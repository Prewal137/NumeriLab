/**
 * NumeriLab Method Workspace Page.
 * 
 * Reusable workbench scaffold providing structural slots for:
 * - Method parameter inputs & problem presets
 * - Solver execution triggers & convergence diagnostics
 * - Interactive visualization canvas (line/surface/spline plots)
 * - Step-by-step iteration records & tabular data
 * - Theoretical formulation & pedagogical notes
 */

import { useState } from "react";
import { getModuleById } from "../data/methods";
import { MethodInputForm } from "../components/methods/MethodInputForm";
import { NumericalResultPanel } from "../components/results/NumericalResultPanel";
import { VisualizationRenderer } from "../components/visualization/VisualizationRenderer";
import { formatNumber } from "../components/results/formatters";
import {
  solveCubicSpline,
  solveFixedPoint,
  solveGaussSeidel,
  solveInverseLagrange,
  solveLagrange,
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
        default:
          throw new Error(`Solver for ${method.name} is scheduled for upcoming phases.`);
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
          onClick={onBack}
          className="btn-ghost"
          style={{ paddingLeft: 0 }}
        >
          ← Back to {currentModule ? currentModule.name : "Methods"} Overview
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
      <div className="panel-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.6rem", color: "#f8fafc" }}>
              {method.name}
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6, maxWidth: "850px", fontSize: "0.95rem" }}>
              {method.description}
            </p>
          </div>

          <div
            style={{
              padding: "0.4rem 0.75rem",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "6px",
              fontSize: "0.75rem",
              color: "#94a3b8",
              fontFamily: "var(--mono)",
              whiteSpace: "nowrap",
            }}
          >
            API: <span style={{ color: "#38bdf8" }}>{method.route}</span>
          </div>
        </div>

        {/* Workspace Sub-Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "1.25rem",
            borderTop: "1px solid #334155",
            paddingTop: "1rem",
          }}
        >
          {[
            { id: "workspace", label: "Interactive Workspace" },
            { id: "theory", label: "Formulation & Theory" },
            { id: "api", label: "API Spec & Metadata" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveWorkspaceView(tab.id)}
              style={{
                background: activeWorkspaceView === tab.id ? "#334155" : "transparent",
                color: activeWorkspaceView === tab.id ? "#ffffff" : "#94a3b8",
                border: "none",
                borderRadius: "6px",
                padding: "0.4rem 0.85rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Tab View */}
      {activeWorkspaceView === "workspace" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(340px, 1fr) minmax(400px, 2fr)",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: Input Configuration & Form */}
          <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
                Input Parameters
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Module {method.module}
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

          {/* Right Column: Visualizations, Iterations & Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Output Summary Card */}
            <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
                  Solution Summary
                </h3>
                {result ? (
                  result.converged ? (
                    <span className="badge" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#22c55e", border: "1px solid rgba(34, 197, 94, 0.4)" }}>
                      ✓ Converged
                    </span>
                  ) : hasHighRefAccuracy ? (
                    <span className="badge" style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.4)" }}>
                      ★ High Accuracy ({result.iterations} Levels)
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
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
                  marginTop: "0.25rem",
                }}
              >
                <div style={{ padding: "0.75rem", backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Computed Solution</div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#38bdf8",
                      marginTop: "2px",
                      wordBreak: "break-all",
                    }}
                  >
                    {formatFinalValue(result?.final_value)}
                  </div>
                </div>

                <div style={{ padding: "0.75rem", backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Iterations / Steps</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                    {result?.iterations !== undefined && result?.iterations !== null ? result.iterations : "—"}
                  </div>
                </div>

                <div style={{ padding: "0.75rem", backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Status</div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: result
                        ? result.converged
                          ? "#22c55e"
                          : hasHighRefAccuracy
                          ? "#38bdf8"
                          : "#f59e0b"
                        : "#94a3b8",
                      marginTop: "2px",
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
                    marginTop: "0.5rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#38bdf8" }}>Explanation:</strong> {result.explanation}
                  {hasHighRefAccuracy && !result.converged && (
                    <div style={{ color: "#94a3b8", marginTop: "0.4rem", fontSize: "0.8rem", borderTop: "1px solid #1e293b", paddingTop: "0.4rem" }}>
                      💡 <strong style={{ color: "#38bdf8" }}>Accuracy vs. Convergence Note:</strong> The result demonstrates high analytical benchmark accuracy (|error| ≈ {formatNumber(result.error_analysis.absolute_error)}), though the internal step difference stopping criterion ({result.metadata?.tolerance || "tolerance"}) was not met within {result.iterations} levels.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visualization Canvas Slot */}
            <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
                  Interactive Visualization
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {result?.visualization?.chart_type ? `${result.visualization.chart_type.toUpperCase()} PLOT` : "Trajectory Canvas"}
                </span>
              </div>
              <VisualizationRenderer
                visualization={result?.visualization}
                isLoading={isLoading}
                height={280}
              />
            </div>

            {/* Iteration Table & Error Analysis Component Panel */}
            <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#f8fafc" }}>
                  Iteration Table & Error Analysis
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {result?.table ? `${result.table.length} rows recorded` : "Awaiting Execution"}
                </span>
              </div>
              
              <NumericalResultPanel result={result} maxHeight="420px" />
            </div>
          </div>
        </div>
      )}

      {/* Theory & Pedagogical Formulation View */}
      {activeWorkspaceView === "theory" && (
        <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#f8fafc" }}>
              Theoretical Foundation: {method.name}
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
              {method.description}
            </p>
          </div>

          <div
            style={{
              padding: "1.25rem",
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              border: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              fontSize: "0.9rem",
              color: "#cbd5e1",
              lineHeight: 1.6,
            }}
          >
            {method.id === "trapezoidal" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Composite Trapezoidal Quadrature:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  ∫ [a, b] f(x) dx ≈ (h / 2) · [ f(x₀) + 2·∑_{'{'}i=1{'}'}^{'{'}n-1{'}'} f(xᵢ) + f(xₙ) ]
                </div>
                <div><strong>Step Size:</strong> h = (b - a) / n</div>
                <div><strong>Global Truncation Error:</strong> E_T = -((b - a)·h² / 12) · f''(ξ) ∈ O(h²)</div>
                <div><strong>Quadrature Weights:</strong> w = [ 1, 2, 2, ..., 2, 1 ]</div>
              </>
            )}

            {method.id === "simpson" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Composite Simpson's 1/3 Rule (Parabolic Quadrature):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
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
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Romberg Integration via Richardson Extrapolation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  R(k, j) = R(k, j-1) + [ R(k, j-1) - R(k-1, j-1) ] / (4ʲ - 1),  for j = 1, ..., k
                </div>
                <div><strong>Level 0 Base:</strong> R(k, 0) = Composite Trapezoidal estimate with 2^k subintervals</div>
                <div><strong>Column Accuracy Order:</strong> Column j achieves asymptotic error O(h^(2j+2))</div>
                <div><strong>Stopping Condition:</strong> |R(k, k) - R(k-1, k-1)| &lt; ε or max levels reached</div>
              </>
            )}

            {method.id === "lagrange" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Lagrange Polynomial Interpolation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  P(x) = ∑_{'{'}i=0{'}'}^{'{'}n-1{'}'} yᵢ · Lᵢ(x), where Lᵢ(x) = ∏_{'{'}j ≠ i{'}'} (x - xⱼ) / (xᵢ - xⱼ)
                </div>
                <div><strong>Degree:</strong> Produces unique polynomial of degree at most (n - 1) passing through all n points.</div>
              </>
            )}

            {method.id === "inverse-lagrange" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Lagrange Inverse Interpolation:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  x(y) = ∑_{'{'}i=0{'}'}^{'{'}n-1{'}'} xᵢ · L'ᵢ(y), where L'ᵢ(y) = ∏_{'{'}j ≠ i{'}'} (y - yⱼ) / (yᵢ - yⱼ)
                </div>
                <div><strong>Requirement:</strong> All y coordinates must be strictly distinct to avoid division by zero.</div>
              </>
            )}

            {method.id === "cubic-spline" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Piecewise Natural Cubic Spline S(x):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  Sᵢ(x) = aᵢ + bᵢ(x - xᵢ) + cᵢ(x - xᵢ)² + dᵢ(x - xᵢ)³,  for x ∈ [xᵢ, xᵢ₊₁]
                </div>
                <div><strong>Continuity:</strong> C² continuity (continuous function, first derivative, and second derivative at interior knots).</div>
                <div><strong>Boundary Conditions:</strong> Natural boundary S''(x₀) = S''(xₙ₋₁) = 0 (c₀ = cₙ₋₁ = 0).</div>
              </>
            )}

            {method.id === "fixed-point" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Fixed Point Iteration:</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  x_{'{'}k+1{'}'} = g(x_k)
                </div>
                <div><strong>Convergence Criterion:</strong> Guaranteed when |g'(x)| &lt; 1 in neighborhood of fixed point.</div>
              </>
            )}

            {method.id === "secant" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Secant Method (Root-Finding):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  x_{'{'}k+1{'}'} = x_k - f(x_k) · (x_k - x_{'{'}k-1{'}'}) / [ f(x_k) - f(x_{'{'}k-1{'}'}) ]
                </div>
                <div><strong>Convergence Order:</strong> Superlinear with convergence rate p = (1 + √5)/2 ≈ 1.618.</div>
              </>
            )}

            {method.id === "gauss-seidel" && (
              <>
                <div style={{ fontWeight: 600, color: "#38bdf8" }}>Gauss-Seidel Iterative Method (Linear Systems):</div>
                <div style={{ fontFamily: "var(--mono)", backgroundColor: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                  xᵢ^(k+1) = [ bᵢ - ∑_{'{'}j &lt; i{'}'} a_{'{'}ij{'}'} xⱼ^(k+1) - ∑_{'{'}j &gt; i{'}'} a_{'{'}ij{'}'} xⱼ^(k) ] / a_{'{'}ii{'}'}
                </div>
                <div><strong>Convergence Guarantee:</strong> Guaranteed for strictly diagonally dominant or symmetric positive-definite matrices.</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* API Specification View */}
      {activeWorkspaceView === "api" && (
        <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#f8fafc" }}>
            Backend API Contract
          </h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            This method is backed by the standardized NumeriLab backend endpoint:
          </p>
          <pre
            style={{
              padding: "1rem",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "6px",
              color: "#38bdf8",
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
