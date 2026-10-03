/**
 * Reusable Error Analysis Component.
 * Displays comparative precision metrics (benchmark, absolute error, relative error, step error).
 */

import { formatCellValue, formatNumber } from "./formatters";

export function ErrorAnalysis({ errorAnalysis, metadata, methodId }) {
  if (!errorAnalysis || typeof errorAnalysis !== "object") return null;

  const {
    reference_value,
    absolute_error,
    relative_error,
    estimated_error,
  } = errorAnalysis;

  // If all fields are null or undefined, do not render empty cards
  const hasContent =
    (reference_value !== null && reference_value !== undefined) ||
    (absolute_error !== null && absolute_error !== undefined) ||
    (relative_error !== null && relative_error !== undefined) ||
    (estimated_error !== null && estimated_error !== undefined);

  if (!hasContent) return null;

  // Format reference target description concisely
  const formatReferenceTarget = () => {
    if (reference_value === null || reference_value === undefined) return "—";

    if (metadata?.reference_solution_expr) {
      return `y(x) = ${metadata.reference_solution_expr}`;
    }
    if (metadata?.reference_expr) {
      return `u(x, t) = ${metadata.reference_expr}`;
    }

    if (methodId === "linear-bvp") {
      return Array.isArray(reference_value)
        ? "Analytical Benchmark Curve y(x)"
        : formatCellValue(reference_value);
    }

    if (methodId === "crank-nicolson") {
      return Array.isArray(reference_value)
        ? "Analytical Benchmark Profile u(x, t_final)"
        : formatCellValue(reference_value);
    }

    if (Array.isArray(reference_value)) {
      return `Exact Benchmark Vector (${reference_value.length} nodes)`;
    }

    return formatCellValue(reference_value);
  };

  // Format absolute error concisely when array of node errors
  const formatAbsError = (val) => {
    if (val === null || val === undefined) return "—";
    if (Array.isArray(val)) {
      const maxVal = Math.max(...val.map((v) => Math.abs(Number(v) || 0)));
      return `Max |Δ| = ${formatNumber(maxVal, 8)}`;
    }
    return formatCellValue(val);
  };

  // Format relative error percentage note
  const formatRelError = (val) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      const formatted = formatNumber(val, 8);
      const pctVal = val * 100;
      let pctStr;
      if (pctVal < 0.01 && pctVal > 0) {
        pctStr = `${pctVal.toExponential(3)}%`;
      } else {
        pctStr = `${pctVal.toFixed(3)}%`;
      }
      return `${formatted} (≈ ${pctStr})`;
    }
    return formatCellValue(val);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "1rem 1.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#f8fafc" }}>
          Accuracy & Error Analysis
        </h4>
        <span className="badge" style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
          Diagnostics
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {reference_value !== null && reference_value !== undefined && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#1e293b", borderRadius: "6px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
              Reference Target
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#38bdf8", fontFamily: "var(--mono)", marginTop: "2px", wordBreak: "break-all" }}>
              {formatReferenceTarget()}
            </div>
          </div>
        )}

        {absolute_error !== null && absolute_error !== undefined && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#1e293b", borderRadius: "6px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
              {Array.isArray(absolute_error) ? "Max Absolute Error" : "Absolute Error (|x - x*|)"}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fca5a5", fontFamily: "var(--mono)", marginTop: "2px", wordBreak: "break-all" }}>
              {formatAbsError(absolute_error)}
            </div>
          </div>
        )}

        {relative_error !== null && relative_error !== undefined && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#1e293b", borderRadius: "6px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
              Relative Error
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fca5a5", fontFamily: "var(--mono)", marginTop: "2px", wordBreak: "break-all" }}>
              {formatRelError(relative_error)}
            </div>
          </div>
        )}

        {estimated_error !== null && estimated_error !== undefined && (
          <div style={{ padding: "0.6rem 0.75rem", backgroundColor: "#1e293b", borderRadius: "6px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
              Step Error / Tolerance
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#cbd5e1", fontFamily: "var(--mono)", marginTop: "2px", wordBreak: "break-all" }}>
              {formatCellValue(estimated_error)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorAnalysis;
