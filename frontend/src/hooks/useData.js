import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fetch platform data (papers, taxonomy, meta) from static JSON files.
 * In production these are served from the same origin;
 * in dev they come from public/data/.
 */
export function usePlatformData() {
  const [data, setData] = useState({
    papers: [],
    taxonomy: null,
    meta: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const base = import.meta.env.BASE_URL || "./";
        const [pRes, tRes, mRes] = await Promise.all([
          fetch(`${base}data/papers.json`),
          fetch(`${base}data/taxonomy.json`),
          fetch(`${base}data/meta.json`),
        ]);

        if (!pRes.ok) throw new Error(`papers.json: ${pRes.status}`);
        const papers = await pRes.json();
        const taxonomy = tRes.ok ? await tRes.json() : null;
        const meta = mRes.ok ? await mRes.json() : null;

        setData({ papers, taxonomy, meta, loading: false, error: null });
      } catch (err) {
        setData((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    }
    load();
  }, []);

  return data;
}

/**
 * Scroll-triggered reveal animation hook.
 * Re-observes on every route change so new .reveal elements are caught.
 * Uses MutationObserver to also catch elements added after mount.
 */
export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    function observeAll() {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        observer.observe(el);
      });
    }

    // Initial observe
    observeAll();

    // Watch for DOM changes (route transitions add new .reveal elements)
    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [location.pathname]);
}

/**
 * Returns true after a short delay — useful for staggered skeleton-to-content transitions.
 */
export function useDelayedReady(delayMs = 100) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return ready;
}
