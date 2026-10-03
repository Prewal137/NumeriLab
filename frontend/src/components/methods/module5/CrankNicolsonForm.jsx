import { useState } from "react";
import { normalizeMathExpression } from "../../../utils/mathUtils";

const PRESETS = [
  {
    name: "Sine Mode Benchmark (α=1)",
    alpha: "1.0",
    xMin: "0.0",
    xMax: "1.0",
    tStart: "0.0",
    tEnd: "0.05",
    nx: "21",
    nt: "51",
    u0Expr: "sin(pi*x)",
    leftExpr: "0.0",
    rightExpr: "0.0",
    refExpr: "exp(-pi**2 * t) * sin(pi*x)",
  },
  {
    name: "Parabolic Initial Pulse (α=0.5)",
    alpha: "0.5",
    xMin: "0.0",
    xMax: "2.0",
    tStart: "0.0",
    tEnd: "0.2",
    nx: "21",
    nt: "41",
    u0Expr: "x * (2 - x)",
    leftExpr: "0.0",
    rightExpr: "0.0",
    refExpr: "",
  },
  {
    name: "Fast Verification (nx=11, nt=21)",
    alpha: "1.0",
    xMin: "0.0",
    xMax: "1.0",
    tStart: "0.0",
    tEnd: "0.1",
    nx: "11",
    nt: "21",
    u0Expr: "sin(pi*x)",
    leftExpr: "0.0",
    rightExpr: "0.0",
    refExpr: "exp(-pi**2 * t) * sin(pi*x)",
  },
];

const DEFAULT_STATE = { ...PRESETS[0] };

export function CrankNicolsonForm({ onSubmit, isLoading, onReset }) {
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

    const alphaVal = parseFloat(formData.alpha);
    if (formData.alpha.trim() === "" || isNaN(alphaVal) || !isFinite(alphaVal) || alphaVal <= 0) {
      errs.alpha = "Thermal diffusivity α must be a strictly positive finite number (α > 0).";
    }

    const xMinVal = parseFloat(formData.xMin);
    const xMaxVal = parseFloat(formData.xMax);
    if (formData.xMin.trim() === "" || isNaN(xMinVal) || !isFinite(xMinVal)) {
      errs.xMin = "x_min must be a finite number.";
    }
    if (formData.xMax.trim() === "" || isNaN(xMaxVal) || !isFinite(xMaxVal)) {
      errs.xMax = "x_max must be a finite number.";
    } else if (!isNaN(xMinVal) && isFinite(xMinVal) && xMaxVal <= xMinVal) {
      errs.xMax = `x_max (${xMaxVal}) must be strictly greater than x_min (${xMinVal}).`;
    }

    const tStartVal = parseFloat(formData.tStart);
    const tEndVal = parseFloat(formData.tEnd);
    if (formData.tStart.trim() === "" || isNaN(tStartVal) || !isFinite(tStartVal)) {
      errs.tStart = "t_start must be a finite number.";
    }
    if (formData.tEnd.trim() === "" || isNaN(tEndVal) || !isFinite(tEndVal)) {
      errs.tEnd = "t_end must be a finite number.";
    } else if (!isNaN(tStartVal) && isFinite(tStartVal) && tEndVal <= tStartVal) {
      errs.tEnd = `t_end (${tEndVal}) must be strictly greater than t_start (${tStartVal}).`;
    }

    const nxVal = parseInt(formData.nx, 10);
    if (formData.nx.trim() === "" || isNaN(nxVal) || nxVal < 3 || nxVal > 500 || nxVal !== parseFloat(formData.nx)) {
      errs.nx = "Spatial resolution nx must be an integer between 3 and 500.";
    }

    const ntVal = parseInt(formData.nt, 10);
    if (formData.nt.trim() === "" || isNaN(ntVal) || ntVal < 2 || ntVal > 2000 || ntVal !== parseFloat(formData.nt)) {
      errs.nt = "Temporal resolution nt must be an integer between 2 and 2000.";
    }

    if (!isNaN(nxVal) && !isNaN(ntVal) && nxVal * ntVal > 200000) {
      errs.nx = `Total space-time grid points (${nxVal * ntVal}) exceeds safety limit of 200,000.`;
    }

    if (!formData.u0Expr.trim()) {
      errs.u0Expr = "Initial condition u0(x) is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const parseBoundaryExpr = (val) => {
    const trimmed = String(val).trim();
    const num = parseFloat(trimmed);
    if (!isNaN(num) && isFinite(num) && String(num) === trimmed) {
      return num;
    }
    return normalizeMathExpression(trimmed);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      alpha: parseFloat(formData.alpha),
      x_min: parseFloat(formData.xMin),
      x_max: parseFloat(formData.xMax),
      t_start: parseFloat(formData.tStart),
      t_end: parseFloat(formData.tEnd),
      nx: parseInt(formData.nx, 10),
      nt: parseInt(formData.nt, 10),
      u0_expr: normalizeMathExpression(formData.u0Expr.trim()),
      left_expr: parseBoundaryExpr(formData.leftExpr),
      right_expr: parseBoundaryExpr(formData.rightExpr),
    };

    if (formData.refExpr && formData.refExpr.trim() !== "") {
      payload.reference_expr = normalizeMathExpression(formData.refExpr.trim());
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
        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Problem Presets:</div>
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
        PDE: <span style={{ color: "#38bdf8" }}>∂u/∂t = α·(∂²u/∂x²)</span> (Crank-Nicolson Scheme)
      </div>

      {/* Thermal Diffusivity & Initial Condition */}
      <div className="form-row">
        <div className="form-group" style={{ flex: "0 0 130px" }}>
          <label className="form-label" htmlFor="cn-alpha">
            Diffusivity (α) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="cn-alpha"
            type="number"
            step="any"
            min="0.00001"
            className={`form-input ${errors.alpha ? "has-error" : ""}`}
            value={formData.alpha}
            onChange={(e) => handleChange("alpha", e.target.value)}
            disabled={isLoading}
          />
          {errors.alpha && <div className="form-error-text">{errors.alpha}</div>}
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" htmlFor="cn-u0">
            Initial Profile u(x, 0) = u₀(x) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="cn-u0"
            type="text"
            className={`form-input ${errors.u0Expr ? "has-error" : ""}`}
            value={formData.u0Expr}
            onChange={(e) => handleChange("u0Expr", e.target.value)}
            placeholder="e.g. sin(pi*x), x*(1-x)"
            disabled={isLoading}
          />
          {errors.u0Expr && <div className="form-error-text">{errors.u0Expr}</div>}
        </div>
      </div>

      {/* Spatial Domain and Resolution */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="cn-xmin">x_min <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="cn-xmin"
            type="number"
            step="any"
            className={`form-input ${errors.xMin ? "has-error" : ""}`}
            value={formData.xMin}
            onChange={(e) => handleChange("xMin", e.target.value)}
            disabled={isLoading}
          />
          {errors.xMin && <div className="form-error-text">{errors.xMin}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cn-xmax">x_max <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="cn-xmax"
            type="number"
            step="any"
            className={`form-input ${errors.xMax ? "has-error" : ""}`}
            value={formData.xMax}
            onChange={(e) => handleChange("xMax", e.target.value)}
            disabled={isLoading}
          />
          {errors.xMax && <div className="form-error-text">{errors.xMax}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cn-nx">Grid Nodes (n_x) <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="cn-nx"
            type="number"
            min="3"
            max="500"
            className={`form-input ${errors.nx ? "has-error" : ""}`}
            value={formData.nx}
            onChange={(e) => handleChange("nx", e.target.value)}
            disabled={isLoading}
          />
          {errors.nx && <div className="form-error-text">{errors.nx}</div>}
        </div>
      </div>

      {/* Time Domain and Resolution */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="cn-tstart">t_start <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="cn-tstart"
            type="number"
            step="any"
            className={`form-input ${errors.tStart ? "has-error" : ""}`}
            value={formData.tStart}
            onChange={(e) => handleChange("tStart", e.target.value)}
            disabled={isLoading}
          />
          {errors.tStart && <div className="form-error-text">{errors.tStart}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cn-tend">t_end <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="cn-tend"
            type="number"
            step="any"
            className={`form-input ${errors.tEnd ? "has-error" : ""}`}
            value={formData.tEnd}
            onChange={(e) => handleChange("tEnd", e.target.value)}
            disabled={isLoading}
          />
          {errors.tEnd && <div className="form-error-text">{errors.tEnd}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cn-nt">Time Steps (n_t) <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="cn-nt"
            type="number"
            min="2"
            max="2000"
            className={`form-input ${errors.nt ? "has-error" : ""}`}
            value={formData.nt}
            onChange={(e) => handleChange("nt", e.target.value)}
            disabled={isLoading}
          />
          {errors.nt && <div className="form-error-text">{errors.nt}</div>}
        </div>
      </div>

      {/* Boundary Conditions */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="cn-left">Left Boundary u(x_min, t)</label>
          <input
            id="cn-left"
            type="text"
            className="form-input"
            value={formData.leftExpr}
            onChange={(e) => handleChange("leftExpr", e.target.value)}
            placeholder="e.g. 0, exp(-t)"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cn-right">Right Boundary u(x_max, t)</label>
          <input
            id="cn-right"
            type="text"
            className="form-input"
            value={formData.rightExpr}
            onChange={(e) => handleChange("rightExpr", e.target.value)}
            placeholder="e.g. 0, 1"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Optional Analytical Reference Solution */}
      <div className="form-group">
        <label className="form-label" htmlFor="cn-ref">
          Exact Analytical Reference Solution u(x, t) (Optional)
        </label>
        <input
          id="cn-ref"
          type="text"
          className="form-input"
          value={formData.refExpr}
          onChange={(e) => handleChange("refExpr", e.target.value)}
          placeholder="e.g. exp(-pi**2 * t) * sin(pi*x)"
          disabled={isLoading}
        />
        <div className="form-hint">Enables pointwise error calculation against the benchmark at t = t_end</div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Stepping Crank-Nicolson..." : "Solve via Crank-Nicolson Scheme →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default CrankNicolsonForm;
