"""
ComplexForm-AI Hub - Phase 2: SCI 文献嗅探引擎
================================================
定时检索 OpenAlex / PubMed / Crossref 中 5 个复杂制剂领域的最新论文。
  1. 按领域检索词矩阵调用 API
  2. 去重（DOI + Title 模糊匹配）
  3. 增量追加至 data/papers.jsonl（不覆盖本地解析记录）
  4. 可选调用 summarizer 生成 LLM 结构化摘要

设计原则：
  - 多数据源容错：单源失败不影响整体
  - 无 LLM 降级：API Key 缺失时仅做规则抽取
  - 增量合并：保留已有记录，仅追加新论文

用法：
    python src/sniffer.py                          # 全领域嗅探
    python src/sniffer.py --domain liposome         # 仅指定领域
    python src/sniffer.py --days 30                 # 检索最近 30 天
    python src/sniffer.py --per-query 10            # 每条检索词取 10 篇
    python src/sniffer.py --no-llm                  # 跳过 LLM 摘要
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("[ERROR] 缺少 requests，请先 `pip install requests`")

sys.path.insert(0, str(Path(__file__).resolve().parent))
import config  # noqa: E402


# ===========================================================================
# OpenAlex API
# ===========================================================================
def search_openalex(query: str, per_page: int = 25, mailto: str = "",
                    from_date: str = "") -> list[dict]:
    """调用 OpenAlex Works API 检索论文，返回标准化记录列表。

    Args:
        from_date: ISO date string (e.g. "2025-01-01")。若提供则筛选该日期后的论文。
    """
    base = "https://api.openalex.org/works"
    # 使用 filter 参数而非纯 search，可加 from_publication_date
    params = {
        "search": query,
        "per_page": per_page,
        "mailto": mailto or config.OPENALEX_MAILTO,
    }
    if from_date:
        params["filter"] = f"from_publication_date:{from_date}"
    try:
        resp = requests.get(base, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        print(f"  [OpenAlex ERROR] {exc}")
        return []

    records = []
    for work in data.get("results", []):
        # 反转 inverted index 重建摘要
        abstract = _reconstruct_abstract(work.get("abstract_inverted_index") or {})

        authors = []
        for a in (work.get("authorships") or [])[:10]:
            author = a.get("author") or {}
            name = author.get("display_name", "")
            if name:
                authors.append(name)

        topics = []
        for t in (work.get("topics") or [])[:5]:
            name = t.get("display_name", "")
            if name:
                topics.append(name)

        oa = work.get("open_access") or {}
        doi = work.get("doi", "") or ""
        if doi and doi.startswith("https://doi.org/"):
            doi = doi[len("https://doi.org/"):]

        records.append({
            "id": f"openalex-{(work.get('id') or '').split('/')[-1]}",
            "source": "openalex",
            "domain": "",  # 由调用方填充
            "domain_label": "",
            "title": work.get("display_name", "") or "",
            "authors": authors,
            "journal": ((work.get("primary_location") or {}).get("source") or {}).get("display_name", ""),
            "publication_year": work.get("publication_year"),
            "doi": doi,
            "url": work.get("doi", "") or "",
            "oa_url": oa.get("oa_url", "") or "",
            "abstract": abstract,
            "cited_by_count": work.get("cited_by_count") or 0,
            "topics": topics,
            "ml_summary": {},
            "is_ml": False,
            "is_local": False,
            "local_path": None,
            "sniffed_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "parsed_date": None,
        })
    return records


def _reconstruct_abstract(inverted_index: dict) -> str:
    """从 OpenAlex inverted index 重建摘要文本。"""
    if not inverted_index:
        return ""
    positions = []
    for word, locs in inverted_index.items():
        for pos in locs:
            positions.append((pos, word))
    positions.sort()
    return " ".join(w for _, w in positions)


# ===========================================================================
# PubMed E-utilities API
# ===========================================================================
def search_pubmed(query: str, retmax: int = 25, api_key: str = "") -> list[dict]:
    """调用 PubMed E-utilities 检索论文，返回标准化记录列表。"""
    base_esearch = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    base_efetch = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

    params = {
        "db": "pubmed",
        "term": query,
        "retmax": retmax,
        "retmode": "json",
    }
    if api_key:
        params["api_key"] = api_key

    try:
        resp = requests.get(base_esearch, params=params, timeout=30)
        resp.raise_for_status()
        ids = resp.json().get("esearchresult", {}).get("idlist", [])
    except Exception as exc:
        print(f"  [PubMed esearch ERROR] {exc}")
        return []

    if not ids:
        return []

    # 获取摘要详情
    fetch_params = {
        "db": "pubmed",
        "id": ",".join(ids),
        "retmode": "xml",
    }
    if api_key:
        fetch_params["api_key"] = api_key

    try:
        resp = requests.get(base_efetch, params=fetch_params, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        print(f"  [PubMed efetch ERROR] {exc}")
        return []

    records = []
    try:
        from xml.etree import ElementTree as ET
        root = ET.fromstring(resp.content)
        for article in root.findall(".//PubmedArticle"):
            pmid = (article.findtext(".//PMID") or "").strip()
            title = (article.findtext(".//ArticleTitle") or "").strip()

            # 摘要
            abstract_parts = []
            for ab in article.findall(".//Abstract/AbstractText"):
                label = ab.get("Label", "")
                text = "".join(ab.itertext()).strip()
                if label:
                    abstract_parts.append(f"{label}: {text}")
                else:
                    abstract_parts.append(text)
            abstract = " ".join(abstract_parts)

            # 年份
            year_str = (article.findtext(".//PubDate/Year") or
                        article.findtext(".//PubDate/MedlineDate") or "")[:4]
            year = int(year_str) if year_str.isdigit() else None

            # 期刊
            journal = (article.findtext(".//Journal/Title") or "").strip()

            # DOI
            doi = ""
            for aid in article.findall(".//ArticleId"):
                if aid.get("IdType") == "doi":
                    doi = (aid.text or "").strip()
                    break

            # 作者
            authors = []
            for author in article.findall(".//Author")[:10]:
                ln = (author.findtext("LastName") or "").strip()
                fn = (author.findtext("ForeName") or "").strip()
                if ln:
                    authors.append(f"{ln}, {fn}" if fn else ln)

            records.append({
                "id": f"pubmed-{pmid}",
                "source": "pubmed",
                "domain": "",
                "domain_label": "",
                "title": title,
                "authors": authors,
                "journal": journal,
                "publication_year": year,
                "doi": doi,
                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else "",
                "oa_url": "",
                "abstract": abstract,
                "cited_by_count": None,
                "topics": [],
                "ml_summary": {},
                "is_ml": False,
                "is_local": False,
                "local_path": None,
                "sniffed_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "parsed_date": None,
            })
    except Exception as exc:
        print(f"  [PubMed parse ERROR] {exc}")
        return []

    return records


# ===========================================================================
# 去重与合并
# ===========================================================================
def _normalize_title(title: str) -> str:
    """标题归一化用于模糊去重。"""
    import re
    s = title.lower().strip()
    s = re.sub(r"[^a-z0-9\s]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s


def deduplicate(new_records: list[dict], existing_ids: set, existing_dois: set,
                existing_titles: set) -> list[dict]:
    """去重：ID / DOI / 标题模糊匹配。"""
    seen = set()
    deduped = []
    for r in new_records:
        rid = r["id"]
        if rid in existing_ids or rid in seen:
            continue
        doi = r.get("doi", "").lower().strip()
        if doi and doi in existing_dois:
            continue
        norm_title = _normalize_title(r.get("title", ""))
        if norm_title and norm_title in existing_titles:
            continue

        seen.add(rid)
        deduped.append(r)
    return deduped


# ===========================================================================
# 主流程
# ===========================================================================
def sniff_domain(domain_key: str, per_query: int = 25, use_pubmed: bool = True,
                 pubmed_key: str = "", days: int = 0) -> list[dict]:
    """嗅探单个领域的最新论文。

    Args:
        days: 只检索最近 N 天的论文（0 = 不限日期）。
    """
    queries = config.SEARCH_QUERIES.get(domain_key, [])
    all_records = []
    seen_titles = set()

    from_date = ""
    if days > 0:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
        from_date = cutoff

    for i, q in enumerate(queries, 1):
        print(f"  [Query {i}/{len(queries)}] {q[:70]}...")

        # OpenAlex
        records = search_openalex(q, per_page=per_query, from_date=from_date)
        for r in records:
            r["domain"] = domain_key
            r["domain_label"] = config.DOMAINS[domain_key]["label"]
        # 去重（同领域内）
        unique = []
        for r in records:
            nt = _normalize_title(r["title"])
            if nt not in seen_titles:
                seen_titles.add(nt)
                unique.append(r)
        all_records.extend(unique)
        print(f"    OpenAlex: +{len(unique)} unique")

        # PubMed（可选）
        if use_pubmed:
            time.sleep(0.5)
            pm_records = search_pubmed(q, retmax=per_query, api_key=pubmed_key)
            for r in pm_records:
                r["domain"] = domain_key
                r["domain_label"] = config.DOMAINS[domain_key]["label"]
            pm_unique = []
            for r in pm_records:
                nt = _normalize_title(r["title"])
                if nt not in seen_titles:
                    seen_titles.add(nt)
                    pm_unique.append(r)
            all_records.extend(pm_unique)
            print(f"    PubMed: +{len(pm_unique)} unique")

        time.sleep(1)  # 礼貌延迟

    return all_records


def run_sniffer(domains: list[str], per_query: int = 25, use_pubmed: bool = True,
                use_llm: bool = True, days: int = 0) -> None:
    """嗅探主入口：检索 -> 去重 -> 规则抽取 -> (可选) LLM 摘要 -> 合并入库。"""
    from parser import load_existing, save_jsonl, build_sqlite, rule_based_extract, _has_ml

    # 加载现有记录
    existing = load_existing(config.JSONL_PATH)
    existing_ids = set(existing.keys())
    existing_dois = {r.get("doi", "").lower().strip() for r in existing.values() if r.get("doi")}
    existing_titles = {_normalize_title(r.get("title", "")) for r in existing.values()}

    pubmed_key = __import__("os").environ.get("PUBMED_API_KEY", "")
    all_new = []

    for dk in domains:
        print(f"\n===== 嗅探领域: {config.DOMAINS[dk]['label']} =====")
        records = sniff_domain(dk, per_query=per_query, use_pubmed=use_pubmed,
                               pubmed_key=pubmed_key, days=days)
        all_new.extend(records)

    # 去重
    deduped = deduplicate(all_new, existing_ids, existing_dois, existing_titles)
    print(f"\n去重后新增: {len(deduped)} 篇 (检索到 {len(all_new)} 篇)")

    if not deduped:
        print("无新论文，跳过。")
        return

    # 规则抽取
    for r in deduped:
        ml = rule_based_extract(r["title"], r["abstract"])
        r["ml_summary"] = ml
        r["is_ml"] = bool(ml["ai_models_all"]) or _has_ml(r["title"], r["abstract"])

    # 先合并入库 + 保存（确保即使 LLM 超时，规则抽取结果也不丢失）
    for r in deduped:
        existing[r["id"]] = r
    save_jsonl(existing, config.JSONL_PATH)
    build_sqlite(list(existing.values()), config.SQLITE_PATH)
    print(f"规则抽取完成并已保存（{len(deduped)} 篇新增）")

    # LLM 摘要增强
    if use_llm and config.LLM_CONFIG["api_key"]:
        print("\n===== LLM 摘要增强 =====")
        try:
            from summarizer import enhance_records

            # checkpoint 函数：将当前 existing（含已增强记录）保存到磁盘
            def checkpoint():
                save_jsonl(existing, config.JSONL_PATH)
                build_sqlite(list(existing.values()), config.SQLITE_PATH)

            enhance_records(deduped, batch_delay=0.5,
                            checkpoint_fn=checkpoint, checkpoint_interval=20)
        except Exception as exc:
            print(f"  [LLM WARNING] {exc}，降级为纯规则抽取")

    # LLM 增强后再次保存（即使超时被中断，checkpoint 已保存了大部分）
    save_jsonl(existing, config.JSONL_PATH)
    build_sqlite(list(existing.values()), config.SQLITE_PATH)

    # 统计
    print("\n" + "=" * 60)
    print(f"嗅探完成：新增 {len(deduped)} 篇")
    print(f"数据库总记录：{len(existing)} 篇")
    ml_count = sum(1 for r in deduped if r.get("is_ml"))
    print(f"新增中标注 ML/AI 相关：{ml_count} 篇")

    # 生成分类体系
    try:
        import build_taxonomy
        build_taxonomy.main()
    except Exception as exc:
        print(f"  [taxonomy WARNING] {exc}")

    # 生成前端 JSON（papers + taxonomy + meta）
    try:
        import export_frontend
        export_frontend.main()
    except Exception as exc:
        print(f"  [export WARNING] {exc}")


def main() -> None:
    ap = argparse.ArgumentParser(description="ComplexForm-AI Hub SCI 文献嗅探引擎")
    ap.add_argument("--domain", choices=list(config.DOMAINS), help="仅嗅探指定领域")
    ap.add_argument("--per-query", type=int, default=25, help="每条检索词取 N 篇（默认 25）")
    ap.add_argument("--days", type=int, default=0, help="只检索最近 N 天的论文（默认不限）")
    ap.add_argument("--no-pubmed", action="store_true", help="跳过 PubMed")
    ap.add_argument("--no-llm", action="store_true", help="跳过 LLM 摘要增强")
    args = ap.parse_args()

    domains = [args.domain] if args.domain else list(config.DOMAINS)
    run_sniffer(
        domains=domains,
        per_query=args.per_query,
        use_pubmed=not args.no_pubmed,
        use_llm=not args.no_llm,
        days=args.days,
    )


if __name__ == "__main__":
    main()
