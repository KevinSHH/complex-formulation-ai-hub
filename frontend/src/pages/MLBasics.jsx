import { useLang } from "../i18n/index.jsx";
import {
  PageHero, SectionHead, SubHead, CodeBlock, Formula, ConceptCard, Callout, SideNav, Tag,
} from "../components/ml/ui.jsx";

/* ===========================================================================
 * Inline SVG figures (light theme: deep ink text on paper / ink-200 panels,
 * amber accents). All are bilingual-agnostic — captions come from copy.
 * ======================================================================== */

function SvgTraditionalVsML({ labels }) {
  return (
    <svg viewBox="0 0 680 250" className="w-full h-auto" role="img" aria-label={labels.aria}>
      {/* Traditional programming */}
      <text x="170" y="26" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fill="#0a2540" fontWeight="600">{labels.traditional}</text>
      <g fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#2C2C2A">
        <rect x="40" y="48" width="120" height="40" rx="7" fill="#E6F1FB" stroke="#2a7ab0" strokeWidth="1.2" />
        <text x="100" y="66" textAnchor="middle">{labels.rules}</text>
        <text x="100" y="80" textAnchor="middle" fill="#5F5E5A">{labels.data}</text>
        <rect x="200" y="48" width="120" height="40" rx="7" fill="#FAEEDA" stroke="#BA7517" strokeWidth="1.2" />
        <text x="260" y="72" textAnchor="middle">{labels.handRules}</text>
        <rect x="120" y="118" width="120" height="40" rx="7" fill="#fff" stroke="#888780" strokeWidth="1.2" />
        <text x="180" y="142" textAnchor="middle">{labels.output}</text>
      </g>
      <g stroke="#5F5E5A" strokeWidth="1.4" markerEnd="url(#mlArrow)">
        <line x1="100" y1="88" x2="170" y2="118" />
        <line x1="260" y1="88" x2="195" y2="118" />
      </g>

      {/* divider */}
      <line x1="352" y1="30" x2="352" y2="215" stroke="#D3D1C7" strokeWidth="1" strokeDasharray="3 4" />

      {/* Machine learning */}
      <text x="510" y="26" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fill="#0a2540" fontWeight="600">{labels.ml}</text>
      <g fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#2C2C2A">
        <rect x="392" y="48" width="120" height="40" rx="7" fill="#E6F1FB" stroke="#2a7ab0" strokeWidth="1.2" />
        <text x="452" y="66" textAnchor="middle">{labels.data}</text>
        <text x="452" y="80" textAnchor="middle" fill="#5F5E5A">{labels.answers}</text>
        <rect x="540" y="48" width="120" height="40" rx="7" fill="#FAEEDA" stroke="#BA7517" strokeWidth="1.2" />
        <text x="600" y="72" textAnchor="middle">{labels.learn}</text>
        <rect x="452" y="118" width="120" height="40" rx="7" fill="#fff" stroke="#1D9E75" strokeWidth="1.4" />
        <text x="512" y="142" textAnchor="middle">{labels.model}</text>
      </g>
      <g stroke="#5F5E5A" strokeWidth="1.4" markerEnd="url(#mlArrow)">
        <line x1="452" y1="88" x2="512" y2="118" />
        <line x1="600" y1="88" x2="540" y2="118" />
      </g>

      {/* bottom takeaway */}
      <rect x="60" y="188" width="560" height="40" rx="7" fill="#F1EFE8" stroke="#D3D1C7" />
      <text x="340" y="206" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#444441">{labels.takeaway1}</text>
      <text x="340" y="221" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#854F0B" fontWeight="600">{labels.takeaway2}</text>

      <defs>
        <marker id="mlArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#5F5E5A" />
        </marker>
      </defs>
    </svg>
  );
}

function SvgParadigms({ labels }) {
  const cols = [
    { x: 20, color: "#2a7ab0", bg: "#E6F1FB", title: labels.sup, d1: labels.supD1, d2: labels.supD2 },
    { x: 245, color: "#BA7517", bg: "#FAEEDA", title: labels.unsup, d1: labels.unsupD1, d2: labels.unsupD2 },
    { x: 470, color: "#1D9E75", bg: "#E3F3EC", title: labels.rl, d1: labels.rlD1, d2: labels.rlD2 },
  ];
  return (
    <svg viewBox="0 0 680 210" className="w-full h-auto" role="img" aria-label={labels.aria}>
      {cols.map((c) => (
        <g key={c.title}>
          <rect x={c.x} y="20" width="190" height="170" rx="10" fill={c.bg} stroke={c.color} strokeWidth="1.4" />
          <text x={c.x + 95} y="48" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fontWeight="600" fill={c.color}>{c.title}</text>
          <circle cx={c.x + 95} cy="92" r="26" fill="#fff" stroke={c.color} strokeWidth="1.6" />
          <text x={c.x + 95} y="97" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="16" fill={c.color}>{c.icon}</text>
          <text x={c.x + 95} y="148" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#2C2C2A">{c.d1}</text>
          <text x={c.x + 95} y="166" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#5F5E5A">{c.d2}</text>
        </g>
      ))}
    </svg>
  );
}

function SvgOverfit({ labels }) {
  return (
    <svg viewBox="0 0 680 240" className="w-full h-auto" role="img" aria-label={labels.aria}>
      {/* axes */}
      <line x1="60" y1="200" x2="620" y2="200" stroke="#888780" strokeWidth="1.4" />
      <line x1="60" y1="200" x2="60" y2="24" stroke="#888780" strokeWidth="1.4" />
      <text x="340" y="228" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#5F5E5A">{labels.x}</text>
      <text x="30" y="112" textAnchor="middle" transform="rotate(-90 30 112)" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#5F5E5A">{labels.y}</text>

      {/* training error (monotonic down) */}
      <path d="M60 70 C 180 130, 320 170, 620 188" fill="none" stroke="#2a7ab0" strokeWidth="2.4" />
      {/* validation error (U-shape) */}
      <path d="M60 96 C 200 150, 300 158, 360 158 C 450 158, 540 120, 620 70" fill="none" stroke="#BA7517" strokeWidth="2.4" />

      {/* sweet spot */}
      <line x1="360" y1="24" x2="360" y2="200" stroke="#1D9E75" strokeWidth="1.4" strokeDasharray="4 4" />
      <text x="360" y="16" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fill="#0f6b4e" fontWeight="600">{labels.best}</text>

      {/* regions */}
      <text x="140" y="220" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fill="#5F5E5A">{labels.under}</text>
      <text x="520" y="220" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fill="#5F5E5A">{labels.over}</text>

      {/* legend */}
      <g fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fill="#2C2C2A">
        <line x1="430" y1="40" x2="455" y2="40" stroke="#2a7ab0" strokeWidth="2.4" />
        <text x="462" y="44">{labels.train}</text>
        <line x1="430" y1="60" x2="455" y2="60" stroke="#BA7517" strokeWidth="2.4" />
        <text x="462" y="64">{labels.valid}</text>
      </g>
    </svg>
  );
}

function SvgKFold({ labels }) {
  const folds = 5;
  const rows = 5;
  const x0 = 120, y0 = 46, cw = 92, ch = 26, gap = 6;
  return (
    <svg viewBox="0 0 680 250" className="w-full h-auto" role="img" aria-label={labels.aria}>
      <text x="80" y="30" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11.5" fill="#5F5E5A">{labels.iter}</text>
      {Array.from({ length: folds }).map((_, f) => (
        <text key={f} x={x0 + f * (cw + gap) + cw / 2} y="30" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="#5F5E5A">
          {labels.fold}{f + 1}
        </text>
      ))}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: folds }).map((_, f) => {
          const isValid = f === r;
          return (
            <rect
              key={`${r}-${f}`}
              x={x0 + f * (cw + gap)}
              y={y0 + r * (ch + gap)}
              width={cw}
              height={ch}
              rx="4"
              fill={isValid ? "#BA7517" : "#E6F1FB"}
              stroke={isValid ? "#854F0B" : "#2a7ab0"}
              strokeWidth="1"
              opacity={isValid ? 0.9 : 0.7}
            />
          );
        })
      )}
      {/* legend */}
      <g fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fill="#2C2C2A">
        <rect x="120" y="222" width="14" height="14" rx="3" fill="#E6F1FB" stroke="#2a7ab0" />
        <text x="140" y="233">{labels.trainOn}</text>
        <rect x="320" y="222" width="14" height="14" rx="3" fill="#BA7517" stroke="#854F0B" />
        <text x="340" y="233">{labels.validateOn}</text>
      </g>
    </svg>
  );
}

/* ===========================================================================
 * Bilingual copy
 * ======================================================================== */
const C = {
  en: {
    kicker: "ML Foundations · 01",
    title: "Machine learning, explained for formulation scientists",
    sub: "A practical first map of machine learning — what it is, the three learning paradigms, how formulation data becomes features, and how to judge whether a model is trustworthy. No prior coding background assumed.",
    badges: ["Beginner friendly", "With formulas & code", "Formulation examples"],
    toc: "On this page",

    nav: [
      { id: "what", label: "What is ML" },
      { id: "paradigms", label: "Three paradigms" },
      { id: "data", label: "Formulation data" },
      { id: "split", label: "Split & overfitting" },
      { id: "cv", label: "Cross-validation" },
      { id: "metrics", label: "Evaluation metrics" },
      { id: "next", label: "Where to go next" },
    ],

    s1k: "The big idea",
    s1t: "From hand-written rules to learned rules",
    s1sub: "Traditional software follows rules a human writes down. Machine learning flips this: you show the computer many examples of inputs and the correct answers, and it learns the rule itself.",
    svg1: {
      aria: "Traditional programming versus machine learning",
      traditional: "Traditional programming",
      ml: "Machine learning",
      rules: "Rules",
      data: "Data",
      handRules: "Hand-written program",
      output: "Output",
      answers: "+ Answers",
      learn: "Learning algorithm",
      model: "Model (learned rule)",
      takeaway1: "Formulation example: instead of hand-tuning a release equation,",
      takeaway2: "the model learns how polymer ratio & curing map to drug release from past experiments.",
    },
    s1body: "In formulation R&D the 'rules' linking composition and process to performance are usually too complex to write by hand — they involve polymer physics, interfacial chemistry and in-vivo transport at once. Machine learning is valuable precisely because it can approximate these hidden relationships from experimental data.",

    s2k: "Three ways to learn",
    s2t: "The three paradigms of machine learning",
    s2sub: "Almost every method you will meet belongs to one of three families, distinguished by what supervision the learner gets.",
    svg2: {
      aria: "Supervised, unsupervised and reinforcement learning",
      sup: "Supervised", supD1: "learns from labelled", supD2: "examples (X → y)",
      unsup: "Unsupervised", unsupD1: "finds structure in", unsupD2: "unlabelled data",
      rl: "Reinforcement", rlD1: "learns by trial &", rlD2: "error from rewards",
    },
    para: [
      { t: "Supervised learning", b: "Every training record has an input (formulation & process variables) and a known answer (measured release, particle size, stability). The model learns to predict the answer for new, unseen formulations. This is the workhorse of formulation ML — regression and classification.", tags: ["Regression", "Classification", "Random Forest", "XGBoost", "ANN"] },
      { t: "Unsupervised learning", b: "No labels are given. The algorithm discovers structure on its own — grouping similar formulations (clustering) or compressing many correlated descriptors into a few (dimensionality reduction such as PCA). Useful for exploring excipient space and visualising high-dimensional data.", tags: ["Clustering", "PCA", "t-SNE", "k-means"] },
      { t: "Reinforcement learning", b: "An agent takes actions (adjust a process parameter), observes a reward (better/worse product quality), and learns a strategy that maximises long-term reward. Closely related to Bayesian optimisation used for formulation search — still emerging in pharma but powerful for sequential decisions.", tags: ["Bayesian optimisation", "Active learning", "DoE"] },
    ],

    s3k: "The raw material",
    s3t: "Formulation data and feature engineering",
    s3sub: "A model is only as good as its features. In our field the inputs are heterogeneous — knowing your data types is half the battle.",
    dataTypes: [
      { t: "Composition variables", b: "Quantities and ratios of API, polymers, lipids, surfactants, solvents. Usually continuous numbers (%, w/w, molar ratio).", tag: "e.g. PLGA LA:GA ratio, drug loading %" },
      { t: "Process parameters", b: "Temperature, stirring rate, homogenisation pressure, curing time, spray-drying inlet temperature. Controllable settings of the experiment.", tag: "e.g. emulsification speed, quench rate" },
      { t: "Molecular descriptors", b: "Computed properties of the API/excipients — logP, molecular weight, TPSA, pKa. Often generated by cheminformatics tools.", tag: "e.g. logP, H-bond donors, Mp" },
      { t: "Characterisation readouts", b: "Measured responses: particle size, PDI, zeta potential, encapsulation efficiency, release %, degradation rate. These become prediction targets.", tag: "e.g. t50, EE%, burst release" },
    ],
    feTitle: "Feature engineering in one sentence",
    feBody: "Turn raw experimental records into clean, numeric, comparable columns — handle missing values, encode categorical variables, scale features to similar ranges, and create domain-informed ratios or interaction terms. Good features routinely matter more than the choice of algorithm.",
    code1: `# Feature engineering & scaling for a formulation dataset
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("isg_formulations.csv")   # e.g. in-situ gel recipes
X = df[["plga_ratio", "drug_loading", "nmp_fraction", "curing_h"]]
y = df["release_t50_days"]                 # target: time to 50% release

# 80/20 split — keep a held-out test set the model NEVER sees in training
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features so large-magnitude ones do not dominate
scaler = StandardScaler().fit(X_train)     # fit on TRAIN only
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)`,

    s4k: "Honest evaluation",
    s4t: "Train / validation / test, and the overfitting trap",
    s4sub: "A model that memorises the training data looks brilliant in the lab and fails on the bench. Splitting data honestly is how we detect this.",
    svg3: {
      aria: "Bias-variance trade-off curve",
      x: "Model complexity →", y: "Error",
      train: "Training error", valid: "Validation error",
      best: "Sweet spot", under: "Underfitting", over: "Overfitting",
    },
    overfit: [
      { t: "Underfitting (high bias)", b: "Model too simple — it cannot capture the real composition–performance relationship. Both training and validation error are high." },
      { t: "Overfitting (high variance)", b: "Model too flexible — it memorises noise in the small training set. Training error is tiny but validation/test error is large. The classic failure with small formulation datasets." },
      { t: "The sweet spot", b: "Just enough complexity to capture the true signal without the noise. Found empirically by tracking validation error while tuning the model." },
    ],
    calloutSmall: "Formulation datasets are often only tens to hundreds of rows. Small data makes overfitting the default failure mode — always keep a genuinely held-out test set and prefer simpler models first.",

    s5k: "Use every row wisely",
    s5t: "Cross-validation on small datasets",
    s5sub: "When data is scarce, k-fold cross-validation reuses the same rows for training and validation in rotation, giving a far more reliable estimate of real-world performance than a single split.",
    svg4: {
      aria: "Five-fold cross-validation",
      iter: "Iteration", fold: "F",
      trainOn: "Train on these folds", validateOn: "Validate on this fold",
    },
    code2: `# k-fold cross-validation — the honest score on small data
from sklearn.model_selection import cross_val_score, KFold
from sklearn.ensemble import RandomForestRegressor

model = RandomForestRegressor(n_estimators=300, random_state=42)
cv = KFold(n_splits=5, shuffle=True, random_state=42)

# negative RMSE is returned, so flip the sign
scores = -cross_val_score(model, X, y, cv=cv,
                          scoring="neg_root_mean_squared_error")
print("CV RMSE: %.3f ± %.3f" % (scores.mean(), scores.std()))`,
    calloutGroup: "If the same formulation appears in several rows (replicates, time-points), use GroupKFold so all rows of one formulation stay in the same fold — otherwise near-duplicates leak across train/validation and inflate the score.",

    s6k: "Measuring success",
    s6t: "Evaluation metrics you will actually use",
    s6sub: "Pick the metric that matches the task — regression for continuous targets (release, size), classification for categories (pass/fail, stable/unstable).",
    regTitle: "Regression metrics",
    clsTitle: "Classification metrics",
    f_rmse: "RMSE = √( (1/n) Σ (yᵢ − ŷᵢ)² )",
    f_rmse_n: "Root-mean-square error — penalises large errors. Same unit as the target.",
    f_mae: "MAE = (1/n) Σ | yᵢ − ŷᵢ |",
    f_mae_n: "Mean absolute error — typical miss in the target's own unit.",
    f_r2: "R² = 1 − Σ(yᵢ−ŷᵢ)² / Σ(yᵢ−ȳ)²",
    f_r2_n: "Fraction of variance explained. 1.0 = perfect, 0 = no better than the mean.",
    f_acc: "Accuracy = correct / total",
    f_acc_n: "Overall correctness — misleading when classes are imbalanced.",
    f_auc: "AUC-ROC ∈ [0, 1]",
    f_auc_n: "Ability to rank positives above negatives across thresholds. 0.5 = random.",

    s7k: "Keep going",
    s7t: "Where to go next",
    s7sub: "You now have the vocabulary. Continue to the algorithm deep-dives, or see how a full formulation-ML project is run end to end.",
    nextAlg: "Explore the algorithms →",
    nextAlgSub: "ML Algorithms · regression, trees, SVM, ANN, CNN, clustering, PCA, optimisation",
    nextFlow: "See the full workflow →",
    nextFlowSub: "ML Workflow · from problem definition to validated, compliant model",
  },

  zh: {
    kicker: "机器学习基础 · 01",
    title: "写给制剂研发人员的机器学习入门",
    sub: "一份实用的机器学习导览——它是什么、三大学习范式、制剂数据如何变成特征、以及如何判断一个模型是否可信。无需任何编程背景。",
    badges: ["零基础上手", "含公式与代码", "制剂实例"],
    toc: "本页目录",

    nav: [
      { id: "what", label: "什么是机器学习" },
      { id: "paradigms", label: "三大学习范式" },
      { id: "data", label: "制剂数据与特征" },
      { id: "split", label: "数据划分与过拟合" },
      { id: "cv", label: "交叉验证" },
      { id: "metrics", label: "评估指标" },
      { id: "next", label: "下一步" },
    ],

    s1k: "核心思想",
    s1t: "从「手写规则「到「学出来的规则「",
    s1sub: "传统软件执行人类写下的规则；机器学习则相反——你给它大量「输入 + 正确答案「的样本，它自己把规律学出来。",
    svg1: {
      aria: "传统编程与机器学习对比",
      traditional: "传统编程",
      ml: "机器学习",
      rules: "规则",
      data: "数据",
      handRules: "手写程序",
      output: "输出结果",
      answers: "+ 答案",
      learn: "学习算法",
      model: "模型（学到的规则）",
      takeaway1: "制剂示例：不再手工推导释放方程，",
      takeaway2: "而是让模型从既往实验中学习「聚合物比例 / 固化条件 → 药物释放「的映射。",
    },
    s1body: "在制剂研发中，「处方 / 工艺 → 性能「之间的规律通常复杂到无法手写——它同时牵涉聚合物物理、界面化学与体内转运。机器学习的价值正在于：它能从实验数据中逼近这些隐藏关系。",

    s2k: "三种学习方式",
    s2t: "机器学习的三大范式",
    s2sub: "你遇到的几乎所有方法，都可归入三大家族之一，区别在于「学习者拿到什么样的监督信号「。",
    svg2: {
      aria: "监督学习、无监督学习与强化学习",
      sup: "监督学习", supD1: "从带标签样本", supD2: "学习（X → y）",
      unsup: "无监督学习", unsupD1: "在无标签数据中", unsupD2: "发现结构",
      rl: "强化学习", rlD1: "通过试错与奖励", rlD2: "学习最优策略",
    },
    para: [
      { t: "监督学习", b: "每条训练样本都有输入（处方与工艺变量）和已知答案（实测释放度、粒径、稳定性）。模型学习对未见新处方做出预测。这是制剂 ML 的主力——回归与分类。", tags: ["回归", "分类", "随机森林", "XGBoost", "神经网络"] },
      { t: "无监督学习", b: "不给标签，算法自行发现结构——把相似处方分组（聚类），或把众多相关描述符压缩成少数几个（如 PCA 降维）。适合探索辅料空间、可视化高维数据。", tags: ["聚类", "PCA", "t-SNE", "k-means"] },
      { t: "强化学习", b: "智能体采取行动（调整某工艺参数）、观察奖励（产品质量变好/变差），学习能最大化长期回报的策略。它与制剂搜索常用的贝叶斯优化密切相关，在药学领域虽新兴但适合序贯决策。", tags: ["贝叶斯优化", "主动学习", "DoE"] },
    ],

    s3k: "原材料",
    s3t: "制剂数据与特征工程",
    s3sub: "模型的上限由特征决定。制剂领域的输入高度异构——认清数据类型就成功了一半。",
    dataTypes: [
      { t: "处方组成变量", b: "API、聚合物、脂质、表面活性剂、溶剂的用量与比例，多为连续数值（%、w/w、摩尔比）。", tag: "例：PLGA 的 LA:GA 比、载药量 %" },
      { t: "工艺参数", b: "温度、搅拌速率、均质压力、固化时间、喷雾干燥进风温度等可控实验设定。", tag: "例：乳化转速、淬冷速率" },
      { t: "分子描述符", b: "由化学信息学工具计算的 API/辅料性质——logP、分子量、TPSA、pKa 等。", tag: "例：logP、氢键供体数、熔点" },
      { t: "表征读数", b: "实测响应：粒径、PDI、Zeta 电位、包封率、释放度、降解速率，常作为预测目标。", tag: "例：t₅₀、EE%、突释量" },
    ],
    feTitle: "一句话说清特征工程",
    feBody: "把原始实验记录变成干净、数值化、可比较的列——处理缺失值、编码分类变量、把特征缩放到相近量纲，并构造有领域意义的比例或交互项。实践中，好特征往往比选哪个算法更重要。",
    code1: `# 制剂数据集的特征工程与缩放
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("isg_formulations.csv")   # 例如原位凝胶处方
X = df[["plga_ratio", "drug_loading", "nmp_fraction", "curing_h"]]
y = df["release_t50_days"]                 # 目标：释放 50% 所需时间

# 80/20 划分 —— 留出一个模型训练中"绝不见面"的测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 缩放特征，避免量纲大的特征主导模型
scaler = StandardScaler().fit(X_train)     # 只在训练集上拟合
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)`,

    s4k: "诚实的评估",
    s4t: "训练 / 验证 / 测试集，与过拟合陷阱",
    s4sub: "一个「背下「训练数据的模型在实验室里看似完美，到了实验台上却一败涂地。诚实地划分数据，正是我们识破它的方法。",
    svg3: {
      aria: "偏差-方差权衡曲线",
      x: "模型复杂度 →", y: "误差",
      train: "训练误差", valid: "验证误差",
      best: "最佳平衡点", under: "欠拟合", over: "过拟合",
    },
    overfit: [
      { t: "欠拟合（高偏差）", b: "模型太简单，抓不住真实的「处方—性能「关系。训练误差和验证误差都偏高。" },
      { t: "过拟合（高方差）", b: "模型太灵活，把小样本里的噪声也背了下来。训练误差极小、验证/测试误差很大——这是小制剂数据集上最典型的失败。" },
      { t: "最佳平衡点", b: "复杂度刚好足以捕捉真实信号、又不混入噪声。通过调参时跟踪验证误差来经验性地找到。" },
    ],
    calloutSmall: "制剂数据集常常只有几十到几百行。小数据让「过拟合「成为默认失败模式——务必保留一个真正独立的测试集，并且先用更简单的模型。",

    s5k: "用好每一行数据",
    s5t: "小数据集上的交叉验证",
    s5sub: "数据稀缺时，k 折交叉验证让同一批样本轮流充当训练与验证，比单次划分能给出可靠得多的真实性能估计。",
    svg4: {
      aria: "五折交叉验证",
      iter: "轮次", fold: "第",
      trainOn: "用于训练的折", validateOn: "用于验证的折",
    },
    code2: `# k 折交叉验证 —— 小数据上的"诚实分数"
from sklearn.model_selection import cross_val_score, KFold
from sklearn.ensemble import RandomForestRegressor

model = RandomForestRegressor(n_estimators=300, random_state=42)
cv = KFold(n_splits=5, shuffle=True, random_state=42)

# 返回的是负的 RMSE，取相反数
scores = -cross_val_score(model, X, y, cv=cv,
                          scoring="neg_root_mean_squared_error")
print("CV RMSE: %.3f ± %.3f" % (scores.mean(), scores.std()))`,
    calloutGroup: "若同一处方有多行（平行样、多个取样时间点），请用 GroupKFold，让同一处方的所有行落在同一折——否则近乎重复的行会同时出现在训练与验证中，造成数据泄漏、虚高分数。",

    s6k: "度量成功",
    s6t: "你真正会用到的评估指标",
    s6sub: "选与任务匹配的指标——连续目标（释放度、粒径）用回归指标，类别目标（合格/不合格、稳定/不稳定）用分类指标。",
    regTitle: "回归指标",
    clsTitle: "分类指标",
    f_rmse: "RMSE = √( (1/n) Σ (yᵢ − ŷᵢ)² )",
    f_rmse_n: "均方根误差——重罚大误差，单位与目标一致。",
    f_mae: "MAE = (1/n) Σ | yᵢ − ŷᵢ |",
    f_mae_n: "平均绝对误差——以目标自身单位表示的「典型偏差「。",
    f_r2: "R² = 1 − Σ(yᵢ−ŷᵢ)² / Σ(yᵢ−ȳ)²",
    f_r2_n: "被解释的方差比例。1.0 为完美，0 表示不比取均值强。",
    f_acc: "准确率 = 预测正确数 / 总数",
    f_acc_n: "整体正确率——类别不平衡时具有误导性。",
    f_auc: "AUC-ROC ∈ [0, 1]",
    f_auc_n: "在各阈值下把正样本排在负样本之前的能力，0.5 等于随机。",

    s7k: "继续前进",
    s7t: "下一步",
    s7sub: "你已掌握基本词汇。接下来可深入各算法详解，或看看一个完整的制剂 ML 项目是如何端到端落地的。",
    nextAlg: "深入算法详解 →",
    nextAlgSub: "ML Algorithms · 回归、树模型、SVM、ANN、CNN、聚类、PCA、优化",
    nextFlow: "查看完整工作流 →",
    nextFlowSub: "ML Workflow · 从问题定义到经验证、合规的模型",
  },
};

/* ===========================================================================
 * Page
 * ======================================================================== */
export default function MLBasics() {
  const { lang } = useLang();
  const c = C[lang] || C.en;

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-20">
      <PageHero kicker={c.kicker} title={c.title} sub={c.sub} badges={c.badges} />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-10">
        <SideNav items={c.nav} label={c.toc} />

        <div className="min-w-0">
          {/* 1. What is ML */}
          <section className="mb-16">
            <SectionHead id="what" kicker={c.s1k} title={c.s1t} sub={c.s1sub} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 md:p-6 my-6">
              <SvgTraditionalVsML labels={c.svg1} />
            </div>
            <p className="text-[14px] text-stone-700 leading-relaxed max-w-3xl">{c.s1body}</p>
          </section>

          {/* 2. Three paradigms */}
          <section className="mb-16">
            <SectionHead id="paradigms" kicker={c.s2k} title={c.s2t} sub={c.s2sub} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 md:p-6 my-6">
              <SvgParadigms labels={c.svg2} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {c.para.map((p, i) => (
                <ConceptCard key={p.t} num={`0${i + 1}`} title={p.t} accent={["#2a7ab0", "#BA7517", "#1D9E75"][i]}>
                  <p className="mb-3">{p.b}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {p.tags.map((t) => <Tag key={t} color={["#2a7ab0", "#BA7517", "#1D9E75"][i]}>{t}</Tag>)}
                  </div>
                </ConceptCard>
              ))}
            </div>
          </section>

          {/* 3. Formulation data */}
          <section className="mb-16">
            <SectionHead id="data" kicker={c.s3k} title={c.s3t} sub={c.s3sub} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {c.dataTypes.map((d, i) => (
                <ConceptCard key={d.t} num={`0${i + 1}`} title={d.t} accent="#0c3070">
                  <p className="mb-2">{d.b}</p>
                  <p className="font-mono text-[11px] text-amber-600">{d.tag}</p>
                </ConceptCard>
              ))}
            </div>
            <SubHead title={c.feTitle} sub={c.feBody} />
            <div className="mt-4">
              <CodeBlock code={c.code1} title="python · feature engineering" />
            </div>
          </section>

          {/* 4. Split & overfitting */}
          <section className="mb-16">
            <SectionHead id="split" kicker={c.s4k} title={c.s4t} sub={c.s4sub} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 md:p-6 my-6">
              <SvgOverfit labels={c.svg3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {c.overfit.map((o, i) => (
                <ConceptCard key={o.t} num={`0${i + 1}`} title={o.t} accent={["#2a7ab0", "#BA7517", "#1D9E75"][i]}>
                  {o.b}
                </ConceptCard>
              ))}
            </div>
            <Callout kind="warn" label={lang === "zh" ? "小数据警示" : "Small-data warning"}>
              {c.calloutSmall}
            </Callout>
          </section>

          {/* 5. Cross-validation */}
          <section className="mb-16">
            <SectionHead id="cv" kicker={c.s5k} title={c.s5t} sub={c.s5sub} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 md:p-6 my-6">
              <SvgKFold labels={c.svg4} />
            </div>
            <CodeBlock code={c.code2} title="python · cross-validation" />
            <Callout kind="tip" label={lang === "zh" ? "防止数据泄漏" : "Avoid leakage"}>
              {c.calloutGroup}
            </Callout>
          </section>

          {/* 6. Metrics */}
          <section className="mb-16">
            <SectionHead id="metrics" kicker={c.s6k} title={c.s6t} sub={c.s6sub} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-stone-400/20 rounded-lg p-5">
                <h3 className="font-display text-base text-ink-900 mb-2">{c.regTitle}</h3>
                <Formula note={c.f_rmse_n}>{c.f_rmse}</Formula>
                <Formula note={c.f_mae_n}>{c.f_mae}</Formula>
                <Formula note={c.f_r2_n}>{c.f_r2}</Formula>
              </div>
              <div className="bg-white border border-stone-400/20 rounded-lg p-5">
                <h3 className="font-display text-base text-ink-900 mb-2">{c.clsTitle}</h3>
                <Formula note={c.f_acc_n}>{c.f_acc}</Formula>
                <Formula note={c.f_auc_n}>{c.f_auc}</Formula>
              </div>
            </div>
          </section>

          {/* 7. Next */}
          <section>
            <SectionHead id="next" kicker={c.s7k} title={c.s7t} sub={c.s7sub} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <a href="#/ml-algorithms" className="group bg-white border border-stone-400/20 rounded-lg p-6 hover:border-ink-400/50 hover:shadow-md transition-all">
                <p className="font-display text-lg text-ink-900 group-hover:text-ink-700">{c.nextAlg}</p>
                <p className="text-[13px] text-stone-600 mt-2">{c.nextAlgSub}</p>
              </a>
              <a href="#/ml-workflow" className="group bg-white border border-stone-400/20 rounded-lg p-6 hover:border-ink-400/50 hover:shadow-md transition-all">
                <p className="font-display text-lg text-ink-900 group-hover:text-ink-700">{c.nextFlow}</p>
                <p className="text-[13px] text-stone-600 mt-2">{c.nextFlowSub}</p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
