/**
 * ComplexForm-AI Hub - 国际化（i18n）基础设施
 * ==============================================
 * 轻量级中英双语方案：LanguageContext + 字典 + useT() hook。
 * 默认英文（en），用户可切换为简体中文（zh），选择持久化到 localStorage。
 *
 * 设计原则：
 *  - 仅 UI 文案（导航、标题、按钮、筛选标签、图表标注、提示语）参与翻译。
 *  - 论文标题、摘要、算法名、制剂名等内容保持英文原文（学术内容不翻译）。
 *  - 领域名等专有名词提供双语对照。
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "cfah_lang";

// ---------------------------------------------------------------------------
// 领域名双语对照（数据层 key -> 双语 label）
// ---------------------------------------------------------------------------
export const DOMAIN_NAMES = {
  in_situ_gel: { en: "In Situ Gel", zh: "原位凝胶" },
  liposome: { en: "Liposome", zh: "脂质体" },
  microsphere: { en: "Microsphere", zh: "微球" },
  nanocrystal: { en: "Nanocrystal", zh: "纳米晶" },
  plga_design: { en: "PLGA Design", zh: "PLGA 设计" },
};

// ---------------------------------------------------------------------------
// UI 文案字典
// ---------------------------------------------------------------------------
const STRINGS = {
  en: {
    // Navigation
    nav_overview: "Overview",
    nav_library: "Paper library",
    nav_taxonomy: "Taxonomy",
    nav_graph: "Knowledge graph",
    nav_case: "Case study",

    // Header / footer
    papers_unit: "papers",
    domains_unit: "domains",
    updated: "Updated",
    tagline: "Open-source platform for ML/AI in complex pharmaceutical formulation R&D",
    footer_desc: "Open-source platform for ML/AI in complex pharmaceutical formulation R&D",

    // Overview hero
    hero_kicker: "ML/AI for Complex Formulation R&D",
    hero_title: "Tracking how machine learning reshapes pharmaceutical formulation science",
    hero_subtitle:
      "An open platform curating AI/ML advances across five complex formulation domains: in situ gels, liposomes, microspheres, nanocrystals, and PLGA design.",

    // Overview metrics
    metric_total: "Total papers",
    metric_total_sub: "curated & sniffed",
    metric_ml: "ML/AI papers",
    metric_ml_sub: "% of total",
    metric_local: "Curated papers",
    metric_local_sub: "expert-reviewed seed set",
    metric_domains: "Domains",
    metric_domains_sub: "complex formulation areas",

    // Overview charts
    chart_by_domain: "Papers by domain",
    chart_by_domain_sub: "Total vs ML/AI-classified papers per formulation area",
    chart_trend: "Publication trend",
    chart_trend_sub: "Papers per year in the curated collection",
    chart_top_models: "Top AI/ML methods used",
    chart_top_models_sub: "Frequency of each algorithm across all curated papers",
    legend_total: "Total",
    legend_ml: "ML/AI",
    legend_papers: "Papers",

    // Recent
    recent_title: "Recent additions",
    recent_sub: "Latest papers added to the collection",
    view_all: "View all papers",

    // Paper library
    library_title: "Paper library",
    library_of: "of",
    search_placeholder: "Search by title, abstract, model, or formulation type...",
    search_aria: "Search papers",
    filter_domain: "Domain",
    filter_source: "Source",
    filter_type: "Type",
    opt_all_domains: "All domains",
    opt_all_sources: "All sources",
    opt_curated: "Curated collection",
    opt_sniffed: "Latest discoveries",
    opt_all_papers: "All papers",
    opt_ml_only: "ML/AI only",
    opt_non_ml: "Non-ML",
    badge_curated: "Curated",
    expand_collapse: "Collapse",
    expand_expand: "Expand",
    abstract: "Abstract",
    prediction_target: "Prediction target",
    key_findings: "Key findings",
    authors: "Authors",
    view_paper: "View paper",
    open_access: "Open access",
    cited_by: "Cited by",
    prev: "Previous",
    next: "Next",
    no_papers_title: "No papers match your filters",
    no_papers_sub: "Try adjusting the domain, source, or search query.",

    // Taxonomy
    taxonomy_title: "Taxonomy",
    taxonomy_sub:
      "Distribution of AI/ML methods, formulation types, and input features across five complex formulation domains.",
    domain_dist: "Domain distribution",
    domain_dist_sub: "Papers per formulation area, with ML/AI classification breakdown",
    view_models: "AI/ML methods",
    view_formulations: "Formulation types",
    view_features: "Input features",
    freq_models: "AI/ML methods frequency",
    freq_formulations: "Formulation types frequency",
    freq_features: "Input features frequency",
    freq_models_sub: "How often each algorithm appears across all papers",
    freq_formulations_sub: "Formulation systems studied in the collection",
    freq_features_sub: "Common input variables and descriptors used in models",
    matrix_title: "Domain x AI model matrix",
    matrix_sub: "Cross-tabulation showing which methods are used in each formulation domain",
    matrix_domain_col: "Domain",
    no_taxonomy: "No taxonomy data available.",
    ml_suffix: "ML",

    // Knowledge graph
    graph_title: "Knowledge graph",
    graph_sub:
      "Interactive force-directed graph showing relationships between formulation domains and AI/ML methods. Node size reflects paper count. Hover any node to see connected papers.",
    graph_domain_node: "Formulation domain",
    graph_model_node: "AI/ML method",
    graph_related: "Related papers",
    graph_hover_hint: "Hover any node to explore connections",
    graph_nodes: "nodes",
    graph_edges: "edges",
    graph_ai_model_legend: "AI model",
    paper_singular: "paper",
    paper_plural: "papers",

    // Case study
    case_kicker: "Featured case study",
    case_title: "FormulationLAI: an end-to-end ML framework for long-acting injectables",
    case_sub:
      "A full reproduction of the J. Control. Release 389 (2026) 114418 framework — dataset, ML prediction, PBPK/PD modeling, closed-loop optimization and MD validation for in-situ forming gel depots.",
    case_badge: "In Situ Gel · Long-acting injectable",
    case_stat_papers: "source papers",
    case_stat_formulations: "formulations",
    case_stat_r2: "best model R²",
    case_stat_weeks: "weeks analgesia (Zilretta®)",
    case_domain_title: "Deep dive by stage",
    case_domain_sub:
      "The framework maps onto the five domains tracked by this hub. Open the full interactive walkthrough for stage-by-stage charts, SHAP analysis and a reuse playbook.",
    case_open: "Open interactive walkthrough",
    case_open_sub: "Standalone page · bilingual charts & playbook",
    case_loop: "Five-stage closed loop",
    case_stage1: "Dataset",
    case_stage1_d: "155 formulations extracted from 26 papers, 35 features",
    case_stage2: "ML prediction",
    case_stage2_d: "LightGBM R²=0.908 with nested GroupKFold CV + SHAP",
    case_stage3: "PBPK/PD",
    case_stage3_d: "IA three-compartment model translates release into efficacy",
    case_stage4: "Optimization",
    case_stage4_d: "Bayesian search + penalized f2 factor, F1 fail to F4 success",
    case_stage5: "MD validation",
    case_stage5_d: "Atomistic API-PLGA interaction confirms the mechanism",
    case_note:
      "Reproduction for academic use. Simplifications and inferred parameters are documented in the walkthrough.",

    // Loading / error
    err_title: "Data loading failed",
    err_hint: "Ensure data/papers.json, taxonomy.json, and meta.json exist in /public/data/.",
    retry: "Retry",

    // Language switcher
    lang_label: "Language",
  },

  zh: {
    nav_overview: "总览",
    nav_library: "文献库",
    nav_taxonomy: "分类体系",
    nav_graph: "知识图谱",
    nav_case: "案例研究",

    papers_unit: "篇文献",
    domains_unit: "个领域",
    updated: "更新于",
    tagline: "面向复杂药物制剂研发的机器学习 / 人工智能开源平台",
    footer_desc: "面向复杂药物制剂研发的机器学习 / 人工智能开源平台",

    hero_kicker: "机器学习 / 人工智能 × 复杂制剂研发",
    hero_title: "追踪机器学习如何重塑药物制剂科学",
    hero_subtitle:
      "一个开放平台，系统梳理五大复杂制剂领域的 AI/ML 研究进展：原位凝胶、脂质体、微球、纳米晶与 PLGA 设计。",

    metric_total: "文献总数",
    metric_total_sub: "精选集 + 每日嗅探",
    metric_ml: "ML/AI 文献",
    metric_ml_sub: "% 占比",
    metric_local: "精选文献",
    metric_local_sub: "专家审读种子集",
    metric_domains: "研究领域",
    metric_domains_sub: "复杂制剂方向",

    chart_by_domain: "各领域文献分布",
    chart_by_domain_sub: "每个制剂领域的文献总数与 ML/AI 分类对比",
    chart_trend: "发表趋势",
    chart_trend_sub: "收录文献的年度分布",
    chart_top_models: "常用 AI/ML 方法",
    chart_top_models_sub: "各算法在全部收录文献中的出现频次",
    legend_total: "总数",
    legend_ml: "ML/AI",
    legend_papers: "文献数",

    recent_title: "最新收录",
    recent_sub: "最近加入文献库的论文",
    view_all: "查看全部文献",

    library_title: "文献库",
    library_of: "/",
    search_placeholder: "按标题、摘要、算法或制剂类型搜索…",
    search_aria: "搜索文献",
    filter_domain: "领域",
    filter_source: "来源",
    filter_type: "类型",
    opt_all_domains: "全部领域",
    opt_all_sources: "全部来源",
    opt_curated: "精选集",
    opt_sniffed: "最新发现",
    opt_all_papers: "全部文献",
    opt_ml_only: "仅 ML/AI",
    opt_non_ml: "非 ML",
    badge_curated: "精选",
    expand_collapse: "收起",
    expand_expand: "展开",
    abstract: "摘要",
    prediction_target: "预测目标",
    key_findings: "主要发现",
    authors: "作者",
    view_paper: "查看原文",
    open_access: "开放获取",
    cited_by: "被引",
    prev: "上一页",
    next: "下一页",
    no_papers_title: "没有符合条件的文献",
    no_papers_sub: "请尝试调整领域、来源或搜索关键词。",

    taxonomy_title: "分类体系",
    taxonomy_sub: "五大复杂制剂领域中 AI/ML 方法、制剂类型与输入特征的分布情况。",
    domain_dist: "领域分布",
    domain_dist_sub: "各制剂领域的文献数量及 ML/AI 分类占比",
    view_models: "AI/ML 方法",
    view_formulations: "制剂类型",
    view_features: "输入特征",
    freq_models: "AI/ML 方法频次",
    freq_formulations: "制剂类型频次",
    freq_features: "输入特征频次",
    freq_models_sub: "每种算法在全部文献中的出现次数",
    freq_formulations_sub: "文献库中研究的制剂系统",
    freq_features_sub: "模型中常用的输入变量与描述符",
    matrix_title: "领域 × AI 模型矩阵",
    matrix_sub: "交叉表：展示各制剂领域中使用了哪些方法",
    matrix_domain_col: "领域",
    no_taxonomy: "暂无分类体系数据。",
    ml_suffix: "ML",

    graph_title: "知识图谱",
    graph_sub:
      "交互式力导向图，展示制剂领域与 AI/ML 方法之间的关联。节点大小反映文献数量，悬停任意节点查看相关论文。",
    graph_domain_node: "制剂领域",
    graph_model_node: "AI/ML 方法",
    graph_related: "相关文献",
    graph_hover_hint: "悬停任意节点以探索关联",
    graph_nodes: "个节点",
    graph_edges: "条边",
    graph_ai_model_legend: "AI 模型",
    paper_singular: "篇文献",
    paper_plural: "篇文献",

    // Case study
    case_kicker: "精选案例研究",
    case_title: "FormulationLAI：面向长效注射剂的端到端机器学习框架",
    case_sub:
      "完整复现 J. Control. Release 389 (2026) 114418 框架--数据集、ML 预测、PBPK/PD 建模、闭环优化与 MD 验证，面向原位成型凝胶（ISFG）等长效注射剂的加速处方开发。",
    case_badge: "原位凝胶 · 长效注射剂",
    case_stat_papers: "源文献",
    case_stat_formulations: "个处方",
    case_stat_r2: "最佳模型 R²",
    case_stat_weeks: "周镇痛（Zilretta®）",
    case_domain_title: "分阶段深入",
    case_domain_sub:
      "该框架与本站追踪的五大领域紧密对应。打开完整交互演示可查看各阶段图表、SHAP 分析与移植指南。",
    case_open: "打开交互演示",
    case_open_sub: "独立页面 · 双语图表与操作指南",
    case_loop: "五环节闭环",
    case_stage1: "数据集",
    case_stage1_d: "26 篇文献提取 155 个处方，35 个特征",
    case_stage2: "ML 预测",
    case_stage2_d: "LightGBM R²=0.908，嵌套 GroupKFold 交叉验证 + SHAP",
    case_stage3: "PBPK/PD",
    case_stage3_d: "IA 三室模型将体外释放翻译为体内药效",
    case_stage4: "闭环优化",
    case_stage4_d: "贝叶斯搜索 + 惩罚型 f₂ 因子，F1 失败到 F4 成功",
    case_stage5: "MD 验证",
    case_stage5_d: "原子尺度 API-PLGA 相互作用确认机制",
    case_note:
      "本复现仅供学术研究使用。简化与合理推断参数详见交互演示中的说明。",

    err_title: "数据加载失败",
    err_hint: "请确认 /public/data/ 下存在 papers.json、taxonomy.json 与 meta.json。",
    retry: "重试",

    lang_label: "语言",
  },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  domainName: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "zh" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    // Update <html lang> for accessibility & SEO
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l === "zh" ? "zh" : "en");
  }, []);

  const t = useCallback(
    (key) => {
      const dict = STRINGS[lang] || STRINGS.en;
      return dict[key] ?? STRINGS.en[key] ?? key;
    },
    [lang]
  );

  const domainName = useCallback(
    (key) => {
      const d = DOMAIN_NAMES[key];
      if (!d) return key;
      return lang === "zh" ? d.zh : d.en;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, domainName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

/**
 * Resolve a bilingual domain label from a paper record's domain/domain_label.
 * Falls back to the raw label if the key is unknown.
 */
export function useDomainLabel() {
  const { lang, domainName } = useLang();
  return useCallback(
    (paper) => {
      const key = paper?.domain;
      if (key && DOMAIN_NAMES[key]) return domainName(key);
      return paper?.domain_label || key || "";
    },
    [lang, domainName]
  );
}
