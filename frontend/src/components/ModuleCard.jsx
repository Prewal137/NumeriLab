/**
 * NumeriLab Module Card Component.
 * Displays summary of a course module with list of associated numerical methods.
 */

export function ModuleCard({ moduleData, methods = [], onSelectMethod }) {
  if (!moduleData) return null;

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #334155",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#38bdf8",
            letterSpacing: "0.05em",
          }}
        >
          {moduleData.name}
        </span>
        <h3 style={{ margin: "0.25rem 0 0.5rem 0", color: "#f8fafc", fontSize: "1.2rem" }}>
          {moduleData.title}
        </h3>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.5 }}>
          {moduleData.description}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>Methods:</div>
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelectMethod && onSelectMethod(method)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem 0.75rem",
              backgroundColor: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              textAlign: "left",
            }}
          >
            <span>{method.name}</span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{method.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModuleCard;
