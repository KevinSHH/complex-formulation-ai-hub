import { useMemo } from "react";
import { useLang, DOMAIN_NAMES } from "../i18n/index.jsx";

const DOMAIN_COLORS = {
  in_situ_gel: "#2a7ab0",
  liposome: "#BA7517",
  microsphere: "#1D9E75",
  nanocrystal: "#D4537E",
  plga_design: "#534AB7",
};

function CaseStat({ value, unit, label, color }) {
  return (
    <div className="bg-white border border-stone-400/20 rounded-lg p-5 text-center">
      <p className="font-display text-3xl" style={{ color: color || "#0a2540" }}>
        {value}
        {unit && <span className="text-base font-mono text-stone-500 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-stone-600 mt-1.5">{label}</p>
    </div>
  );
}

function LoopStep({ num, title, desc, color }) {
  return (
    <div className="bg-white border border-stone-400/20 rounded-lg p-5">
      <p className="font-display text-2xl font-bold" style={{ color: color || "#0a2540" }}>{num}</p>
      <h3 className="font-display text-sm text-ink-900 mt-2 mb-1.5">{title}</h3>
      <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function CaseStudy() {
  const { t } = useLang();

  const stats = useMemo(() => [
    { value: "26", label: t("case_stat_papers"), color: "#2a7ab0" },
    { value: "155", label: t("case_stat_formulations"), color: "#BA7517" },
    { value: "0.908", label: t("case_stat_r2"), color: "#1D9E75" },
    { value: "14.69", unit: "wk", label: t("case_stat_weeks"), color: "#534AB7" },
  ], [t]);

  const stages = useMemo(() => [
    { num: "01", title: t("case_stage1"), desc: t("case_stage1_d"), color: "#2a7ab0" },
    { num: "02", title: t("case_stage2"), desc: t("case_stage2_d"), color: "#BA7517" },
    { num: "03", title: t("case_stage3"), desc: t("case_stage3_d"), color: "#1D9E75" },
    { num: "04", title: t("case_stage4"), desc: t("case_stage4_d"), color: "#D4537E" },
    { num: "05", title: t("case_stage5"), desc: t("case_stage5_d"), color: "#534AB7" },
  ], [t]);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-20">
      {/* Hero */}
      <section className="reveal mb-12">
        <p className="font-mono text-[11px] text-amber-500 font-medium uppercase tracking-[0.2em] mb-5">
          {t("case_kicker")}
        </p>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-900 leading-[1.1] max-w-3xl">
          {t("case_title")}
        </h1>
        <p className="mt-6 text-[15px] text-stone-700 max-w-2xl leading-relaxed">
          {t("case_sub")}
        </p>
        <div className="mt-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-ink-200/40 text-ink-800 border border-ink-400/15">
            {t("case_badge")}
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="reveal mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <CaseStat key={s.label} value={s.value} unit={s.unit} label={s.label} color={s.color} />
          ))}
        </div>
      </section>

      {/* Closed loop */}
      <section className="reveal mb-14">
        <h2 className="font-display text-xl text-ink-900 mb-1">{t("case_loop")}</h2>
        <p className="text-xs text-stone-600 mb-6">{t("case_domain_sub")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map((s) => (
            <LoopStep key={s.num} num={s.num} title={s.title} desc={s.desc} color={s.color} />
          ))}
        </div>
      </section>

      {/* Link to interactive walkthrough */}
      <section className="reveal">
        <div className="bg-white border border-stone-400/20 rounded-lg p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="font-display text-xl text-ink-900 mb-2">{t("case_open")}</h2>
              <p className="text-sm text-stone-600">{t("case_open_sub")}</p>
            </div>
            <a
              href="case-study/formulationlai.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-ink-900 rounded-lg hover:bg-ink-800 transition-colors whitespace-nowrap"
            >
              {t("case_open")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
        <p className="text-xs text-stone-500 mt-4 leading-relaxed max-w-3xl">
          {t("case_note")}
        </p>
      </section>
    </div>
  );
}
