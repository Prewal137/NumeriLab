import { useState } from "react";
import { normalizeMathExpression } from "../../../utils/mathUtils";

const PRESETS = [
  {
    name: "Heated Top Plate (Laplace)",
    pdeType: "laplace",
    sourceExpr: "0",
    xMin: "0",
    xMax: "1",
    yMin: "0",
    yMax: "1",
    nx: "21",
    ny: "21",
    topVal: "100",
    bottomVal: "0",
    leftVal: "0",
    rightVal: "0",
    tolerance: "1e-5",
    maxIterations: "2000",
  },
  {
    name: "Uniform Equilibrium (Laplace)",
    pdeType: "laplace",
    sourceExpr: "0",
    xMin: "0",
    xMax: "1",
    yMin: "0",
    yMax: "1",
    nx: "15",
    ny: "15",
    topVal: "50",
    bottomVal: "50",
    leftVal: "50",
    rightVal: "50",
    tolerance: "1e-6",
    maxIterations: "1000",
  },
  {
    name: "Sinusoidal Source (Poisson)",
    pdeType: "poisson",
    sourceExpr: "-2 * (pi**2) * sin(pi*x) * sin(pi*y)",
    xMin: "0",
    xMax: "1",
    yMin: "0",
    yMax: "1",
    nx: "21",
    ny: "21",
    topVal: "0",
    bottomVal: "0",
    leftVal: "0",
    rightVal: "0",
    tolerance: "1e-5",
    maxIterations: "3000",
  },
];

const DEFAULT_STATE = { ...PRESETS[0] };

export function LaplacePoissonForm({ onSubmit, isLoading, onReset }) {
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

    const yMinVal = parseFloat(formData.yMin);
    const yMaxVal = parseFloat(formData.yMax);
    if (formData.yMin.trim() === "" || isNaN(yMinVal) || !isFinite(yMinVal)) {
      errs.yMin = "y_min must be a finite number.";
    }
    if (formData.yMax.trim() === "" || isNaN(yMaxVal) || !isFinite(yMaxVal)) {
      errs.yMax = "y_max must be a finite number.";
    } else if (!isNaN(yMinVal) && isFinite(yMinVal) && yMaxVal <= yMinVal) {
      errs.yMax = `y_max (${yMaxVal}) must be strictly greater than y_min (${yMinVal}).`;
    }

    const nxVal = parseInt(formData.nx, 10);
    if (formData.nx.trim() === "" || isNaN(nxVal) || nxVal < 3 || nxVal > 100 || nxVal !== parseFloat(formData.nx)) {
      errs.nx = "Grid resolution nx must be an integer between 3 and 100.";
    }

    const nyVal = parseInt(formData.ny, 10);
    if (formData.ny.trim() === "" || isNaN(nyVal) || nyVal < 3 || nyVal > 100 || nyVal !== parseFloat(formData.ny)) {
      errs.ny = "Grid resolution ny must be an integer between 3 and 100.";
    }

    if (!isNaN(nxVal) && !isNaN(nyVal) && nxVal * nyVal > 10000) {
      errs.nx = `Total grid nodes (${nxVal * nyVal}) exceeds safety limit of 10,000.`;
    }

    const tol = parseFloat(formData.tolerance);
    if (formData.tolerance.trim() === "" || isNaN(tol) || !isFinite(tol) || tol <= 0) {
      errs.tolerance = "Convergence tolerance must be a positive finite number.";
    }

    const maxIt = parseInt(formData.maxIterations, 10);
    if (formData.maxIterations.trim() === "" || isNaN(maxIt) || maxIt < 1 || maxIt > 20000 || maxIt !== parseFloat(formData.maxIterations)) {
      errs.maxIterations = "Max iterations must be an integer between 1 and 20000.";
    }

    if (formData.pdeType === "poisson" && !formData.sourceExpr.trim()) {
      errs.sourceExpr = "Source function f(x, y) is required for Poisson equation.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const parseBoundaryVal = (val) => {
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
      pde_type: formData.pdeType,
      source_expr: formData.pdeType === "poisson" ? normalizeMathExpression(formData.sourceExpr.trim()) : "0",
      x_min: parseFloat(formData.xMin),
      x_max: parseFloat(formData.xMax),
      y_min: parseFloat(formData.yMin),
      y_max: parseFloat(formData.yMax),
      nx: parseInt(formData.nx, 10),
      ny: parseInt(formData.ny, 10),
      top_val: parseBoundaryVal(formData.topVal),
      bottom_val: parseBoundaryVal(formData.bottomVal),
      left_val: parseBoundaryVal(formData.leftVal),
      right_val: parseBoundaryVal(formData.rightVal),
      tolerance: parseFloat(formData.tolerance),
      max_iterations: parseInt(formData.maxIterations, 10),
    };

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

      {/* PDE Type Selector */}
      <div className="form-group">
        <label className="form-label">PDE Formulation</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <button
            type="button"
            className={formData.pdeType === "laplace" ? "btn-primary" : "btn-secondary"}
            style={{ padding: "0.5rem" }}
            onClick={() => handleChange("pdeType", "laplace")}
            disabled={isLoading}
          >
            Laplace (∇²u = 0)
          </button>
          <button
            type="button"
            className={formData.pdeType === "poisson" ? "btn-primary" : "btn-secondary"}
            style={{ padding: "0.5rem" }}
            onClick={() => handleChange("pdeType", "poisson")}
            disabled={isLoading}
          >
            Poisson (∇²u = f(x, y))
          </button>
        </div>
      </div>

      {/* Source Function f(x, y) if Poisson */}
      {formData.pdeType === "poisson" && (
        <div className="form-group">
          <label className="form-label" htmlFor="lp-source">
            Source Term f(x, y) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="lp-source"
            type="text"
            className={`form-input ${errors.sourceExpr ? "has-error" : ""}`}
            value={formData.sourceExpr}
            onChange={(e) => handleChange("sourceExpr", e.target.value)}
            placeholder="e.g. -2*(pi**2)*sin(pi*x)*sin(pi*y), x*y, -1"
            disabled={isLoading}
          />
          {errors.sourceExpr && <div className="form-error-text">{errors.sourceExpr}</div>}
        </div>
      )}

      {/* Spatial Domain Bounds */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="lp-xmin">x_min</label>
          <input
            id="lp-xmin"
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
          <label className="form-label" htmlFor="lp-xmax">x_max</label>
          <input
            id="lp-xmax"
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
          <label className="form-label" htmlFor="lp-ymin">y_min</label>
          <input
            id="lp-ymin"
            type="number"
            step="any"
            className={`form-input ${errors.yMin ? "has-error" : ""}`}
            value={formData.yMin}
            onChange={(e) => handleChange("yMin", e.target.value)}
            disabled={isLoading}
          />
          {errors.yMin && <div className="form-error-text">{errors.yMin}</div>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="lp-ymax">y_max</label>
          <input
            id="lp-ymax"
            type="number"
            step="any"
            className={`form-input ${errors.yMax ? "has-error" : ""}`}
            value={formData.yMax}
            onChange={(e) => handleChange("yMax", e.target.value)}
            disabled={isLoading}
          />
          {errors.yMax && <div className="form-error-text">{errors.yMax}</div>}
        </div>
      </div>

      {/* Grid Resolution nx, ny */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="lp-nx">
            Grid Resolution (n_x) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="lp-nx"
            type="number"
            min="3"
            max="100"
            className={`form-input ${errors.nx ? "has-error" : ""}`}
            value={formData.nx}
            onChange={(e) => handleChange("nx", e.target.value)}
            disabled={isLoading}
          />
          {errors.nx && <div className="form-error-text">{errors.nx}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lp-ny">
            Grid Resolution (n_y) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="lp-ny"
            type="number"
            min="3"
            max="100"
            className={`form-input ${errors.ny ? "has-error" : ""}`}
            value={formData.ny}
            onChange={(e) => handleChange("ny", e.target.value)}
            disabled={isLoading}
          />
          {errors.ny && <div className="form-error-text">{errors.ny}</div>}
        </div>
      </div>

      {/* Boundary Conditions (Top, Bottom, Left, Right) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#e2e8f0", fontWeight: 600 }}>
          Dirichlet Boundary Conditions (Scalar or f(x)/g(y)):
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="lp-top">Top u(x, y_max)</label>
            <input
              id="lp-top"
              type="text"
              className="form-input"
              value={formData.topVal}
              onChange={(e) => handleChange("topVal", e.target.value)}
              placeholder="e.g. 100, sin(pi*x)"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lp-bottom">Bottom u(x, y_min)</label>
            <input
              id="lp-bottom"
              type="text"
              className="form-input"
              value={formData.bottomVal}
              onChange={(e) => handleChange("bottomVal", e.target.value)}
              placeholder="e.g. 0, x"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="lp-left">Left u(x_min, y)</label>
            <input
              id="lp-left"
              type="text"
              className="form-input"
              value={formData.leftVal}
              onChange={(e) => handleChange("leftVal", e.target.value)}
              placeholder="e.g. 0, y"
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lp-right">Right u(x_max, y)</label>
            <input
              id="lp-right"
              type="text"
              className="form-input"
              value={formData.rightVal}
              onChange={(e) => handleChange("rightVal", e.target.value)}
              placeholder="e.g. 0, y"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Solver Settings: Tolerance & Max Iterations */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="lp-tol">
            Convergence Tolerance <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="lp-tol"
            type="text"
            className={`form-input ${errors.tolerance ? "has-error" : ""}`}
            value={formData.tolerance}
            onChange={(e) => handleChange("tolerance", e.target.value)}
            placeholder="e.g. 1e-5"
            disabled={isLoading}
          />
          {errors.tolerance && <div className="form-error-text">{errors.tolerance}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lp-maxit">
            Max Iterations <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="lp-maxit"
            type="number"
            min="1"
            max="20000"
            className={`form-input ${errors.maxIterations ? "has-error" : ""}`}
            value={formData.maxIterations}
            onChange={(e) => handleChange("maxIterations", e.target.value)}
            disabled={isLoading}
          />
          {errors.maxIterations && <div className="form-error-text">{errors.maxIterations}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Relaxing Field Grid..." : "Solve via Gauss-Seidel Relaxation →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default LaplacePoissonForm;
