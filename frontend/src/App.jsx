import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { usePlatformData, useScrollReveal } from "./hooks/useData.js";
import { LanguageProvider, useLang, DOMAIN_NAMES } from "./i18n/index.jsx";
import LangSwitch from "./components/LangSwitch.jsx";
import Overview from "./pages/Overview.jsx";
import PaperLibrary from "./pages/PaperLibrary.jsx";
import Taxonomy from "./pages/Taxonomy.jsx";
import KnowledgeGraph from "./pages/KnowledgeGraph.jsx";
import CaseStudy from "./pages/CaseStudy.jsx";

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" className="flex-shrink-0" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="#0a2540" strokeWidth="1.8" />
      <circle cx="10" cy="12" r="2.5" fill="#BA7517" />
      <circle cx="22" cy="12" r="2.5" fill="#2a7ab0" />
      <circle cx="16" cy="22" r="2.5" fill="#1D9E75" />
      <line x1="13" y1="13" x2="19" y2="13" stroke="#0a2540" strokeWidth="1.2" />
      <line x1="12" y1="14.5" x2="14" y2="20" stroke="#0a2540" strokeWidth="1.2" />
      <line x1="20" y1="14.5" x2="18" y2="20" stroke="#0a2540" strokeWidth="1.2" />
    </svg>
  );
}

function Header({ meta }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLang();

  const NAV_ITEMS = [
    { path: "/", label: t("nav_overview") },
    { path: "/library", label: t("nav_library") },
    { path: "/taxonomy", label: t("nav_taxonomy") },
    { path: "/graph", label: t("nav_graph") },
    { path: "/case-study", label: t("nav_case") },
  ];

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <header className="border-b border-stone-400/25 bg-white/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <Logo />
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg text-ink-900 font-medium tracking-tight group-hover:text-ink-700 transition-colors">
              ComplexForm
            </span>
            <span className="font-mono text-[10px] text-amber-500 font-medium uppercase tracking-wider">
              AI Hub
            </span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-ink-900 bg-ink-200/50"
                    : "text-stone-700 hover:text-ink-900 hover:bg-stone-300/40"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4 text-xs text-stone-600">
          {meta && (
            <span className="font-mono text-[11px]">
              {meta.total_papers} {t("papers_unit")}
            </span>
          )}
          <LangSwitch />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-stone-700 hover:text-ink-900 transition-colors"
          >
            GitHub
          </a>
        </div>

        {/* Mobile: lang switch + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <LangSwitch />
          <button
            className="p-2 -mr-2 rounded-md hover:bg-stone-300/40 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-900">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-stone-400/20 bg-white px-5 py-3 space-y-1" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-ink-900 bg-ink-200/50"
                    : "text-stone-700 hover:text-ink-900 hover:bg-stone-300/40"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {meta && (
            <p className="px-3 py-1 text-[11px] font-mono text-stone-500">
              {meta.total_papers} {t("papers_unit")}
            </p>
          )}
        </nav>
      )}
    </header>
  );
}

function DomainBadges() {
  const { domainName } = useLang();
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Formulation domains">
      {Object.keys(DOMAIN_NAMES).map((key) => (
        <span
          key={key}
          role="listitem"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-ink-200/40 text-ink-800 border border-ink-400/15"
        >
          {domainName(key)}
        </span>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-400/20 rounded-lg p-5 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-4 w-10" />
      </div>
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-20 pb-16">
      <div className="space-y-4 mb-16">
        <div className="skeleton h-3 w-48 rounded-full" />
        <div className="skeleton h-10 w-full max-w-lg rounded" />
        <div className="skeleton h-10 w-2/3 max-w-md rounded" />
        <div className="skeleton h-4 w-full max-w-md rounded" />
        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-stone-300/30 rounded-lg p-5 space-y-2">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-200/40 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="font-display text-lg text-ink-900 mb-2">{t("err_title")}</p>
        <p className="text-sm text-stone-600 font-mono mb-4">{message}</p>
        <p className="text-xs text-stone-500">{t("err_hint")}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 text-sm font-medium text-white bg-ink-900 rounded-lg hover:bg-ink-800 transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const { papers, taxonomy, meta, loading, error } = usePlatformData();
  const { t } = useLang();
  useScrollReveal();

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen">
      <Header meta={meta} />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Overview
                papers={papers}
                taxonomy={taxonomy}
                meta={meta}
                DomainBadges={DomainBadges}
              />
            }
          />
          <Route
            path="/library"
            element={<PaperLibrary papers={papers} DomainBadges={DomainBadges} />}
          />
          <Route
            path="/taxonomy"
            element={<Taxonomy taxonomy={taxonomy} DomainBadges={DomainBadges} />}
          />
          <Route
            path="/graph"
            element={<KnowledgeGraph papers={papers} taxonomy={taxonomy} />}
          />
          <Route
            path="/case-study"
            element={<CaseStudy />}
          />
        </Routes>
      </main>

      <footer className="border-t border-stone-400/25 mt-16 py-8 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo />
            <div>
              <p className="font-display text-sm text-ink-900 font-medium">
                ComplexForm-AI Hub
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {t("footer_desc")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-600">
            {meta && (
              <span className="font-mono">
                {t("updated")} {new Date(meta.last_updated).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            <span>5 {t("domains_unit")}</span>
            <span>{papers.length} {t("papers_unit")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  );
}
