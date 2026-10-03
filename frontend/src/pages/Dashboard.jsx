/**
 * NumeriLab Dashboard Page.
 * Central view showing module overview, methods listing, and backend status.
 */

import { MODULES, METHODS } from "../data/methods";
import { ModuleCard } from "../components/ModuleCard";

export function Dashboard({ backendStatus, onSelectMethod, onSelectModule }) {
  const getStatusClass = () => {
    if (backendStatus === "Connected") return "connected";
    if (backendStatus === "Disconnected") return "disconnected";
    return "checking";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Glass Hero Banner */}
      <section className="glass-hero" aria-labelledby="dashboard-title">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span
              className="badge"
              style={{
                backgroundColor: "rgba(56, 189, 248, 0.12)",
                color: "var(--accent-blue)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                marginBottom: "0.75rem",
              }}
            >
              Scientific Computing Workbench
            </span>
            <h2
              id="dashboard-title"
              style={{
                margin: "0 0 0.5rem 0",
                color: "var(--text-high-contrast)",
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.025em",
              }}
            >
              Numerical Methods Engine & Interactive Analysis
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: "760px", lineHeight: 1.6, fontSize: "0.95rem" }}>
              NumeriLab provides 15 standardized numerical methods across 5 core computational modules,
              featuring step-by-step convergence tables, dynamic visual trajectories, and closed-form analytical benchmarks.
            </p>
          </div>
        </div>

        {/* Dashboard Metrics / Status Strip */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-glass-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-main)" }}>
            <span className={`status-dot ${getStatusClass()}`} />
            <span>Backend Engine: <strong>{backendStatus}</strong></span>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Solvers: <strong>{METHODS.length} Methods</strong>
          </div>

          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Syllabus: <strong>{MODULES.length} Core Modules</strong>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section aria-labelledby="modules-grid-title">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 id="modules-grid-title" style={{ margin: 0, color: "var(--text-high-contrast)", fontSize: "1.35rem" }}>
              Course Modules
            </h3>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-dim)", fontSize: "0.825rem" }}>
              Select a module to view theoretical foundations or launch solvers directly
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {MODULES.map((mod) => {
            const moduleMethods = METHODS.filter((m) => m.module === mod.id);
            return (
              <ModuleCard
                key={mod.id}
                moduleData={mod}
                methods={moduleMethods}
                onSelectMethod={onSelectMethod}
                onSelectModule={onSelectModule}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
