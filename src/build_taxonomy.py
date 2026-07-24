"""
ComplexForm-AI Hub - Phase 1 附属：分类体系与统计生成
=====================================================
从 papers.jsonl 聚合生成 taxonomy.json，供前端展示：
  - 各领域论文数 / ML 论文数
  - AI 模型使用频次分布
  - 制剂类型分布
  - 输入特征分布
  - 年度趋势
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import config  # noqa: E402


def load_records() -> list[dict]:
    recs = []
    if config.JSONL_PATH.exists():
        with open(config.JSONL_PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    recs.append(json.loads(line))
    return recs


def build_taxonomy(records: list[dict]) -> dict:
    domains_stat = {}
    model_counter = Counter()
    formulation_counter = Counter()
    feature_counter = Counter()
    year_counter = Counter()
    domain_model = {dk: Counter() for dk in config.DOMAINS}

    for r in records:
        dk = r["domain"]
        domains_stat.setdefault(dk, {"total": 0, "ml": 0})
        domains_stat[dk]["total"] += 1
        if r.get("is_ml"):
            domains_stat[dk]["ml"] += 1

        for m in r["ml_summary"].get("ai_models_all", []):
            model_counter[m] += 1
            if dk in domain_model:
                domain_model[dk][m] += 1
        for f in r["ml_summary"].get("formulation_types_all", []):
            formulation_counter[f] += 1
        for feat in r["ml_summary"].get("input_features", []):
            feature_counter[feat] += 1
        if r.get("publication_year"):
            year_counter[r["publication_year"]] += 1

    return {
        "meta": {
            "total_papers": len(records),
            "total_ml_papers": sum(1 for r in records if r.get("is_ml")),
            "domains": {
                dk: {
                    "label": config.DOMAINS[dk]["label"],
                    "label_cn": config.DOMAINS[dk]["label_cn"],
                    "icon": config.DOMAINS[dk]["icon"],
                    **domains_stat.get(dk, {"total": 0, "ml": 0}),
                }
                for dk in config.DOMAINS
            },
        },
        "ai_models": dict(model_counter.most_common()),
        "formulation_types": dict(formulation_counter.most_common()),
        "input_features": dict(feature_counter.most_common()),
        "year_trend": dict(sorted(year_counter.items())),
        "domain_model_matrix": {
            dk: dict(domain_model[dk].most_common()) for dk in config.DOMAINS
        },
    }


def main() -> None:
    records = load_records()
    if not records:
        sys.exit("[ERROR] 未找到 papers.jsonl，请先运行 parser.py")
    tax = build_taxonomy(records)
    with open(config.TAXONOMY_PATH, "w", encoding="utf-8") as f:
        json.dump(tax, f, ensure_ascii=False, indent=2)

    print(f"taxonomy.json 已生成: {config.TAXONOMY_PATH}")
    print(f"\n总论文: {tax['meta']['total_papers']}  ML论文: {tax['meta']['total_ml_papers']}")
    print("\nAI 模型频次 TOP:")
    for m, c in list(tax["ai_models"].items())[:12]:
        print(f"  {m:<24} {c}")
    print("\n制剂类型频次 TOP:")
    for m, c in list(tax["formulation_types"].items())[:10]:
        print(f"  {m:<28} {c}")
    print("\n年度趋势:")
    for y, c in tax["year_trend"].items():
        print(f"  {y}: {c}")


if __name__ == "__main__":
    main()
