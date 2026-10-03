/**
 * NumeriLab Method Card Component.
 * Card representation for individual numerical method in overview grids.
 */

export function MethodCard({ method, onSelect }) {
  if (!method) return null;

  return (
    <div
      className="glass-card"
      style={{
        justifyContent: "space-between",
        gap: "1rem",
        padding: "1.25rem",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span className="badge badge-module">
            Module {method.module}
          </span>
          <span className="badge badge-category">
            {method.category}
          </span>
        </div>
        <h4 style={{ margin: "0.35rem 0 0.25rem 0", color: "var(--text-high-contrast)", fontSize: "1.05rem", fontWeight: 600 }}>
          {method.name}
        </h4>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.825rem", lineHeight: 1.5 }}>
          {method.description}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid var(--border-glass-subtle)" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
          {method.route}
        </span>
        <button
          type="button"
          onClick={() => onSelect && onSelect(method)}
          className="btn-primary"
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.8rem",
          }}
        >
          Configure & Solve →
        </button>
      </div>
    </div>
  );
}

export default MethodCard;
