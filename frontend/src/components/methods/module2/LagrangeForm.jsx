/**
 * Lagrange Interpolation Form Component.
 * Constructs unique polynomial P(x) passing through given data points.
 */

import { useState } from "react";
import { DataPointEditor } from "../DataPointEditor";

const DEFAULT_POINTS = [
  { x: "0", y: "1" },
  { x: "1", y: "2" },
  { x: "2", y: "5" },
  { x: "3", y: "10" },
];

const DEFAULT_STATE = {
  points: DEFAULT_POINTS,
  targetX: "1.5",
  referenceValue: "",
};

export function LagrangeForm({ onSubmit, isLoading, onReset }) {
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
      errs.points = "At least 2 data points are required for Lagrange interpolation.";
    } else {
      const xSet = new Set();
      let hasEmptyOrInvalid = false;
      let hasDuplicateX = false;

      for (let i = 0; i < formData.points.length; i++) {
        const p = formData.points[i];
        if (p.x === "" || p.y === "" || isNaN(parseFloat(p.x)) || isNaN(parseFloat(p.y))) {
          hasEmptyOrInvalid = true;
          break;
        }
        const xNum = parseFloat(p.x);
        if (xSet.has(xNum)) {
          hasDuplicateX = true;
          break;
        }
        xSet.add(xNum);
      }

      if (hasEmptyOrInvalid) {
        errs.points = "All data point coordinates (x and y) must be valid numbers.";
      } else if (hasDuplicateX) {
        errs.points = "Duplicate x-coordinates detected. All x-values must be strictly distinct.";
      }
    }

    // Validate target_x
    if (formData.targetX.trim() === "" || isNaN(parseFloat(formData.targetX))) {
      errs.targetX = "Target evaluation point x must be a valid number.";
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
      target_x: parseFloat(formData.targetX),
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
        yLabel="y_i"
        title="Interpolation Data Points"
        error={errors.points}
      />

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="lag-target-x">
            Target Evaluation Point (x) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="lag-target-x"
            type="number"
            step="any"
            className={`form-input ${errors.targetX ? "has-error" : ""}`}
            value={formData.targetX}
            onChange={(e) => handleChange("targetX", e.target.value)}
            placeholder="e.g. 1.5"
            disabled={isLoading}
          />
          {errors.targetX && <div className="form-error-text">{errors.targetX}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lag-ref-val">
            Exact Reference Value (Optional)
          </label>
          <input
            id="lag-ref-val"
            type="number"
            step="any"
            className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
            value={formData.referenceValue}
            onChange={(e) => handleChange("referenceValue", e.target.value)}
            placeholder="Benchmark value P(x)"
            disabled={isLoading}
          />
          {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Interpolating..." : "Compute Lagrange Polynomial →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default LagrangeForm;
