/**
 * NumeriLab Module Card Component.
 * Displays summary of a course module with glassmorphism styling and quick method launchers.
 */

export function ModuleCard({ moduleData, methods = [], onSelectMethod, onSelectModule }) {
  if (!moduleData) return null;

  return (
    <div className="glass-card" style={{ justifyContent: "space-between", gap: "1.25rem" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span className="badge badge-module">
            {moduleData.name}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 500 }}>
            {methods.length} {methods.length === 1 ? "Method" : "Methods"}
          </span>
        </div>

        <h3 style={{ margin: "0.25rem 0 0.5rem 0", color: "var(--text-high-contrast)", fontSize: "1.2rem", fontWeight: 600 }}>
          {moduleData.title}
        </h3>
        
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.55 }}>
          {moduleData.description}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)" }}>
            Available Solvers:
          </span>
          {onSelectModule && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onSelectModule(moduleData.id)}
              style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
            >
              Explore Module →
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {methods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod && onSelectMethod(method)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.55rem 0.75rem",
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                color: "var(--text-main)",
                border: "1px solid rgba(51, 65, 85, 0.6)",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.825rem",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.85)";
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
                e.currentTarget.style.color = "var(--text-high-contrast)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
                e.currentTarget.style.borderColor = "rgba(51, 65, 85, 0.6)";
                e.currentTarget.style.color = "var(--text-main)";
              }}
            >
              <span style={{ fontWeight: 500 }}>{method.name}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginLeft: "0.5rem" }}>
                {method.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModuleCard;
