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


COMBINED_PROMPT = """You are an expert in pharmaceutical formulation science and AI/ML.
Analyze this paper and extract structured information.

Title: {title}
Abstract: {abstract}

Respond ONLY in JSON format with these fields:
{{"domain": ["choose from: in_situ_gel, liposome, microsphere, nanocrystal, plga_design"], "is_ml": true/false, "formulation_type": "specific formulation system", "input_features": ["list of input variables"], "ai_model": "ML/AI model(s) used", "prediction_target": "what the model predicts", "key_findings": "2-3 sentence summary"}}"""


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
    """对单篇论文执行单次 LLM 调用（合并分类+抽取），返回增强后的 ml_summary。"""
    title = record.get("title", "")
    abstract = record.get("abstract", "")

    if not abstract or len(abstract) < 50:
        # 无摘要则跳过 LLM，保留规则抽取结果
        return record.get("ml_summary", {})

    original_ml = record.get("ml_summary", {})

    # 单次调用：合并分类 + 抽取
    prompt = COMBINED_PROMPT.format(title=title, abstract=abstract[:1500])
    text = _call_llm(client, prompt)
    result = _parse_json_response(text) or {}

    # 合并：LLM 结果优先，规则抽取补全
    enhanced = {
        "formulation_type": result.get("formulation_type", "") or original_ml.get("formulation_type", ""),
        "formulation_types_all": original_ml.get("formulation_types_all", []),
        "input_features": result.get("input_features", []) or original_ml.get("input_features", []),
        "ai_model": result.get("ai_model", "") or original_ml.get("ai_model", ""),
        "ai_models_all": original_ml.get("ai_models_all", []),
        "prediction_target": result.get("prediction_target", "") or original_ml.get("prediction_target", ""),
        "key_findings": result.get("key_findings", "") or original_ml.get("key_findings", ""),
        "extracted_by": "llm",
    }

    from datetime import datetime, timezone
    enhanced["summary_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 更新 is_ml
    if "is_ml" in result:
        record["is_ml"] = bool(result["is_ml"])

    return enhanced


def _test_llm(client) -> bool:
    """快速测试 LLM API 是否可用（发一个最小请求），返回 True/False。"""
    try:
        resp = client.chat.completions.create(
            model=config.LLM_CONFIG["model"],
            messages=[{"role": "user", "content": "Reply OK"}],
            temperature=0,
            max_tokens=5,
        )
        return bool(resp.choices[0].message.content)
    except Exception as exc:
        print(f"  [LLM TEST] API 不可用: {exc}")
        print(f"  [LLM TEST] model={config.LLM_CONFIG['model']}, base_url={config.LLM_CONFIG['base_url']}")
        return False


def enhance_records(records: list[dict], batch_delay: float = 1.0) -> None:
    """批量增强论文记录的 ml_summary（原地修改）。

    batch_delay 默认 1.0s：每篇 2 次 LLM 调用，约 2 req/s，
    远低于 NVIDIA NIM 免费额度的 40 RPM 限速，可安全用于免费 API。

    跳过已有 LLM 摘要的记录（extracted_by == "llm"），避免重复调用。
    """
    client = _get_client()

    # 先测试 API 是否可用，避免对不可用的 API 发起数百次无效调用
    if not _test_llm(client):
        print("  ⚠️ LLM API 不可用，跳过增强，保留规则抽取结果")
        return

    # 过滤：只增强规则抽取的记录，跳过已有 LLM 摘要的
    to_enhance = [r for r in records
                  if r.get("ml_summary", {}).get("extracted_by") != "llm"]
    skipped = len(records) - len(to_enhance)
    if skipped:
        print(f"  (跳过 {skipped} 篇已有 LLM 摘要的记录)")

    total = len(to_enhance)
    if total == 0:
        print("  所有记录已有 LLM 摘要，无需增强")
        return

    success = 0
    fail_streak = 0  # 连续失败计数
    MAX_FAIL_STREAK = 5  # 连续失败超过此阈值则提前终止

    for i, r in enumerate(to_enhance, 1):
        title = r.get("title", "")[:60]
        print(f"  [{i}/{total}] {title}...", end=" ", flush=True)
        try:
            r["ml_summary"] = enhance_single(r, client)
            success += 1
            fail_streak = 0
            print("OK")
        except Exception as exc:
            fail_streak += 1
            print(f"SKIP ({exc})")
            # 保留已有规则抽取结果

        # 连续失败过多，提前终止 LLM 增强（API 可能宕机/模型名错误）
        if fail_streak >= MAX_FAIL_STREAK:
            print(f"\n  ⚠️ 连续 {fail_streak} 次 LLM 调用失败，提前终止增强（API 可能不可用）")
            print(f"  剩余 {total - i} 篇保留规则抽取结果")
            break

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
