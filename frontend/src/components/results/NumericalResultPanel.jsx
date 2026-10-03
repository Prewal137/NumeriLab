/**
 * NumericalResultPanel Component.
 * Unified result view containing iteration table, error analysis, and diagnostics.
 */

import { ResultTable } from "./ResultTable";
import { ErrorAnalysis } from "./ErrorAnalysis";

export function NumericalResultPanel({ result, maxHeight = "400px" }) {
  if (!result) {
    return (
      <div className="slot-placeholder" style={{ minHeight: "140px" }}>
        <div style={{ fontWeight: 600, color: "#cbd5e1", marginBottom: "0.25rem" }}>
          Iteration Table & Error Analysis
        </div>
        <div style={{ fontSize: "0.825rem", color: "#64748b" }}>
          Execute the solver on the left to compute and view the step-by-step iteration records and error benchmarks.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Error Analysis Metrics (if available) */}
      {result.error_analysis && (
        <ErrorAnalysis
          errorAnalysis={result.error_analysis}
          metadata={result.metadata}
          methodId={result.method}
        />
      )}

      {/* Step-by-Step Iteration Table */}
      <ResultTable table={result.table} maxHeight={maxHeight} />
    </div>
  );
}

export default NumericalResultPanel;
