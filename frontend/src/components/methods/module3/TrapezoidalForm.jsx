import { useState } from "react";
import { normalizeMathExpression } from "../../../utils/mathUtils";

const DEFAULT_STATE = {
  func: "sin(x)",
  a: "0",
  b: "3.141592653589793",
  n: "10",
  referenceValue: "2.0",
};

export function TrapezoidalForm({ onSubmit, isLoading, onReset }) {
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

    const nVal = parseInt(formData.n, 10);
    if (formData.n.trim() === "" || isNaN(nVal) || nVal < 1 || nVal !== parseFloat(formData.n)) {
      errs.n = "Number of subintervals n must be a positive integer (n >= 1).";
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
      n: parseInt(formData.n, 10),
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
        <label className="form-label" htmlFor="trap-func">
          Integrand Function f(x) <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          id="trap-func"
          type="text"
          className={`form-input ${errors.func ? "has-error" : ""}`}
          value={formData.func}
          onChange={(e) => handleChange("func", e.target.value)}
          placeholder="e.g. sin(x), x**2, exp(-x**2)"
          disabled={isLoading}
        />
        {errors.func ? (
          <div className="form-error-text">{errors.func}</div>
        ) : (
          <div className="form-hint">Evaluates ∫ [a, b] f(x) dx via composite trapezoids</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="trap-a">
            Lower Limit (a) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="trap-a"
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
          <label className="form-label" htmlFor="trap-b">
            Upper Limit (b) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="trap-b"
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
          <label className="form-label" htmlFor="trap-n">
            Subintervals (n) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="trap-n"
            type="number"
            min="1"
            max="100000"
            className={`form-input ${errors.n ? "has-error" : ""}`}
            value={formData.n}
            onChange={(e) => handleChange("n", e.target.value)}
            disabled={isLoading}
          />
          {errors.n && <div className="form-error-text">{errors.n}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="trap-ref">
            Reference Integral Value (Optional)
          </label>
          <input
            id="trap-ref"
            type="number"
            step="any"
            className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
            value={formData.referenceValue}
            onChange={(e) => handleChange("referenceValue", e.target.value)}
            placeholder="Analytical benchmark"
            disabled={isLoading}
          />
          {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Integrating..." : "Compute Trapezoidal Integral →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default TrapezoidalForm;
