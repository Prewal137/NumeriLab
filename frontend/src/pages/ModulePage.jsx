/**
 * NumeriLab Module View Page.
 * Displays methods and theoretical overview for a specific selected module.
 */

import { getModuleById, getMethodsByModule, MODULES } from "../data/methods";
import { MethodCard } from "../components/MethodCard";

export function ModulePage({ moduleId, onSelectMethod, onBack }) {
  const currentModule = getModuleById(moduleId) || MODULES[0];
  const moduleMethods = getMethodsByModule(currentModule.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <button
        onClick={onBack}
        className="btn-ghost"
        style={{ paddingLeft: 0 }}
      >
        ← Back to Dashboard
      </button>

      <div className="panel-card" style={{ padding: "1.5rem 1.75rem" }}>
        <span className="badge badge-module" style={{ marginBottom: "0.5rem" }}>
          {currentModule.name}
        </span>
        <h2 style={{ margin: "0.25rem 0 0.5rem 0", color: "#f8fafc", fontSize: "1.5rem" }}>
          {currentModule.title}
        </h2>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6, maxWidth: "800px" }}>
          {currentModule.description}
        </p>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, color: "#f8fafc" }}>
            Available Numerical Methods ({moduleMethods.length})
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Select a method to open the interactive solver workspace
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {moduleMethods.map((method) => (
            <MethodCard
              key={method.id}
              method={method}
              onSelect={onSelectMethod}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModulePage;
