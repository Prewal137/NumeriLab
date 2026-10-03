/**
 * Lagrange Inverse Interpolation Form Component.
 * Estimates independent variable x corresponding to target y.
 */

import { useState } from "react";
import { DataPointEditor } from "../DataPointEditor";

const DEFAULT_POINTS = [
  { x: "1", y: "1" },
  { x: "2", y: "4" },
  { x: "3", y: "9" },
  { x: "4", y: "16" },
];

const DEFAULT_STATE = {
  points: DEFAULT_POINTS,
  targetY: "6.25",
  referenceValue: "2.5",
};

export function InverseLagrangeForm({ onSubmit, isLoading, onReset }) {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [errors, setErrors] = useState({});

  const handlePointsChange = (newPoints) => {
    setFormData((prev) => ({ ...prev, points: newPoints }));
    if (errors.points) {
      setErrors((prev) => ({ ...prev, points: null }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};

    // Validate points
    if (!formData.points || formData.points.length < 2) {
      errs.points = "At least 2 data points are required for inverse interpolation.";
    } else {
      const ySet = new Set();
      let hasEmptyOrInvalid = false;
      let hasDuplicateY = false;

      for (let i = 0; i < formData.points.length; i++) {
        const p = formData.points[i];
        if (p.x === "" || p.y === "" || isNaN(parseFloat(p.x)) || isNaN(parseFloat(p.y))) {
          hasEmptyOrInvalid = true;
          break;
        }
        const yNum = parseFloat(p.y);
        if (ySet.has(yNum)) {
          hasDuplicateY = true;
          break;
        }
        ySet.add(yNum);
      }

      if (hasEmptyOrInvalid) {
        errs.points = "All data point coordinates (x and y) must be valid numbers.";
      } else if (hasDuplicateY) {
        errs.points = "Duplicate y-coordinates detected. Inverse interpolation requires distinct y-values.";
      }
    }

    // Validate target_y
    if (formData.targetY.trim() === "" || isNaN(parseFloat(formData.targetY))) {
      errs.targetY = "Target dependent value y must be a valid number.";
    }

    // Validate optional reference_value
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
      x_points: formData.points.map((p) => parseFloat(p.x)),
      y_points: formData.points.map((p) => parseFloat(p.y)),
      target_y: parseFloat(formData.targetY),
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
      {/* Reusable Data Point Editor */}
      <DataPointEditor
        points={formData.points}
        onChange={handlePointsChange}
        minPoints={2}
        disabled={isLoading}
        xLabel="x_i"
        yLabel="y_i (distinct)"
        title="Known Coordinate Pairs"
        error={errors.points}
      />

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="inv-target-y">
            Target Value (y) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="inv-target-y"
            type="number"
            step="any"
            className={`form-input ${errors.targetY ? "has-error" : ""}`}
            value={formData.targetY}
            onChange={(e) => handleChange("targetY", e.target.value)}
            placeholder="e.g. 6.25"
            disabled={isLoading}
          />
          {errors.targetY && <div className="form-error-text">{errors.targetY}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="inv-ref-val">
            Exact Reference x (Optional)
          </label>
          <input
            id="inv-ref-val"
            type="number"
            step="any"
            className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
            value={formData.referenceValue}
            onChange={(e) => handleChange("referenceValue", e.target.value)}
            placeholder="Benchmark value x(y)"
            disabled={isLoading}
          />
          {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Estimating..." : "Estimate Inverse Point x(y) →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default InverseLagrangeForm;
