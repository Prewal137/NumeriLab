import { useState } from "react";
import { normalizeMathExpression } from "../../../utils/mathUtils";

const DEFAULT_STATE = {
  func: "sin(x)",
  a: "0",
  b: "3.141592653589793",
  maxLevels: "5",
  tolerance: "0.00000001",
  referenceValue: "2.0",
};

export function RombergForm({ onSubmit, isLoading, onReset }) {
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
      errs.func = "Integrand function f(x) is required.";
    }

    const aVal = parseFloat(formData.a);
    if (formData.a.trim() === "" || isNaN(aVal) || !isFinite(aVal)) {
      errs.a = "Lower limit a must be a valid finite number.";
    }

    const bVal = parseFloat(formData.b);
    if (formData.b.trim() === "" || isNaN(bVal) || !isFinite(bVal)) {
      errs.b = "Upper limit b must be a valid finite number.";
    } else if (!isNaN(aVal) && isFinite(aVal) && bVal <= aVal) {
      errs.b = `Upper limit b (${bVal}) must be strictly greater than lower limit a (${aVal}).`;
    }

    const maxLevVal = parseInt(formData.maxLevels, 10);
    if (formData.maxLevels.trim() === "" || isNaN(maxLevVal) || maxLevVal < 1 || maxLevVal > 12) {
      errs.maxLevels = "Max extrapolation levels must be an integer between 1 and 12.";
    }

    const tolVal = parseFloat(formData.tolerance);
    if (formData.tolerance.trim() === "" || isNaN(tolVal) || tolVal <= 0) {
      errs.tolerance = "Convergence tolerance must be a positive number.";
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
      a: parseFloat(formData.a),
      b: parseFloat(formData.b),
      max_levels: parseInt(formData.maxLevels, 10),
      tolerance: parseFloat(formData.tolerance),
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
        <label className="form-label" htmlFor="rom-func">
          Integrand Function f(x) <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="rom-func"
          type="text"
          className={`form-input ${errors.func ? "has-error" : ""}`}
          value={formData.func}
          onChange={(e) => handleChange("func", e.target.value)}
          placeholder="e.g. sin(x), exp(-x**2), 1/(1 + x**2)"
          disabled={isLoading}
        />
        {errors.func ? (
          <div className="form-error-text">{errors.func}</div>
        ) : (
          <div className="form-hint">Accelerates trapezoidal estimates via Richardson extrapolation</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="rom-a">
            Lower Limit (a) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="rom-a"
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
          <label className="form-label" htmlFor="rom-b">
            Upper Limit (b) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="rom-b"
            type="number"
            step="any"
            className={`form-input ${errors.b ? "has-error" : ""}`}
            value={formData.b}
            onChange={(e) => handleChange("b", e.target.value)}
            disabled={isLoading}
          />
          {errors.b && <div className="form-error-text">{errors.b}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="rom-levels">
            Max Levels (1 to 12) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="rom-levels"
            type="number"
            min="1"
            max="12"
            className={`form-input ${errors.maxLevels ? "has-error" : ""}`}
            value={formData.maxLevels}
            onChange={(e) => handleChange("maxLevels", e.target.value)}
            disabled={isLoading}
          />
          {errors.maxLevels && <div className="form-error-text">{errors.maxLevels}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="rom-tol">
            Convergence Tolerance (ε) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="rom-tol"
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

      <div className="form-group">
        <label className="form-label" htmlFor="rom-ref">
          Reference Integral Value (Optional)
        </label>
        <input
          id="rom-ref"
          type="number"
          step="any"
          className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
          value={formData.referenceValue}
          onChange={(e) => handleChange("referenceValue", e.target.value)}
          placeholder="Exact analytical benchmark"
          disabled={isLoading}
        />
        {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Extrapolating..." : "Compute Romberg Tableau →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default RombergForm;
