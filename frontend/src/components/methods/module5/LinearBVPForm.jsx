import { useState } from "react";
import { normalizeMathExpression } from "../../../utils/mathUtils";

const PRESETS = [
  {
    name: "Parabolic Source (Benchmark)",
    pExpr: "0",
    qExpr: "0",
    rExpr: "-2",
    a: "0",
    b: "1",
    n: "20",
    alpha1: "1",
    beta1: "0",
    gamma1: "0",
    alpha2: "1",
    beta2: "0",
    gamma2: "0",
    refExpr: "x*(1-x)",
  },
  {
    name: "Hyperbolic Sinh (y'' - y = 0)",
    pExpr: "0",
    qExpr: "-1",
    rExpr: "0",
    a: "0",
    b: "1",
    n: "30",
    alpha1: "1",
    beta1: "0",
    gamma1: "0",
    alpha2: "1",
    beta2: "0",
    gamma2: "1.17520119",
    refExpr: "sinh(x)",
  },
  {
    name: "Robin/Neumann (y'(0)=2, y(1)=5)",
    pExpr: "0",
    qExpr: "0",
    rExpr: "0",
    a: "0",
    b: "1",
    n: "20",
    alpha1: "0",
    beta1: "1",
    gamma1: "2",
    alpha2: "1",
    beta2: "0",
    gamma2: "5",
    refExpr: "2*x + 3",
  },
];

const DEFAULT_STATE = { ...PRESETS[0] };

export function LinearBVPForm({ onSubmit, isLoading, onReset }) {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const applyPreset = (preset) => {
    setFormData({ ...preset });
    setErrors({});
  };

  const validate = () => {
    const errs = {};

    const aVal = parseFloat(formData.a);
    if (formData.a.trim() === "" || isNaN(aVal) || !isFinite(aVal)) {
      errs.a = "Left boundary coordinate a must be a valid finite number.";
    }

    const bVal = parseFloat(formData.b);
    if (formData.b.trim() === "" || isNaN(bVal) || !isFinite(bVal)) {
      errs.b = "Right boundary coordinate b must be a valid finite number.";
    } else if (!isNaN(aVal) && isFinite(aVal) && bVal <= aVal) {
      errs.b = `Right boundary b (${bVal}) must be strictly greater than a (${aVal}).`;
    }

    const nVal = parseInt(formData.n, 10);
    if (formData.n.trim() === "" || isNaN(nVal) || nVal < 3 || nVal > 2000 || nVal !== parseFloat(formData.n)) {
      errs.n = "Number of subintervals n must be an integer between 3 and 2000.";
    }

    const a1 = parseFloat(formData.alpha1);
    const b1 = parseFloat(formData.beta1);
    const g1 = parseFloat(formData.gamma1);
    if (isNaN(a1) || !isFinite(a1)) errs.alpha1 = "alpha1 must be a finite number.";
    if (isNaN(b1) || !isFinite(b1)) errs.beta1 = "beta1 must be a finite number.";
    if (isNaN(g1) || !isFinite(g1)) errs.gamma1 = "gamma1 must be a finite number.";
    if (!isNaN(a1) && !isNaN(b1) && Math.abs(a1) < 1e-15 && Math.abs(b1) < 1e-15) {
      errs.alpha1 = "At least one of alpha1 or beta1 must be non-zero.";
    }

    const a2 = parseFloat(formData.alpha2);
    const b2 = parseFloat(formData.beta2);
    const g2 = parseFloat(formData.gamma2);
    if (isNaN(a2) || !isFinite(a2)) errs.alpha2 = "alpha2 must be a finite number.";
    if (isNaN(b2) || !isFinite(b2)) errs.beta2 = "beta2 must be a finite number.";
    if (isNaN(g2) || !isFinite(g2)) errs.gamma2 = "gamma2 must be a finite number.";
    if (!isNaN(a2) && !isNaN(b2) && Math.abs(a2) < 1e-15 && Math.abs(b2) < 1e-15) {
      errs.alpha2 = "At least one of alpha2 or beta2 must be non-zero.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      p_expr: normalizeMathExpression(formData.pExpr.trim() || "0"),
      q_expr: normalizeMathExpression(formData.qExpr.trim() || "0"),
      r_expr: normalizeMathExpression(formData.rExpr.trim() || "0"),
      a: parseFloat(formData.a),
      b: parseFloat(formData.b),
      n: parseInt(formData.n, 10),
      alpha1: parseFloat(formData.alpha1),
      beta1: parseFloat(formData.beta1),
      gamma1: parseFloat(formData.gamma1),
      alpha2: parseFloat(formData.alpha2),
      beta2: parseFloat(formData.beta2),
      gamma2: parseFloat(formData.gamma2),
    };

    if (formData.refExpr && formData.refExpr.trim() !== "") {
      payload.reference_solution_expr = normalizeMathExpression(formData.refExpr.trim());
    }

    onSubmit(payload);
  };

  const handleReset = () => {
    setFormData(DEFAULT_STATE);
    setErrors({});
    if (onReset) onReset();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Preset Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Quick Problem Presets:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
              onClick={() => applyPreset(p)}
              disabled={isLoading}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Governing Equation Info */}
      <div
        style={{
          padding: "0.6rem 0.75rem",
          backgroundColor: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "6px",
          fontSize: "0.8rem",
          color: "#94a3b8",
          fontFamily: "var(--mono)",
        }}
      >
        ODE: <span style={{ color: "#38bdf8" }}>y'' + p(x)y' + q(x)y = r(x)</span> on [a, b]
      </div>

      {/* Coefficient Functions p(x), q(x), r(x) */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="bvp-p">
            p(x) [Coefficient of y']
          </label>
          <input
            id="bvp-p"
            type="text"
            className="form-input"
            value={formData.pExpr}
            onChange={(e) => handleChange("pExpr", e.target.value)}
            placeholder="e.g. 0, -2*x, 1/x"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bvp-q">
            q(x) [Coefficient of y]
          </label>
          <input
            id="bvp-q"
            type="text"
            className="form-input"
            value={formData.qExpr}
            onChange={(e) => handleChange("qExpr", e.target.value)}
            placeholder="e.g. 0, -1, 4"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bvp-r">
            r(x) [RHS Source] <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="bvp-r"
            type="text"
            className="form-input"
            value={formData.rExpr}
            onChange={(e) => handleChange("rExpr", e.target.value)}
            placeholder="e.g. -2, 0, sin(x)"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Domain [a, b] and Discretization n */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="bvp-a">
            Left Bound (a) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="bvp-a"
            type="number"
            step="any"
            className={`form-input ${errors.a ? "has-error" : ""}`}
            value={formData.a}
            onChange={(e) => handleChange("a", e.target.value)}
            disabled={isLoading}
          />
          {errors.a && <div className="form-error-text">{errors.a}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bvp-b">
            Right Bound (b) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="bvp-b"
            type="number"
            step="any"
            className={`form-input ${errors.b ? "has-error" : ""}`}
            value={formData.b}
            onChange={(e) => handleChange("b", e.target.value)}
            disabled={isLoading}
          />
          {errors.b && <div className="form-error-text">{errors.b}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bvp-n">
            Subintervals (n) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="bvp-n"
            type="number"
            min="3"
            max="2000"
            className={`form-input ${errors.n ? "has-error" : ""}`}
            value={formData.n}
            onChange={(e) => handleChange("n", e.target.value)}
            disabled={isLoading}
          />
          {errors.n && <div className="form-error-text">{errors.n}</div>}
        </div>
      </div>

      {/* Left Boundary Condition: alpha1*y(a) + beta1*y'(a) = gamma1 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 600 }}>
          Left Boundary Condition: <span style={{ color: "#38bdf8", fontFamily: "var(--mono)" }}>α₁·y(a) + β₁·y'(a) = γ₁</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="bvp-a1">α₁ (Coeff y)</label>
            <input
              id="bvp-a1"
              type="number"
              step="any"
              className={`form-input ${errors.alpha1 ? "has-error" : ""}`}
              value={formData.alpha1}
              onChange={(e) => handleChange("alpha1", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bvp-b1">β₁ (Coeff y')</label>
            <input
              id="bvp-b1"
              type="number"
              step="any"
              className={`form-input ${errors.beta1 ? "has-error" : ""}`}
              value={formData.beta1}
              onChange={(e) => handleChange("beta1", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bvp-g1">γ₁ (RHS Val)</label>
            <input
              id="bvp-g1"
              type="number"
              step="any"
              className={`form-input ${errors.gamma1 ? "has-error" : ""}`}
              value={formData.gamma1}
              onChange={(e) => handleChange("gamma1", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        {errors.alpha1 && <div className="form-error-text">{errors.alpha1}</div>}
      </div>

      {/* Right Boundary Condition: alpha2*y(b) + beta2*y'(b) = gamma2 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 600 }}>
          Right Boundary Condition: <span style={{ color: "#38bdf8", fontFamily: "var(--mono)" }}>α₂·y(b) + β₂·y'(b) = γ₂</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="bvp-a2">α₂ (Coeff y)</label>
            <input
              id="bvp-a2"
              type="number"
              step="any"
              className={`form-input ${errors.alpha2 ? "has-error" : ""}`}
              value={formData.alpha2}
              onChange={(e) => handleChange("alpha2", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bvp-b2">β₂ (Coeff y')</label>
            <input
              id="bvp-b2"
              type="number"
              step="any"
              className={`form-input ${errors.beta2 ? "has-error" : ""}`}
              value={formData.beta2}
              onChange={(e) => handleChange("beta2", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bvp-g2">γ₂ (RHS Val)</label>
            <input
              id="bvp-g2"
              type="number"
              step="any"
              className={`form-input ${errors.gamma2 ? "has-error" : ""}`}
              value={formData.gamma2}
              onChange={(e) => handleChange("gamma2", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        {errors.alpha2 && <div className="form-error-text">{errors.alpha2}</div>}
      </div>

      {/* Optional Analytical Reference Solution */}
      <div className="form-group">
        <label className="form-label" htmlFor="bvp-ref">
          Exact Analytical Reference Solution y(x) (Optional)
        </label>
        <input
          id="bvp-ref"
          type="text"
          className="form-input"
          value={formData.refExpr}
          onChange={(e) => handleChange("refExpr", e.target.value)}
          placeholder="e.g. x*(1-x), sinh(x)"
          disabled={isLoading}
        />
        <div className="form-hint">Enables exact pointwise benchmark comparison and error metrics</div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Solving Linear BVP..." : "Solve Linear BVP →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default LinearBVPForm;
