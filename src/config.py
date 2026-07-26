"""
ComplexForm-AI Hub - 集中配置模块
==================================
统一管理 5 个复杂制剂领域的定义、检索词矩阵、算法词典与制剂类型词典。
所有解析(parser)、嗅探(sniffer)、摘要(summarizer)、前端(app)模块均从此处引用，
确保词典单点维护、高内聚低耦合。
"""

from __future__ import annotations

from pathlib import Path

# ---------------------------------------------------------------------------
# 路径配置（基于项目根目录动态推导，避免硬编码绝对路径）
# ---------------------------------------------------------------------------
# config.py 位于 <root>/src/config.py，因此项目根 = 上两级
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

JSONL_PATH = DATA_DIR / "papers.jsonl"
SQLITE_PATH = DATA_DIR / "papers.db"
TAXONOMY_PATH = DATA_DIR / "taxonomy.json"

# 本地文献库根目录（5 个领域文件夹的父目录）。默认为项目上一级（工作区根）。
# 可通过环境变量 CFAH_LIBRARY_ROOT 覆盖。
LIBRARY_ROOT = PROJECT_ROOT.parent

# ---------------------------------------------------------------------------
# 5 个复杂制剂领域定义
# key: 内部标识；folder: 本地文件夹名；label: 展示名；icon: 前端图标
# ---------------------------------------------------------------------------
DOMAINS: dict[str, dict] = {
    "in_situ_gel": {
        "folder": "InSituGel",
        "label": "In Situ Gel",
        "label_cn": "原位凝胶",
        "icon": "💧",
    },
    "liposome": {
        "folder": "Liposome",
        "label": "Liposome",
        "label_cn": "脂质体",
        "icon": "🧫",
    },
    "microsphere": {
        "folder": "Microsphere",
        "label": "Microsphere",
        "label_cn": "微球",
        "icon": "⚪",
    },
    "nanocrystal": {
        "folder": "Nanocrystal",
        "label": "Nanocrystal",
        "label_cn": "纳米晶",
        "icon": "💎",
    },
    "plga_design": {
        "folder": "PLGA design",
        "label": "PLGA Design",
        "label_cn": "PLGA 设计",
        "icon": "🧬",
    },
}

# folder -> domain_key 反查表
FOLDER_TO_DOMAIN = {v["folder"]: k for k, v in DOMAINS.items()}

# ---------------------------------------------------------------------------
# 检索词矩阵（供 Phase 2 sniffer 使用；OpenAlex / PubMed 通用布尔查询）
# ---------------------------------------------------------------------------
SEARCH_QUERIES: dict[str, list[str]] = {
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

# ---------------------------------------------------------------------------
# AI/ML 算法词典（用于规则抽取与前端分类筛选）
# canonical -> 匹配别名列表（小写匹配）
# ---------------------------------------------------------------------------
AI_MODELS: dict[str, list[str]] = {
    "Random Forest": ["random forest", "random-forest", " rf ", "(rf)", "rf model"],
    "XGBoost": ["xgboost", "xgb", "gradient boosting", "gbdt", "gbm", "lightgbm", "catboost"],
    "ANN / MLP": ["artificial neural network", "ann ", "(ann)", "multilayer perceptron",
                  "multi-layer perceptron", "mlp", "feedforward neural"],
    "Deep Learning": ["deep learning", "deep neural", "dnn"],
    "CNN": ["convolutional neural network", "cnn", "convnet", "3d-cnn", "3dcnn"],
    "RNN / LSTM": ["recurrent neural network", "lstm", "gru", "rnn"],
    "GNN": ["graph neural network", "gnn", "message passing", "graph convolution",
            "graph attention"],
    "Transformer / LLM": ["transformer", "large language model", "llm", "attention mechanism",
                          "bert", "gpt", "chemical language model", "foundation model"],
    "SVM": ["support vector machine", "support vector regression", "svm", "svr"],
    "Gaussian Process": ["gaussian process", "gpr", "kriging", "bayesian optimization"],
    "Linear / PLS": ["linear regression", "partial least squares", "pls regression",
                     "lasso", "ridge regression", "elastic net"],
    "Decision Tree": ["decision tree", "cart ", "regression tree"],
    "k-NN": ["k-nearest", "knn", "nearest neighbor"],
    "Genetic Algorithm": ["genetic algorithm", "evolutionary algorithm", "particle swarm"],
    "Molecular Dynamics": ["molecular dynamics", " md simulation", "md simulations"],
    "AutoML": ["automl", "automated machine learning", "auto-sklearn"],
    "Ensemble": ["ensemble", "stacking", "voting classifier", "bagging"],
    "Reinforcement Learning": ["reinforcement learning", "q-learning", "policy gradient"],
    "VAE / GAN": ["variational autoencoder", "vae", "generative adversarial", "gan ",
                  "diffusion model", "generative model"],
}

# ---------------------------------------------------------------------------
# 制剂类型词典（用于规则抽取制剂系统）
# ---------------------------------------------------------------------------
FORMULATION_TYPES: dict[str, list[str]] = {
    "In situ gel": ["in situ gel", "in-situ gel", "in situ-forming", "in situ forming"],
    "Thermosensitive hydrogel": ["thermosensitive", "thermo-responsive", "thermoresponsive",
                                 "temperature-sensitive gel"],
    "Hydrogel": ["hydrogel", "nanogel"],
    "Liposome": ["liposome", "liposomal"],
    "Lipid nanoparticle (LNP)": ["lipid nanoparticle", "lnp", "solid lipid nanoparticle",
                                 "nanostructured lipid"],
    "PLGA microsphere": ["plga microsphere", "plga microparticle"],
    "PLGA nanoparticle": ["plga nanoparticle", "plga np", "plga-based nanoparticle"],
    "PLGA implant": ["plga implant", "in situ-forming implant", "long-acting injectable",
                     "lai "],
    "Microsphere": ["microsphere", "microparticle", "microencapsulation"],
    "Nanocrystal": ["nanocrystal", "nano-crystal"],
    "Nanosuspension": ["nanosuspension", "nano-suspension"],
    "Block copolymer": ["block copolymer", "copolymer", "star block"],
    "mRNA / nucleic acid carrier": ["mrna", "sirna", "circrna", "nucleic acid delivery",
                                    "gene delivery"],
    "Nanoparticle (generic)": ["nanoparticle", "nanocarrier"],
}

# ---------------------------------------------------------------------------
# 输入特征/描述符词典（用于规则抽取常见处方变量）
# ---------------------------------------------------------------------------
INPUT_FEATURES: dict[str, list[str]] = {
    "Polymer molecular weight": ["molecular weight", "mw ", "polymer mw"],
    "Polymer/lipid ratio": ["polymer ratio", "lipid ratio", "la:ga", "lactide"],
    "Surfactant concentration": ["surfactant", "stabilizer concentration", "emulsifier"],
    "Particle size": ["particle size", "droplet size", "hydrodynamic diameter"],
    "Zeta potential": ["zeta potential", "surface charge"],
    "Drug loading": ["drug loading", "encapsulation efficiency", "loading capacity"],
    "Temperature": ["temperature", "gelation temperature"],
    "pH": ["ph value", " ph ", "ph-dependent"],
    "Concentration": ["concentration", "drug concentration"],
    "Process parameters": ["stirring", "flow rate", "milling time", "homogenization",
                           "spray drying", "microfluidic"],
    "Molecular descriptors": ["molecular descriptor", "smiles", "fingerprint", "rdkit",
                              "physicochemical descriptor"],
    "Viscosity": ["viscosity", "rheolog"],
}

# ---------------------------------------------------------------------------
# ML/AI 判定关键词（判断论文是否使用 ML/AI）
# ---------------------------------------------------------------------------
ML_INDICATOR_KEYWORDS: list[str] = [
    "machine learning", "artificial intelligence", "deep learning", "neural network",
    "random forest", "xgboost", "gradient boosting", "support vector",
    "predictive model", "data-driven", "data driven", "gaussian process",
    "bayesian optimization", "graph neural", "transformer", "large language model",
    "convolutional", "regression model", "classification model", "automl",
    "generative model", "reinforcement learning", "supervised learning",
    "unsupervised learning", "feature importance", "training set", "test set",
    "cross-validation", "cross validation",
]

# ---------------------------------------------------------------------------
# LLM 配置（OpenAI 兼容；供 summarizer 使用）
# 通过环境变量注入，代码内不硬编码密钥。
# ---------------------------------------------------------------------------
import os

LLM_CONFIG = {
    "api_key": os.environ.get("OPENAI_API_KEY", ""),
    "base_url": os.environ.get("OPENAI_API_BASE", "https://api.openai.com/v1"),
    "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
}

# ---------------------------------------------------------------------------
# NVIDIA NIM 模型降级链
# 按优先级依次测试，第一个可用的模型作为本次嗅探的 LLM 后端。
# 用户可通过 OPENAI_MODEL 环境变量指定单个模型（跳过降级链），
# 也可通过 OPENAI_MODEL_FALLBACK 环境变量用逗号分隔自定义降级顺序。
# ---------------------------------------------------------------------------
NVIDIA_MODEL_CHAIN = [
    "nvidia/nemotron-3-super-120b-a12b",
    "nvidia/nemotron-3-ultra-550b-a55b",
    "deepseek-ai/deepseek-v4-flash",
]

def get_model_chain() -> list[str]:
    """返回模型降级链列表。
    
    优先级：
    1. 若 OPENAI_MODEL 环境变量设置了单个模型 -> [该模型]（不降级）
    2. 若 OPENAI_MODEL_FALLBACK 设置了逗号分隔的列表 -> 该列表
    3. 默认 -> NVIDIA_MODEL_CHAIN
    """
    single = os.environ.get("OPENAI_MODEL", "").strip()
    if single:
        return [single]
    fallback = os.environ.get("OPENAI_MODEL_FALLBACK", "").strip()
    if fallback:
        models = [m.strip() for m in fallback.split(",") if m.strip()]
        if models:
            return models
    return list(NVIDIA_MODEL_CHAIN)

# OpenAlex Polite Pool 邮箱（非敏感，可硬编码或环境变量覆盖）
OPENALEX_MAILTO = os.environ.get("OPENALEX_MAILTO", "complexform.ai.hub@example.com")
