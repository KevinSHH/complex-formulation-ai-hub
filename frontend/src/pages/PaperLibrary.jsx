import { useMemo, useState, useCallback } from "react";
import { useLang, useDomainLabel } from "../i18n/index.jsx";

const PAGE_SIZE = 12;

function Highlight({ text, query }) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-300/40 text-ink-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={label}>
      <span className="text-[11px] font-medium text-stone-700 uppercase tracking-wider mr-1">{label}</span>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          aria-pressed={value === opt.key}
          className={`chip text-xs px-2.5 py-1 rounded-full border transition-colors ${
            value === opt.key
              ? "bg-ink-900 text-white border-ink-900"
              : "bg-white text-stone-700 border-stone-400/40 hover:border-ink-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PaperLibrary({ papers, DomainBadges }) {
  const { t, domainName } = useLang();
  const domainLabel = useDomainLabel();

  const [domain, setDomain] = useState("all");
  const [source, setSource] = useState("all");
  const [mlFilter, setMlFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const DOMAIN_OPTIONS = useMemo(() => [
    { key: "all", label: t("opt_all_domains") },
    { key: "in_situ_gel", label: domainName("in_situ_gel") },
    { key: "liposome", label: domainName("liposome") },
    { key: "microsphere", label: domainName("microsphere") },
    { key: "nanocrystal", label: domainName("nanocrystal") },
    { key: "plga_design", label: domainName("plga_design") },
  ], [t, domainName]);

  const SOURCE_OPTIONS = useMemo(() => [
    { key: "all", label: t("opt_all_sources") },
    { key: "curated", label: t("opt_curated") },
    { key: "sniffed", label: t("opt_sniffed") },
  ], [t]);

  const ML_OPTIONS = useMemo(() => [
    { key: "all", label: t("opt_all_papers") },
    { key: "ml", label: t("opt_ml_only") },
    { key: "non-ml", label: t("opt_non_ml") },
  ], [t]);

  const filtered = useMemo(() => {
    let result = papers;

    if (domain !== "all") {
      result = result.filter((p) => p.domain === domain);
    }
    if (source === "curated") {
      result = result.filter((p) => p.is_local);
    } else if (source === "sniffed") {
      result = result.filter((p) => !p.is_local);
    }
    if (mlFilter === "ml") {
      result = result.filter((p) => p.is_ml);
    } else if (mlFilter === "non-ml") {
      result = result.filter((p) => !p.is_ml);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.abstract?.toLowerCase().includes(q) ||
          p.ml_summary?.ai_model?.toLowerCase().includes(q) ||
          p.ml_summary?.formulation_type?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [papers, domain, source, mlFilter, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetPage = useCallback(() => setPage(0), []);

  const handleKeyDown = useCallback((e, paperId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded((prev) => (prev === paperId ? null : paperId));
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-20">
      <div className="reveal mb-8">
        <h1 className="font-display text-3xl text-ink-900 mb-2">{t("library_title")}</h1>
        <p className="text-sm text-stone-600">
          <span className="font-mono font-medium">{filtered.length}</span> {t("library_of")}{" "}
          <span className="font-mono">{papers.length}</span> {t("papers_unit")}
        </p>
      </div>

      {/* Filters */}
      <div className="reveal mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-xl">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-400/40 rounded-lg bg-white focus:outline-none focus:border-ink-600 focus:ring-2 focus:ring-ink-600/15 transition-shadow"
            aria-label={t("search_aria")}
          />
        </div>

        {/* Filter groups */}
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <FilterGroup label={t("filter_domain")} options={DOMAIN_OPTIONS} value={domain} onChange={(v) => { setDomain(v); resetPage(); }} />
          <FilterGroup label={t("filter_source")} options={SOURCE_OPTIONS} value={source} onChange={(v) => { setSource(v); resetPage(); }} />
          <FilterGroup label={t("filter_type")} options={ML_OPTIONS} value={mlFilter} onChange={(v) => { setMlFilter(v); resetPage(); }} />
        </div>
      </div>

      {/* Paper list */}
      <div className="space-y-3" role="list" aria-label="Papers">
        {pageData.map((p) => {
          const isExpanded = expanded === p.id;
          return (
            <article
              key={p.id}
              role="listitem"
              className="card-hover bg-white border border-stone-400/20 rounded-lg overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer select-none"
                onClick={() => setExpanded(isExpanded ? null : p.id)}
                onKeyDown={(e) => handleKeyDown(e, p.id)}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? t("expand_collapse") : t("expand_expand")}: ${p.title}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ink-200/40 text-ink-800">
                        {domainLabel(p)}
                      </span>
                      {p.is_ml && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-200/40 text-amber-600">
                          ML/AI
                        </span>
                      )}
                      {p.is_local && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-300/40 text-stone-700">
                          {t("badge_curated")}
                        </span>
                      )}
                      {p.source === "openalex" && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-300/40 text-stone-700">
                          OpenAlex
                        </span>
                      )}
                      {p.source === "pubmed" && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-300/40 text-stone-700">
                          PubMed
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-[13px] text-ink-900 leading-snug">
                      <Highlight text={p.title} query={search} />
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono text-stone-600 whitespace-nowrap">
                      {p.publication_year || "N/A"}
                    </span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-stone-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* ML summary badges */}
                {(p.ml_summary?.ai_model || p.ml_summary?.formulation_type) && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.ml_summary?.formulation_type && (
                      <span className="text-[11px] text-ink-600 bg-ink-200/30 px-2 py-0.5 rounded">
                        {p.ml_summary.formulation_type}
                      </span>
                    )}
                    {p.ml_summary?.ai_model && (
                      <span className="text-[11px] text-amber-600 bg-amber-200/30 px-2 py-0.5 rounded">
                        {p.ml_summary.ai_model}
                      </span>
                    )}
                    {p.ml_summary?.input_features?.slice(0, 3).map((f) => (
                      <span key={f} className="text-[11px] text-stone-600 bg-stone-300/20 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-400/20 space-y-3 animate-in">
                    {p.abstract && (
                      <div>
                        <p className="text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1.5">{t("abstract")}</p>
                        <p className="text-xs text-stone-700 leading-relaxed">{p.abstract}</p>
                      </div>
                    )}
                    {p.ml_summary?.prediction_target && (
                      <div>
                        <p className="text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1.5">{t("prediction_target")}</p>
                        <p className="text-xs text-stone-700">{p.ml_summary.prediction_target}</p>
                      </div>
                    )}
                    {p.ml_summary?.key_findings && (
                      <div>
                        <p className="text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1.5">{t("key_findings")}</p>
                        <p className="text-xs text-stone-700 leading-relaxed">{p.ml_summary.key_findings}</p>
                      </div>
                    )}
                    {p.authors?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-stone-700 uppercase tracking-wider mb-1.5">{t("authors")}</p>
                        <p className="text-xs text-stone-700">{p.authors.join(", ")}</p>
                      </div>
                    )}
                    {p.journal && (
                      <p className="text-xs text-stone-600 italic">{p.journal}</p>
                    )}
                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                      {p.doi && (
                        <a
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-ink-600 link-underline font-medium"
                        >
                          DOI: {p.doi}
                        </a>
                      )}
                      {p.url && !p.doi && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-ink-600 link-underline font-medium"
                        >
                          {t("view_paper")}
                        </a>
                      )}
                      {p.oa_url && (
                        <a
                          href={p.oa_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-500 link-underline font-medium"
                        >
                          {t("open_access")}
                        </a>
                      )}
                      {p.cited_by_count != null && p.cited_by_count > 0 && (
                        <span className="text-xs text-stone-600 font-mono">
                          {t("cited_by")} {p.cited_by_count}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm border border-stone-400/40 rounded-md disabled:opacity-40 hover:border-ink-400 transition-colors"
            aria-label={t("prev")}
          >
            {t("prev")}
          </button>
          <span className="text-sm text-stone-600 font-mono px-3" aria-current="page">
            {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount - 1, page + 1))}
            disabled={page >= pageCount - 1}
            className="px-3 py-1.5 text-sm border border-stone-400/40 rounded-md disabled:opacity-40 hover:border-ink-400 transition-colors"
            aria-label={t("next")}
          >
            {t("next")}
          </button>
        </nav>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-stone-300/40 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888780" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="font-display text-lg text-stone-700">{t("no_papers_title")}</p>
          <p className="text-sm text-stone-500 mt-2">{t("no_papers_sub")}</p>
        </div>
      )}
    </div>
  );
}
