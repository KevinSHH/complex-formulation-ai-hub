import { useMemo, useRef, useState, useEffect } from "react";
import { useLang, DOMAIN_NAMES } from "../i18n/index.jsx";

const DOMAIN_COLORS = {
  in_situ_gel: "#2a7ab0",
  liposome: "#BA7517",
  microsphere: "#1D9E75",
  nanocrystal: "#D4537E",
  plga_design: "#534AB7",
};

/**
 * Build graph nodes and edges from papers + taxonomy.
 * Nodes: domain nodes + AI model nodes
 * Edges: domain -> model (weight = paper count)
 */
function buildGraph(papers, taxonomy, domainLabel) {
  if (!taxonomy || !taxonomy.meta || !taxonomy.meta.domains || !taxonomy.ai_models) {
    return { nodes: [], links: [] };
  }

  const domains = Object.keys(taxonomy.meta.domains);
  const models = Object.keys(taxonomy.ai_models);

  const nodes = [
    ...domains.map((d) => ({
      id: `domain:${d}`,
      label: domainLabel(d),
      type: "domain",
      color: DOMAIN_COLORS[d] || "#888",
      size: 15 + (taxonomy.meta.domains[d]?.total || 0) * 0.5,
      count: taxonomy.meta.domains[d]?.total || 0,
    })),
    ...models.map((m) => ({
      id: `model:${m}`,
      label: m,
      type: "model",
      color: "#444441",
      size: 8 + (taxonomy.ai_models[m] || 0) * 1.5,
      count: taxonomy.ai_models[m] || 0,
    })),
  ];

  const links = [];
  const matrix = taxonomy.domain_model_matrix || {};
  for (const [domain, modelCounts] of Object.entries(matrix)) {
    for (const [model, count] of Object.entries(modelCounts)) {
      if (count > 0) {
        links.push({
          source: `domain:${domain}`,
          target: `model:${model}`,
          value: count,
          color: DOMAIN_COLORS[domain] || "#888",
        });
      }
    }
  }

  return { nodes, links };
}

export default function KnowledgeGraph({ papers, taxonomy }) {
  const { t, domainName } = useLang();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const hoveredRef = useRef(null);

  // Keep ref in sync for use inside animation loop without re-triggering effect
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    setGraphData(buildGraph(papers, taxonomy, domainName));
  }, [papers, taxonomy, domainName]);

  // Simple force-directed graph rendering on canvas
  // Only re-init when graphData changes, NOT on hover
  useEffect(() => {
    if (!canvasRef.current || graphData.nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = containerRef.current;

    // Wait for layout to settle (clientWidth may be 0 on first render)
    function initGraph() {
      const width = container.clientWidth || 800;
      const height = 500;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Initialize node positions
      const nodes = graphData.nodes.map((n) => ({
        ...n,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
      }));

      const nodeMap = {};
      nodes.forEach((n) => { nodeMap[n.id] = n; });

      const links = graphData.links.map((l) => ({
        source: nodeMap[l.source],
        target: nodeMap[l.target],
        value: l.value,
        color: l.color,
      })).filter((l) => l.source && l.target);

      // Force simulation
      let animationId;
      const damping = 0.85;
      const repulsion = 800;
      const attraction = 0.02;
      const centerForce = 0.005;

      function simulate() {
        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx += fx;
            nodes[i].vy += fy;
            nodes[j].vx -= fx;
            nodes[j].vy -= fy;
          }
        }

        // Attraction (links)
        for (const link of links) {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = attraction * dist;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          link.source.vx += fx;
          link.source.vy += fy;
          link.target.vx -= fx;
          link.target.vy -= fy;
        }

        // Center gravity
        for (const n of nodes) {
          n.vx += (width / 2 - n.x) * centerForce;
          n.vy += (height / 2 - n.y) * centerForce;
        }

        // Update positions
        for (const n of nodes) {
          n.vx *= damping;
          n.vy *= damping;
          n.x += n.vx;
          n.y += n.vy;
          // Boundaries
          n.x = Math.max(n.size, Math.min(width - n.size, n.x));
          n.y = Math.max(n.size, Math.min(height - n.size, n.y));
        }

        // Render
        ctx.clearRect(0, 0, width, height);

        // Draw links
        for (const link of links) {
          ctx.strokeStyle = link.color + "40";
          ctx.lineWidth = Math.max(0.5, link.value * 0.5);
          ctx.beginPath();
          ctx.moveTo(link.source.x, link.source.y);
          ctx.lineTo(link.target.x, link.target.y);
          ctx.stroke();
        }

        // Draw nodes - use ref for hovered to avoid re-init
        const h = hoveredRef.current;
        for (const n of nodes) {
          const isHovered = h?.id === n.id;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.globalAlpha = isHovered ? 1 : 0.85;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Label
          if (n.type === "domain" || isHovered) {
            ctx.fillStyle = "#2C2C2A";
            ctx.font = `${n.type === "domain" ? "500 " : ""}11px "Plus Jakarta Sans", sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(n.label, n.x, n.y + n.size + 14);
          }
        }

        animationId = requestAnimationFrame(simulate);
      }

      simulate();

      // Mouse interaction
      function getMouseNode(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        for (const n of nodes) {
          const dx = mx - n.x;
          const dy = my - n.y;
          if (dx * dx + dy * dy < n.size * n.size) {
            return n;
          }
        }
        return null;
      }

      function handleMove(e) {
        const n = getMouseNode(e);
        setHovered(n);
        canvas.style.cursor = n ? "pointer" : "default";
      }

      canvas.addEventListener("mousemove", handleMove);

      return () => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener("mousemove", handleMove);
      };
    }

    // Use ResizeObserver to init once container has real width
    let cleanup = null;
    let ro = null;
    if (container.clientWidth > 0) {
      cleanup = initGraph();
    } else {
      ro = new ResizeObserver((entries) => {
        if (entries[0].contentRect.width > 0 && !cleanup) {
          ro.disconnect();
          cleanup = initGraph();
        }
      });
      ro.observe(container);
    }

    return () => {
      if (ro) ro.disconnect();
      if (cleanup) cleanup();
    };
  }, [graphData]);  // Only depend on graphData, NOT hovered

  const tooltipPapers = useMemo(() => {
    if (!hovered) return [];
    if (hovered.type === "domain") {
      return papers.filter((p) => p.domain === hovered.id.replace("domain:", "")).slice(0, 5);
    } else if (hovered.type === "model") {
      const modelName = hovered.id.replace("model:", "");
      return papers
        .filter((p) => p.ml_summary?.ai_models_all?.includes(modelName))
        .slice(0, 5);
    }
    return [];
  }, [hovered, papers]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-20">
      <div className="reveal mb-8">
        <h1 className="font-display text-3xl text-ink-900 mb-2">{t("graph_title")}</h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          {t("graph_sub")}
        </p>
      </div>

      <div className="reveal grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph canvas */}
        <div className="lg:col-span-2 bg-white border border-stone-400/30 rounded-lg p-4 relative">
          <div ref={containerRef} className="w-full">
            <canvas ref={canvasRef} className="w-full" style={{ height: 500 }} />
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-6 flex flex-wrap gap-3 text-xs">
            {Object.keys(DOMAIN_NAMES).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[key] }} />
                <span className="text-stone-700">{domainName(key)}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-stone-800" />
              <span className="text-stone-700">{t("graph_ai_model_legend")}</span>
            </span>
          </div>
        </div>

        {/* Tooltip / info panel */}
        <div className="bg-white border border-stone-400/30 rounded-lg p-5">
          {hovered ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: hovered.color }}
                />
                <span className="font-display text-base text-ink-900">{hovered.label}</span>
              </div>
              <p className="text-xs text-stone-600 mb-3">
                {hovered.type === "domain" ? t("graph_domain_node") : t("graph_model_node")}
                {" · "}
                {hovered.count} {hovered.count === 1 ? t("paper_singular") : t("paper_plural")}
              </p>

              {tooltipPapers.length > 0 && (
                <div>
                  <p className="text-xs font-500 text-stone-700 uppercase tracking-wide mb-2">
                    {t("graph_related")}
                  </p>
                  <div className="space-y-2">
                    {tooltipPapers.map((p) => (
                      <div key={p.id} className="text-xs">
                        <p className="text-ink-900 leading-snug">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-stone-500">{p.publication_year || "N/A"}</span>
                          {p.doi && (
                            <a
                              href={`https://doi.org/${p.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ink-600 link-underline"
                            >
                              DOI
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-stone-600">
                {t("graph_hover_hint")}
              </p>
              <p className="text-xs text-stone-500 mt-2">
                {graphData.nodes.length} {t("graph_nodes")} · {graphData.links.length} {t("graph_edges")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
