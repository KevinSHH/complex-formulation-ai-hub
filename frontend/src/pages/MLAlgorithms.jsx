import { useState } from "react";
import { useLang } from "../i18n/index.jsx";
import {
  PageHero, SectionHead, SubHead, CodeBlock, Formula, CaseCard, Callout, SideNav, Tag,
} from "../components/ml/ui.jsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";

/* ===========================================================================
 * SVG schematic figures (light theme, ink + amber).
 * ======================================================================== */
const FIG = {
  tree: (
    <svg viewBox="0 0 300 170" className="w-full h-auto" role="img" aria-label="decision tree">
      <g fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fill="#2C2C2A">
        <rect x="105" y="8" width="90" height="26" rx="6" fill="#E6F1FB" stroke="#2a7ab0" />
        <text x="150" y="25" textAnchor="middle">LA:GA ≤ 1?</text>
        <rect x="40" y="66" width="80" height="26" rx="6" fill="#E6F1FB" stroke="#2a7ab0" />
        <text x="80" y="83" textAnchor="middle">loading ≤ 8%?</text>
        <rect x="180" y="66" width="80" height="26" rx="6" fill="#FAEEDA" stroke="#BA7517" />
        <text x="220" y="83" textAnchor="middle">t50 = 21 d</text>
        <rect x="8" y="124" width="80" height="26" rx="6" fill="#FAEEDA" stroke="#BA7517" />
        <text x="48" y="141" textAnchor="middle">t50 = 7 d</text>
        <rect x="104" y="124" width="80" height="26" rx="6" fill="#FAEEDA" stroke="#BA7517" />
        <text x="144" y="141" textAnchor="middle">t50 = 14 d</text>
      </g>
      <g stroke="#888780" strokeWidth="1.2">
        <line x1="135" y1="34" x2="85" y2="66" /><line x1="165" y1="34" x2="215" y2="66" />
        <line x1="65" y1="92" x2="48" y2="124" /><line x1="95" y1="92" x2="144" y2="124" />
      </g>
    </svg>
  ),
  svm: (
    <svg viewBox="0 0 300 170" className="w-full h-auto" role="img" aria-label="support vector machine">
      <line x1="30" y1="140" x2="280" y2="140" stroke="#888780" strokeWidth="1.2" />
      <line x1="30" y1="140" x2="30" y2="14" stroke="#888780" strokeWidth="1.2" />
      <line x1="90" y1="150" x2="200" y2="20" stroke="#0a2540" strokeWidth="2" />
      <line x1="70" y1="150" x2="180" y2="20" stroke="#BA7517" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="110" y1="150" x2="220" y2="20" stroke="#BA7517" strokeWidth="1" strokeDasharray="4 3" />
      <g fill="#2a7ab0"><circle cx="80" cy="110" r="5" /><circle cx="95" cy="90" r="5" /><circle cx="120" cy="120" r="5" /><circle cx="70" cy="70" r="5" /></g>
      <g fill="#BA7517"><rect x="160" y="60" width="9" height="9" /><rect x="190" y="90" width="9" height="9" /><rect x="150" y="100" width="9" height="9" /><rect x="210" y="70" width="9" height="9" /></g>
      <circle cx="95" cy="90" r="9" fill="none" stroke="#1D9E75" strokeWidth="1.6" />
      <rect x="150" y="100" width="17" height="17" fill="none" stroke="#1D9E75" strokeWidth="1.6" />
    </svg>
  ),
  ann: (
    <svg viewBox="0 0 300 170" className="w-full h-auto" role="img" aria-label="neural network">
      <g stroke="#B4B2A9" strokeWidth="1">
        {[40, 85, 130].map((y) => [30, 85, 140].map((y2) => <line key={`${y}-${y2}`} x1="45" y1={y} x2="135" y2={y2} />))}
        {[30, 85, 140].map((y) => [60, 110].map((y2) => <line key={`${y}-${y2}`} x1="135" y1={y} x2="225" y2={y2} />))}
        {[60, 110].map((y) => <line key={y} x1="225" y1={y} x2="285" y2="85" />)}
      </g>
      <g fill="#2a7ab0">{[40, 85, 130].map((y) => <circle key={y} cx="45" cy={y} r="9" fill="#E6F1FB" stroke="#2a7ab0" strokeWidth="1.4" />)}</g>
      <g fill="#FAEEDA">{[30, 85, 140].map((y) => <circle key={y} cx="135" cy={y} r="9" stroke="#BA7517" strokeWidth="1.4" />)}</g>
      <g>{[60, 110].map((y) => <circle key={y} cx="225" cy={y} r="9" fill="#FAEEDA" stroke="#BA7517" strokeWidth="1.4" />)}</g>
      <circle cx="285" cy="85" r="9" fill="#1D9E75" stroke="#0f6b4e" strokeWidth="1.4" />
      <g fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9.5" fill="#5F5E5A">
        <text x="45" y="160" textAnchor="middle">inputs</text><text x="150" y="160" textAnchor="middle">hidden</text><text x="270" y="160" textAnchor="middle">output</text>
      </g>
    </svg>
  ),
  cluster: (
    <svg viewBox="0 0 300 170" className="w-full h-auto" role="img" aria-label="clustering">
      <line x1="30" y1="140" x2="280" y2="140" stroke="#888780" strokeWidth="1.2" />
      <line x1="30" y1="140" x2="30" y2="14" stroke="#888780" strokeWidth="1.2" />
      <g fill="#2a7ab0">{[[70, 110], [85, 95], [60, 90], [95, 115], [75, 75]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="5" />)}</g>
      <g fill="#BA7517">{[[200, 60], [220, 75], [185, 80], [215, 45], [235, 60]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="5" />)}</g>
      <g fill="#1D9E75">{[[180, 120], [200, 128], [165, 132], [215, 118]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="5" />)}</g>
    </svg>
  ),
  bayes: (
    <svg viewBox="0 0 300 170" className="w-full h-auto" role="img" aria-label="bayesian optimisation">
      <line x1="30" y1="140" x2="280" y2="140" stroke="#888780" strokeWidth="1.2" />
      <line x1="30" y1="140" x2="30" y2="14" stroke="#888780" strokeWidth="1.2" />
      <path d="M30 90 C 80 40, 130 60, 180 30 C 220 55, 250 80, 280 70" fill="none" stroke="#2a7ab0" strokeWidth="2" />
      <path d="M30 100 C 80 60, 130 80, 180 50 C 220 75, 250 95, 280 88 L280 140 L30 140 Z" fill="#BA7517" opacity="0.12" />
      <g fill="#0a2540"><circle cx="80" cy="55" r="4.5" /><circle cx="150" cy="52" r="4.5" /><circle cx="240" cy="82" r="4.5" /></g>
      <circle cx="182" cy="28" r="6" fill="#BA7517" stroke="#854F0B" strokeWidth="1.6" />
      <text x="182" y="14" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9.5" fill="#854F0B">next</text>
    </svg>
  ),
};

/* Top "which algorithm should I use?" decision tree — the memorable figure. */
function SvgChooser({ l }) {
  const box = (x, y, w, h, fill, stroke, lines, fs = 11, bold = false) => (
    <g key={x + y + lines[0]}>
      <rect x={x} y={y} width={w} height={h} rx="7" fill={fill} stroke={stroke} strokeWidth="1.3" />
      {lines.map((t, i) => (
        <text key={t} x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * 13 + 4} textAnchor="middle"
          fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={fs} fill="#2C2C2A" fontWeight={bold ? 600 : 400}>{t}</text>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 680 320" className="w-full h-auto" role="img" aria-label={l.aria}>
      {box(255, 10, 170, 34, "#0a2540", "#0a2540", [l.q], 12, true)}
      {/* level 2 */}
      {box(10, 90, 150, 44, "#E6F1FB", "#2a7ab0", [l.reg], 11, true)}
      {box(190, 90, 150, 44, "#E6F1FB", "#2a7ab0", [l.cls], 11, true)}
      {box(370, 90, 150, 44, "#E6F1FB", "#2a7ab0", [l.struct], 11, true)}
      {box(530, 90, 140, 44, "#E6F1FB", "#2a7ab0", [l.opt], 11, true)}
      {/* level 3 leaves */}
      {box(10, 180, 150, 90, "#fff", "#1D9E75", l.regLeaves, 10.5)}
      {box(190, 180, 150, 90, "#fff", "#1D9E75", l.clsLeaves, 10.5)}
      {box(370, 180, 150, 90, "#fff", "#1D9E75", l.structLeaves, 10.5)}
      {box(530, 180, 140, 90, "#fff", "#1D9E75", l.optLeaves, 10.5)}
      {/* connectors */}
      <g stroke="#888780" strokeWidth="1.3" fill="none">
        <path d="M300 44 L85 90" /><path d="M325 44 L265 90" /><path d="M355 44 L445 90" /><path d="M385 44 L600 90" />
        <line x1="85" y1="134" x2="85" y2="180" /><line x1="265" y1="134" x2="265" y2="180" />
        <line x1="445" y1="134" x2="445" y2="180" /><line x1="600" y1="134" x2="600" y2="180" />
      </g>
      <text x="340" y="302" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fill="#854F0B" fontStyle="italic">{l.hint}</text>
    </svg>
  );
}

/* ===========================================================================
 * Real collection stats for the distribution chart.
 * ======================================================================== */
const DIST = [
  { name: "Deep Learning", n: 43 }, { name: "ANN / MLP", n: 34 }, { name: "VAE / GAN", n: 22 },
  { name: "Gaussian Process", n: 20 }, { name: "XGBoost", n: 19 }, { name: "Random Forest", n: 17 },
  { name: "Transformer / LLM", n: 17 }, { name: "Linear / PLS", n: 12 }, { name: "SVM", n: 11 },
  { name: "CNN", n: 7 }, { name: "Genetic Algo.", n: 6 }, { name: "GNN", n: 5 },
];

/* ===========================================================================
 * Bilingual algorithm catalogue.
 * ======================================================================== */
const COPY = {
  en: {
    kicker: "ML Foundations · 02",
    title: "The algorithms, one by one",
    sub: "A guided tour of the methods that appear most often in the hub's collection — the intuition, the key formula, runnable code, and a real paper that used each one. Expand any card to go deeper.",
    badges: ["9 method families", "Formulas + code", "Real papers"],
    toc: "Methods",
    chooserKicker: "Start here",
    chooserTitle: "Which algorithm should I use?",
    chooserSub: "A one-glance decision tree. Find your task at the top, then follow the branch to a sensible first choice.",
    chooser: {
      aria: "Algorithm selection decision tree",
      q: "What is your task?",
      reg: "Predict a number\n(regression)", cls: "Predict a class\n(classification)",
      struct: "Find structure\n(no labels)", opt: "Optimise a\nformulation",
      regLeaves: ["Small data, non-linear:", "Random Forest / XGBoost", "Linear relation: Linear / PLS"],
      clsLeaves: ["Clear margin, small data:", "SVM", "Default baseline: Random Forest"],
      structLeaves: ["Group similar recipes:", "Clustering (k-means)", "Compress features: PCA"],
      optLeaves: ["Expensive experiments:", "Bayesian optimisation", "Discrete search: Genetic Algo."],
      hint: "Rule of thumb on small formulation data: start with a tree ensemble — it is strong, robust and needs little tuning.",
    },
    distTitle: "How often each method appears in this hub",
    distSub: "Mentions across the curated + sniffed collection (619 papers) — tree ensembles, neural networks and Gaussian processes dominate.",
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    intuition: "Intuition",
    formula: "Key idea",
    code: "Minimal example",
    cases: "From the collection",
    bestFor: "Best for",
    watchOut: "Watch out",
  },
  zh: {
    kicker: "机器学习基础 · 02",
    title: "核心算法逐个讲",
    sub: "沿着本站文献库中最常出现的方法逐一讲解——直觉、关键公式、可运行代码，以及用过它的真实论文。点击任意卡片可展开深入。",
    badges: ["9 大方法族", "公式 + 代码", "真实论文"],
    toc: "方法目录",
    chooserKicker: "从这里开始",
    chooserTitle: "我该用哪个算法？",
    chooserSub: "一张图看懂。从顶部找到你的任务类型，沿分支走下去，就是一个合理的首选。",
    chooser: {
      aria: "算法选择决策树",
      q: "你的任务是？",
      reg: "预测数值\n（回归）", cls: "预测类别\n（分类）",
      struct: "发现结构\n（无标签）", opt: "优化处方",
      regLeaves: ["小数据、非线性：", "随机森林 / XGBoost", "线性关系：线性 / PLS"],
      clsLeaves: ["间隔清晰、小数据：", "SVM", "稳妥基线：随机森林"],
      structLeaves: ["给相似处方分组：", "聚类（k-means）", "压缩特征：PCA"],
      optLeaves: ["实验代价高：", "贝叶斯优化", "离散搜索：遗传算法"],
      hint: "小制剂数据集的经验法则：先用树模型集成——强、稳、几乎不用调参。",
    },
    distTitle: "各方法在本站文献中的出现频次",
    distSub: "基于 619 篇（精选 + 嗅探）文献的统计——树模型集成、神经网络与高斯过程占主导。",
    expandAll: "全部展开",
    collapseAll: "全部收起",
    intuition: "直觉",
    formula: "核心思想",
    code: "最小示例",
    cases: "来自本站文献",
    bestFor: "适用场景",
    watchOut: "注意事项",
  },
};

const ALGO = [
  {
    id: "linear", color: "#5fa8d3",
    name: { en: "Linear / PLS Regression", zh: "线性 / 偏最小二乘回归" },
    tagline: { en: "The interpretable baseline — fit a straight relationship.", zh: "可解释的基线——拟合一个线性关系。" },
    intuition: {
      en: "Assume the target is a weighted sum of the inputs. Each coefficient tells you exactly how much one variable moves the prediction, which is why linear models remain the first thing to try and the easiest to defend in a report. PLS (partial least squares) is the formulation favourite when descriptors are many and highly correlated — it projects them onto a few latent directions first.",
      zh: "假设目标是各输入的加权和。每个系数都明确告诉你某变量会让预测变化多少，因此线性模型总是首选基线，也最容易在报告中解释。当描述符多且高度相关时，制剂领域常用偏最小二乘（PLS）——它先把描述符投影到少数潜在方向上。",
    },
    formula: { en: "ŷ = β₀ + β₁x₁ + β₂x₂ + … + βₚxₚ", zh: "ŷ = β₀ + β₁x₁ + β₂x₂ + … + βₚxₚ" },
    formulaNote: { en: " minimise Σ(yᵢ − ŷᵢ)² (least squares)", zh: " 最小化 Σ(yᵢ − ŷᵢ)²（最小二乘）" },
    code: `from sklearn.linear_model import LinearRegression
from sklearn.cross_decomposition import PLSRegression

# plain multiple linear regression
lin = LinearRegression().fit(X_train, y_train)
print("coef:", dict(zip(features, lin.coef_.round(3))))

# PLS handles many correlated descriptors
pls = PLSRegression(n_components=3).fit(X_train_s, y_train)
r2 = pls.score(X_test_s, y_test)`,
    codeTitle: "python · linear & PLS",
    cases: [
      { badge: "Linear / PLS", title: "Machine learning predicts the functional composition of the protein corona and the cellular recognition of nanoparticles", meta: "PNAS · 2020 · cited 298", color: "#5fa8d3",
        body: { en: "Used linear-style models on nanoparticle physicochemical descriptors to predict protein-corona composition — a clean example of interpretable regression guiding nanocarrier design.", zh: "用线性类模型基于纳米粒理化描述符预测蛋白冠组成，是可解释回归指导纳米载体设计的范例。" } },
    ],
    bestFor: { en: "Quick baselines, small clean datasets, when you must explain each variable's contribution.", zh: "快速基线、干净的小数据集，以及必须解释每个变量贡献时。" },
    watchOut: { en: "Cannot capture non-linear effects or interactions unless you add them by hand.", zh: "无法自动捕捉非线性与交互作用，需手工构造。" },
    svg: null,
  },
  {
    id: "rf", color: "#1D9E75", svg: "tree",
    name: { en: "Decision Tree & Random Forest", zh: "决策树与随机森林" },
    tagline: { en: "Many yes/no questions, then average a whole forest.", zh: "一连串是/否判断，再让整片森林投票取平均。" },
    intuition: {
      en: "A single tree splits the data by asking simple threshold questions (e.g. 'is drug loading ≤ 8%?'). It is easy to read but overfits easily. A Random Forest trains hundreds of trees on random subsets of rows and features, then averages them — dramatically more stable and one of the strongest off-the-shelf methods for tabular formulation data.",
      zh: "单棵树通过简单的阈值问题切分数据（如「载药量 ≤ 8%？」）。易读但容易过拟合。随机森林在随机抽取的行与特征上训练数百棵树再取平均——稳定性大幅提升，是表格型制剂数据最强的开箱即用方法之一。",
    },
    formula: { en: "ŷ = (1/B) Σ_b T_b(x)   (average of B trees)", zh: "ŷ = (1/B) Σ_b T_b(x)（B 棵树取平均）" },
    formulaNote: { en: "each tree built on a bootstrap sample + random feature subset", zh: "每棵树基于自助采样 + 随机特征子集构建" },
    code: `from sklearn.ensemble import RandomForestRegressor

rf = RandomForestRegressor(
    n_estimators=500, max_depth=None,
    min_samples_leaf=2, random_state=42, n_jobs=-1
).fit(X_train, y_train)

print("test R2:", rf.score(X_test, y_test))
# which variables matter most
importances = dict(zip(features, rf.feature_importances_.round(3)))`,
    codeTitle: "python · random forest",
    cases: [
      { badge: "Random Forest", title: "Predicting Nanoparticle Delivery to Tumors Using Machine Learning and Artificial Intelligence Approaches", meta: "Int. J. Nanomedicine · 2022 · cited 177", color: "#1D9E75",
        body: { en: "Benchmarked tree ensembles (and other models) to predict tumour accumulation of nanoparticles from their properties — a representative use of Random Forest on delivery data.", zh: "以树模型集成等方法根据纳米粒性质预测其肿瘤富集，是随机森林用于递送数据的代表性工作。" } },
    ],
    bestFor: { en: "Tabular data, non-linear relationships, built-in feature importance, minimal preprocessing.", zh: "表格数据、非线性关系、内置特征重要性、几乎无需预处理。" },
    watchOut: { en: "Does not extrapolate beyond the training range; large forests are less interpretable.", zh: "无法在训练范围之外外推；森林太大时可解释性下降。" },
  },
  {
    id: "xgb", color: "#BA7517", svg: "tree",
    name: { en: "XGBoost / Gradient Boosting", zh: "XGBoost / 梯度提升" },
    tagline: { en: "Trees built one after another, each fixing the last one's errors.", zh: "树一棵接一棵地建，每棵都在纠正前一棵的错误。" },
    intuition: {
      en: "Gradient boosting adds trees sequentially: each new tree is fit to the residual errors of the current ensemble, so mistakes are progressively corrected. XGBoost is the fast, regularised, industry-standard version and frequently tops formulation-ML benchmarks on tabular data.",
      zh: "梯度提升按顺序加树：每棵新树拟合当前集成残留的误差，错误被逐步纠正。XGBoost 是其快速、带正则化的工业标准实现，常在制剂 ML 的表格数据基准中表现最佳。",
    },
    formula: { en: "F_m(x) = F_{m−1}(x) + η · h_m(x)", zh: "F_m(x) = F_{m−1}(x) + η · h_m(x)" },
    formulaNote: { en: "add a small (η) correction tree at each step", zh: "每步加入一棵小幅（η）修正树" },
    code: `from xgboost import XGBRegressor

xgb = XGBRegressor(
    n_estimators=800, learning_rate=0.05,
    max_depth=6, subsample=0.8, colsample_bytree=0.8,
    reg_lambda=1.0, random_state=42
).fit(X_train, y_train)

print("test R2:", xgb.score(X_test, y_test))`,
    codeTitle: "python · xgboost",
    cases: [
      { badge: "XGBoost", title: "Prediction of lipid nanoparticles for mRNA vaccines by the machine learning algorithm", meta: "Acta Pharm. Sin. B · 2021 · cited 155", color: "#BA7517",
        body: { en: "Applied gradient boosting to screen ionisable-lipid LNPs for mRNA delivery, cutting the cost and time of traditional lipid screening — a flagship formulation case.", zh: "用梯度提升筛选用于 mRNA 递送的可电离脂质 LNP，大幅降低传统脂质筛选的成本与周期，是标志性制剂案例。" } },
    ],
    bestFor: { en: "Maximum accuracy on tabular data; the default strong choice for formulation benchmarks.", zh: "在表格数据上追求最高精度；制剂基准中的默认强选择。" },
    watchOut: { en: "More hyperparameters than Random Forest; needs a validation set to tune safely.", zh: "超参数比随机森林多，需验证集才能稳妥调参。" },
  },
  {
    id: "svm", color: "#534AB7", svg: "svm",
    name: { en: "Support Vector Machine (SVM)", zh: "支持向量机（SVM）" },
    tagline: { en: "Draw the boundary with the widest safety margin.", zh: "画出「安全间隔「最宽的那条分界线。" },
    intuition: {
      en: "SVM looks for the decision boundary that leaves the largest possible gap (margin) between classes. Only the points closest to the boundary — the support vectors — matter. With the kernel trick it can draw curved boundaries, making it strong for small, clean classification problems like pass/fail prediction.",
      zh: "SVM 寻找让两类之间「间隔「最大的决策边界。真正起作用的只有离边界最近的点——支持向量。借助核技巧，它能画出弯曲边界，因此很适合小而干净的分类问题，如「合格/不合格「预测。",
    },
    formula: { en: "maximise  2/‖w‖   subject to  yᵢ(w·xᵢ + b) ≥ 1", zh: "最大化  2/‖w‖，约束 yᵢ(w·xᵢ + b) ≥ 1" },
    formulaNote: { en: "widest margin separating the two classes", zh: "把两类分开的最宽间隔" },
    code: `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# SVM is scale-sensitive — always standardise first
svm = make_pipeline(
    StandardScaler(),
    SVC(kernel="rbf", C=1.0, gamma="scale", probability=True)
).fit(X_train, y_train_cls)

print("accuracy:", svm.score(X_test, y_train_cls))`,
    codeTitle: "python · SVM",
    cases: [
      { badge: "SVM / XAI", title: "Exploring the Potential of Artificial Intelligence for Hydrogel Development — A Short Review", meta: "Gels · 2023 · cited 110", color: "#534AB7",
        body: { en: "Reviews SVM and other classifiers for predicting hydrogel properties (swelling, strength, degradation) from composition — a formulation-relevant classification survey.", zh: "综述了用 SVM 等分类器根据组成预测水凝胶性能（溶胀、强度、降解）——与制剂密切相关的分类综述。" } },
    ],
    bestFor: { en: "Small-to-medium classification tasks with clear class separation.", zh: "中小规模、类别可分性好的分类任务。" },
    watchOut: { en: "Needs feature scaling; slow and less effective on very large or noisy datasets.", zh: "必须缩放特征；在超大或噪声多的数据上较慢且效果下降。" },
  },
  {
    id: "ann", color: "#2a7ab0", svg: "ann",
    name: { en: "Artificial Neural Network (ANN / MLP)", zh: "人工神经网络（ANN / MLP）" },
    tagline: { en: "Stacked layers of simple neurons approximate any curve.", zh: "层层堆叠的简单神经元，可以逼近任意曲线。" },
    intuition: {
      en: "A multi-layer perceptron passes inputs through layers of neurons, each computing a weighted sum then a non-linear activation. Stacking layers lets it model highly non-linear composition–process–performance relationships. It is one of the most-used methods for drug-release and PK modelling, but is data-hungry and needs careful regularisation on small sets.",
      zh: "多层感知机把输入逐层传递：每个神经元先算加权和，再过一个非线性激活。多层堆叠使其能拟合高度非线性的「处方—工艺—性能「关系。它是药物释放与药代建模最常用的方法之一，但吃数据，小样本上要仔细做正则化。",
    },
    formula: { en: "a = f(W·x + b),  stacked layer by layer", zh: "a = f(W·x + b)，逐层堆叠" },
    formulaNote: { en: "f = activation (ReLU / sigmoid), trained by backpropagation", zh: "f 为激活函数（ReLU/sigmoid），用反向传播训练" },
    code: `from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

ann = make_pipeline(
    StandardScaler(),
    MLPRegressor(hidden_layer_sizes=(64, 32),
                 activation="relu", alpha=1e-3,   # alpha = L2 regularisation
                 max_iter=2000, random_state=42)
).fit(X_train_s, y_train)

print("test R2:", ann.score(X_test_s, y_test))`,
    codeTitle: "python · MLP",
    cases: [
      { badge: "ANN / MLP", title: "State-of-the-Art Review of Artificial Neural Networks to Predict, Characterize and Optimize Pharmaceutical Formulations", meta: "Pharmaceutics · 2022 · cited 85", color: "#2a7ab0",
        body: { en: "A dedicated review of ANNs for predicting and optimising pharmaceutical formulations — the canonical reference for this method in our field.", zh: "一篇专门综述 ANN 预测与优化药物处方的文章，是该方法在本领域的经典参考。" } },
    ],
    bestFor: { en: "Complex non-linear mappings when you have enough data (hundreds+ rows).", zh: "数据量足够（数百行以上）时的复杂非线性映射。" },
    watchOut: { en: "Prone to overfitting on small data; needs scaling, tuning and regularisation.", zh: "小数据易过拟合；需缩放、调参与正则化。" },
  },
  {
    id: "cnn", color: "#D4537E",
    name: { en: "Convolutional Neural Network (CNN)", zh: "卷积神经网络（CNN）" },
    tagline: { en: "Learns visual patterns — ideal for images of your product.", zh: "自动学习图像特征——最适合处理产品图像。" },
    intuition: {
      en: "CNNs slide small filters across an image to detect edges, textures and shapes, building up from simple to complex features. In formulation work they shine on image data — tablet-defect detection, microscopy of particles, or dissolution-apparatus imaging — rather than on small tabular tables.",
      zh: "CNN 用小卷积核在图像上滑动，依次检测边缘、纹理与形状，特征由简到繁逐层抽象。在制剂工作中，它擅长处理图像——片剂缺陷检测、颗粒显微图像、溶出装置成像——而不是小型表格数据。",
    },
    formula: { en: "(I * K)(i,j) = ΣΣ I(i+m, j+n)·K(m,n)", zh: "(I * K)(i,j) = ΣΣ I(i+m, j+n)·K(m,n)" },
    formulaNote: { en: "convolution of image I with kernel K, then pooling", zh: "图像 I 与卷积核 K 的卷积，再接池化" },
    code: `# CNN for tablet-defect image classification (Keras)
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([
    layers.Conv2D(32, 3, activation="relu", input_shape=(128,128,3)),
    layers.MaxPooling2D(),
    layers.Conv2D(64, 3, activation="relu"),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(64, activation="relu"),
    layers.Dense(1, activation="sigmoid"),     # defect vs OK
])
model.compile(optimizer="adam", loss="binary_crossentropy",
              metrics=["accuracy"])`,
    codeTitle: "python · CNN (images)",
    cases: [
      { badge: "CNN / imaging", title: "Development and In Vivo Evaluation of Liposomal Fentanyl Nanocarriers using Thin-Film Hydration", meta: "Sci. Rep. · 2025 · Liposome", color: "#D4537E",
        body: { en: "Representative of image- and characterisation-driven ML pipelines around nanocarriers, where CNN-style models handle microscopy/spectral inputs.", zh: "代表纳米载体中图像与表征驱动的 ML 流程，CNN 类模型处理显微/光谱输入。" } },
    ],
    bestFor: { en: "Images and grid-like data: tablet inspection, microscopy, spectral maps.", zh: "图像与网格状数据：片剂检测、显微图像、光谱图。" },
    watchOut: { en: "Needs lots of labelled images and more compute; overkill for small tables.", zh: "需要大量标注图像与更多算力；对小表格是大材小用。" },
  },
  {
    id: "gp", color: "#EF9F27", svg: "bayes",
    name: { en: "Gaussian Process & Bayesian Optimisation", zh: "高斯过程与贝叶斯优化" },
    tagline: { en: "A model that knows what it doesn't know — then explores smartly.", zh: "一个「知道自己哪里不确定「的模型，再据此聪明地探索。" },
    intuition: {
      en: "A Gaussian Process predicts not just a value but also its uncertainty. Bayesian optimisation exploits this: it tests where the model is most uncertain or most promising, so it finds good formulations in very few experiments. This is exactly the strategy used for closed-loop formulation search (as in the FormulationLAI case study).",
      zh: "高斯过程不仅给出预测值，还给出不确定性。贝叶斯优化利用这一点：在「最不确定「或「最有希望「处做实验，从而用极少的实验找到好处方。这正是闭环处方搜索（如本站 FormulationLAI 案例）采用的策略。",
    },
    formula: { en: "EI(x) = E[ max(0, f(x) − f(x⁺)) ]", zh: "EI(x) = E[ max(0, f(x) − f(x⁺)) ]" },
    formulaNote: { en: "expected improvement — pick x with the highest EI next", zh: "期望改进——下一步选 EI 最大的 x" },
    code: `# Bayesian optimisation over a formulation space
from skopt import gp_minimize

def experiment(params):          # run a real / simulated experiment
    plga, loading = params
    return -predicted_t50(plga, loading)   # minimise (-t50)

space = [(0.5, 1.0), (2.0, 12.0)]          # LA:GA ratio, drug loading
res = gp_minimize(experiment, space, n_calls=20, random_state=42)
print("best:", res.x, "t50:", -res.fun)`,
    codeTitle: "python · bayesian optimisation",
    cases: [
      { badge: "Bayesian opt.", title: "FormulationLAI case study — closed-loop optimisation of in-situ forming gel depots", meta: "This hub · Case study", color: "#EF9F27",
        body: { en: "The hub's own case study uses Bayesian search with a penalised f2 factor to move a failing formulation (F1) to a passing one (F4) — see the Case Study page.", zh: "本站案例研究用带惩罚型 f₂ 因子的贝叶斯搜索，把失败的 F1 处方优化到达标的 F4——详见「案例研究「页。" } },
    ],
    bestFor: { en: "Expensive experiments where each run costs time/materials; sequential optimisation.", zh: "实验代价高（每次耗时耗材）且需序贯优化的场景。" },
    watchOut: { en: "Best in low dimensions (<~20); needs a surrogate model and a clear objective.", zh: "适合低维（约 20 维内）；需代理模型与明确目标函数。" },
  },
  {
    id: "ga", color: "#1a4d7a",
    name: { en: "Genetic Algorithm", zh: "遗传算法" },
    tagline: { en: "Evolve better formulations through selection and mutation.", zh: "通过「选择 + 变异「进化出更好的处方。" },
    intuition: {
      en: "Inspired by evolution: start with a population of candidate formulations, keep the best performers, then 'breed' them (combine and mutate their variables) over generations. It needs no gradients and handles messy, discrete search spaces — useful when variables are categorical or the objective is a black box.",
      zh: "受进化启发：先有一群候选处方，保留表现最好的，再让它们「繁殖「（组合并变异其变量），逐代进化。它不需要梯度，能处理杂乱、离散的搜索空间——当变量是类别型或目标是黑箱时很有用。",
    },
    formula: { en: "fitness → select → crossover → mutate → repeat", zh: "适应度 → 选择 → 交叉 → 变异 → 循环" },
    formulaNote: { en: "population evolves toward higher fitness", zh: "种群朝更高适应度进化" },
    code: `# Genetic algorithm with DEAP for recipe optimisation
from deap import base, creator, tools, algorithms
import random

creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)
tb = base.Toolbox()
tb.register("attr", random.uniform, 0, 1)
tb.register("individual", tools.initRepeat, creator.Individual, tb.attr, 5)
tb.register("population", tools.initRepeat, list, tb.individual)
# ... define evaluate(), mate, mutate, select, then:
# pop = algorithms.eaSimple(tb.population(50), tb, cxpb=0.5,
#                           mutpb=0.2, ngen=40)`,
    codeTitle: "python · genetic algorithm",
    cases: [
      { badge: "Genetic Algo.", title: "Preparation, optimization, and in vitro simulated inhalation delivery of carvedilol nanoparticles", meta: "Int. J. Nanomedicine · 2015 · cited 60", color: "#1a4d7a",
        body: { en: "Used optimisation to tune a nanosuspension for pulmonary delivery of carvedilol, improving bioavailability — a concrete GA-style formulation optimisation.", zh: "用优化方法调优用于肺部递送卡维地洛的纳米混悬剂，提高生物利用度——一个具体的 GA 式处方优化。" } },
    ],
    bestFor: { en: "Discrete/categorical variables and black-box objectives with no gradient.", zh: "离散/类别变量与无梯度的黑箱目标。" },
    watchOut: { en: "Can need many function evaluations; no guarantee of the global optimum.", zh: "可能需要大量函数评估；不保证全局最优。" },
  },
  {
    id: "cluster", color: "#888780", svg: "cluster",
    name: { en: "Clustering & PCA", zh: "聚类与主成分分析（PCA）" },
    tagline: { en: "No labels — just find groups and compress dimensions.", zh: "没有标签——只负责分组与压缩维度。" },
    intuition: {
      en: "Clustering (e.g. k-means) groups similar formulations together, helping you see families of recipes or suppliers. PCA compresses many correlated descriptors into a few principal components that keep most of the variance — perfect for visualising a high-dimensional formulation space in 2D before modelling.",
      zh: "聚类（如 k-means）把相似处方归为一组，帮你看清处方或辅料的「家族「。PCA 把众多相关描述符压缩成少数几个保留大部分方差的主成分——非常适合在建模前把高维处方空间画到二维来看。",
    },
    formula: { en: "PC₁ = w₁x₁ + w₂x₂ + …  (max variance)", zh: "PC₁ = w₁x₁ + w₂x₂ + …（方差最大）" },
    formulaNote: { en: "each next PC is orthogonal & captures remaining variance", zh: "后续主成分彼此正交，依次捕获剩余方差" },
    code: `from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# compress to 2D for visualisation
pca = PCA(n_components=2).fit(X_train_s)
Z = pca.transform(X_train_s)
print("variance kept:", pca.explained_variance_ratio_.round(3))

# group similar formulations
km = KMeans(n_clusters=4, n_init=10, random_state=42).fit(X_train_s)
labels = km.labels_`,
    codeTitle: "python · PCA + k-means",
    cases: [
      { badge: "Unsupervised", title: "Two-step machine learning enables optimized nanoparticle synthesis", meta: "npj Comput. Mater. · 2021 · cited 237", color: "#888780",
        body: { en: "Combined unsupervised structure finding with supervised modelling to optimise nanoparticle synthesis — showing how exploration and prediction work together.", zh: "把无监督结构发现与监督建模结合以优化纳米粒合成，展示了「探索 + 预测「如何协同。" } },
    ],
    bestFor: { en: "Exploring data, visualising high-dimensional spaces, grouping before modelling.", zh: "数据探索、高维空间可视化、建模前分组。" },
    watchOut: { en: "Results depend on scaling and the chosen number of clusters/components.", zh: "结果受缩放方式与簇数/主成分数选择影响。" },
  },
  {
    id: "gen", color: "#854F0B",
    name: { en: "Generative Models & LLMs", zh: "生成模型与大语言模型" },
    tagline: { en: "From predicting to creating new molecules and recipes.", zh: "从「预测「走向「创造「新分子与新处方。" },
    intuition: {
      en: "VAEs and GANs learn the underlying distribution of data and can generate new, plausible candidates (molecules, polymers, even formulation suggestions). Large language models add reasoning and literature mining on top. This is the frontier — powerful for proposing candidates that a predictive model then screens.",
      zh: "VAE 与 GAN 学习数据的内在分布，能生成新的、合理的候选（分子、聚合物，乃至处方建议）。大语言模型再叠加推理与文献挖掘能力。这是前沿方向——先由生成模型提出候选，再由预测模型筛选。",
    },
    formula: { en: "GAN: min_G max_D  E[log D(x)] + E[log(1−D(G(z)))]", zh: "GAN: min_G max_D  E[log D(x)] + E[log(1−D(G(z)))]" },
    formulaNote: { en: "generator G fools discriminator D in a minimax game", zh: "生成器 G 与判别器 D 在极小极大博弈中对抗" },
    code: `# VAE / GAN sketch for candidate generation
# (framework code — e.g. with PyTorch)
# z = sample_from_latent_prior()
# candidate = decoder(z)          # propose a new molecule / recipe
# score = predictive_model(candidate)   # screen with a predictive model
# keep the best-scoring candidates for the lab`,
    codeTitle: "python · generative (sketch)",
    cases: [
      { badge: "VAE / GAN", title: "Achieving long-term stability of lipid nanoparticles: effect of pH, temperature, and lyophilization", meta: "Int. J. Nanomedicine · 2016 · cited 324", color: "#854F0B",
        body: { en: "Data-driven stability work on LNPs — the kind of structured dataset generative models can learn from to propose stable formulations.", zh: "面向 LNP 稳定性的数据驱动研究——这类结构化数据正是生成模型可用于提出稳定处方的学习素材。" } },
      { badge: "LLM", title: "Automation and machine learning augmented by large language models in a catalysis study", meta: "Chemical Science · 2024 · cited 91", color: "#D4537E",
        body: { en: "Shows LLMs orchestrating experiments and analysis — a glimpse of how agentic AI may soon assist formulation R&D.", zh: "展示 LLM 编排实验与分析——预示智能体化 AI 很快会辅助制剂研发。" } },
    ],
    bestFor: { en: "Proposing novel candidates, literature mining, and AI-assisted design loops.", zh: "提出新候选、文献挖掘、AI 辅助设计闭环。" },
    watchOut: { en: "Needs large datasets and compute; outputs still require experimental validation.", zh: "需要大数据与算力；产出仍需实验验证。" },
  },
];

/* ===========================================================================
 * One expandable algorithm card.
 * ======================================================================== */
function AlgoCard({ a, open, onToggle, cc, lang }) {
  const L = (o) => (lang === "zh" ? o.zh : o.en);
  return (
    <div id={a.id} className="scroll-mt-24 bg-white border border-stone-400/20 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={onToggle} aria-expanded={open}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-stone-300/20 transition-colors">
        <span className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[16px] text-ink-900">{L(a.name)}</h3>
          <p className="text-[12.5px] text-stone-600 mt-0.5 truncate">{L(a.tagline)}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F5E5A" strokeWidth="2"
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-stone-400/15">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">{cc.intuition}</p>
              <p className="text-[13.5px] text-stone-700 leading-relaxed">{L(a.intuition)}</p>
              <div className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">{cc.formula}</p>
                <Formula note={L(a.formulaNote)}>{L(a.formula)}</Formula>
              </div>
              {a.svg && (
                <div className="mt-4 bg-paper border border-stone-400/20 rounded-lg p-3 max-w-sm">
                  {FIG[a.svg]}
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Callout kind="tip" label={cc.bestFor}><p>{L(a.bestFor)}</p></Callout>
                <Callout kind="warn" label={cc.watchOut}><p>{L(a.watchOut)}</p></Callout>
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">{cc.code}</p>
              <CodeBlock code={a.code} title={a.codeTitle} />
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-5 mb-2">{cc.cases}</p>
              {a.cases.map((k) => (
                <CaseCard key={k.title} badge={k.badge} badgeColor={k.color} title={k.title} meta={k.meta}>
                  {L(k.body)}
                </CaseCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
 * Page
 * ======================================================================== */
export default function MLAlgorithms() {
  const { lang } = useLang();
  const cc = COPY[lang] || COPY.en;
  const [open, setOpen] = useState(() => new Set(["rf", "xgb"]));

  const toggle = (id) => setOpen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOpen = open.size === ALGO.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(ALGO.map((a) => a.id)));

  const nav = [
    { id: "chooser", label: lang === "zh" ? "如何选算法" : "Which algorithm" },
    { id: "dist", label: lang === "zh" ? "频次分布" : "Frequency" },
    ...ALGO.map((a) => ({ id: a.id, label: lang === "zh" ? a.name.zh : a.name.en })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-20">
      <PageHero kicker={cc.kicker} title={cc.title} sub={cc.sub} badges={cc.badges} />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-10">
        <SideNav items={nav} label={cc.toc} />

        <div className="min-w-0">
          {/* Decision tree chooser */}
          <section className="mb-14" id="chooser">
            <SectionHead kicker={cc.chooserKicker} title={cc.chooserTitle} sub={cc.chooserSub} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 md:p-6 mt-6">
              <SvgChooser l={cc.chooser} />
            </div>
          </section>

          {/* Frequency distribution */}
          <section className="mb-14 scroll-mt-24" id="dist">
            <SectionHead kicker={cc.kicker} title={cc.distTitle} sub={cc.distSub} />
            <div className="bg-white border border-stone-400/20 rounded-lg p-5 mt-6" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DIST} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D3D1C7" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#5F5E5A" }} stroke="#B4B2A9" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#2C2C2A" }} stroke="#B4B2A9" />
                  <Tooltip cursor={{ fill: "rgba(42,122,176,0.06)" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #D3D1C7" }} />
                  <Bar dataKey="n" radius={[0, 4, 4, 0]}>
                    {DIST.map((d, i) => (
                      <Cell key={d.name} fill={["XGBoost", "Random Forest", "Gaussian Process"].includes(d.name) ? "#BA7517" : "#2a7ab0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Algorithm cards */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-ink-900">{lang === "zh" ? "方法详解" : "Method deep-dives"}</h2>
            <button onClick={toggleAll}
              className="px-3 py-1.5 text-[12px] font-medium text-ink-900 border border-stone-400/40 rounded-md hover:bg-stone-300/40 transition-colors">
              {allOpen ? cc.collapseAll : cc.expandAll}
            </button>
          </div>
          <div className="space-y-4">
            {ALGO.map((a) => (
              <AlgoCard key={a.id} a={a} cc={cc} lang={lang} open={open.has(a.id)} onToggle={() => toggle(a.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
