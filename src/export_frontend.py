"""
ComplexForm-AI Hub - 前端数据导出
==================================
从 papers.jsonl + taxonomy.json 生成前端直接使用的合并 JSON。
前端 React 应用在运行时 fetch 这些 JSON，无需重建镜像。

输出：
  data/frontend/papers.json     - 全量论文数组
  data/frontend/taxonomy.json   - 聚合统计
  data/frontend/meta.json       - 平台元信息（更新时间、计数等）
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import config  # noqa: E402


def main() -> None:
    # 加载论文
    records = []
    if config.JSONL_PATH.exists():
        with open(config.JSONL_PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    records.append(json.loads(line))

    # 加载分类体系
    taxonomy = {}
    if config.TAXONOMY_PATH.exists():
        with open(config.TAXONOMY_PATH, encoding="utf-8") as f:
            taxonomy = json.load(f)

    # 输出目录
    out_dir = config.DATA_DIR / "frontend"
    out_dir.mkdir(exist_ok=True)

    # papers.json
    with open(out_dir / "papers.json", "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False)

    # taxonomy.json
    with open(out_dir / "taxonomy.json", "w", encoding="utf-8") as f:
        json.dump(taxonomy, f, ensure_ascii=False, indent=2)

    # meta.json
    local_count = sum(1 for r in records if r.get("is_local"))
    sniffed_count = sum(1 for r in records if not r.get("is_local"))
    ml_count = sum(1 for r in records if r.get("is_ml"))
    meta = {
        "platform_name": "ComplexForm-AI Hub",
        "description": "ML/AI for Complex Formulation R&D",
        "total_papers": len(records),
        "local_papers": local_count,
        "sniffed_papers": sniffed_count,
        "ml_papers": ml_count,
        "domains": list(config.DOMAINS.keys()),
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    with open(out_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"前端数据已导出至 {out_dir}/")
    print(f"  papers.json: {len(records)} 篇")
    print(f"  taxonomy.json: {len(taxonomy)} 个键")
    print(f"  meta.json: 更新于 {meta['last_updated']}")


if __name__ == "__main__":
    main()
