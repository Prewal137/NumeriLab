/**
 * DataPointEditor Component.
 * Reusable tabular coordinate editor for interpolation, curve fitting, and spline methods.
 */

export function DataPointEditor({
  points = [],
  onChange,
  minPoints = 2,
  disabled = false,
  xLabel = "x_i",
  yLabel = "y_i",
  title = "Data Points / Knots",
  error = null,
}) {
  const handlePointChange = (index, field, value) => {
    const updated = points.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: value };
      }
      return p;
    });
    onChange(updated);
  };

  const handleAddPoint = () => {
    // Guess sensible next x if previous are numeric
    let nextX = "";
    if (points.length >= 2) {
      const lastX = parseFloat(points[points.length - 1]?.x);
      const prevX = parseFloat(points[points.length - 2]?.x);
      if (!isNaN(lastX) && !isNaN(prevX)) {
        const step = lastX - prevX;
        nextX = (lastX + (step !== 0 ? step : 1)).toString();
      }
    } else if (points.length === 1) {
      const lastX = parseFloat(points[0]?.x);
      if (!isNaN(lastX)) {
        nextX = (lastX + 1).toString();
      }
    }
    onChange([...points, { x: nextX, y: "" }]);
  };

  const handleRemovePoint = (index) => {
    if (points.length <= minPoints) return;
    const updated = points.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label className="form-label" style={{ margin: 0 }}>
          {title} <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          {points.length} {points.length === 1 ? "point" : "points"} (min: {minPoints})
        </span>
      </div>

      {/* Points Table Container */}
      <div
        style={{
          backgroundColor: "#0f172a",
          border: `1px solid ${error ? "#ef4444" : "#334155"}`,
          borderRadius: "8px",
          padding: "0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 1fr 36px",
            gap: "0.5rem",
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#94a3b8",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <div style={{ textAlign: "center" }}>#</div>
          <div>{xLabel}</div>
          <div>{yLabel}</div>
          <div style={{ textAlign: "center" }}>Act</div>
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "220px", overflowY: "auto" }}>
          {points.map((pt, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 1fr 36px",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontFamily: "var(--mono)",
                }}
              >
                {idx}
              </div>

              <input
                type="number"
                step="any"
                className="form-input"
                style={{ padding: "0.35rem 0.5rem", fontSize: "0.825rem" }}
                value={pt.x}
                onChange={(e) => handlePointChange(idx, "x", e.target.value)}
                placeholder="x"
                disabled={disabled}
              />

              <input
                type="number"
                step="any"
                className="form-input"
                style={{ padding: "0.35rem 0.5rem", fontSize: "0.825rem" }}
                value={pt.y}
                onChange={(e) => handlePointChange(idx, "y", e.target.value)}
                placeholder="y"
                disabled={disabled}
              />

              <button
                type="button"
                onClick={() => handleRemovePoint(idx)}
                disabled={disabled || points.length <= minPoints}
                title={points.length <= minPoints ? `Minimum ${minPoints} points required` : "Delete row"}
                style={{
                  height: "30px",
                  backgroundColor: points.length <= minPoints ? "transparent" : "rgba(239, 68, 68, 0.1)",
                  border: "1px solid",
                  borderColor: points.length <= minPoints ? "#334155" : "rgba(239, 68, 68, 0.3)",
                  color: points.length <= minPoints ? "#475569" : "#ef4444",
                  borderRadius: "4px",
                  cursor: points.length <= minPoints ? "not-allowed" : "pointer",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  transition: "all 0.15s ease",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add Row Action */}
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: "0.4rem", marginTop: "0.2rem" }}>
          <button
            type="button"
            onClick={handleAddPoint}
            disabled={disabled}
            className="btn-ghost"
            style={{
              width: "100%",
              padding: "0.35rem",
              fontSize: "0.775rem",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
            }}
          >
            + Add Data Point (x_{points.length}, y_{points.length})
          </button>
        </div>
      </div>

      {error && <div className="form-error-text">{error}</div>}
    </div>
  );
}

export default DataPointEditor;
