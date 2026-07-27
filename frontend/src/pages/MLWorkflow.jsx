import { useLang } from "../i18n/index.jsx";
import {
  PageHero, SectionHead, SubHead, CodeBlock, Formula, ConceptCard, Callout, SideNav, Tag,
} from "../components/ml/ui.jsx";

/* ===========================================================================
 * SVG: 7-step workflow pipeline (horizontal, wraps on small screens).
 * ======================================================================== */
function SvgPipeline({ l }) {
  const steps = [
    { n: "1", label: l.s1, color: "#2a7ab0", bg: "#E6F1FB" },
    { n: "2", label: l.s2, color: "#2a7ab0", bg: "#E6F1FB" },
    { n: "3", label: l.s3, color: "#BA7517", bg: "#FAEEDA" },
    { n: "4", label: l.s4, color: "#BA7517", bg: "#FAEEDA" },
    { n: "5", label: l.s5, color: "#1D9E75", bg: "#E3F3EC" },
    { n: "6", label: l.s6, color: "#1D9E75", bg: "#E3F3EC" },
    { n: "7", label: l.s7, color: "#534AB7", bg: "#EFEDF8" },
  ];
  const w = 92, gap = 6;
  return (
    <svg viewBox="0 0 700 120" className="w-full h-auto" role="img" aria-label={l.aria}>
      {steps.map((s, i) => {
        const x = 8 + i * (w + gap);
        return (
          <g key={s.n}>
            <rect x={x} y="20" width={w} height="56" rx="8" fill={s.bg} stroke={s.color} strokeWidth="1.3" />
            <circle cx={x + 18} cy="38" r="11" fill={s.color} />
            <text x={x + 18} y="42" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="#fff" fontWeight="700">{s.n}</text>
            <text x={x + w / 2 + 6} y="42" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9.5" fill="#2C2C2A" fontWeight="600">
              {s.label.length > 12 ? s.label.slice(0, 11) + "\u2026" : s.label}
            </text>
            <text x={x + w / 2 + 6} y="56" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8.5" fill="#5F5E5A">
              {s.label.length > 12 ? s.label.slice(11) : ""}
            </text>
            {i < steps.length - 1 && (
              <g stroke="#888780" strokeWidth="1.3" fill="none">
                <line x1={x + w} y1="48" x2={x + w + gap} y2="48" />
                <path d={`M${x + w + gap - 3},45 L${x + w + gap},48 L${x + w + gap - 3},51`} stroke="#888780" />
              </g>
            )}
          </g>
        );
      })}
      {/* iteration loop-back arrow */}
      <path d="M 650 76 Q 660 100, 350 100 Q 40 100, 50 76" fill="none" stroke="#BA7517" strokeWidth="1.2" strokeDasharray="4 3" />
      <text x="350" y="114" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9.5" fill="#854F0B" fontStyle="italic">{l.iterate}</text>
    </svg>
  );
}

/* ===========================================================================
 * SVG: QbD + DoE + ML intersection diagram.
 * ======================================================================== */
function SvgQbDML({ l }) {
  return (
    <svg viewBox="0 0 380 250" className="w-full h-auto" role="img" aria-label={l.aria}>
      {/* QbD circle */}
      <circle cx="120" cy="120" r="80" fill="rgba(42,122,176,0.08)" stroke="#2a7ab0" strokeWidth="1.6" />
      <text x="120" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fontWeight="600" fill="#2a7ab0">{l.qbd}</text>
      <text x="120" y="78" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fill="#0c3070">{l.qbdD}</text>
      {/* DoE circle */}
      <circle cx="260" cy="120" r="80" fill="rgba(186,117,23,0.08)" stroke="#BA7517" strokeWidth="1.6" />
      <text x="260" y="60" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fontWeight="600" fill="#BA7517">{l.doe}</text>
      <text x="260" y="78" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fill="#854F0B">{l.doeD}</text>
      {/* ML circle */}
      <circle cx="190" cy="165" r="65" fill="rgba(29,158,117,0.08)" stroke="#1D9E75" strokeWidth="1.6" />
      <text x="190" y="200" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="14" fontWeight="600" fill="#1D9E75">{l.ml}</text>
      <text x="190" y="216" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9.5" fill="#0f6b4e">{l.mlD}</text>
      {/* intersection labels */}
      <text x="195" y="118" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9.5" fill="#2C2C2A" fontWeight="600">{l.intersect1}</text>
      <text x="148" y="150" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fill="#2C2C2A">{l.intersect2}</text>
      <text x="240" y="150" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fill="#2C2C2A">{l.intersect3}</text>
      <text x="190" y="165" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8.5" fill="#1D9E75" fontWeight="600">{l.center}</text>
    </svg>
  );
}

/* ===========================================================================
 * SVG: Validation strategy (internal / external / temporal).
 * ======================================================================== */
function SvgValidation({ l }) {
  const items = [
    { x: 20, label: l.int1, desc: l.intD, color: "#2a7ab0", bg: "#E6F1FB" },
    { x: 145, label: l.ext1, desc: l.extD, color: "#BA7517", bg: "#FAEEDA" },
    { x: 270, label: l.tmp1, desc: l.tmpD, color: "#1D9E75", bg: "#E3F3EC" },
  ];
  return (
    <svg viewBox="0 0 400 130" className="w-full h-auto" role="img" aria-label={l.aria}>
      {items.map((c) => (
        <g key={c.label}>
          <rect x={c.x} y="12" width="110" height="100" rx="8" fill={c.bg} stroke={c.color} strokeWidth="1.3" />
          <circle cx={c.x + 55} cy="36" r="12" fill="#fff" stroke={c.color} strokeWidth="1.4" />
          <text x={c.x + 55} y="40" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="13" fill={c.color} fontWeight="700">{"\u2713"}</text>
          <text x={c.x + 55} y="64" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="12.5" fontWeight="600" fill={c.color}>{c.label}</text>
          <foreignObject x={c.x + 5} y="70" width="100" height="38">
            <p xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: "9.5px", color: "#5F5E5A", textAlign: "center", margin: "0", lineHeight: "1.3" }}>{c.desc}</p>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

/* ===========================================================================
 * Bilingual copy.
 * ======================================================================== */
const COPY = {
  en: {
    kicker: "ML Foundations \u00b7 03",
    title: "From data to deployed model: the formulation ML workflow",
    sub: "A practical, seven-step guide to running a machine-learning project in a pharmaceutical formulation lab - plus how ML fits with QbD/DoE, how to validate and document models, and where to start learning more.",
    badges: ["7-step workflow", "QbD + DoE integration", "Validation & compliance", "Learning path"],
    toc: "On this page",

    /* pipeline svg labels */
    pipeline: {
      aria: "Seven-step ML workflow pipeline",
      s1: "Define", s2: "Collect", s3: "Clean & EDA", s4: "Feature eng.",
      s5: "Model", s6: "Validate", s7: "Deploy",
      iterate: "iterate: monitor, retrain, improve",
    },

    /* Step details */
    s1k: "Step 1 \u00b7 Problem definition",
    s1t: "Start with a question, not a model",
    s1sub: "The most common failure mode is solving the wrong problem. Write down: what are you predicting, for whom, and what decision will it inform?",
    s1Body: "Define the task type (regression, classification, clustering), the target variable, and the success criterion. For example: 'predict cumulative drug release at 24 h (\u00b5g/mL) within \u00b115% relative error' is a well-posed regression problem. 'Classify tablets as acceptable / defective' is a classification problem.",
    s1Code: `# Write a one-line problem charter
TASK_TYPE   = "regression"          # or "classification", "clustering"
TARGET      = "release_24h_pct"     # what you predict
SUCCESS     = "R2 > 0.85, MAE < 5%" # acceptance threshold
DECISION    = "adjust polymer ratio"  # what action follows`,

    s2k: "Step 2 \u00b7 Data collection",
    s2t: "Your data quality sets the ceiling",
    s2sub: "ML cannot learn what is not in the data. In formulation R&D this means lab records, process logs, analytical results, and sometimes images or spectra.",
    s2Body: "Collect raw data from experiments, historical DoE runs, or literature. Capture not just the inputs (composition, process parameters) and outputs (release, particle size, stability) but also metadata: batch ID, operator, instrument, date. Small but well-documented datasets often outperform large messy ones.",
    s2Callout: "If you have fewer than ~30 rows, consider whether more experiments are needed before modelling. Transfer learning or literature-augmented approaches can help when lab data is scarce.",

    s3k: "Step 3 \u00b7 Data cleaning & EDA",
    s3t: "Know your data before you model it",
    s3sub: "Exploratory data analysis (EDA) reveals outliers, missing values, and the shape of relationships - all of which will silently break your model if ignored.",
    s3Body: "Check distributions, pairwise correlations, and missing-value patterns. In formulation data, watch for: batch-to-batch variability, collinear excipient fractions (they sum to 100%), and instruments that drifted over time. Visualise each input vs. the target before choosing a model.",
    s3Code: `import pandas as pd
import seaborn as sns

df = pd.read_csv("formulation_data.csv")

# quick health check
print(df.describe())
print("missing:\\n", df.isna().sum())
print("corr with target:\\n", df.corr(numeric_only=True)["release_24h"].sort_values())

# visual: scatter of each variable vs target
sns.pairplot(df, y_vars=["release_24h"], height=3)`,

    s4k: "Step 4 \u00b7 Feature engineering",
    s4t: "Transform inputs into signals the model can use",
    s4sub: "Raw variables rarely enter a model unchanged. Feature engineering is the art of creating informative inputs.",
    s4Body: "Common transformations for formulation data: standardise or min-max scale continuous variables; encode categorical factors (e.g. polymer grade) as one-hot; create interaction terms (polymer \u00d7 plasticiser); derive domain-specific features like the theoretical glass-transition temperature or Higuchi release constant.",
    s4Formula: "x_scaled = (x - \u03bc) / \u03c3    (z-score standardisation)",
    s4FormulaNote: " \u03bc = mean, \u03c3 = std. dev. of the training set only; apply same \u03bc, \u03c3 to test data.",
    s4Code: `from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

numeric_features = ["polymer_pct", "drug_load", "rpm"]
categorical_features = ["polymer_grade"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), numeric_features),
    ("cat", OneHotEncoder(drop="first"), categorical_features),
])

# wrap in a pipeline so leakage is impossible
pipe = Pipeline([("prep", preprocessor), ("model", RandomForestRegressor())])`,

    s5k: "Step 5 \u00b7 Model selection & training",
    s5t: "Start simple, then add complexity only if needed",
    s5sub: "The best model is the simplest one that meets your success criterion. Begin with linear regression or a random forest, then try more complex methods only if they add real value.",
    s5Body: "Use cross-validation to compare candidates. For small formulation datasets (n < 100), prefer models with few parameters or strong regularisation. Avoid deep neural networks unless you have hundreds of rows or are working with images/spectra. Always set a random seed for reproducibility.",
    s5Code: `from sklearn.model_selection import cross_val_score, KFold
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR

cv = KFold(n_splits=5, shuffle=True, random_state=42)

candidates = {
    "Ridge":  Ridge(alpha=1.0),
    "RF":     RandomForestRegressor(n_estimators=300, random_state=42),
    "SVR":    SVR(kernel="rbf", C=10),
}

for name, m in candidates.items():
    scores = cross_val_score(m, X_train, y_train, cv=cv, scoring="r2")
    print(f"{name:12s}  R2 = {scores.mean():.3f} \u00b1 {scores.std():.3f}")`,

    s6k: "Step 6 \u00b7 Model validation & interpretation",
    s6t: "Prove it works - and explain why",
    s6sub: "A model is not useful until you can trust it. Validation answers 'does it generalise?'; interpretation answers 'how does it work?'",
    s6Body: "Report performance on a held-out test set that the model never saw during training or tuning. Use SHAP values or feature-importance plots to explain which inputs drive predictions. Document the training data, hyperparameters, and code version so results are reproducible.",
    s6ValidationLabels: {
      aria: "Three validation strategies",
      int1: "Internal", intD: "Cross-validation on your own data; detect overfitting.",
      ext1: "External", extD: "Test on data from a different batch, site, or instrument.",
      tmp1: "Temporal", tmpD: "Train on older batches, test on newer ones to simulate real use.",
    },
    s6Code: `import shap  # pip install shap

# train final model on full training set
model = RandomForestRegressor(n_estimators=500, random_state=42).fit(X_train, y_train)
print("test R2:", model.score(X_test, y_test))

# explain: which features drive each prediction?
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test, feature_names=features)`,

    s7k: "Step 7 \u00b7 Deployment & monitoring",
    s7t: "A model in a notebook helps no one",
    s7sub: "Deployment means making the model usable - as a spreadsheet tool, a web app, or an API. Once deployed, monitor its predictions over time.",
    s7Body: "For a formulation lab, deployment often means: export the model with joblib, build a simple Streamlit or Flask interface where scientists enter composition and get a prediction, and log every prediction vs. the actual measured value. When performance drifts (new polymer grade, new instrument), retrain.",
    s7Code: `import joblib
joblib.dump(model, "release_predictor_v1.pkl")

# streamlit app (app.py)
import streamlit as st, joblib, pandas as pd
model = joblib.load("release_predictor_v1.pkl")
st.title("Drug Release Predictor")
poly = st.slider("Polymer (%)", 5, 40, 20)
load = st.slider("Drug load (%)", 1, 20, 10)
pred = model.predict(pd.DataFrame({"polymer_pct": [poly], "drug_load": [load]}))
st.metric("Predicted 24 h release", f"{pred[0]:.1f}%")`,

    /* QbD section */
    qbdKicker: "ML meets QbD",
    qbdTitle: "Where ML fits in Quality-by-Design",
    qbdSub: "ML does not replace QbD or DoE - it amplifies them. QbD provides the regulatory framework; DoE generates structured data efficiently; ML finds patterns in that data and predicts outcomes for untested formulations.",
    qbdSvg: {
      aria: "Venn diagram: QbD, DoE, and ML overlap",
      qbd: "QbD", qbdD: "Regulatory framework",
      doe: "DoE", doeD: "Structured experiments",
      ml: "ML", mlD: "Pattern learning",
      intersect1: "Design space",
      intersect2: "CQAs",
      intersect3: "Optimal design",
      center: "Best formulation",
    },
    qbdBody: "ICH Q8 defines the Design Space as the multidimensional combination of input variables that assures quality. ML can map this space more completely than a polynomial model, especially when the response surface is non-linear. The key is to use DoE to generate the training data, then ML to extend predictions beyond the measured points.",
    qbdCallout: "ML predictions inside the Design Space support regulatory filings. Extrapolating outside the measured range does NOT - always flag extrapolation visually in your tool.",

    /* Compliance section */
    compKicker: "Validation & compliance",
    compTitle: "What regulators expect",
    compSub: "If your model informs a GxP decision, it falls under Computerised System Validation (CSV / GAMP 5). The bar is traceability, reproducibility, and documented risk assessment - not perfection.",
    compItems: [
      { title: "Data integrity (ALCOA+)", body: "Training data must be attributable, legible, contemporaneous, original, and accurate. Keep raw lab records linked to model versions." },
      { title: "Reproducibility", body: "Fix random seeds, pin library versions, version your code (Git), and store model artefacts with metadata (training date, data hash, hyperparameters)." },
      { title: "Model risk assessment", body: "Classify model impact: does it inform a CQA, a process parameter, or just R&D exploration? Higher impact = stricter validation." },
      { title: "Change control", body: "Any model update (retraining, new features, new algorithm) must go through documented change control. Keep a model logbook." },
      { title: "Explainability", body: "For regulated decisions, prefer interpretable models or use SHAP / LIME to explain black-box predictions. 'The model said so' is not acceptable." },
      { title: "Limitations & scope", body: "Document what the model can and cannot do: valid input ranges, known failure modes, and that it is a decision-support tool, not a replacement for analytical testing." },
    ],

    /* Learning path section */
    learnKicker: "Learning path",
    learnTitle: "Where to go next",
    learnSub: "A curated path for formulation scientists who want to go from concept to practice.",
    learnSteps: [
      { phase: "Week 1\u20132", title: "Python + pandas basics", body: "Learn Python syntax, pandas for data handling, and matplotlib/seaborn for visualisation. Goal: load a CSV, describe it, make a scatter plot." },
      { phase: "Week 3\u20134", title: "scikit-learn end-to-end", body: "Follow the official scikit-learn tutorials. Train a Random Forest on a toy dataset, understand fit/score/predict, and try cross-validation." },
      { phase: "Week 5\u20136", title: "Your first formulation model", body: "Take a small DoE dataset from your lab. Build a regression model, evaluate with R\u00b2/RMSE, and plot predicted vs. actual." },
      { phase: "Week 7+", title: "Deepen as needed", body: "Explore SHAP for interpretation, Bayesian optimisation for formulation search, or neural networks if you work with images or spectra." },
    ],
    learnBooks: "Recommended reading",
    learnBooksList: [
      "G\u00e9ron, A. Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd ed.) \u2013 the standard practical intro.",
      "Rogers, D. & Hopkins, T. Machine Learning for Pharmaceutical Discovery \u2013 domain-specific examples.",
      "ICH Q8(R2): Pharmaceutical Development \u2013 the QbD framework ML models live inside.",
      "GAMP 5 (2nd ed.) \u2013 risk-based approach to computerised system validation.",
    ],
    learnTools: "Recommended tools",
    learnToolsList: [
      { name: "scikit-learn", desc: "The go-to library for classical ML in Python. Start here." },
      { name: "SHAP", desc: "Model interpretability \u2013 explains any model's predictions." },
      { name: "Optuna / BoTorch", desc: "Bayesian optimisation for efficient formulation search." },
      { name: "Streamlit", desc: "Turn a model into a shareable web app in 10 lines of code." },
      { name: "Jupyter Lab", desc: "Interactive notebooks for exploration and reporting." },
    ],
    learnPaper: "How to read a formulation ML paper",
    learnPaperSteps: [
      "Skim the abstract and figures first. What is the input, the output, and the model?",
      "Check the dataset size and source. Is it lab-generated, public, or simulated?",
      "Look at the evaluation: is there a held-out test set? What metrics are reported?",
      "Identify the real-world claim. Does the paper validate on external data or only cross-validation?",
      "Reproduce if possible. Many papers share code on GitHub \u2013 running it on your own data is the fastest way to learn.",
    ],

    /* Footer nav */
    prevTitle: "ML Basics", prevSub: "Concepts, paradigms, and key terms",
    backTitle: "Back to overview", backSub: "Return to the hub home page",
  },
  zh: {
    kicker: "机器学习基础 \u00b7 03",
    title: "从数据到部署：制剂 ML 项目工作流",
    sub: "一份面向制药制剂实验室的七步实践指南--涵盖 ML 与 QbD/DoE 的协同、模型验证与文档化方法，以及后续学习路径。",
    badges: ["七步工作流", "QbD + DoE 协同", "验证与合规", "学习路径"],
    toc: "本页内容",

    pipeline: {
      aria: "七步 ML 工作流管线",
      s1: "定义", s2: "采集", s3: "清洗与探索", s4: "特征工程",
      s5: "建模", s6: "验证", s7: "部署",
      iterate: "迭代：监控、重训、改进",
    },

    s1k: "第 1 步 \u00b7 问题定义",
    s1t: "从问题出发，而不是从模型出发",
    s1sub: "最常见的失败模式是解决了一个错误的问题。先写下：你在预测什么、给谁用、它将支撑什么决策？",
    s1Body: "确定任务类型（回归、分类、聚类）、目标变量和成功标准。例如：'预测 24 h 累积药物释放量（\u00b5g/mL），误差不超过 \u00b115%' 是一个定义明确的回归问题。'将片剂分为合格 / 不合格' 是一个分类问题。",
    s1Code: `# 写一行问题章程
TASK_TYPE   = "regression"          # 或 "classification"、"clustering"
TARGET      = "release_24h_pct"     # 你要预测什么
SUCCESS     = "R2 > 0.85, MAE < 5%" # 验收标准
DECISION    = "调整聚合物比例"       # 预测之后做什么`,

    s2k: "第 2 步 \u00b7 数据采集",
    s2t: "数据质量决定了模型的上限",
    s2sub: "ML 学不到数据里没有的东西。在制剂研发中，这意味着实验记录、工艺日志、分析结果，有时还有图像或光谱。",
    s2Body: "从实验、历史 DoE 或文献中收集原始数据。不仅要记录输入（组成、工艺参数）和输出（释放度、粒径、稳定性），还要记录元数据：批号、操作人、仪器、日期。小而记录完善的数据集往往优于大而杂乱的。",
    s2Callout: "如果行数少于 ~30，考虑是否需要先补实验再建模。在实验室数据稀缺时，迁移学习或文献增强方法可以有所帮助。",

    s3k: "第 3 步 \u00b7 数据清洗与探索性分析",
    s3t: "建模之前先了解你的数据",
    s3sub: "探索性数据分析（EDA）揭示异常值、缺失值和关系形态--这些如果被忽略，会悄悄破坏你的模型。",
    s3Body: "检查分布、两两相关和缺失值模式。制剂数据中要特别留意：批次间差异、辅料分数共线性（它们加和为 100%）、以及仪器随时间的漂移。在选择模型之前，先可视化每个输入与目标的关系。",
    s3Code: `import pandas as pd
import seaborn as sns

df = pd.read_csv("formulation_data.csv")

# 快速健康检查
print(df.describe())
print("缺失值:\\n", df.isna().sum())
print("与目标的相关性:\\n", df.corr(numeric_only=True)["release_24h"].sort_values())

# 可视化：各变量与目标的散点图
sns.pairplot(df, y_vars=["release_24h"], height=3)`,

    s4k: "第 4 步 \u00b7 特征工程",
    s4t: "把原始变量转化为模型能理解的信号",
    s4sub: "原始变量很少直接进入模型。特征工程是创建信息性输入的艺术。",
    s4Body: "制剂数据的常见变换：对连续变量做标准化或归一化；将类别因子（如聚合物级别）做 one-hot 编码；创建交互项（聚合物 \u00d7 增塑剂）；推导领域特征如理论玻璃化转变温度或 Higuchi 释放常数。",
    s4Formula: "x_scaled = (x - \u03bc) / \u03c3    （z-score 标准化）",
    s4FormulaNote: " \u03bc = 均值，\u03c3 = 训练集标准差；对测试数据使用相同的 \u03bc、\u03c3。",
    s4Code: `from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

numeric_features = ["polymer_pct", "drug_load", "rpm"]
categorical_features = ["polymer_grade"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), numeric_features),
    ("cat", OneHotEncoder(drop="first"), categorical_features),
])

# 用 Pipeline 包裹，避免数据泄漏
pipe = Pipeline([("prep", preprocessor), ("model", RandomForestRegressor())])`,

    s5k: "第 5 步 \u00b7 模型选择与训练",
    s5t: "从简单开始，只在确有增益时增加复杂度",
    s5sub: "最好的模型是能满足成功标准的最简单模型。先用线性回归或随机森林，只有当复杂方法确实带来提升时才尝试。",
    s5Body: "用交叉验证比较候选模型。对于小制剂数据集（n < 100），优先选择参数少或正则化强的模型。除非有数百行数据或处理图像 / 光谱，否则避免深度神经网络。务必设置随机种子以保证可复现性。",
    s5Code: `from sklearn.model_selection import cross_val_score, KFold
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR

cv = KFold(n_splits=5, shuffle=True, random_state=42)

candidates = {
    "Ridge":  Ridge(alpha=1.0),
    "RF":     RandomForestRegressor(n_estimators=300, random_state=42),
    "SVR":    SVR(kernel="rbf", C=10),
}

for name, m in candidates.items():
    scores = cross_val_score(m, X_train, y_train, cv=cv, scoring="r2")
    print(f"{name:12s}  R2 = {scores.mean():.3f} \u00b1 {scores.std():.3f}")`,

    s6k: "第 6 步 \u00b7 模型验证与解释",
    s6t: "证明它有效--并解释为什么",
    s6sub: "模型在被信任之前没有用处。验证回答'它能泛化吗？'；解释回答'它是怎么工作的？'",
    s6Body: "在模型从未见过的留出测试集上报告性能。用 SHAP 值或特征重要性图解释哪些输入驱动了预测。记录训练数据、超参数和代码版本，使结果可复现。",
    s6ValidationLabels: {
      aria: "三种验证策略",
      int1: "内部验证", intD: "在自己数据上做交叉验证；检测过拟合。",
      ext1: "外部验证", extD: "用不同批次、场地或仪器的数据测试。",
      tmp1: "时间验证", tmpD: "用旧批次训练、新批次测试，模拟真实使用。",
    },
    s6Code: `import shap  # pip install shap

# 在完整训练集上训练最终模型
model = RandomForestRegressor(n_estimators=500, random_state=42).fit(X_train, y_train)
print("test R2:", model.score(X_test, y_test))

# 解释：哪些特征驱动了每个预测？
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test, feature_names=features)`,

    s7k: "第 7 步 \u00b7 部署与监控",
    s7t: "放在 notebook 里的模型没人能用",
    s7sub: "部署意味着让模型可用--可以是表格工具、Web 应用或 API。部署后，持续监控其预测质量。",
    s7Body: "对制剂实验室而言，部署通常意味着：用 joblib 导出模型，搭建一个简单的 Streamlit 或 Flask 界面让研发人员输入组成并获取预测，并记录每次预测与实测值的偏差。当性能漂移时（新聚合物级别、新仪器），重新训练。",
    s7Code: `import joblib
joblib.dump(model, "release_predictor_v1.pkl")

# streamlit 应用 (app.py)
import streamlit as st, joblib, pandas as pd
model = joblib.load("release_predictor_v1.pkl")
st.title("药物释放预测器")
poly = st.slider("聚合物 (%)", 5, 40, 20)
load = st.slider("载药量 (%)", 1, 20, 10)
pred = model.predict(pd.DataFrame({"polymer_pct": [poly], "drug_load": [load]}))
st.metric("预测 24 h 释放", f"{pred[0]:.1f}%")`,

    qbdKicker: "ML 与 QbD",
    qbdTitle: "ML 在质量源于设计中的位置",
    qbdSub: "ML 不替代 QbD 或 DoE--它放大它们。QbD 提供监管框架；DoE 高效地生成结构化数据；ML 在数据中发现模式并预测未测试处方的结果。",
    qbdSvg: {
      aria: "韦恩图：QbD、DoE 与 ML 的交集",
      qbd: "QbD", qbdD: "监管框架",
      doe: "DoE", doeD: "结构化实验",
      ml: "ML", mlD: "模式学习",
      intersect1: "设计空间",
      intersect2: "CQA",
      intersect3: "最优设计",
      center: "最佳处方",
    },
    qbdBody: "ICH Q8 将设计空间定义为保证质量的输入变量多维组合。当响应面非线性时，ML 能比多项式模型更完整地映射该空间。关键是用 DoE 生成训练数据，再用 ML 将预测延伸到测量点之外。",
    qbdCallout: "在设计空间内的 ML 预测可支持注册申报。外推到测量范围之外的预测则不可--务必在工具中可视化标记外推区域。",

    compKicker: "验证与合规",
    compTitle: "监管机构期望什么",
    compSub: "如果你的模型影响 GxP 决策，它就属于计算机化系统验证（CSV / GAMP 5）范畴。核心要求是可追溯性、可复现性和有文档记录的风险评估--不是完美。",
    compItems: [
      { title: "数据完整性（ALCOA+）", body: "训练数据必须可归属、清晰、同步、原始且准确。保留与模型版本关联的原始实验记录。" },
      { title: "可复现性", body: "固定随机种子、锁定库版本、用 Git 管理代码，并存储模型工件及其元数据（训练日期、数据哈希、超参数）。" },
      { title: "模型风险评估", body: "对模型影响分级：它影响 CQA、工艺参数，还是仅用于研发探索？影响越大，验证越严格。" },
      { title: "变更控制", body: "任何模型更新（重训、新特征、新算法）都必须经过文档化变更控制。保留模型日志。" },
      { title: "可解释性", body: "对于受监管的决策，优先选择可解释模型，或使用 SHAP / LIME 解释黑箱预测。'模型说是'不可接受的。" },
      { title: "局限性与范围", body: "记录模型能做什么和不能做什么：有效输入范围、已知失败模式，以及它是决策支持工具而非分析测试的替代。" },
    ],

    learnKicker: "学习路径",
    learnTitle: "接下来怎么学",
    learnSub: "为想从概念走向实践的制剂科研人员整理的学习路线。",
    learnSteps: [
      { phase: "第 1\u20132 周", title: "Python + pandas 基础", body: "学 Python 语法、pandas 数据处理、matplotlib/seaborn 可视化。目标：加载 CSV、描述统计、画散点图。" },
      { phase: "第 3\u20134 周", title: "scikit-learn 全流程", body: "跟随 scikit-learn 官方教程。在玩具数据集上训练随机森林，理解 fit/score/predict，尝试交叉验证。" },
      { phase: "第 5\u20136 周", title: "你的第一个制剂模型", body: "取实验室的小 DoE 数据集。建回归模型，用 R\u00b2/RMSE 评估，画预测值 vs. 实测值图。" },
      { phase: "第 7 周起", title: "按需深入", body: "探索 SHAP 做解释、贝叶斯优化做处方搜索，或如果处理图像 / 光谱则学习神经网络。" },
    ],
    learnBooks: "推荐阅读",
    learnBooksList: [
      "G\u00e9ron, A. Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow（第 3 版）--标准的实践入门。",
      "Rogers, D. & Hopkins, T. Machine Learning for Pharmaceutical Discovery--领域专用示例。",
      "ICH Q8(R2): Pharmaceutical Development--ML 模型所处的 QbD 框架。",
      "GAMP 5（第 2 版）--基于风险的计算机化系统验证方法。",
    ],
    learnTools: "推荐工具",
    learnToolsList: [
      { name: "scikit-learn", desc: "Python 经典 ML 库，从这里开始。" },
      { name: "SHAP", desc: "模型可解释性工具--解释任意模型的预测。" },
      { name: "Optuna / BoTorch", desc: "贝叶斯优化，用于高效处方搜索。" },
      { name: "Streamlit", desc: "10 行代码把模型变成可分享的 Web 应用。" },
      { name: "Jupyter Lab", desc: "交互式笔记本，用于探索和报告。" },
    ],
    learnPaper: "如何阅读一篇制剂 ML 论文",
    learnPaperSteps: [
      "先看摘要和图表。输入是什么、输出是什么、用的什么模型？",
      "检查数据集大小和来源。是实验室生成的、公开的、还是模拟的？",
      "看评估方法：有没有留出测试集？报告了哪些指标？",
      "找出真实世界声明。论文是否在外部数据上验证，还是仅做了交叉验证？",
      "尽可能复现。很多论文在 GitHub 上分享代码--在自己的数据上跑一遍是最快的学习方式。",
    ],

    prevTitle: "ML Basics", prevSub: "概念、范式与关键术语",
    backTitle: "返回总览", backSub: "回到站点首页",
  },
};

/* ===========================================================================
 * Page component.
 * ======================================================================== */
export default function MLWorkflow() {
  const { lang } = useLang();
  const c = COPY[lang] || COPY.en;

  const nav = [
    { id: "pipeline", label: lang === "zh" ? "工作流总览" : "Workflow" },
    { id: "step1", label: lang === "zh" ? "1. 问题定义" : "1. Define" },
    { id: "step2", label: lang === "zh" ? "2. 数据采集" : "2. Collect" },
    { id: "step3", label: lang === "zh" ? "3. 清洗与EDA" : "3. Clean & EDA" },
    { id: "step4", label: lang === "zh" ? "4. 特征工程" : "4. Features" },
    { id: "step5", label: lang === "zh" ? "5. 建模" : "5. Model" },
    { id: "step6", label: lang === "zh" ? "6. 验证" : "6. Validate" },
    { id: "step7", label: lang === "zh" ? "7. 部署" : "7. Deploy" },
    { id: "qbd", label: lang === "zh" ? "QbD 协同" : "QbD + DoE" },
    { id: "compliance", label: lang === "zh" ? "合规要点" : "Compliance" },
    { id: "learning", label: lang === "zh" ? "学习路径" : "Learning path" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-20">
      <PageHero kicker={c.kicker} title={c.title} sub={c.sub} badges={c.badges} />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-10">
        <SideNav items={nav} label={c.toc} />

        <div className="min-w-0">
          {/* Pipeline overview */}
          <section className="mb-14" id="pipeline">
            <SectionHead kicker={lang === "zh" ? "总览" : "Overview"} title={lang === "zh" ? "七步工作流一览" : "The seven steps at a glance"} sub={lang === "zh" ? "从问题定义到模型部署，每一步都不可跳过。虚线箭头表示迭代--模型上线后需要持续监控和重训。" : "From problem definition to deployment, each step matters. The dashed arrow shows iteration - models need monitoring and retraining after they go live."} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 md:p-6 mt-6">
              <SvgPipeline l={c.pipeline} />
            </div>
          </section>

          {/* Step 1 */}
          <section className="mb-14 scroll-mt-24" id="step1">
            <SectionHead kicker={c.s1k} title={c.s1t} sub={c.s1sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s1Body}</p>
              <CodeBlock code={c.s1Code} title="python \u00b7 problem charter" />
            </div>
          </section>

          {/* Step 2 */}
          <section className="mb-14 scroll-mt-24" id="step2">
            <SectionHead kicker={c.s2k} title={c.s2t} sub={c.s2sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s2Body}</p>
              <Callout kind="tip" label={lang === "zh" ? "小数据提示" : "Small-data tip"}>{c.s2Callout}</Callout>
            </div>
          </section>

          {/* Step 3 */}
          <section className="mb-14 scroll-mt-24" id="step3">
            <SectionHead kicker={c.s3k} title={c.s3t} sub={c.s3sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s3Body}</p>
              <CodeBlock code={c.s3Code} title="python \u00b7 EDA" />
            </div>
          </section>

          {/* Step 4 */}
          <section className="mb-14 scroll-mt-24" id="step4">
            <SectionHead kicker={c.s4k} title={c.s4t} sub={c.s4sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s4Body}</p>
              <Formula note={c.s4FormulaNote}>{c.s4Formula}</Formula>
              <CodeBlock code={c.s4Code} title="python \u00b7 pipeline" />
            </div>
          </section>

          {/* Step 5 */}
          <section className="mb-14 scroll-mt-24" id="step5">
            <SectionHead kicker={c.s5k} title={c.s5t} sub={c.s5sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s5Body}</p>
              <CodeBlock code={c.s5Code} title="python \u00b7 model comparison" />
            </div>
          </section>

          {/* Step 6 */}
          <section className="mb-14 scroll-mt-24" id="step6">
            <SectionHead kicker={c.s6k} title={c.s6t} sub={c.s6sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s6Body}</p>
              <div className="bg-white border border-stone-400/20 rounded-lg p-5">
                <SvgValidation l={c.s6ValidationLabels} />
              </div>
              <CodeBlock code={c.s6Code} title="python \u00b7 SHAP" />
            </div>
          </section>

          {/* Step 7 */}
          <section className="mb-14 scroll-mt-24" id="step7">
            <SectionHead kicker={c.s7k} title={c.s7t} sub={c.s7sub} />
            <div className="mt-6 space-y-4">
              <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s7Body}</p>
              <CodeBlock code={c.s7Code} title="python \u00b7 deploy (joblib + streamlit)" />
            </div>
          </section>

          {/* QbD + DoE */}
          <section className="mb-14 scroll-mt-24" id="qbd">
            <SectionHead kicker={c.qbdKicker} title={c.qbdTitle} sub={c.qbdSub} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
              <div className="bg-white border border-stone-400/20 rounded-lg p-5">
                <SvgQbDML l={c.qbdSvg} />
              </div>
              <div className="space-y-4">
                <p className="text-[14px] text-stone-700 leading-relaxed">{c.qbdBody}</p>
                <Callout kind="reg" label={lang === "zh" ? "注册申报提示" : "Regulatory note"}>{c.qbdCallout}</Callout>
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section className="mb-14 scroll-mt-24" id="compliance">
            <SectionHead kicker={c.compKicker} title={c.compTitle} sub={c.compSub} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {c.compItems.map((item, i) => (
                <ConceptCard key={i} num={String(i + 1)} accent="#534AB7" title={item.title}>
                  {item.body}
                </ConceptCard>
              ))}
            </div>
          </section>

          {/* Learning path */}
          <section className="mb-14 scroll-mt-24" id="learning">
            <SectionHead kicker={c.learnKicker} title={c.learnTitle} sub={c.learnSub} />

            {/* Steps timeline */}
            <div className="mt-8 space-y-4">
              {c.learnSteps.map((s, i) => (
                <div key={i} className="bg-white border border-stone-400/20 rounded-lg p-5 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-20 text-right">
                    <span className="font-mono text-[11px] text-amber-500 font-medium uppercase tracking-wider">{s.phase}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-[15px] text-ink-900 mb-1.5">{s.title}</h3>
                    <p className="text-[13px] text-stone-700 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Books */}
            <div className="mt-8">
              <SubHead title={c.learnBooks} />
              <ul className="mt-3 space-y-2">
                {c.learnBooksList.map((b, i) => (
                  <li key={i} className="text-[13px] text-stone-700 leading-relaxed flex gap-2">
                    <span className="text-amber-500 flex-shrink-0">{"\u2022"}</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className="mt-8">
              <SubHead title={c.learnTools} />
              <div className="mt-3 flex flex-wrap gap-2">
                {c.learnToolsList.map((tool, i) => (
                  <div key={i} className="bg-white border border-stone-400/20 rounded-lg px-4 py-3">
                    <p className="font-mono text-[12px] text-ink-900 font-medium">{tool.name}</p>
                    <p className="text-[11px] text-stone-600 mt-0.5">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to read a paper */}
            <div className="mt-8 bg-ink-200/30 border border-ink-400/20 rounded-lg p-5">
              <SubHead title={c.learnPaper} />
              <ol className="mt-3 space-y-2">
                {c.learnPaperSteps.map((s, i) => (
                  <li key={i} className="text-[13px] text-stone-700 leading-relaxed flex gap-2.5">
                    <span className="font-mono text-[12px] text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Footer nav */}
          <section className="border-t border-stone-400/20 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#/ml-basics" className="group bg-white border border-stone-400/20 rounded-lg p-6 hover:border-ink-400/50 hover:shadow-md transition-all">
                <p className="font-mono text-[11px] text-stone-500 mb-1">{"\u2190"} {lang === "zh" ? "上一篇" : "Previous"}</p>
                <p className="font-display text-lg text-ink-900 group-hover:text-ink-700">{c.prevTitle}</p>
                <p className="text-[13px] text-stone-600 mt-1">{c.prevSub}</p>
              </a>
              <a href="#/" className="group bg-white border border-stone-400/20 rounded-lg p-6 hover:border-ink-400/50 hover:shadow-md transition-all text-right">
                <p className="font-mono text-[11px] text-stone-500 mb-1">{lang === "zh" ? "首页" : "Home"} {"\u2192"}</p>
                <p className="font-display text-lg text-ink-900 group-hover:text-ink-700">{c.backTitle}</p>
                <p className="text-[13px] text-stone-600 mt-1">{c.backSub}</p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
