/**
 * NumeriLab Module View Page.
 * Displays methods and theoretical overview for a specific selected module.
 */

import { MODULES, METHODS } from "../data/methods";
import { MethodCard } from "../components/MethodCard";

export function ModulePage({ moduleId, onSelectMethod, onBack }) {
  const currentModule = MODULES.find((m) => m.id === moduleId) || MODULES[0];
  const moduleMethods = METHODS.filter((m) => m.module === currentModule.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <button
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "#38bdf8",
          cursor: "pointer",
          fontSize: "0.875rem",
          padding: 0,
        }}
      >
        ← Back to Dashboard
      </button>

      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "1.5rem",
          borderRadius: "10px",
          border: "1px solid #334155",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 600 }}>
          {currentModule.name}
        </span>
        <h2 style={{ margin: "0.25rem 0 0.5rem 0", color: "#f8fafc" }}>
          {currentModule.title}
        </h2>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.5 }}>
          {currentModule.description}
        </p>
      </div>

      <div>
        <h3 style={{ margin: "0 0 1rem 0", color: "#f8fafc" }}>Available Numerical Methods</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
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
