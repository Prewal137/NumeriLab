/**
 * Reusable Numerical Result Table Component.
 * Dynamically renders iteration and step records across all numerical methods.
 */

import { useMemo } from "react";
import { formatCellValue } from "./formatters";

/**
 * Format column keys into friendly header labels.
 */
function getColumnHeader(key) {
  const map = {
    iteration: "Iteration (k)",
    step: "Step",
    index: "Index (i)",
    interval: "Interval (i)",
    level: "Level (k)",
    x_current: "x_current",
    x_next: "x_next",
    x_prev: "x_prev",
    x_curr: "x_curr",
    f_prev: "f(x_prev)",
    f_curr: "f(x_curr)",
    f_next: "f(x_next)",
    error: "Error (|Δ|)",
    abs_error: "Absolute Error",
    rel_error: "Relative Error",
    values: "State Values",
    slope: "Slope",
    slope_f: "f(x_n, y_n)",
    y_next: "y_next",
    y_n: "y_n",
    x_n: "x_n",
    u_initial: "u(x, 0)",
    u_final: "u(x, t_final)",
    u_exact: "u_exact",
    x_i: "x_i",
    y_i: "y_i",
    f_x_i: "f(x_i)",
    weight: "Weight (w_i)",
    basis_L_i: "Basis L_i(x)",
    basis_L_prime_i: "Basis L'_i(y)",
    contribution: "Contribution",
    x_start: "x_i",
    x_end: "x_{i+1}",
    h_i: "h_i",
    a_i: "a_i",
    b_i: "b_i",
    c_i: "c_i",
    d_i: "d_i",
    polynomial: "Piecewise S_i(x)",
    subintervals: "Subintervals (n)",
    step_size: "Step Size (h)",
    step_h: "Step Size (h)",
    y_pred: "Predicted y*",
    f_pred: "f(xₙ₊₁, y*)",
    k1: "k₁",
    k2: "k₂",
    k3: "k₃",
    k4: "k₄",
    trapezoidal_R_k_0: "Trapezoidal R(k,0)",
    extrapolations: "Extrapolations R(k,j)",
    best_estimate: "Best Estimate R(k,k)",
    estimated_error: "Step Difference (|Δ|)",
  };
  return map[key] || key.replace(/_/g, " ");
}

export function ResultTable({ table, title, maxHeight = "400px" }) {
  // Extract column keys dynamically from table rows
  const columns = useMemo(() => {
    if (!Array.isArray(table) || table.length === 0) return [];
    
    // Aggregate all unique keys
    const keySet = new Set();
    table.forEach((row) => {
      if (row && typeof row === "object") {
        Object.keys(row).forEach((k) => keySet.add(k));
      }
    });

    const allKeys = Array.from(keySet);

    // Prioritize step/iteration/interval/level first, error metrics last
    const primaryKey = allKeys.find((k) => ["iteration", "step", "index", "interval", "level", "k"].includes(k));
    const errorKeys = allKeys.filter((k) => k.includes("error"));
    const middleKeys = allKeys.filter((k) => k !== primaryKey && !errorKeys.includes(k));

    const sorted = [];
    if (primaryKey) sorted.push(primaryKey);
    sorted.push(...middleKeys);
    sorted.push(...errorKeys);

    return sorted;
  }, [table]);

  if (!Array.isArray(table) || table.length === 0) {
    return (
      <div className="slot-placeholder" style={{ minHeight: "120px" }}>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
          No tabular iteration records available for this computation.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {/* Table Header Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
          {title || "Step-by-Step Iteration Table"}
        </span>
        <span className="badge badge-category" style={{ fontSize: "0.7rem" }}>
          {table.length} {table.length === 1 ? "row" : "rows"}
        </span>
      </div>

      {/* Scrollable Table Viewport */}
      <div
        style={{
          maxHeight,
          overflowY: "auto",
          overflowX: "auto",
          border: "1px solid #334155",
          borderRadius: "8px",
          backgroundColor: "#0f172a",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.825rem",
            textAlign: "left",
            whiteSpace: "nowrap",
          }}
        >
          <thead>
            <tr
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#1e293b",
                borderBottom: "2px solid #334155",
                zIndex: 2,
              }}
            >
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "0.6rem 0.85rem",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}
                >
                  {getColumnHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom: "1px solid #1e293b",
                  backgroundColor: rIdx % 2 === 0 ? "transparent" : "rgba(30, 41, 59, 0.4)",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(56, 189, 248, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    rIdx % 2 === 0 ? "transparent" : "rgba(30, 41, 59, 0.4)";
                }}
              >
                {columns.map((col) => {
                  const val = row[col];
                  const isPrimary = ["iteration", "step", "index", "interval", "level", "k"].includes(col);
                  const isError = col.includes("error");

                  return (
                    <td
                      key={col}
                      style={{
                        padding: "0.55rem 0.85rem",
                        color: isPrimary
                          ? "#38bdf8"
                          : isError
                          ? "#fca5a5"
                          : "#f8fafc",
                        fontFamily: "var(--mono)",
                        fontWeight: isPrimary ? 600 : 400,
                        verticalAlign: "middle",
                      }}
                    >
                      {Array.isArray(val) ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.3rem",
                            maxWidth: "400px",
                            whiteSpace: "normal",
                            alignItems: "center",
                          }}
                        >
                          {val.length === 0 ? (
                            <span style={{ color: "#64748b" }}>—</span>
                          ) : (
                            val.map((item, idx) => (
                              <span
                                key={idx}
                                style={{
                                  display: "inline-block",
                                  padding: "0.15rem 0.4rem",
                                  backgroundColor: "#1e293b",
                                  border: "1px solid #334155",
                                  borderRadius: "4px",
                                  fontSize: "0.75rem",
                                  color: "#e2e8f0",
                                  fontFamily: "var(--mono)",
                                }}
                              >
                                {formatCellValue(item)}
                              </span>
                            ))
                          )}
                        </div>
                      ) : typeof val === "string" && val.length > 40 ? (
                        <div style={{ maxWidth: "340px", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {val}
                        </div>
                      ) : (
                        formatCellValue(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultTable;
