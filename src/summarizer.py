"""
ComplexForm-AI Hub - Phase 2: LLM 结构化摘要管线
==================================================
两步 Prompt Chain：
  Step 1 (Classification): 判断领域归属 + 是否使用 ML/AI
  Step 2 (Extraction): 抽取制剂类型/输入特征/AI模型/预测目标/主要发现

支持任意 OpenAI 兼容 API（OpenAI / DeepSeek / 方舟 / c2846 代理等）。
无 API Key 时自动降级为规则抽取（由 sniffer.py 已处理）。

用法（通常由 sniffer.py 自动调用）：
    from summarizer import enhance_records
    enhance_records(records)
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import config  # noqa: E402

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # 延迟报错，允许无 openai 包时纯规则运行


# ===========================================================================
# Prompt 模板
# ===========================================================================
CLASSIFICATION_PROMPT = """You are an expert in pharmaceutical formulation science.
Given the following paper title and abstract, determine:
1. Which of these 5 domains does this paper belong to? (choose one or more from: in_situ_gel, liposome, microsphere, nanocrystal, plga_design)
2. Does this paper use machine learning or artificial intelligence methods? (true/false)

Title: {title}
Abstract: {abstract}

Respond ONLY in JSON format:
{{"domain": ["..."], "is_ml": true/false}}"""


EXTRACTION_PROMPT = """You are an expert in pharmaceutical formulation and AI/ML.
Extract structured information from this paper:

Title: {title}
Abstract: {abstract}

Extract the following fields:
- formulation_type: The specific formulation system studied (e.g., PLGA nanoparticle, liposome, nanocrystal)
- input_features: List of input variables/descriptors used in the model (e.g., polymer MW, surfactant concentration)
- ai_model: The ML/AI model(s) or algorithm(s) used (e.g., Random Forest, CNN, Gaussian Process)
- prediction_target: What the model predicts or optimizes (e.g., particle size, release rate, encapsulation efficiency)
- key_findings: 2-3 sentence summary of the main results and conclusions

Respond ONLY in JSON format:
{{"formulation_type": "...", "input_features": ["..."], "ai_model": "...", "prediction_target": "...", "key_findings": "..."}}"""


# ===========================================================================
# LLM 调用
# ===========================================================================
def _get_client():
    """创建 OpenAI 兼容客户端。"""
    if OpenAI is None:
        raise ImportError("openai package not installed. Run: pip install openai")
    cfg = config.LLM_CONFIG
    if not cfg["api_key"]:
        raise ValueError("OPENAI_API_KEY not set in environment")
    return OpenAI(api_key=cfg["api_key"], base_url=cfg["base_url"])


def _call_llm(client, prompt: str, max_retries: int = 2) -> str:
    """调用 LLM 并返回文本响应，带重试。"""
    for attempt in range(max_retries + 1):
        try:
            resp = client.chat.completions.create(
                model=config.LLM_CONFIG["model"],
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=512,
            )
            return resp.choices[0].message.content.strip()
        except Exception as exc:
            if attempt < max_retries:
                wait = 2 ** attempt
                print(f"    [LLM retry {attempt+1}/{max_retries}] {exc}, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise


def _parse_json_response(text: str) -> dict | None:
    """从 LLM 响应中提取 JSON（容忍 markdown code fence 包裹）。"""
    # 去除 markdown code fence
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # 去首尾 ``` 行
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # 尝试提取第一个完整 JSON 对象（支持嵌套）
        import re
        # 逐字符匹配花括号深度
        start = text.find("{")
        if start == -1:
            return None
        depth = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        return None
    return None


# ===========================================================================
# 两步 Prompt Chain
# ===========================================================================
def enhance_single(record: dict, client) -> dict:
    """对单篇论文执行两步 Prompt Chain，返回增强后的 ml_summary。"""
    title = record.get("title", "")
    abstract = record.get("abstract", "")

    if not abstract or len(abstract) < 50:
        # 无摘要则跳过 LLM，保留规则抽取结果
        return record.get("ml_summary", {})

    original_ml = record.get("ml_summary", {})

    # Step 1: Classification
    cls_prompt = CLASSIFICATION_PROMPT.format(title=title, abstract=abstract[:1500])
    cls_text = _call_llm(client, cls_prompt)
    cls_result = _parse_json_response(cls_text) or {}

    # Step 2: Extraction
    ext_prompt = EXTRACTION_PROMPT.format(title=title, abstract=abstract[:1500])
    ext_text = _call_llm(client, ext_prompt)
    ext_result = _parse_json_response(ext_text) or {}

    # 合并：LLM 结果优先，规则抽取补全
    enhanced = {
        "formulation_type": ext_result.get("formulation_type", "") or original_ml.get("formulation_type", ""),
        "formulation_types_all": original_ml.get("formulation_types_all", []),
        "input_features": ext_result.get("input_features", []) or original_ml.get("input_features", []),
        "ai_model": ext_result.get("ai_model", "") or original_ml.get("ai_model", ""),
        "ai_models_all": original_ml.get("ai_models_all", []),
        "prediction_target": ext_result.get("prediction_target", "") or original_ml.get("prediction_target", ""),
        "key_findings": ext_result.get("key_findings", "") or original_ml.get("key_findings", ""),
        "extracted_by": "llm",
        "summary_date": config.LLM_CONFIG.get("summary_date", ""),
    }

    from datetime import datetime, timezone
    enhanced["summary_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 更新 is_ml
    if "is_ml" in cls_result:
        record["is_ml"] = bool(cls_result["is_ml"])

    return enhanced


def enhance_records(records: list[dict], batch_delay: float = 1.0) -> None:
    """批量增强论文记录的 ml_summary（原地修改）。

    batch_delay 默认 1.0s：每篇 2 次 LLM 调用，约 2 req/s，
    远低于 NVIDIA NIM 免费额度的 40 RPM 限速，可安全用于免费 API。
    """
    client = _get_client()
    total = len(records)
    success = 0

    for i, r in enumerate(records, 1):
        title = r.get("title", "")[:60]
        print(f"  [{i}/{total}] {title}...", end=" ", flush=True)
        try:
            r["ml_summary"] = enhance_single(r, client)
            success += 1
            print("OK")
        except Exception as exc:
            print(f"SKIP ({exc})")
            # 保留已有规则抽取结果

        if batch_delay and i < total:
            time.sleep(batch_delay)

    print(f"\nLLM 增强完成：{success}/{total} 成功")


if __name__ == "__main__":
    # 独立运行：对已有 JSONL 中的记录执行 LLM 增强
    from parser import load_existing, save_jsonl, build_sqlite

    records = load_existing(config.JSONL_PATH)
    # 仅增强规则抽取的记录（extracted_by == "rule"）
    to_enhance = [r for r in records.values() if r.get("ml_summary", {}).get("extracted_by") == "rule"]
    print(f"待增强: {len(to_enhance)} 篇")

    if to_enhance:
        enhance_records(to_enhance)
        save_jsonl(records, config.JSONL_PATH)
        build_sqlite(list(records.values()), config.SQLITE_PATH)
        print(f"已保存至 {config.JSONL_PATH}")
