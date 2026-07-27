# ComplexForm-AI Hub

> Open-source platform tracking how machine learning reshapes pharmaceutical formulation science.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)

## What is this?

ComplexForm-AI Hub is an open-source academic platform that curates and visualizes the latest ML/AI advances across five complex formulation domains:

- **In Situ Gel** (原位凝胶)
- **Liposome** (脂质体)
- **Microsphere** (微球)
- **Nanocrystal** (纳米晶)
- **PLGA Design** (PLGA 设计)

## Features

- **Paper Library**: 90+ curated papers with ML/AI classification, formulation type extraction, and DOI links. Seed papers are integrated by domain (no separate "local library" section) and marked with a **Curated** badge; daily-sniffed papers are marked **Latest**.
- **Case Study**: Interactive walkthrough of FormulationLAI - a full reproduction of the J. Control. Release 389 (2026) 114418 framework for long-acting injectable formulation development (dataset -> ML prediction -> PBPK/PD -> closed-loop optimization -> MD validation)
- **ML Foundations**: A three-page learning module for formulation scientists new to machine learning:
  - **ML Basics** (`/ml-basics`): What is ML vs. traditional programming, three learning paradigms, formulation data types & feature engineering, train/val/test splits, overfitting, cross-validation, evaluation metrics (R², RMSE, MAE, AUC) — with SVG diagrams, formulas, and scikit-learn code snippets
  - **ML Algorithms** (`/ml-algorithms`): Decision-tree guided algorithm selector, real collection frequency chart (619 papers), and deep-dive cards for 9 method families (Linear/PLS, Random Forest, XGBoost, SVM, ANN, CNN, Gaussian Process & Bayesian Opt, Genetic Algorithm, Clustering & PCA, Generative Models) — each with intuition, formula, runnable code, and a real paper from the hub's collection
  - **ML Workflow** (`/ml-workflow`): Seven-step project workflow (Define → Collect → Clean → Feature Eng. → Model → Validate → Deploy), QbD/DoE integration diagram, model validation strategies, GxP/CSV compliance essentials, and a curated learning path with recommended books, tools, and paper-reading guide
- **Daily Sniffer**: Automated SCI paper discovery via OpenAlex + PubMed APIs
- **LLM Summarization**: Two-step prompt chain for structured academic summaries
- **Interactive Dashboard**: Domain distribution, publication trends, AI method taxonomy
- **Knowledge Graph**: Force-directed graph showing domain-method relationships
- **Bilingual UI**: English (default) / Simplified Chinese, switchable at any time

## Quick Start

### Local Development

```bash
# Backend: parse local PDFs and build database
python src/parser.py
python src/build_taxonomy.py
python src/export_frontend.py

# Frontend: dev server
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Deploy

See [DEPLOY.md](DEPLOY.md) for complete deployment instructions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Data sources | OpenAlex API, PubMed E-utilities |
| Backend | Python 3.12, PyMuPDF, SQLite, JSONL |
| LLM | OpenAI-compatible API (DeepSeek / OpenAI / Ark / NVIDIA NIM) |
| Frontend | React 18, Vite 5, TailwindCSS 3, Recharts |
| CI/CD | GitHub Actions |
| Hosting | Hugging Face Spaces (Docker + nginx) |

## Project Structure

```
complexform-ai-hub/
├── src/                    # Python backend
│   ├── config.py           # Central configuration
│   ├── parser.py           # PDF parser + rule-based extraction
│   ├── sniffer.py          # OpenAlex/PubMed paper sniffer
│   ├── summarizer.py       # LLM two-step prompt chain
│   ├── build_taxonomy.py   # Aggregation statistics
│   └── export_frontend.py  # Frontend JSON exporter
├── frontend/               # React frontend
│   ├── src/pages/          # 8 pages: Overview, Library, Taxonomy, Graph, CaseStudy, MLBasics, MLAlgorithms, MLWorkflow
│   ├── src/components/ml/  # Shared ML Foundations UI components (CodeBlock, Formula, CaseCard, etc.)
│   ├── public/case-study/  # Standalone FormulationLAI interactive walkthrough
│   ├── Dockerfile          # HF Spaces Docker
│   └── nginx.conf          # nginx config
├── data/                   # Database (JSONL + SQLite + JSON)
├── .github/workflows/      # CI/CD: sniff.yml + deploy.yml
├── STRATEGY.md             # Architecture design document
├── DEPLOY.md               # Deployment manual
└── .env.example            # Environment variable template
```

## Documentation

- [技术架构选型与策略设计书](STRATEGY.md)
- [部署操作手册](DEPLOY.md)
- [环境变量清单](.env.example)

## License

MIT
