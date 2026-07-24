"""
ComplexForm-AI Hub - Phase 1: 本地 PDF 解析与数据库初始化
=========================================================
遍历 5 个复杂制剂领域文件夹，解析每篇 PDF：
  1. PyMuPDF 提取首页文本与字体信息
  2. 抽取标题、摘要、DOI、年份
  3. 规则型抽取：制剂类型 / AI 模型 / 输入特征 / 是否使用 ML
  4. 输出 data/papers.jsonl（主数据）+ data/papers.db（SQLite 索引）

规则抽取为"无 LLM 降级方案"，保证零成本即可产出可用数据库；
Phase 2 的 summarizer.py 可在有 LLM API Key 时进一步增强 ml_summary。

用法：
    python src/parser.py                 # 解析全部 5 领域
    python src/parser.py --domain liposome
    python src/parser.py --limit 3       # 每领域仅解析前 3 篇（调试）
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("[ERROR] 缺少 PyMuPDF，请先 `pip install PyMuPDF`")

# 允许以脚本或模块方式运行
sys.path.insert(0, str(Path(__file__).resolve().parent))
import config  # noqa: E402


# ===========================================================================
# 文本清洗
# ===========================================================================
def clean_text(s: str) -> str:
    """解码 HTML 实体、归一化各类连字符/空白。"""
    if not s:
        return ""
    s = html.unescape(s)
    # 各类 Unicode 连字符/短横线归一为 ASCII '-'
    s = re.sub(r"[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]", "-", s)
    # 归一空白
    s = re.sub(r"\s+", " ", s)
    return s.strip()


# ===========================================================================
# PDF 文本与元数据提取
# ===========================================================================
def extract_pdf_content(pdf_path: Path, max_pages: int = 3) -> dict:
    """提取 PDF 首几页文本、metadata 与首页字体块。返回 dict。"""
    result = {
        "meta_title": "",
        "full_text": "",
        "first_page_blocks": [],
        "page_count": 0,
        "error": None,
    }
    try:
        with fitz.open(pdf_path) as doc:
            result["page_count"] = doc.page_count
            meta = doc.metadata or {}
            result["meta_title"] = (meta.get("title") or "").strip()

            texts = []
            for i, page in enumerate(doc):
                if i >= max_pages:
                    break
                texts.append(page.get_text("text"))
                # 首页记录字体块，用于标题识别（取最大字号文本）
                if i == 0:
                    blocks = page.get_text("dict").get("blocks", [])
                    for b in blocks:
                        for line in b.get("lines", []):
                            for span in line.get("spans", []):
                                txt = span.get("text", "").strip()
                                if txt:
                                    result["first_page_blocks"].append(
                                        {"text": txt, "size": round(span.get("size", 0), 1)}
                                    )
            result["full_text"] = "\n".join(texts)
    except Exception as exc:  # noqa: BLE001
        result["error"] = str(exc)
    return result


def _is_garbage_title(s: str) -> bool:
    """检测非标题文本：文档内部标识符、页码范围、纯机构名等。"""
    s_low = s.lower().strip()
    if re.search(r"\d+\s*\.\.\s*\d+", s):          # 页码范围 "1..11"
        return True
    if re.match(r"^[a-z]{2,6}\d[a-z]?\d{3,}", s_low):  # 期刊内部 ID "ao3c01939"
        return True
    if re.match(r"^(fig|table|scheme|figure)\b", s_low):
        return True
    # 纯机构/期刊名（含这些词且短）
    inst_kw = ["national laboratory", "university press", "elsevier", "springer",
               "wiley", "copyright", "all rights reserved"]
    if any(k in s_low for k in inst_kw):
        return True
    return False


def guess_title(content: dict, fallback: str) -> str:
    """标题识别：优先 metadata；否则取首页最大字号且长度合理的文本块。
    若识别结果疑似文档标识符/页码/机构名，则回退到清洗后的文件名。"""
    meta_title = content.get("meta_title", "")
    if (meta_title and len(meta_title) >= 15
            and not meta_title.lower().endswith(".pdf")
            and not _is_garbage_title(meta_title)):
        return meta_title

    blocks = content.get("first_page_blocks", [])
    if not blocks:
        return fallback

    # 找最大字号
    max_size = max((b["size"] for b in blocks), default=0)
    # 合并接近最大字号（容差 0.5）的连续文本块作为标题
    candidate = " ".join(
        b["text"] for b in blocks if abs(b["size"] - max_size) <= 0.5
    ).strip()
    candidate = re.sub(r"\s+", " ", candidate)
    # 过滤明显非标题（太短、太长或垃圾标题）
    if 15 <= len(candidate) <= 300 and not _is_garbage_title(candidate):
        return candidate
    return fallback


def extract_abstract(full_text: str) -> str:
    """从全文中截取 Abstract 段落（Abstract 到 Introduction/Keywords 之间）。"""
    if not full_text:
        return ""
    text = re.sub(r"\r", "\n", full_text)
    # 匹配 Abstract 起点
    m = re.search(r"\bA\s?B\s?S\s?T\s?R\s?A\s?C\s?T\b|\bAbstract\b", text, re.IGNORECASE)
    if not m:
        # 没有 Abstract 标记，返回首段较长文本
        paras = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 120]
        return re.sub(r"\s+", " ", paras[0])[:1500] if paras else ""
    start = m.end()
    tail = text[start:]
    # 匹配结束标记
    end_m = re.search(
        r"\b(Introduction|Keywords|KEYWORDS|1\.\s*Introduction|©|Graphical abstract)\b",
        tail,
    )
    abstract = tail[: end_m.start()] if end_m else tail[:2000]
    abstract = re.sub(r"\s+", " ", abstract).strip(" :.-")
    return abstract[:2500]


def extract_doi(full_text: str) -> str:
    """正则抽取 DOI。"""
    m = re.search(r"10\.\d{4,9}/[-._;()/:A-Za-z0-9]+", full_text or "")
    if m:
        return m.group(0).rstrip(".,;)")
    return ""


def extract_year(full_text: str, filename: str) -> int | None:
    """从文本或文件名中抽取 4 位年份（1990-2030）。"""
    for source in (full_text[:3000] if full_text else "", filename):
        for m in re.finditer(r"\b(19[9]\d|20[0-3]\d)\b", source):
            y = int(m.group(0))
            if 1990 <= y <= 2030:
                return y
    return None


# ===========================================================================
# 规则型 ML 信息抽取（无 LLM 降级方案）
# ===========================================================================
def _match_dict(text_lower: str, vocab: dict[str, list[str]]) -> list[str]:
    """在文本中匹配词典，返回命中的 canonical 名称列表（去重保序）。"""
    hits = []
    for canonical, aliases in vocab.items():
        for alias in aliases:
            if alias in text_lower:
                hits.append(canonical)
                break
    return hits


def rule_based_extract(title: str, abstract: str) -> dict:
    """基于词典的规则抽取，作为 ml_summary 的降级填充。"""
    corpus = f" {title} {abstract} ".lower()
    corpus = re.sub(r"\s+", " ", corpus)

    is_ml = any(kw in corpus for kw in config.ML_INDICATOR_KEYWORDS)
    models = _match_dict(corpus, config.AI_MODELS)
    formulations = _match_dict(corpus, config.FORMULATION_TYPES)
    features = _match_dict(corpus, config.INPUT_FEATURES)

    return {
        "formulation_type": formulations[0] if formulations else "",
        "formulation_types_all": formulations,
        "input_features": features,
        "ai_model": ", ".join(models) if models else "",
        "ai_models_all": models,
        "prediction_target": "",  # 规则难以可靠抽取，留待 LLM 增强
        "key_findings": "",       # 同上
        "extracted_by": "rule",
        "summary_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }


# ===========================================================================
# 记录构建
# ===========================================================================
def make_record(pdf_path: Path, domain_key: str) -> dict:
    """解析单篇 PDF，构建标准 JSONL 记录。"""
    filename = pdf_path.name
    content = extract_pdf_content(pdf_path)

    # 文件名清洗作为标题兜底（去序号前缀、下划线转空格、去扩展名）
    clean_name = re.sub(r"^(PLGA\s*)?\d+[_\s-]*", "", pdf_path.stem)
    clean_name = re.sub(r"[_]+", " ", clean_name).strip()

    title = clean_text(guess_title(content, fallback=clean_name))
    abstract = clean_text(extract_abstract(content["full_text"]))
    doi = extract_doi(content["full_text"])
    year = extract_year(content["full_text"], filename)

    ml_summary = rule_based_extract(title, abstract)

    # 稳定 ID：领域 + 文件名 hash
    uid = "local-" + hashlib.md5(f"{domain_key}/{filename}".encode()).hexdigest()[:12]

    rel_path = f"{config.DOMAINS[domain_key]['folder']}/{filename}"

    return {
        "id": uid,
        "source": "local",
        "domain": domain_key,
        "domain_label": config.DOMAINS[domain_key]["label"],
        "title": title,
        "authors": [],
        "journal": "",
        "publication_year": year,
        "doi": doi,
        "url": f"https://doi.org/{doi}" if doi else "",
        "oa_url": "",
        "abstract": abstract,
        "cited_by_count": None,
        "topics": ml_summary["formulation_types_all"],
        "ml_summary": ml_summary,
        # 判定为 ML/AI 相关：命中任一 AI 模型词典 或 含 ML 指示关键词
        "is_ml": bool(ml_summary["ai_models_all"]) or _has_ml(title, abstract),
        "is_local": True,
        "local_path": rel_path,
        "sniffed_date": None,
        "parsed_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "page_count": content["page_count"],
        "parse_error": content["error"],
    }


def _has_ml(title: str, abstract: str) -> bool:
    corpus = f" {title} {abstract} ".lower()
    return any(kw in corpus for kw in config.ML_INDICATOR_KEYWORDS)


# ===========================================================================
# SQLite 构建
# ===========================================================================
def build_sqlite(records: list[dict], db_path: Path) -> None:
    """从记录列表构建 SQLite 索引（覆盖重建）。"""
    if db_path.exists():
        db_path.unlink()
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE papers (
            id TEXT PRIMARY KEY,
            source TEXT,
            domain TEXT,
            domain_label TEXT,
            title TEXT,
            journal TEXT,
            publication_year INTEGER,
            doi TEXT,
            url TEXT,
            abstract TEXT,
            cited_by_count INTEGER,
            formulation_type TEXT,
            ai_model TEXT,
            is_ml INTEGER,
            is_local INTEGER,
            local_path TEXT,
            parsed_date TEXT
        )
        """
    )
    cur.execute("CREATE INDEX idx_domain ON papers(domain)")
    cur.execute("CREATE INDEX idx_year ON papers(publication_year)")
    cur.execute("CREATE INDEX idx_isml ON papers(is_ml)")

    for r in records:
        cur.execute(
            """INSERT OR REPLACE INTO papers VALUES
               (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                r["id"], r["source"], r["domain"], r["domain_label"], r["title"],
                r["journal"], r["publication_year"], r["doi"], r["url"], r["abstract"],
                r["cited_by_count"], r["ml_summary"]["formulation_type"],
                r["ml_summary"]["ai_model"], int(bool(r["is_ml"])), int(bool(r["is_local"])),
                r["local_path"], r["parsed_date"],
            ),
        )
    conn.commit()
    conn.close()


# ===========================================================================
# JSONL 读写（支持增量合并：本地记录覆盖，嗅探记录保留）
# ===========================================================================
def load_existing(jsonl_path: Path) -> dict[str, dict]:
    existing = {}
    if jsonl_path.exists():
        with open(jsonl_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        rec = json.loads(line)
                        existing[rec["id"]] = rec
                    except json.JSONDecodeError:
                        continue
    return existing


def save_jsonl(records: dict[str, dict], jsonl_path: Path) -> None:
    with open(jsonl_path, "w", encoding="utf-8") as f:
        for rec in records.values():
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")


# ===========================================================================
# 主流程
# ===========================================================================
def parse_domain(domain_key: str, limit: int | None = None) -> list[dict]:
    domain = config.DOMAINS[domain_key]
    folder = config.LIBRARY_ROOT / domain["folder"]
    if not folder.is_dir():
        print(f"[WARN] 领域文件夹不存在: {folder}")
        return []

    pdfs = sorted(folder.glob("*.pdf"))
    if limit:
        pdfs = pdfs[:limit]

    records = []
    for i, pdf in enumerate(pdfs, 1):
        rec = make_record(pdf, domain_key)
        flag = "ML" if rec["is_ml"] else "  "
        err = f" [ERR: {rec['parse_error']}]" if rec["parse_error"] else ""
        print(f"  [{i:>2}/{len(pdfs)}] {flag} {rec['title'][:60]}{err}")
        records.append(rec)
    return records


def main() -> None:
    ap = argparse.ArgumentParser(description="ComplexForm-AI Hub PDF 解析器")
    ap.add_argument("--domain", choices=list(config.DOMAINS), help="仅解析指定领域")
    ap.add_argument("--limit", type=int, help="每领域最多解析 N 篇（调试用）")
    args = ap.parse_args()

    targets = [args.domain] if args.domain else list(config.DOMAINS)

    # 增量合并：保留已有嗅探记录，覆盖本地记录
    all_records = load_existing(config.JSONL_PATH)

    total_new = 0
    for dk in targets:
        print(f"\n===== 解析领域: {config.DOMAINS[dk]['label']} ({config.DOMAINS[dk]['folder']}) =====")
        recs = parse_domain(dk, limit=args.limit)
        for r in recs:
            all_records[r["id"]] = r
        total_new += len(recs)

    save_jsonl(all_records, config.JSONL_PATH)
    # 仅本地记录 + 嗅探记录一起进 SQLite
    build_sqlite(list(all_records.values()), config.SQLITE_PATH)

    # 统计
    local_recs = [r for r in all_records.values() if r["is_local"]]
    ml_count = sum(1 for r in all_records.values() if r["is_ml"])
    print("\n" + "=" * 60)
    print(f"解析完成：本次处理 {total_new} 篇")
    print(f"数据库总记录：{len(all_records)} 篇（本地 {len(local_recs)} + 嗅探 {len(all_records) - len(local_recs)}）")
    print(f"标注为 ML/AI 相关：{ml_count} 篇")
    print(f"JSONL: {config.JSONL_PATH}")
    print(f"SQLite: {config.SQLITE_PATH}")
    # 分领域统计
    print("\n分领域统计：")
    for dk in config.DOMAINS:
        cnt = sum(1 for r in all_records.values() if r["domain"] == dk)
        mlc = sum(1 for r in all_records.values() if r["domain"] == dk and r["is_ml"])
        print(f"  {config.DOMAINS[dk]['label']:<16} {cnt:>3} 篇（ML {mlc}）")


if __name__ == "__main__":
    main()
