/**
 * VisualizationEmptyState Component.
 * Styled placeholder shown when no simulation has been run or no visualization data exists.
 */

export function VisualizationEmptyState({ title, message }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
        backgroundColor: "#0b1120",
        borderRadius: "8px",
        border: "1px dashed #334155",
        minHeight: "260px",
        textAlign: "center",
        color: "#64748b",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          marginBottom: "0.85rem",
          color: "#94a3b8",
        }}
      >
        📈
      </div>
      <div
        style={{
          fontWeight: 600,
          color: "#cbd5e1",
          fontSize: "0.95rem",
          marginBottom: "0.35rem",
        }}
      >
        {title || "No Visualization Data Available"}
      </div>
      <div
        style={{
          fontSize: "0.825rem",
          maxWidth: "380px",
          lineHeight: 1.5,
          color: "#64748b",
        }}
      >
        {message || "Run the numerical solver with valid parameters to generate convergence trajectory and function plots."}
      </div>
    </div>
  );
}

export default VisualizationEmptyState;
