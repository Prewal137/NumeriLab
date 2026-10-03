/**
 * Fixed Point Iteration Form Component.
 * Solves equations of the form x = g(x).
 */

import { useState } from "react";

const DEFAULT_STATE = {
  func: "cos(x)",
  x0: "0.5",
  tolerance: "0.000001",
  maxIterations: "100",
  referenceValue: "",
};

export function FixedPointForm({ onSubmit, isLoading, onReset }) {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.func.trim()) {
      errs.func = "Function expression g(x) is required.";
    }

    const x0Val = parseFloat(formData.x0);
    if (formData.x0.trim() === "" || isNaN(x0Val) || !isFinite(x0Val)) {
      errs.x0 = "Initial guess x0 must be a valid finite number.";
    }

    const tolVal = parseFloat(formData.tolerance);
    if (formData.tolerance.trim() === "" || isNaN(tolVal) || tolVal <= 0) {
      errs.tolerance = "Tolerance must be a positive number.";
    }

    const maxIterVal = parseInt(formData.maxIterations, 10);
    if (formData.maxIterations.trim() === "" || isNaN(maxIterVal) || maxIterVal < 1) {
      errs.maxIterations = "Maximum iterations must be an integer >= 1.";
    }

    if (formData.referenceValue.trim() !== "") {
      const refVal = parseFloat(formData.referenceValue);
      if (isNaN(refVal) || !isFinite(refVal)) {
        errs.referenceValue = "Reference value must be a finite number if provided.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      function: formData.func.trim(),
      x0: parseFloat(formData.x0),
      tolerance: parseFloat(formData.tolerance),
      max_iterations: parseInt(formData.maxIterations, 10),
    };

    if (formData.referenceValue.trim() !== "") {
      payload.reference_value = parseFloat(formData.referenceValue);
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
      <div className="form-group">
        <label className="form-label" htmlFor="fp-func">
          Iteration Function g(x) <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="fp-func"
          type="text"
          className={`form-input ${errors.func ? "has-error" : ""}`}
          value={formData.func}
          onChange={(e) => handleChange("func", e.target.value)}
          placeholder="e.g. cos(x), (x + 2/x) / 2"
          disabled={isLoading}
        />
        {errors.func ? (
          <div className="form-error-text">{errors.func}</div>
        ) : (
          <div className="form-hint">Formulated for iteration: x_(k+1) = g(x_k)</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="fp-x0">
            Initial Guess x0 <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="fp-x0"
            type="number"
            step="any"
            className={`form-input ${errors.x0 ? "has-error" : ""}`}
            value={formData.x0}
            onChange={(e) => handleChange("x0", e.target.value)}
            disabled={isLoading}
          />
          {errors.x0 && <div className="form-error-text">{errors.x0}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fp-tol">
            Tolerance (ε) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="fp-tol"
            type="number"
            step="any"
            className={`form-input ${errors.tolerance ? "has-error" : ""}`}
            value={formData.tolerance}
            onChange={(e) => handleChange("tolerance", e.target.value)}
            disabled={isLoading}
          />
          {errors.tolerance && <div className="form-error-text">{errors.tolerance}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="fp-maxiter">
            Max Iterations <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="fp-maxiter"
            type="number"
            min="1"
            max="10000"
            className={`form-input ${errors.maxIterations ? "has-error" : ""}`}
            value={formData.maxIterations}
            onChange={(e) => handleChange("maxIterations", e.target.value)}
            disabled={isLoading}
          />
          {errors.maxIterations && <div className="form-error-text">{errors.maxIterations}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fp-ref">
            Reference Value (Optional)
          </label>
          <input
            id="fp-ref"
            type="number"
            step="any"
            className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
            value={formData.referenceValue}
            onChange={(e) => handleChange("referenceValue", e.target.value)}
            placeholder="Exact root benchmark"
            disabled={isLoading}
          />
          {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Computing..." : "Compute & Solve →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default FixedPointForm;
