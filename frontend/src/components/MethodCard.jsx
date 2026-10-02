/**
 * NumeriLab Method Card Component.
 * Card representation for individual numerical method in overview grids.
 */

export function MethodCard({ method, onSelect }) {
  if (!method) return null;

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "10px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 600 }}>
            Module {method.module}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#0f172a", padding: "2px 6px", borderRadius: "4px" }}>
            {method.category}
          </span>
        </div>
        <h4 style={{ margin: "0.25rem 0", color: "#f8fafc", fontSize: "1rem" }}>
          {method.name}
        </h4>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.825rem", lineHeight: 1.4 }}>
          {method.description}
        </p>
      </div>

      <button
        onClick={() => onSelect && onSelect(method)}
        style={{
          marginTop: "0.5rem",
          padding: "0.45rem 0.75rem",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          alignSelf: "flex-start",
        }}
      >
        Configure & Solve →
      </button>
    </div>
  );
}

export default MethodCard;
