import { useState } from "react";
import { normalizeMathExpression } from "../../../utils/mathUtils";

const DEFAULT_STATE = {
  func: "y",
  x0: "0",
  y0: "1",
  xEnd: "1",
  h: "0.1",
  referenceValue: "2.71828183",
};

export function ModifiedEulerForm({ onSubmit, isLoading, onReset }) {
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
      errs.func = "ODE derivative function f(x, y) is required.";
    }

    const x0Val = parseFloat(formData.x0);
    if (formData.x0.trim() === "" || isNaN(x0Val) || !isFinite(x0Val)) {
      errs.x0 = "Initial x₀ must be a valid finite number.";
    }

    const y0Val = parseFloat(formData.y0);
    if (formData.y0.trim() === "" || isNaN(y0Val) || !isFinite(y0Val)) {
      errs.y0 = "Initial condition y₀ = y(x₀) must be a valid finite number.";
    }

    const xEndVal = parseFloat(formData.xEnd);
    if (formData.xEnd.trim() === "" || isNaN(xEndVal) || !isFinite(xEndVal)) {
      errs.xEnd = "Target endpoint x_end must be a valid finite number.";
    } else if (!isNaN(x0Val) && isFinite(x0Val) && xEndVal <= x0Val) {
      errs.xEnd = `Target endpoint x_end (${xEndVal}) must be strictly greater than x₀ (${x0Val}).`;
    }

    const hVal = parseFloat(formData.h);
    if (formData.h.trim() === "" || isNaN(hVal) || !isFinite(hVal) || hVal <= 0) {
      errs.h = "Step size h must be a strictly positive finite number (h > 0).";
    }

    if (formData.referenceValue.trim() !== "") {
      const refVal = parseFloat(formData.referenceValue);
      if (isNaN(refVal) || !isFinite(refVal)) {
        errs.referenceValue = "Reference value must be a finite number if specified.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      function: normalizeMathExpression(formData.func.trim()),
      x0: parseFloat(formData.x0),
      y0: parseFloat(formData.y0),
      x_end: parseFloat(formData.xEnd),
      h: parseFloat(formData.h),
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
        <label className="form-label" htmlFor="modeuler-func">
          Derivative Function dy/dx = f(x, y) <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="modeuler-func"
          type="text"
          className={`form-input ${errors.func ? "has-error" : ""}`}
          value={formData.func}
          onChange={(e) => handleChange("func", e.target.value)}
          placeholder="e.g. y, x + y, x^2 + y, y - x**2 + 1"
          disabled={isLoading}
        />
        {errors.func ? (
          <div className="form-error-text">{errors.func}</div>
        ) : (
          <div className="form-hint">
            Predictor: y*_(n+1) = y_n + h·f(x_n, y_n) | Corrector: y_(n+1) = y_n + (h/2)[f_n + f(x_(n+1), y*_(n+1))]
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="modeuler-x0">
            Initial Point (x₀) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="modeuler-x0"
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
          <label className="form-label" htmlFor="modeuler-y0">
            Initial Value y(x₀) = y₀ <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="modeuler-y0"
            type="number"
            step="any"
            className={`form-input ${errors.y0 ? "has-error" : ""}`}
            value={formData.y0}
            onChange={(e) => handleChange("y0", e.target.value)}
            disabled={isLoading}
          />
          {errors.y0 && <div className="form-error-text">{errors.y0}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="modeuler-xend">
            Final Point (x_end) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="modeuler-xend"
            type="number"
            step="any"
            className={`form-input ${errors.xEnd ? "has-error" : ""}`}
            value={formData.xEnd}
            onChange={(e) => handleChange("xEnd", e.target.value)}
            disabled={isLoading}
          />
          {errors.xEnd && <div className="form-error-text">{errors.xEnd}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="modeuler-h">
            Step Size (h) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="modeuler-h"
            type="number"
            step="any"
            min="0.000001"
            className={`form-input ${errors.h ? "has-error" : ""}`}
            value={formData.h}
            onChange={(e) => handleChange("h", e.target.value)}
            disabled={isLoading}
          />
          {errors.h && <div className="form-error-text">{errors.h}</div>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="modeuler-ref">
          Reference / Analytical Exact Value y(x_end) (Optional)
        </label>
        <input
          id="modeuler-ref"
          type="number"
          step="any"
          className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
          value={formData.referenceValue}
          onChange={(e) => handleChange("referenceValue", e.target.value)}
          placeholder="e.g. 2.71828183 for dy/dx = y"
          disabled={isLoading}
        />
        {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Stepping Heun's Method..." : "Solve via Modified Euler →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default ModifiedEulerForm;
