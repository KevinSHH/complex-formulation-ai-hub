/**
 * Shared UI building blocks for the ML Foundations section.
 * ----------------------------------------------------------
 * Visual system is aligned with the rest of the hub:
 *   Fraunces (display) / Plus Jakarta Sans (body) / JetBrains Mono (code)
 *   ink (deep blue) + amber (accent) + stone (neutrals) on a paper background.
 * All blocks are presentational only — bilingual copy is passed in by pages.
 */

/* ---------------------------------------------------------------------------
 * SectionHead — kick­er + display title + optional subtitle, anchor target.
 * ------------------------------------------------------------------------- */
export function SectionHead({ id, kicker, title, sub }) {
  return (
    <div id={id} className="reveal scroll-mt-24">
      {kicker && (
        <p className="font-mono text-[11px] text-amber-500 font-medium uppercase tracking-[0.2em] mb-4">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-2xl md:text-3xl text-ink-900 leading-tight max-w-3xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-[14px] text-stone-700 max-w-3xl leading-relaxed">{sub}</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * SubHead — smaller in-section heading.
 * ------------------------------------------------------------------------- */
export function SubHead({ title, sub }) {
  return (
    <div className="mt-2">
      <h3 className="font-display text-lg text-ink-900">{title}</h3>
      {sub && <p className="mt-1.5 text-[13px] text-stone-600 leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * CodeBlock — dark editor-style block with a title bar.
 * ------------------------------------------------------------------------- */
export function CodeBlock({ code, title = "python" }) {
  return (
    <div className="rounded-lg overflow-hidden border border-ink-900/15 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-ink-900">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="font-mono text-[10px] text-ink-300 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <pre className="bg-[#0d2137] text-ink-100 text-[12.5px] leading-relaxed p-4 overflow-x-auto">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Formula — amber-tinted block for math expressions (Unicode, no dependency).
 * ------------------------------------------------------------------------- */
export function Formula({ children, note }) {
  return (
    <div className="bg-amber-200/40 border border-amber-300/40 rounded-lg px-4 py-3.5 my-3">
      <p className="font-mono text-[13.5px] text-ink-900 text-center leading-relaxed">
        {children}
      </p>
      {note && (
        <p className="text-[11px] text-stone-600 text-center mt-1.5">{note}</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ConceptCard — numbered/icon card for a single concept.
 * ------------------------------------------------------------------------- */
export function ConceptCard({ num, icon, title, children, accent = "#0a2540" }) {
  return (
    <div className="bg-white border border-stone-400/20 rounded-lg p-5 h-full flex flex-col transition-all duration-200 hover:border-ink-400/40 hover:shadow-md">
      <div className="flex items-center gap-3 mb-3">
        {num ? (
          <span
            className="font-display text-2xl font-bold leading-none"
            style={{ color: accent }}
          >
            {num}
          </span>
        ) : (
          icon
        )}
        <h3 className="font-display text-[15px] text-ink-900 leading-snug">{title}</h3>
      </div>
      <div className="text-[13px] text-stone-700 leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * CaseCard — a REAL paper pulled from the hub collection, used as a worked
 * example. Shows an algorithm badge, paper title, venue/year/citations.
 * ------------------------------------------------------------------------- */
export function CaseCard({ badge, badgeColor = "#BA7517", title, meta, children }) {
  return (
    <div className="bg-ink-200/30 border border-ink-400/20 rounded-lg p-5 my-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full text-white"
          style={{ backgroundColor: badgeColor }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {badge}
        </span>
        <span className="text-[11px] font-mono text-stone-500">{meta}</span>
      </div>
      <p className="font-display text-[15px] text-ink-900 leading-snug mb-2 italic">
        “{title}”
      </p>
      <div className="text-[13px] text-stone-700 leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Callout — highlighted note. kind: "note" | "tip" | "warn" | "reg".
 * ------------------------------------------------------------------------- */
const CALLOUT_STYLES = {
  note: { border: "#2a7ab0", bg: "rgba(42,122,176,0.06)", label: "#0c3070" },
  tip: { border: "#1D9E75", bg: "rgba(29,158,117,0.06)", label: "#0f6b4e" },
  warn: { border: "#BA7517", bg: "rgba(186,117,23,0.08)", label: "#854F0B" },
  reg: { border: "#534AB7", bg: "rgba(83,74,183,0.06)", label: "#3f3a96" },
};

export function Callout({ kind = "note", label, children }) {
  const s = CALLOUT_STYLES[kind] || CALLOUT_STYLES.note;
  return (
    <div
      className="rounded-lg border-l-4 p-4 my-4"
      style={{ borderColor: s.border, backgroundColor: s.bg }}
    >
      {label && (
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: s.label }}>
          {label}
        </p>
      )}
      <div className="text-[13px] text-stone-800 leading-relaxed">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Tag — small pill used for formulation-type / algorithm tags.
 * ------------------------------------------------------------------------- */
export function Tag({ children, color = "#0a2540" }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border"
      style={{ color, borderColor: `${color}33`, backgroundColor: `${color}14` }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * SideNav — sticky in-page table of contents for long teaching pages.
 * ------------------------------------------------------------------------- */
export function SideNav({ items, label }) {
  return (
    <nav aria-label={label} className="hidden lg:block sticky top-24 self-start">
      <p className="font-mono text-[10px] text-stone-500 uppercase tracking-wider mb-3">
        {label}
      </p>
      <ul className="space-y-1 border-l border-stone-400/30">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="block -ml-px pl-4 py-1 text-[12.5px] text-stone-600 border-l-2 border-transparent hover:text-ink-900 hover:border-amber-500 transition-colors"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------------------------------------------------------------------
 * PageHero — shared hero for the three ML pages (aligned with CaseStudy).
 * ------------------------------------------------------------------------- */
export function PageHero({ kicker, title, sub, badges = [] }) {
  return (
    <section className="reveal mb-12">
      <p className="font-mono text-[11px] text-amber-500 font-medium uppercase tracking-[0.2em] mb-5">
        {kicker}
      </p>
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-ink-900 leading-[1.1] max-w-3xl">
        {title}
      </h1>
      <p className="mt-6 text-[15px] text-stone-700 max-w-2xl leading-relaxed">{sub}</p>
      {badges.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-ink-200/40 text-ink-800 border border-ink-400/15"
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
