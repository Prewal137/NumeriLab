/**
 * NumeriLab Dashboard Page.
 * Central view showing module overview, methods listing, and backend status.
 */

import { MODULES, METHODS } from "../data/methods";
import { ModuleCard } from "../components/ModuleCard";

export function Dashboard({ backendStatus, onSelectMethod }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "2rem",
          borderRadius: "12px",
          border: "1px solid #334155",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem 0", color: "#f8fafc", fontSize: "1.75rem" }}>
          Numerical Methods Engine & Visualization
        </h2>
        <p style={{ margin: 0, color: "#94a3b8", maxWidth: "700px", lineHeight: 1.6 }}>
          NumeriLab provides 15 standardized numerical methods across 5 core computational modules,
          with dynamic step-by-step convergence tables, interactive visualizations, and analytical error benchmarks.
        </p>
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#cbd5e1" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: backendStatus === "Connected" ? "#22c55e" : "#ef4444",
                display: "inline-block",
              }}
            />
            Backend: <strong>{backendStatus}</strong>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
            Total Methods: <strong>{METHODS.length}</strong> across <strong>{MODULES.length}</strong> Modules
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <h3 style={{ margin: "0 0 1rem 0", color: "#f8fafc" }}>Course Modules</h3>
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
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
