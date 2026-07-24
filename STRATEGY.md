# ComplexForm-AI Hub 技术架构选型与策略设计书

> 版本：1.0 | 日期：2026-07-24  
> 状态：Phase 0 交付物

---

## 1. 项目概述

### 1.1 目标

搭建面向全球药剂学者的开源学术平台 **ComplexForm-AI Hub**，聚焦 5 个复杂制剂领域：

| 领域 | 本地文献数 | 高频检索词示例 |
|------|-----------|--------------|
| InSituGel（原位凝胶） | 17 篇 | in situ gel, thermosensitive gel, stimuli-responsive |
| Liposome（脂质体） | 19 篇 | liposome, lipid nanoparticle, LNP |
| Microsphere（微球） | 18 篇 | microsphere, PLGA microsphere, sustained release |
| Nanocrystal（纳米晶） | 12 篇 | nanocrystal, nanosuspension, wet milling |
| PLGA Design（PLGA 设计） | 24 篇 | PLGA, PLGA nanoparticle, degradation modeling |

平台核心功能：
1. **ML/AI 进展全景展现**：动态梳理并可视化 5 领域的研究进展、模型算法、数据集及描述符。
2. **自动化 SCI 文献嗅探与智能摘要**：定时检索 PubMed / OpenAlex / arXiv / Crossref，利用 LLM 生成结构化学术概要。

### 1.2 资源约束

| 约束项 | 说明 |
|--------|------|
| 代码托管 | GitHub（公开仓库，Actions 无限免费分钟数） |
| 应用部署 | Hugging Face Spaces（CPU Basic 免费：2 vCPU / 16 GB RAM / 50 GB 临时存储） |
| 数据源 | 本地 90 篇 PDF + 互联网学术 API |
| LLM | 需自行提供 API Key（OpenAI / DeepSeek / 方舟 Coding Plan 等均可） |
| 预算 | Free Tier 优先，零成本上线 |

---

## 2. 数据源 API 调研

### 2.1 OpenAlex（推荐主数据源）

| 维度 | 详情 |
|------|------|
| 数据规模 | 474M+ 学术成果（截至 2026-02） |
| API Key | **无需**，注册可获 10 倍免费额度（$1/天 ≈ 10,000 搜索调用） |
| 速率限制 | 无 Key：$0.10/天（约 1,000 搜索）；有 Key：$1/天（约 10,000 搜索） |
| Polite Pool | 附加 `mailto=you@example.com` 可获 10 req/s（无 Key 也有 1 req/s） |
| 返回字段 | title, doi, abstract_inverted_index, publication_year, cited_by_count, open_access.oa_url, authorships, topics, keywords |
| 检索能力 | 全文搜索 `search=`，精确过滤 `filter=concepts.id:...,publication_year:2020-2026` |
| 优势 | 覆盖面最广、完全免费、JSON 结构化输出、无需注册 |

**检索示例**：
```
GET https://api.openalex.org/works?search=PLGA+microsphere+machine+learning&filter=publication_year:2023-2026&per_page=25&mailto=your@email.com
```

### 2.2 PubMed E-utilities

| 维度 | 详情 |
|------|------|
| 数据规模 | 36M+ 生物医学文献 |
| API Key | 可选（NCBI 账号免费申请） |
| 速率限制 | 无 Key：3 req/s；有 Key：10 req/s |
| 返回字段 | PMID, Title, Abstract, Authors, Journal, PubDate, DOI |
| 优势 | 药学/生物医学领域最权威索引 |

### 2.3 Crossref

| 维度 | 详情 |
|------|------|
| 数据规模 | 150M+ DOI 记录 |
| API Key | **无需** |
| 速率限制 | Polite Pool（附加 `mailto`）：50 req/s |
| 优势 | DOI 元数据最全，适合补全引用信息与作者详情 |

### 2.4 arXiv

| 维度 | 详情 |
|------|------|
| 数据规模 | 2.4M+ 预印本 |
| API Key | **无需** |
| 速率限制 | 建议间隔 ≥3 秒 |
| 优势 | CS/AI 领域预印本，可获取 ML 方法学前沿 |

### 2.5 数据源策略

```
主数据源：OpenAlex（覆盖面最广、免费、结构化好）
辅助数据源：PubMed（药学权威补充）+ Crossref（DOI 元数据补全）
可选扩展：arXiv（AI 方法学前沿）
```

---

## 3. 文献检索 MCP 方案调研

### 3.1 paper-search-mcp 生态

调研发现 3 个活跃的 paper-search-mcp 实现：

| 项目 | 语言 | 支持数据源 | 特色 | 维护状态 |
|------|------|-----------|------|---------|
| **openags/paper-search-mcp** | Python | arXiv, PubMed, bioRxiv, medRxiv, Google Scholar, IACR, Semantic Scholar, Zenodo | 轻量，MCP SDK 原生 | 活跃（2025-08 更新） |
| **synapticore-io/paper-search-mcp** | Python | 上述 + Crossref, SearXNG | 扩展 SurrealDB 知识图谱 + Docling PDF 处理 + Docker | 活跃 fork |
| **Faminer/paper-search-mcp-nodejs** | Node.js | 13 平台（含 WoS, ScienceDirect, Springer, Wiley, Scopus） | TypeScript，平台覆盖最广 | 活跃（2025-09 更新） |

### 3.2 MCP 方案评估

**优点**：
- 标准化 MCP 协议，可与 Claude Desktop / LLM 客户端无缝集成
- 统一 Paper 数据模型，多数据源一致输出
- 异步 httpx 请求，效率高

**局限**：
- MCP Server 需要常驻进程（HF Spaces 免费版不支持后台进程）
- 对 GitHub Actions 定时任务而言，直接调用 REST API 比 MCP 更轻量
- paper-search-mcp 不含 OpenAlex（本项目主数据源）

### 3.3 结论

> **MCP 用于交互式研究与 LLM 辅助分析；CI/CD 管线中直接调用 REST API。**

在 GitHub Actions 定时嗅探流程中，直接使用 `requests` 库调用 OpenAlex/PubMed/Crossref REST API，无需 MCP Server 常驻。MCP 可作为本地开发阶段的辅助工具，用于人工探索检索策略和验证结果。

---

## 4. 自动化工作流方案对比

### 方案 A：GitHub Actions + Python 脚本（推荐 ✅）

```
GitHub Actions (cron) → Python 脚本 → OpenAlex/PubMed API → LLM 摘要 → JSONL 提交至 GitHub → HF Space 自动拉取重建
```

| 维度 | 评估 |
|------|------|
| 成本 | **$0**（公开仓库 Actions 无限免费） |
| 稳定性 | 高（GitHub 基础设施，内置重试与缓存） |
| 二次开发 | 高（标准 Python，无额外平台依赖） |
| 部署难度 | 低（仅需 `.github/workflows/` YAML） |
| 定时精度 | cron 最小间隔 5 分钟（对本场景足够） |
| LLM 集成 | 脚本内直接调用 OpenAI 兼容 API |
| 数据更新 | git commit → HF Space webhook → 自动重建 |

**架构图**：
```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                      │
│                                                           │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐ │
│  │  PDF Parser  │    │  Sniffer     │    │  HF Space   │ │
│  │  (Phase 1)   │    │  (Phase 2)   │    │  Frontend   │ │
│  │              │    │              │    │  (Phase 2)  │ │
│  │  本地PDF →   │    │  API检索 →   │    │             │ │
│  │  JSONL/SQLite│    │  LLM摘要 →   │    │  Streamlit  │ │
│  │              │    │  JSONL       │    │  Dashboard  │ │
│  └─────────────┘    └──────────────┘    └─────────────┘ │
│         │                   │                  ↑         │
│         ▼                   ▼                  │         │
│  ┌──────────────────────────────────┐          │         │
│  │     data/papers.jsonl (Git)      │──────────┘         │
│  │     data/papers.db (SQLite)      │                    │
│  └──────────────────────────────────┘                    │
│         ↑                                                 │
│         │                                                 │
│  ┌──────────────────────────────────────┐               │
│  │  .github/workflows/sniff.yml          │               │
│  │  cron: '0 6 * * *' (每日 6:00 UTC)   │               │
│  │                                       │               │
│  │  1. pip install deps                  │               │
│  │  2. python sniffer.py                 │               │
│  │  3. git commit data/papers.jsonl      │               │
│  │  4. (可选) 推送至 HF Dataset Repo      │               │
│  └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Hugging Face Space  │
│  (Streamlit Docker)  │
│                      │
│  读取 data/ 目录      │
│  渲染 Dashboard       │
│  Git push 触发重建    │
└─────────────────────┘
```

### 方案 B：n8n 自托管

```
n8n (VPS/本地) → HTTP Request 节点 → LLM 节点 → GitHub Commit 节点 → HF Space
```

| 维度 | 评估 |
|------|------|
| 成本 | 自托管免费，但需一台 VPS（~$5/月）或本地常驻机器 |
| 稳定性 | 中（需自行维护 n8n 实例运行） |
| 二次开发 | 中（可视化编排，但复杂逻辑仍需 Code 节点） |
| 部署难度 | 中（Docker 部署 n8n，配置工作流） |
| LLM 集成 | 内置 OpenAI/Anthropic 节点 |
| 数据更新 | 通过 GitHub API 节点自动提交 |

**优势**：可视化编排、400+ 集成节点、错误重试内置  
**劣势**：需额外 VPS 成本、平台依赖（工作流锁定在 n8n 内）、与 GitHub 仓库代码分离

### 方案 C：Dify 自托管

```
Dify (VPS) → Workflow 模式 → 知识库 + LLM → API 输出 → GitHub Actions 拉取
```

| 维度 | 评估 |
|------|------|
| 成本 | 自托管免费，但需 VPS（~$5/月，推荐 8 GB RAM） |
| 稳定性 | 中（多服务 Docker Compose，运维复杂度高） |
| 二次开发 | 低（工作流锁定在 Dify 平台内，迁移成本高） |
| 部署难度 | 高（Docker Compose 多服务栈，最低 4 GB RAM） |
| LLM 集成 | 原生 LLM-first 设计，Prompt 版本管理、RAG 内置 |
| 数据更新 | 需额外 webhook 串联 GitHub |

**优势**：LLM 编排能力最强、知识库与 RAG 原生支持  
**劣势**：平台锁定最严重、资源消耗最大、对本项目（定时检索+摘要）功能过剩

### 方案对比总览

| 维度 | 方案 A (GitHub Actions) | 方案 B (n8n) | 方案 C (Dify) |
|------|------------------------|-------------|--------------|
| **月成本** | **$0** | ~$5 (VPS) | ~$5-10 (VPS) |
| **部署复杂度** | **低** | 中 | 高 |
| **稳定性** | **高** | 中 | 中 |
| **二次开发** | **高（纯 Python）** | 中 | 低（平台锁定） |
| **LLM 集成** | 脚本直调 | 内置节点 | **原生最优** |
| **定时调度** | **cron 内置** | cron 内置 | 需配置 |
| **迁移成本** | **低** | 中 | 高 |
| **社区生态** | GitHub 原生 | 182K stars | 106K stars |

### 4.1 推荐方案

> **推荐方案 A：GitHub Actions + Python 脚本 + Streamlit on HF Spaces**

理由：
1. **零成本**：公开仓库 GitHub Actions 无限免费 + HF Spaces CPU Basic 免费
2. **零额外基础设施**：无需 VPS、无需维护 n8n/Dify 实例
3. **代码即配置**：所有逻辑在 Git 仓库内，版本可追溯、可复现
4. **二次开发潜力最高**：纯 Python，无平台锁定
5. **闭环最短**：`cron → 检索 → 摘要 → git commit → HF Space 自动重建`，全链路 GitHub 原生

---

## 5. 前端技术选型

### 5.1 Streamlit vs Gradio

| 维度 | Streamlit | Gradio |
|------|-----------|--------|
| 定位 | 通用数据仪表板 | ML 模型演示 |
| 布局能力 | **强**（多页面、侧边栏、列布局、tabs） | 弱（单函数界面为主） |
| 数据筛选 | **原生**（selectbox, multiselect, slider, data_editor） | 基础（需自定义回调） |
| 图表生态 | **Plotly / Altair / Bokeh / PyDeck** | Plotly / Matplotlib |
| 知识图谱 | **PyVis / NetworkX + Plotly** | 需自定义 |
| HF Spaces | 支持（Docker SDK + Streamlit 模板） | 原生支持 |
| 性能 | 脚本重跑模型（@st.cache_data 缓存） | 函数驱动，部分更新 |
| 适合场景 | **学术仪表板 + 数据筛选 + 可视化** | 模型推理演示 |

### 5.2 结论

> **选择 Streamlit（Docker SDK 部署于 HF Spaces）**

理由：
1. 本项目是**数据仪表板**而非模型推理演示——Streamlit 的多页面、筛选器、图表生态完全匹配
2. Streamlit 原生支持 `st.dataframe` 交互表格 + `st.selectbox` / `st.multiselect` 多维筛选
3. Plotly 交互图表 + PyVis 知识图谱可视化在 Streamlit 中集成成熟
4. HF Spaces 支持通过 Docker SDK 部署 Streamlit（`sdk: streamlit` 或 Docker + Streamlit 模板）

### 5.3 前端架构

```
complexform-ai-hub/
├── app.py                      # Streamlit 主入口
├── pages/
│   ├── 1_📋_Progress_Review.py  # ML/AI 进展全景
│   ├── 2_📄_Paper_Library.py    # 文献库浏览（本地+嗅探）
│   ├── 3_📊_Taxonomy.py         # 算法/领域分类图谱
│   └── 4_🔍_Paper_Sniffer.py    # 最新嗅探结果
├── data/
│   ├── papers.jsonl            # 结构化文献数据
│   ├── papers.db               # SQLite 索引
│   └── taxonomy.json           # 算法分类体系
├── src/
│   ├── parser.py               # PDF 解析模块
│   ├── sniffer.py              # API 检索模块
│   ├── summarizer.py           # LLM 摘要模块
│   └── viz.py                  # 可视化组件
├── .github/workflows/
│   └── sniff.yml               # 定时嗅探工作流
├── requirements.txt
└── README.md
```

---

## 6. 数据存储策略

### 6.1 存储方案

| 存储层 | 格式 | 用途 | 更新方式 |
|--------|------|------|---------|
| 主数据 | `data/papers.jsonl` | 所有文献的结构化记录（本地+嗅探） | git commit |
| 索引 | `data/papers.db` (SQLite) | 前端快速查询/过滤 | 脚本生成 |
| 分类体系 | `data/taxonomy.json` | 算法分类树/领域映射 | 手动维护+自动扩展 |
| HF Space 数据 | HF Dataset Repo（可选） | 嗅探结果镜像，供 Space 读取 | GitHub Actions 推送 |

### 6.2 JSONL 记录结构

```json
{
  "id": "openalex-W1234567890",
  "source": "openalex",
  "domain": "PLGA design",
  "title": "Machine learning-guided optimization of PLGA nanoparticles...",
  "authors": ["Zhang, Y.", "Li, X."],
  "journal": "Journal of Controlled Release",
  "publication_year": 2025,
  "doi": "10.1016/j.jconrel.2025.01.001",
  "url": "https://doi.org/10.1016/...",
  "oa_url": "https://...",
  "abstract": "Full abstract text...",
  "cited_by_count": 12,
  "topics": ["PLGA", "Nanoparticle", "Drug delivery"],
  "ml_summary": {
    "formulation_type": "PLGA nanoparticle",
    "input_features": ["polymer ratio", "molecular weight", "surfactant concentration"],
    "ai_model": "Random Forest + ANN ensemble",
    "prediction_target": "particle size, encapsulation efficiency",
    "key_findings": "RF achieved R²=0.94 for particle size prediction...",
    "summary_date": "2026-07-24"
  },
  "is_local": true,
  "local_path": "PLGA design/17_DOE与机器学习联合优化PLGA纳米粒生产.pdf",
  "sniffed_date": null
}
```

### 6.3 HF Space 持久化策略

HF Spaces 免费版磁盘是**非持久化**的（每次重建清空）。解决方案：

1. **数据随仓库提交**：`data/papers.jsonl` 直接在 Git 仓库内，Space 构建时自带
2. **嗅探结果通过 GitHub Actions commit 回仓库**：Space 每次重建自动获取最新数据
3. **可选**：使用 HF Dataset Repo 作为数据镜像，Space 运行时通过 `huggingface_hub` 拉取

---

## 7. LLM 摘要 Prompt Chain 设计

### 7.1 Prompt Chain 流程

```
输入：Title + Abstract + Metadata
         │
         ▼
    ┌─────────────────────────────────┐
    │  Step 1: 分类（Classification）  │
    │  Prompt: 判断该论文属于5个领域   │
    │  中的哪个/哪些，以及是否使用ML/AI │
    └────────────┬────────────────────┘
                 │ domain, is_ml
                 ▼
    ┌─────────────────────────────────┐
    │  Step 2: 结构化抽取（Extraction）│
    │  Prompt: 从摘要中抽取：           │
    │  - 制剂类型                      │
    │  - 输入特征/描述符               │
    │  - AI模型/算法                   │
    │  - 预测目标                      │
    │  - 主要发现（≤3句话）            │
    └────────────┬────────────────────┘
                 │ ml_summary dict
                 ▼
    ┌─────────────────────────────────┐
    │  Step 3: 输出（Output）          │
    │  合并为标准 JSONL 记录            │
    └─────────────────────────────────┘
```

### 7.2 核心 Prompt 模板

```python
CLASSIFICATION_PROMPT = """You are an expert in pharmaceutical formulation science.
Given the following paper title and abstract, determine:
1. Which of these 5 domains does this paper belong to? (choose one or more)
   - in_situ_gel
   - liposome
   - microsphere
   - nanocrystal
   - plga_design
2. Does this paper use machine learning or artificial intelligence methods? (true/false)

Title: {title}
Abstract: {abstract}

Respond in JSON format:
{{"domain": ["..."], "is_ml": true/false}}"""

EXTRACTION_PROMPT = """You are an expert in pharmaceutical formulation and AI/ML.
Extract structured information from this paper:

Title: {title}
Abstract: {abstract}

Extract:
- formulation_type: The specific formulation system studied
- input_features: List of input variables/descriptors used
- ai_model: The ML/AI model(s) or algorithm(s) used
- prediction_target: What the model predicts or optimizes
- key_findings: 2-3 sentence summary of main results

Respond in JSON format:
{{"formulation_type": "...", "input_features": [...], "ai_model": "...", "prediction_target": "...", "key_findings": "..."}}"""
```

---

## 8. 检索策略

### 8.1 领域检索词矩阵

```python
SEARCH_QUERIES = {
    "in_situ_gel": [
        '"in situ gel" AND ("machine learning" OR "artificial intelligence" OR "deep learning")',
        '"thermosensitive gel" AND ("prediction" OR "optimization" OR "neural network")',
        '"stimuli-responsive gel" AND ("machine learning" OR "AI")',
    ],
    "liposome": [
        '"liposome" AND ("machine learning" OR "artificial intelligence" OR "deep learning")',
        '"lipid nanoparticle" AND ("machine learning" OR "prediction" OR "optimization")',
        '"LNP" AND ("machine learning" OR "AI" OR "neural network")',
    ],
    "microsphere": [
        '"microsphere" AND ("machine learning" OR "artificial intelligence")',
        '"PLGA microsphere" AND ("prediction" OR "optimization" OR "deep learning")',
        '"sustained release microsphere" AND ("machine learning" OR "AI")',
    ],
    "nanocrystal": [
        '"nanocrystal" AND ("machine learning" OR "artificial intelligence")',
        '"nanosuspension" AND ("prediction" OR "optimization" OR "neural network")',
        '"wet milling" AND ("machine learning" OR "AI") AND ("nanocrystal" OR "nanosuspension")',
    ],
    "plga_design": [
        '"PLGA" AND ("machine learning" OR "artificial intelligence" OR "deep learning")',
        '"PLGA nanoparticle" AND ("prediction" OR "optimization" OR "neural network")',
        '"PLGA degradation" AND ("machine learning" OR "modeling" OR "AI")',
    ],
}
```

### 8.2 检索频率与去重

| 参数 | 值 | 理由 |
|------|-----|------|
| 定时频率 | 每日 1 次（UTC 06:00） | 学术论文日更新量适中，避免 API 过载 |
| 每次检索 | 每领域 top 25 篇 | 5 领域 × 25 = 125 篇/日上限 |
| 去重 | DOI + Title 模糊匹配 | 防止重复入库 |
| 时间窗口 | 最近 90 天滚动 | 捕获最新成果同时避免遗漏 |

---

## 9. 环境变量清单

| 变量名 | 用途 | 必需 | 存放位置 |
|--------|------|------|---------|
| `OPENAI_API_KEY` | LLM 摘要生成 | 是* | GitHub Secrets |
| `OPENAI_API_BASE` | API 端点（兼容 DeepSeek/方舟） | 否 | GitHub Secrets |
| `OPENAI_MODEL` | 模型名称 | 否 | GitHub Secrets |
| `HF_TOKEN` | 推送至 HF Space/Dataset | 是 | GitHub Secrets |
| `OPENALEX_MAILTO` | OpenAlex Polite Pool | 是 | 代码内（非敏感） |
| `PUBMED_API_KEY` | PubMed 速率提升 | 否 | GitHub Secrets |

> *LLM 可使用任意 OpenAI 兼容 API（OpenAI / DeepSeek / 方舟 Coding Plan / c2846 代理等），通过 `OPENAI_API_KEY` + `OPENAI_API_BASE` + `OPENAI_MODEL` 三参数配置。

---

## 10. CI/CD 闭环设计

```yaml
# .github/workflows/sniff.yml
name: Daily Paper Sniffer
on:
  schedule:
    - cron: '0 6 * * *'    # 每日 UTC 06:00（北京时间 14:00）
  workflow_dispatch:        # 手动触发

jobs:
  sniff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run sniffer
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_BASE: ${{ secrets.OPENAI_API_BASE }}
          OPENAI_MODEL: ${{ secrets.OPENAI_MODEL }}
          OPENALEX_MAILTO: ${{ secrets.OPENALEX_MAILTO }}
        run: python src/sniffer.py

      - name: Commit new papers
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/papers.jsonl data/papers.db
          git diff --staged --quiet || git commit -m "chore: daily paper sniff $(date -u +%Y-%m-%d)"
          git push

      - name: Sync to Hugging Face
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: python src/sync_to_hf.py
```

### 闭环流程

```
1. GitHub Actions cron 触发（每日 UTC 06:00）
2. sniffer.py 调用 OpenAlex/PubMed API 检索 5 领域最新论文
3. summarizer.py 调用 LLM 生成结构化摘要
4. 新论文追加至 data/papers.jsonl + 重建 data/papers.db
5. git commit & push 回仓库
6. （可选）sync_to_hf.py 推送数据至 HF Dataset Repo
7. HF Space 检测到仓库更新 → 自动重建 → 前端刷新
```

---

## 11. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| LLM API 费用 | 每日 ~125 篇 × 2 步 Prompt ≈ 250 次调用 | 使用低成本模型（DeepSeek-V4 / 方舟 Coding Plan），预估 <$0.5/日 |
| OpenAlex 速率限制 | $1/天免费额度可能不够 | 有 Key 时 10,000 搜索/日足够；退化为仅 Title 匹配可降至 500 次 |
| HF Space 休眠 | 48h 无访问自动休眠 | GitHub Actions 每日 push 触发重建，自然保持活跃 |
| Git 仓库膨胀 | JSONL 持续增长 | 每季度归档旧数据至 `data/archive/`，主文件仅保留近 2 年 |
| API 不可用 | OpenAlex/PubMed 宕机 | 脚本内置 try/except + 重试 + 降级策略（跳过失败领域） |

---

## 12. 实施路线图

| 阶段 | 内容 | 交付物 |
|------|------|--------|
| **Phase 1** | 本地 PDF 解析 + 数据库初始化 | `src/parser.py` + `data/papers.jsonl` + `data/papers.db` |
| **Phase 2a** | 嗅探引擎 + LLM 摘要管线 | `src/sniffer.py` + `src/summarizer.py` |
| **Phase 2b** | Streamlit Dashboard 前端 | `app.py` + `pages/` + `src/viz.py` |
| **Phase 3** | CI/CD + 部署手册 | `.github/workflows/sniff.yml` + `DEPLOY.md` |

---

## 13. 技术栈总览

```
┌────────────────────────────────────────────┐
│              技术栈                         │
├──────────────┬─────────────────────────────┤
│ 数据源 API   │ OpenAlex (主) + PubMed (辅) │
│              │ + Crossref (补全)           │
├──────────────┼─────────────────────────────┤
│ 检索方式     │ Python requests 直接调用     │
│              │ (CI 中) + paper-search-mcp  │
│              │ (本地开发辅助)              │
├──────────────┼─────────────────────────────┤
│ LLM          │ OpenAI 兼容 API             │
│              │ (DeepSeek/方舟/OpenAI 均可)  │
├──────────────┼─────────────────────────────┤
│ 数据存储     │ JSONL (主) + SQLite (索引)  │
├──────────────┼─────────────────────────────┤
│ 前端框架     │ Streamlit (Docker on HF)    │
├──────────────┼─────────────────────────────┤
│ 可视化       │ Plotly + PyVis + Altair     │
├──────────────┼─────────────────────────────┤
│ CI/CD        │ GitHub Actions (cron)       │
├──────────────┼─────────────────────────────┤
│ 部署         │ Hugging Face Spaces (免费)  │
├──────────────┼─────────────────────────────┤
│ 代码托管     │ GitHub (公开仓库)           │
├──────────────┼─────────────────────────────┤
│ PDF 解析     │ PyMuPDF (fitz) + pdfplumber │
├──────────────┼─────────────────────────────┤
│ 自动化编排   │ GitHub Actions (推荐)       │
│              │ n8n (可选替代)              │
│              │ Dify (不推荐，过重)         │
└──────────────┴─────────────────────────────┘
```

---

## 附录 A：paper-search-mcp 本地使用指南（可选）

如需本地开发阶段使用 MCP 辅助文献探索：

```bash
# 安装
pip install paper-search-mcp

# 配置 Claude Desktop / MCP Client
{
  "mcpServers": {
    "paper_search_server": {
      "command": "uv",
      "args": ["run", "-m", "paper_search_mcp.server"],
      "env": {
        "SEMANTIC_SCHOLAR_API_KEY": ""
      }
    }
  }
}
```

注意：paper-search-mcp 不含 OpenAlex 数据源，且需要常驻进程，不适合 CI/CD 环境。

---

## 附录 B：HF Spaces 免费额度详情（2026-07 核实）

| 资源 | 免费额度 |
|------|---------|
| CPU | 2 vCPU |
| 内存 | 16 GB RAM |
| 磁盘 | 50 GB（非持久化，重建清空） |
| 带宽 | 不限量（公平使用） |
| 构建分钟 | 不限量 |
| 休眠策略 | 48h 无访问自动休眠，首次访问冷启动 ~30-60s |
| GPU | ZeroGPU（共享 A100 80GB，按秒配额，需 Pro $9/月 获得更多配额） |
| 自定义域名 | Pro 功能（$9/月） |
| 公开访问 | 免费（*.hf.space URL） |

---

## 附录 C：GitHub Actions 免费额度详情（2026-07 核实）

| 资源 | 免费额度 |
|------|---------|
| 公开仓库分钟数 | **无限** |
| 私有仓库分钟数 | 2,000 分钟/月 |
| 存储 | 500 MB |
| 并发作业 | 20 |
| 单作业超时 | 6 小时 |
| cron 最小间隔 | 5 分钟（实际建议 ≥1 小时） |
| Secrets | 无限 |
| 矩阵作业上限 | 256 |

---

*文档结束*
