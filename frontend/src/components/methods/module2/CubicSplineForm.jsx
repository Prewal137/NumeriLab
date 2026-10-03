/**
 * Natural Cubic Spline Form Component.
 * Constructs piecewise cubic polynomials with C2 continuity across data knots.
 */

import { useState } from "react";
import { DataPointEditor } from "../DataPointEditor";

const DEFAULT_POINTS = [
  { x: "0", y: "1" },
  { x: "1", y: "2" },
  { x: "2", y: "1" },
  { x: "3", y: "3" },
];

const DEFAULT_STATE = {
  points: DEFAULT_POINTS,
  targetX: "1.5",
  referenceValue: "",
};

export function CubicSplineForm({ onSubmit, isLoading, onReset }) {
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

    // Validate points (at least 3 knots)
    let minX = Infinity;
    let maxX = -Infinity;

    if (!formData.points || formData.points.length < 3) {
      errs.points = "Natural cubic spline requires at least 3 distinct knot points.";
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
        if (xNum < minX) minX = xNum;
        if (xNum > maxX) maxX = xNum;
      }

      if (hasEmptyOrInvalid) {
        errs.points = "All knot coordinates (x and y) must be valid numbers.";
      } else if (hasDuplicateX) {
        errs.points = "Duplicate knot x-coordinates detected. All knot x-values must be strictly distinct.";
      }
    }

    // Validate target_x
    if (formData.targetX.trim() === "" || isNaN(parseFloat(formData.targetX))) {
      errs.targetX = "Target evaluation coordinate x must be a valid number.";
    } else if (minX !== Infinity && maxX !== -Infinity) {
      const tx = parseFloat(formData.targetX);
      if (tx < minX || tx > maxX) {
        errs.targetX = `Target x (${tx}) must lie inside knot domain [${minX}, ${maxX}] (extrapolation not permitted for splines).`;
      }
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
        minPoints={3}
        disabled={isLoading}
        xLabel="x_i"
        yLabel="y_i"
        title="Spline Knots (x_i, y_i)"
        error={errors.points}
      />

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="spline-target-x">
            Target Evaluation Point (x) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="spline-target-x"
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
          <label className="form-label" htmlFor="spline-ref-val">
            Exact Reference S(x) (Optional)
          </label>
          <input
            id="spline-ref-val"
            type="number"
            step="any"
            className={`form-input ${errors.referenceValue ? "has-error" : ""}`}
            value={formData.referenceValue}
            onChange={(e) => handleChange("referenceValue", e.target.value)}
            placeholder="Benchmark value S(x)"
            disabled={isLoading}
          />
          {errors.referenceValue && <div className="form-error-text">{errors.referenceValue}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Constructing Spline..." : "Construct Natural Cubic Spline →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default CubicSplineForm;
