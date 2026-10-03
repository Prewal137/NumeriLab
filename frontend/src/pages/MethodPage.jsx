/**
 * NumeriLab Method Workspace Page.
 * 
 * Reusable workbench scaffold providing structural slots for:
 * - Method parameter inputs & problem presets
 * - Solution summary & status diagnostics
 * - Interactive visualization canvas (line/surface/spline plots) - Full Width
 * - Analytical error analysis & precision benchmarks - Full Width
 * - Step-by-step iteration records & tabular data - Full Width
 * - Theoretical formulation & pedagogical notes
 */

import { useState } from "react";
import { getModuleById } from "../data/methods";
import { MethodInputForm } from "../components/methods/MethodInputForm";
import { ErrorAnalysis } from "../components/results/ErrorAnalysis";
import { ResultTable } from "../components/results/ResultTable";
import { VisualizationRenderer } from "../components/visualization/VisualizationRenderer";
import { formatNumber } from "../components/results/formatters";
import {
  solveCrankNicolson,
  solveCubicSpline,
  solveEuler,
  solveFixedPoint,
  solveGaussSeidel,
  solveInverseLagrange,
  solveLagrange,
  solveLaplacePoisson,
  solveLinearBVP,
  solveModifiedEuler,
  solveRK4,
  solveRomberg,
  solveSecant,
  solveSimpson,
  solveTrapezoidal,
} from "../services/api";

export function MethodPage({ method, onBack }) {
  const [activeWorkspaceView, setActiveWorkspaceView] = useState("workspace"); // "workspace" | "theory" | "api"
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!method) return null;

  const currentModule = getModuleById(method.module);

  const handleSolve = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      let res;
      switch (method.id) {
        case "fixed-point":
          res = await solveFixedPoint(payload);
          break;
        case "secant":
          res = await solveSecant(payload);
          break;
        case "gauss-seidel":
          res = await solveGaussSeidel(payload);
          break;
        case "lagrange":
          res = await solveLagrange(payload);
          break;
        case "inverse-lagrange":
          res = await solveInverseLagrange(payload);
          break;
        case "cubic-spline":
          res = await solveCubicSpline(payload);
          break;
        case "trapezoidal":
          res = await solveTrapezoidal(payload);
          break;
        case "simpson":
          res = await solveSimpson(payload);
          break;
        case "romberg":
          res = await solveRomberg(payload);
          break;
        case "euler":
          res = await solveEuler(payload);
          break;
        case "modified-euler":
          res = await solveModifiedEuler(payload);
          break;
        case "rk4":
          res = await solveRK4(payload);
          break;
        case "linear-bvp":
          res = await solveLinearBVP(payload);
          break;
        case "laplace-poisson":
          res = await solveLaplacePoisson(payload);
          break;
        case "crank-nicolson":
          res = await solveCrankNicolson(payload);
          break;
        default:
          throw new Error(`Solver for ${method.name} is scheduled for upcoming phases.`);
      }

      if (res && res.metadata) {
        if (payload.reference_solution_expr) {
          res.metadata.reference_solution_expr = payload.reference_solution_expr;
        }
        if (payload.reference_expr) {
          res.metadata.reference_expr = payload.reference_expr;
        }
      }

      setResult(res);
      if (!res.success && res.error) {
        setError(res.error);
      }
    } catch (err) {
      console.error("Solver error:", err);
      setError(err.message || "Failed to execute numerical solver.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  // Helper to format final value for display
  const formatFinalValue = (val) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      return Number.isInteger(val) ? val.toString() : val.toFixed(8);
    }
    if (Array.isArray(val)) {
      if (val.length > 0 && Array.isArray(val[0])) {
        return `2D Grid Matrix (${val.length} × ${val[0].length})`;
      }
      if (val.length > 8) {
        const head = val.slice(0, 3).map((v) => (typeof v === "number" ? v.toFixed(4) : v)).join(", ");
        const tail = val.slice(-2).map((v) => (typeof v === "number" ? v.toFixed(4) : v)).join(", ");
        return `[ ${head}, ..., ${tail} ] (${val.length} nodes)`;
      }
      return `[ ${val.map((v) => (typeof v === "number" ? v.toFixed(6) : v)).join(", ")} ]`;
    }
    return JSON.stringify(val);
  };

  const hasHighRefAccuracy =
    result &&
    result.error_analysis?.absolute_error !== null &&
    result.error_analysis?.absolute_error !== undefined &&
    result.error_analysis.absolute_error < 1e-6;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Breadcrumbs & Back Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost"
          style={{ paddingLeft: 0 }}
        >
          ← Back to {currentModule ? currentModule.name : `Module ${method.module}`}
        </button>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="badge badge-module">
            {currentModule ? currentModule.name : `Module ${method.module}`}
          </span>
          <span className="badge badge-category">
            {method.category}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass-hero" style={{ padding: "1.5rem 1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.6rem", color: "var(--text-high-contrast)" }}>
              {method.name}
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "850px", fontSize: "0.95rem" }}>
              {method.description}
            </p>
          </div>

          <div
            style={{
              padding: "0.4rem 0.75rem",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid var(--border-glass)",
              borderRadius: "6px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontFamily: "var(--mono)",
              whiteSpace: "nowrap",
            }}
          >
            API: <span style={{ color: "var(--accent-blue)" }}>{method.route}</span>
          </div>
        </div>

        {/* Workspace Sub-Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1.25rem",
            borderTop: "1px solid var(--border-glass-subtle)",
            paddingTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "workspace", label: "Interactive Workspace" },
            { id: "theory", label: "Formulation & Theory" },
            { id: "api", label: "API Spec & Metadata" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveWorkspaceView(tab.id)}
              style={{
                background: activeWorkspaceView === tab.id ? "rgba(56, 189, 248, 0.15)" : "transparent",
                color: activeWorkspaceView === tab.id ? "var(--accent-blue)" : "var(--text-muted)",
                border: "1px solid",
                borderColor: activeWorkspaceView === tab.id ? "rgba(56, 189, 248, 0.3)" : "transparent",
                borderRadius: "6px",
                padding: "0.4rem 0.85rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all var(--transition-fast)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Tab View */}
      {activeWorkspaceView === "workspace" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Row 1: Inputs & Solution Summary Side-by-Side (Stacks on mobile) */}
          <div className="method-top-grid">
            {/* Left Column: Input Configuration & Form */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-high-contrast)" }}>
                  Input Parameters
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  {currentModule ? currentModule.name : `Module ${method.module}`}
                </span>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="error-banner">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Interactive Method Form */}
              <MethodInputForm
                method={method}
                onSubmit={handleSolve}
                isLoading={isLoading}
                onReset={handleReset}
              />
            </div>

            {/* Right Column: Solution Summary */}
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.85rem", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-high-contrast)" }}>
                    Solution Summary
                  </h3>
                  {result ? (
                    result.converged ? (
                      <span className="badge" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)", border: "1px solid rgba(34, 197, 94, 0.4)" }}>
                        ✓ Converged
                      </span>
                    ) : hasHighRefAccuracy ? (
                      <span className="badge" style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", color: "var(--accent-blue)", border: "1px solid rgba(56, 189, 248, 0.4)" }}>
                        ★ High Accuracy ({result.iterations} Levels)
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "var(--accent-amber)", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
                        ⚠ Max Iterations / Levels Reached
                      </span>
                    )
                  ) : (
                    <span className="badge badge-category">Awaiting Run</span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ padding: "0.75rem", backgroundColor: "rgba(8, 12, 22, 0.75)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                      Computed Solution
                    </div>
                    <div
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--accent-blue)",
                        marginTop: "4px",
                        wordBreak: "break-all",
                      }}
                    >
                      {formatFinalValue(result?.final_value)}
                    </div>
                  </div>

                  <div style={{ padding: "0.75rem", backgroundColor: "rgba(8, 12, 22, 0.75)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                      {method.id === "linear-bvp"
                        ? "Grid Discretization"
                        : method.id === "crank-nicolson"
                        ? "Time Steps"
                        : method.id === "laplace-poisson"
                        ? "Relaxation Iterations"
                        : "Iterations / Steps"}
                    </div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-high-contrast)", marginTop: "4px" }}>
                      {result
                        ? method.id === "linear-bvp"
                          ? `${result.metadata?.n_subintervals || result.iterations - 1} Intervals (${result.iterations} Nodes)`
                          : method.id === "crank-nicolson"
                          ? `${result.iterations} Steps (nt=${result.metadata?.nt || result.iterations + 1})`
                          : method.id === "laplace-poisson"
                          ? `${result.iterations} Iterations`
                          : result.iterations !== undefined && result.iterations !== null
                          ? result.iterations
                          : "—"
                        : "—"}
                    </div>
                  </div>

                  <div style={{ padding: "0.75rem", backgroundColor: "rgba(8, 12, 22, 0.75)", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Status</div>
                    <div
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: result
                          ? result.converged
                            ? "var(--accent-green)"
                            : hasHighRefAccuracy
                            ? "var(--accent-blue)"
                            : "var(--accent-amber)"
                          : "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      {result
                        ? result.converged
                          ? "Converged"
                          : hasHighRefAccuracy
                          ? "High Accuracy (Max Levels)"
                          : "Not Converged"
                        : "Idle"}
                    </div>
                  </div>
                </div>

                {result?.explanation && (
                  <div
                    style={{
                      marginTop: "0.85rem",
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(8, 12, 22, 0.65)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    <strong style={{ color: "var(--accent-blue)" }}>Explanation:</strong> {result.explanation}
                    {hasHighRefAccuracy && !result.converged && (
                      <div style={{ color: "var(--text-dim)", marginTop: "0.4rem", fontSize: "0.8rem", borderTop: "1px solid var(--border-glass-subtle)", paddingTop: "0.4rem" }}>
                        💡 <strong style={{ color: "var(--accent-blue)" }}>Accuracy Note:</strong> The result demonstrates high analytical benchmark accuracy (|error| ≈ {formatNumber(result.error_analysis.absolute_error)}), though the step difference stopping criterion ({result.metadata?.tolerance || "tolerance"}) was not reached within {result.iterations} levels.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!result && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", fontStyle: "italic", marginTop: "0.5rem" }}>
                  Provide parameters on the left and click "Execute Solver" to compute numerical results.
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Full-Width Interactive Visualization */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-high-contrast)" }}>
                  Interactive Visualization
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  Dynamic solution trajectory and analytical geometry
                </span>
              </div>
              <span className="badge badge-category">
                {result?.visualization?.chart_type ? `${result.visualization.chart_type.toUpperCase()} PLOT` : "Trajectory Canvas"}
              </span>
            </div>
            <VisualizationRenderer
              visualization={result?.visualization}
              isLoading={isLoading}
              height={340}
            />
          </div>

          {/* Row 3: Full-Width Accuracy & Benchmark Error Analysis */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-high-contrast)" }}>
                  Accuracy & Error Analysis
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  Closed-form analytical verification and numerical precision diagnostics
                </span>
              </div>
              {result?.error_analysis && (
                <span className="badge badge-module" style={{ textTransform: "none", fontSize: "0.75rem" }}>
                  Analytical Comparison
                </span>
              )}
            </div>
            
            {result?.error_analysis ? (
              <ErrorAnalysis
                errorAnalysis={result.error_analysis}
                metadata={result.metadata}
                methodId={result.method}
              />
            ) : (
              <div className="slot-placeholder" style={{ minHeight: "90px" }}>
                <div style={{ fontSize: "0.825rem", color: "var(--text-dim)" }}>
                  {result
                    ? "No specific analytical error metrics defined for this method preset."
                    : "Execute the solver to compute precision metrics, truncation errors, and analytical benchmarks."}
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Full-Width Step-by-Step Result / Iteration Table */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-high-contrast)" }}>
                  Step-by-Step Result & Iteration Table
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                  Granular state progression, intermediate variables, and step metrics
                </span>
              </div>
              <span className="badge badge-category">
                {result?.table ? `${result.table.length} records` : "Awaiting Execution"}
              </span>
            </div>

            {result?.table ? (
              <ResultTable table={result.table} maxHeight="500px" />
            ) : (
              <div className="slot-placeholder" style={{ minHeight: "110px" }}>
                <div style={{ fontSize: "0.825rem", color: "var(--text-dim)" }}>
                  Run the solver to generate step-by-step iteration records and computational state logs.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theory & Pedagogical Formulation View */}
      {activeWorkspaceView === "theory" && (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "var(--text-high-contrast)" }}>
              Theoretical Foundation: {method.name}
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
              {method.description}
            </p>
          </div>

          <div
            style={{
              padding: "1.25rem",
              backgroundColor: "rgba(10, 15, 29, 0.8)",
              borderRadius: "8px",
              border: "1px solid var(--border-glass)",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              fontSize: "0.9rem",
              color: "var(--text-main)",
              lineHeight: 1.6,
            }}
          >
            {method.id === "trapezoidal" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Composite Trapezoidal Quadrature:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  ∫ [a, b] f(x) dx ≈ (h / 2) · [ f(x₀) + 2·∑_{'{'}i=1{'}'}^{'{'}n-1{'}'} f(xᵢ) + f(xₙ) ]
                </div>
                <div><strong>Step Size:</strong> h = (b - a) / n</div>
                <div><strong>Global Truncation Error:</strong> E_T = -((b - a)·h² / 12) · f''(ξ) ∈ O(h²)</div>
                <div><strong>Quadrature Weights:</strong> w = [ 1, 2, 2, ..., 2, 1 ]</div>
              </>
            )}

            {method.id === "simpson" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Composite Simpson's 1/3 Rule (Parabolic Quadrature):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  ∫ [a, b] f(x) dx ≈ (h / 3) · [ f(x₀) + 4·∑_{'{'}i=odd{'}'} f(xᵢ) + 2·∑_{'{'}i=even{'}'} f(xᵢ) + f(xₙ) ]
                </div>
                <div><strong>Step Size:</strong> h = (b - a) / n (where n must be an <em>even</em> positive integer)</div>
                <div><strong>Global Truncation Error:</strong> E_S = -((b - a)·h⁴ / 180) · f⁽⁴⁾(ξ) ∈ O(h⁴)</div>
                <div><strong>Exactness:</strong> Exactly integrates all polynomials up to degree 3.</div>
                <div><strong>Quadrature Weights:</strong> w = [ 1, 4, 2, 4, 2, ..., 4, 1 ]</div>
              </>
            )}

            {method.id === "romberg" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Romberg Integration via Richardson Extrapolation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  R(k, j) = R(k, j-1) + [ R(k, j-1) - R(k-1, j-1) ] / (4ʲ - 1),  for j = 1, ..., k
                </div>
                <div><strong>Level 0 Base:</strong> R(k, 0) = Composite Trapezoidal estimate with 2^k subintervals</div>
                <div><strong>Column Accuracy Order:</strong> Column j achieves asymptotic error O(h^(2j+2))</div>
                <div><strong>Stopping Condition:</strong> |R(k, k) - R(k-1, k-1)| &lt; ε or max levels reached</div>
              </>
            )}

            {method.id === "lagrange" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Lagrange Polynomial Interpolation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  P(x) = ∑_{'{'}i=0{'}'}^{'{'}n-1{'}'} yᵢ · Lᵢ(x), where Lᵢ(x) = ∏_{'{'}j ≠ i{'}'} (x - xⱼ) / (xᵢ - xⱼ)
                </div>
                <div><strong>Degree:</strong> Produces unique polynomial of degree at most (n - 1) passing through all n points.</div>
              </>
            )}

            {method.id === "inverse-lagrange" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Lagrange Inverse Interpolation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  x(y) = ∑_{'{'}i=0{'}'}^{'{'}n-1{'}'} xᵢ · L'ᵢ(y), where L'ᵢ(y) = ∏_{'{'}j ≠ i{'}'} (y - yⱼ) / (yᵢ - yⱼ)
                </div>
                <div><strong>Requirement:</strong> All y coordinates must be strictly distinct to avoid division by zero.</div>
              </>
            )}

            {method.id === "cubic-spline" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Piecewise Natural Cubic Spline S(x):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  Sᵢ(x) = aᵢ + bᵢ(x - xᵢ) + cᵢ(x - xᵢ)² + dᵢ(x - xᵢ)³,  for x ∈ [xᵢ, xᵢ₊₁]
                </div>
                <div><strong>Continuity:</strong> C² continuity (continuous function, first derivative, and second derivative at interior knots).</div>
                <div><strong>Boundary Conditions:</strong> Natural boundary S''(x₀) = S''(xₙ₋₁) = 0 (c₀ = cₙ₋₁ = 0).</div>
              </>
            )}

            {method.id === "fixed-point" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Fixed Point Iteration:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  x_{'{'}k+1{'}'} = g(x_k)
                </div>
                <div><strong>Convergence Criterion:</strong> Guaranteed when |g'(x)| &lt; 1 in neighborhood of fixed point.</div>
              </>
            )}

            {method.id === "secant" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Secant Method (Root-Finding):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  x_{'{'}k+1{'}'} = x_k - f(x_k) · (x_k - x_{'{'}k-1{'}'}) / [ f(x_k) - f(x_{'{'}k-1{'}'}) ]
                </div>
                <div><strong>Convergence Order:</strong> Superlinear with convergence rate p = (1 + √5)/2 ≈ 1.618.</div>
              </>
            )}

            {method.id === "gauss-seidel" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Gauss-Seidel Iterative Method (Linear Systems):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  xᵢ^(k+1) = [ bᵢ - ∑_{'{'}j &lt; i{'}'} a_{'{'}ij{'}'} xⱼ^(k+1) - ∑_{'{'}j &gt; i{'}'} a_{'{'}ij{'}'} xⱼ^(k) ] / a_{'{'}ii{'}'}
                </div>
                <div><strong>Convergence Guarantee:</strong> Guaranteed for strictly diagonally dominant or symmetric positive-definite matrices.</div>
              </>
            )}

            {method.id === "euler" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Euler's Explicit Method (Initial Value Problems):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px" }}>
                  y_(n+1) = y_n + h · f(x_n, y_n),  where x_(n+1) = x_n + h
                </div>
                <div><strong>Principle:</strong> Uses instantaneous slope f(x_n, y_n) to advance the solution linearly.</div>
                <div><strong>Global Truncation Error:</strong> O(h) cumulative error (First-order accurate).</div>
              </>
            )}

            {method.id === "modified-euler" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Modified Euler's Method (Heun's Predictor-Corrector):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div><strong>Predictor:</strong> y*_(n+1) = y_n + h · f(x_n, y_n)</div>
                  <div><strong>Corrector:</strong> y_(n+1) = y_n + (h / 2) · [ f(x_n, y_n) + f(x_(n+1), y*_(n+1)) ]</div>
                </div>
                <div><strong>Global Truncation Error:</strong> O(h²) cumulative error (Second-order accurate).</div>
              </>
            )}

            {method.id === "rk4" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Fourth-Order Runge-Kutta Method (RK4):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div>k₁ = f(x_n, y_n)</div>
                  <div>k₂ = f(x_n + h/2, y_n + (h/2)·k₁)</div>
                  <div>k₃ = f(x_n + h/2, y_n + (h/2)·k₂)</div>
                  <div>k₄ = f(x_n + h, y_n + h·k₃)</div>
                  <div style={{ borderTop: "1px solid var(--border-glass-subtle)", paddingTop: "0.35rem", marginTop: "0.2rem", color: "var(--accent-blue)" }}>
                    y_(n+1) = y_n + (h / 6) · [ k₁ + 2·k₂ + 2·k₃ + k₄ ]
                  </div>
                </div>
                <div><strong>Global Truncation Error:</strong> O(h⁴) cumulative error (Fourth-order accurate).</div>
              </>
            )}

            {method.id === "linear-bvp" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Two-Point Linear Boundary Value Problem (Finite Differences):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div><strong>Governing ODE:</strong> y'' + p(x)·y' + q(x)·y = r(x),  x ∈ [a, b]</div>
                  <div><strong>Central Stencil:</strong> y''_i ≈ (y_{'{'}i+1{'}'} - 2y_i + y_{'{'}i-1{'}'}) / h²,  y'_i ≈ (y_{'{'}i+1{'}'} - y_{'{'}i-1{'}'}) / (2h)</div>
                  <div style={{ borderTop: "1px solid var(--border-glass-subtle)", paddingTop: "0.35rem", marginTop: "0.2rem", color: "var(--accent-blue)" }}>
                    (1 - h/2·p_i)·y_{'{'}i-1{'}'} + (-2 + h²·q_i)·y_i + (1 + h/2·p_i)·y_{'{'}i+1{'}'} = h²·r_i
                  </div>
                </div>
                <div><strong>Global Discretization Error:</strong> O(h²) throughout the interior grid.</div>
              </>
            )}

            {method.id === "laplace-poisson" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>2D Laplace & Poisson Equation (Five-Point Finite Difference):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div><strong>Governing PDE:</strong> ∂²u/∂x² + ∂²u/∂y² = f(x, y)</div>
                  <div style={{ borderTop: "1px solid var(--border-glass-subtle)", paddingTop: "0.35rem", marginTop: "0.2rem", color: "var(--accent-blue)" }}>
                    u_{'{'}i,j{'}'}^(k+1) = [ Δy²(u_{'{'}i+1,j{'}'}^(k) + u_{'{'}i-1,j{'}'}^(k+1)) + Δx²(u_{'{'}i,j+1{'}'}^(k) + u_{'{'}i,j-1{'}'}^(k+1)) - Δx²Δy²·f_{'{'}i,j{'}'} ] / [ 2(Δx² + Δy²) ]
                  </div>
                </div>
                <div><strong>Relaxation Solver:</strong> Gauss-Seidel point iterative relaxation with immediate coordinate updates.</div>
              </>
            )}

            {method.id === "crank-nicolson" && (
              <>
                <div style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Crank-Nicolson Method for 1D Transient Heat Equation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "rgba(15, 23, 42, 0.7)", padding: "0.75rem", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div><strong>Governing PDE:</strong> ∂u/∂t = α · (∂²u/∂x²)</div>
                  <div><strong>Mesh Ratio:</strong> r = (α · Δt) / (2 · Δx²)</div>
                  <div style={{ borderTop: "1px solid var(--border-glass-subtle)", paddingTop: "0.35rem", marginTop: "0.2rem", color: "var(--accent-blue)" }}>
                    -r·u_{'{'}i-1{'}'}^(m+1) + (1 + 2r)·u_i^(m+1) - r·u_{'{'}i+1{'}'}^(m+1) = r·u_{'{'}i-1{'}'}^m + (1 - 2r)·u_i^m + r·u_{'{'}i+1{'}'}^m
                  </div>
                </div>
                <div><strong>Stability & Accuracy:</strong> Implicit unconditionally stable scheme with O(Δt² + Δx²) accuracy.</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* API Specification View */}
      {activeWorkspaceView === "api" && (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-high-contrast)" }}>
            Backend API Contract
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            This method is backed by the standardized NumeriLab backend endpoint:
          </p>
          <pre
            style={{
              padding: "1rem",
              backgroundColor: "rgba(10, 15, 29, 0.8)",
              border: "1px solid var(--border-glass)",
              borderRadius: "6px",
              color: "var(--accent-blue)",
              fontFamily: "var(--mono)",
              fontSize: "0.85rem",
              margin: 0,
              overflowX: "auto",
            }}
          >
            {`POST http://127.0.0.1:8000/api${method.route}
Content-Type: application/json

Response Schema: NumericalResult {
  success: boolean,
  method: string,
  final_value: any,
  iterations: number,
  converged: boolean,
  table: Array<Record<string, any>>,
  visualization: VisualizationPayload,
  error_analysis: ErrorAnalysis,
  explanation: string
}`}
          </pre>
        </div>
      )}
    </div>
  );
}

export default MethodPage;
