import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";
import { useLang, useDomainLabel } from "../i18n/index.jsx";

const DOMAIN_COLORS = {
  in_situ_gel: "#2a7ab0",
  liposome: "#BA7517",
  microsphere: "#1D9E75",
  nanocrystal: "#D4537E",
  plga_design: "#534AB7",
};

function MetricCard({ label, value, sub, accent = "#0a2540" }) {
  return (
    <div className="metric-card bg-white border border-stone-400/20 rounded-lg p-5">
      <p className="text-[11px] font-medium text-stone-700 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-display mt-2" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-xs text-stone-600 mt-1.5">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-400/30 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-medium text-ink-900 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} className="text-stone-700">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color || p.fill }} />
          {p.name}: <span className="font-mono font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function Overview({ papers, taxonomy, meta, DomainBadges }) {
  const { t, domainName } = useLang();
  const domainLabel = useDomainLabel();

  // Domain distribution
  const domainData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.meta.domains).map(([key, d]) => ({
      name: domainName(key),
      total: d.total,
      ml: d.ml,
      key,
      color: DOMAIN_COLORS[key] || "#888",
    }));
  }, [taxonomy, domainName]);

  // Year trend
  const yearData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.year_trend)
      .filter(([y]) => parseInt(y) >= 2020)
      .map(([year, count]) => ({ year, count }));
  }, [taxonomy]);

  // Top AI models
  const modelData = useMemo(() => {
    if (!taxonomy) return [];
    return Object.entries(taxonomy.ai_models)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [taxonomy]);

  // Recent papers (latest 6)
  const recentPapers = useMemo(() => {
    return [...papers]
      .sort((a, b) => {
        const da = a.sniffed_date || a.parsed_date || "";
        const db = b.sniffed_date || b.parsed_date || "";
        return db.localeCompare(da);
      })
      .slice(0, 6);
  }, [papers]);

  const mlPct = Math.round((meta?.ml_papers || 0) / (meta?.total_papers || 1) * 100);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pt-20 pb-14">
        <div className="reveal">
          <p className="font-mono text-[11px] text-amber-500 font-medium uppercase tracking-[0.2em] mb-5">
            {t("hero_kicker")}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink-900 leading-[1.08] max-w-4xl">
            {t("hero_title")}
          </h1>
          <p className="mt-6 text-[15px] text-stone-700 max-w-2xl leading-relaxed">
            {t("hero_subtitle")}
          </p>
          <div className="mt-8">
            <DomainBadges />
          </div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 reveal">
          <MetricCard label={t("metric_total")} value={meta?.total_papers || papers.length} sub={t("metric_total_sub")} accent="#0a2540" />
          <MetricCard label={t("metric_ml")} value={meta?.ml_papers || 0} sub={`${mlPct}${t("metric_ml_sub")}`} accent="#BA7517" />
          <MetricCard label={t("metric_local")} value={meta?.local_papers || 0} sub={t("metric_local_sub")} accent="#1D9E75" />
          <MetricCard label={t("metric_domains")} value="5" sub={t("metric_domains_sub")} accent="#534AB7" />
        </div>
      </section>

      {/* ── Charts ── */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 reveal">
          {/* Domain distribution */}
          <div>
            <h2 className="font-display text-lg text-ink-900 mb-1">{t("chart_by_domain")}</h2>
            <p className="text-xs text-stone-600 mb-5">{t("chart_by_domain_sub")}</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={domainData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#888780" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#444441" }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,37,64,0.03)" }} />
                <Bar dataKey="total" name={t("legend_total")} fill="#0a2540" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="ml" name={t("legend_ml")} fill="#BA7517" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 text-xs text-stone-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-ink-900 inline-block" />{t("legend_total")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />{t("legend_ml")}
              </span>
            </div>
          </div>

          {/* Year trend */}
          <div>
            <h2 className="font-display text-lg text-ink-900 mb-1">{t("chart_trend")}</h2>
            <p className="text-xs text-stone-600 mb-5">{t("chart_trend_sub")}</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={yearData} margin={{ left: -8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#888780" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#888780" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name={t("legend_papers")}
                  stroke="#0a2540"
                  strokeWidth={2}
                  dot={{ fill: "#BA7517", r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: "#BA7517", r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI models bar chart */}
        <div className="mt-10 reveal">
          <h2 className="font-display text-lg text-ink-900 mb-1">{t("chart_top_models")}</h2>
          <p className="text-xs text-stone-600 mb-5">{t("chart_top_models_sub")}</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelData} margin={{ left: 8, right: 8, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#444441" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#888780" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,37,64,0.03)" }} />
              <Bar dataKey="count" name={t("legend_papers")} fill="#0a2540" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Recent papers ── */}
      <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-20">
        <div className="flex items-baseline justify-between mb-6 reveal">
          <div>
            <h2 className="font-display text-xl text-ink-900">{t("recent_title")}</h2>
            <p className="text-xs text-stone-600 mt-1">{t("recent_sub")}</p>
          </div>
          <Link to="/library" className="text-sm text-amber-500 font-medium link-underline">
            {t("view_all")} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal">
          {recentPapers.map((p) => (
            <article
              key={p.id}
              className="card-hover bg-white border border-stone-400/20 rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ink-200/40 text-ink-800">
                  {domainLabel(p)}
                </span>
                <span className="text-xs font-mono text-stone-600 flex-shrink-0">
                  {p.publication_year || "N/A"}
                </span>
              </div>
              <h3 className="font-display text-[13px] text-ink-900 leading-snug mb-2">
                {p.title}
              </h3>
              {p.ml_summary?.ai_model && (
                <p className="text-xs text-amber-600 font-medium mt-2">
                  {p.ml_summary.ai_model}
                </p>
              )}
              {p.ml_summary?.key_findings && (
                <p className="text-xs text-stone-700 mt-2 line-clamp-2 leading-relaxed">
                  {p.ml_summary.key_findings}
                </p>
              )}
              {p.doi && (
                <a
                  href={`https://doi.org/${p.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ink-600 link-underline mt-3 inline-block"
                >
                  DOI: {p.doi}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
