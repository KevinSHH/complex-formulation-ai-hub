import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useLang } from "../i18n/index.jsx";

const PIE_COLORS = ["#0a2540", "#BA7517", "#1D9E75", "#D4537E", "#534AB7", "#854F0B", "#0F6E56", "#993556"];

function Section({ title, subtitle, children }) {
  return (
    <div className="reveal mb-14">
      <h2 className="font-display text-xl text-ink-900 mb-1">{title}</h2>
      {subtitle && <p className="text-xs text-stone-600 mb-5">{subtitle}</p>}
      {children}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-400/30 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-medium text-ink-900 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="text-stone-700">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color || p.payload?.fill || p.fill }} />
          {p.name}: <span className="font-mono font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function BarList({ data, color = "#0a2540" }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3 group">
          <span
            className="text-xs text-stone-700 w-44 flex-shrink-0 group-hover:text-ink-900 transition-colors leading-tight"
            title={item.name}
          >
            {item.name}
          </span>
          <div className="flex-1 bg-stone-300/30 rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(item.count / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-xs font-mono text-stone-600 w-8 text-right group-hover:text-ink-900 transition-colors">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Taxonomy({ taxonomy, DomainBadges }) {
  const { t, domainName } = useLang();
  const [view, setView] = useState("models");

  const modelData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.ai_models)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [taxonomy]);

  const formulationData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.formulation_types)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [taxonomy]);

  const featureData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.input_features)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [taxonomy]);

  // Domain-model matrix for the heatmap-like display
  const matrixData = useMemo(() => {
    if (!taxonomy) return [];
    const models = Object.keys(taxonomy.ai_models).slice(0, 8);
    return Object.entries(taxonomy.domain_model_matrix).map(([domain, modelCounts]) => ({
      domain,
      label: domainName(domain),
      models: models.map((m) => ({ name: m, count: modelCounts[m] || 0 })),
    }));
  }, [taxonomy, domainName]);

  const pieData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.meta.domains).map(([key, d]) => ({
      name: domainName(key),
      value: d.total,
      ml: d.ml,
    }));
  }, [taxonomy, domainName]);

  if (!taxonomy) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12">
        <p className="text-stone-600">{t("no_taxonomy")}</p>
      </div>
    );
  }

  const freqTitle =
    view === "models" ? t("freq_models") : view === "formulations" ? t("freq_formulations") : t("freq_features");
  const freqSub =
    view === "models" ? t("freq_models_sub") : view === "formulations" ? t("freq_formulations_sub") : t("freq_features_sub");

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-20">
      <div className="reveal mb-10">
        <h1 className="font-display text-3xl text-ink-900 mb-2">{t("taxonomy_title")}</h1>
        <p className="text-sm text-stone-600">{t("taxonomy_sub")}</p>
        <div className="mt-4">
          <DomainBadges />
        </div>
      </div>

      {/* Domain pie chart */}
      <Section title={t("domain_dist")} subtitle={t("domain_dist_sub")}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={48}
                label={({ name, value }) => `${name} (${value})`}
                labelLine={false}
                style={{ fontSize: 11 }}
                strokeWidth={2}
                stroke="#fafaf9"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2.5">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between p-3.5 bg-white border border-stone-400/20 rounded-lg card-hover">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm text-ink-900 font-medium">{d.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-medium text-ink-900">{d.value}</span>
                  <span className="text-xs text-stone-600 ml-2">({d.ml} {t("ml_suffix")})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* View toggle */}
      <div className="reveal flex items-center gap-2 mb-8" role="tablist" aria-label="Data view">
        {[
          { key: "models", label: t("view_models") },
          { key: "formulations", label: t("view_formulations") },
          { key: "features", label: t("view_features") },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setView(opt.key)}
            role="tab"
            aria-selected={view === opt.key}
            className={`chip text-xs px-3 py-1.5 rounded-full border transition-colors ${
              view === opt.key
                ? "bg-ink-900 text-white border-ink-900"
                : "bg-white text-stone-700 border-stone-400/40 hover:border-ink-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bar list based on view */}
      <Section title={freqTitle} subtitle={freqSub}>
        {view === "models" && <BarList data={modelData} color="#0a2540" />}
        {view === "formulations" && <BarList data={formulationData} color="#BA7517" />}
        {view === "features" && <BarList data={featureData} color="#1D9E75" />}
      </Section>

      {/* Domain x Model matrix — header fully visible, no truncation */}
      <Section title={t("matrix_title")} subtitle={t("matrix_sub")}>
        <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 pb-2">
          <table className="text-xs border-separate" style={{ borderSpacing: 0 }} role="grid" aria-label={t("matrix_title")}>
            <thead>
              <tr className="border-b border-stone-400/40">
                {/* Domain column header — fixed min width, never truncated */}
                <th className="text-left py-2.5 px-3 font-medium text-stone-700 align-bottom sticky left-0 bg-paper min-w-[110px]">
                  {t("matrix_domain_col")}
                </th>
                {matrixData[0]?.models.map((m) => (
                  <th
                    key={m.name}
                    className="py-2.5 px-2 font-medium text-stone-700 text-center align-bottom"
                    title={m.name}
                  >
                    {/* Vertical label: rotated, full text, generous height so nothing clips */}
                    <div className="flex items-end justify-center h-[92px]">
                      <span
                        className="inline-block whitespace-nowrap text-[10px] leading-none"
                        style={{
                          transform: "rotate(-38deg)",
                          transformOrigin: "bottom center",
                          marginBottom: "4px",
                        }}
                      >
                        {m.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map((row) => (
                <tr key={row.domain} className="border-b border-stone-400/15 hover:bg-stone-300/10 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-ink-900 whitespace-nowrap sticky left-0 bg-paper">
                    {row.label}
                  </td>
                  {row.models.map((m) => (
                    <td key={m.name} className="py-2.5 px-2 text-center">
                      {m.count > 0 ? (
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-mono font-medium transition-transform hover:scale-110"
                          title={`${row.label} × ${m.name}: ${m.count}`}
                          style={{
                            backgroundColor: m.count >= 3 ? "rgba(10,37,64,0.85)" : "rgba(10,37,64,0.12)",
                            color: m.count >= 3 ? "#fff" : "#0a2540",
                          }}
                        >
                          {m.count}
                        </span>
                      ) : (
                        <span className="text-stone-400">&mdash;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
