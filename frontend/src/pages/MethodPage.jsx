/**
 * NumeriLab Method Execution & Visualization Page Scaffold.
 * Provides architectural placeholder layout for solver configuration, tabular results, and charts.
 */

export function MethodPage({ method, onBack }) {
  if (!method) return null;

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
        ← Back to Methods Overview
      </button>

      {/* Header */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "1.5rem",
          borderRadius: "10px",
          border: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: 700 }}>
            MODULE {method.module}
          </span>
          <span style={{ color: "#64748b" }}>•</span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{method.category}</span>
        </div>
        <h2 style={{ margin: "0 0 0.5rem 0", color: "#f8fafc" }}>{method.name}</h2>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.5 }}>{method.description}</p>
      </div>

      {/* Two-Column Workspace Layout Scaffold */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "1.5rem",
        }}
      >
        {/* Input Configuration Column */}
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "1.5rem",
            borderRadius: "10px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.1rem" }}>
            Input Parameters
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
            Parameter inputs, interval bounds, and convergence tolerances will be configured here when methods are implemented.
          </p>

          <div
            style={{
              padding: "1rem",
              backgroundColor: "#0f172a",
              borderRadius: "6px",
              border: "1px dashed #334155",
              color: "#94a3b8",
              fontSize: "0.85rem",
              textAlign: "center",
            }}
          >
            Solver controls will be wired to <code style={{ color: "#38bdf8" }}>{method.route}</code>
          </div>
        </div>

        {/* Results & Visualizations Column */}
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "1.5rem",
            borderRadius: "10px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "1.1rem" }}>
            Results & Visualizations
          </h3>
          <div
            style={{
              minHeight: "220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              border: "1px dashed #334155",
              color: "#64748b",
              textAlign: "center",
              padding: "1.5rem",
            }}
          >
            Interactive plots, iteration tables, and error convergence curves will be rendered here.
          </div>
        </div>
      </div>
    </div>
  );
}

export default MethodPage;
