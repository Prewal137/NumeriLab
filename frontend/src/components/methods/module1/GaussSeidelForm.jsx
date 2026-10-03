/**
 * Gauss-Seidel Method Form Component.
 * Solves linear systems of equations Ax = b iteratively.
 */

import { useState } from "react";

const createDefaultSystem = (n) => {
  if (n === 2) {
    return {
      matrix: [
        ["4", "1"],
        ["2", "3"],
      ],
      vector: ["1", "2"],
      initialGuess: ["0", "0"],
      referenceValue: "",
    };
  }
  // Default diagonally dominant system for size n
  const matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? "5" : "1"))
  );
  const vector = Array.from({ length: n }, () => "1");
  const initialGuess = Array.from({ length: n }, () => "0");
  return { matrix, vector, initialGuess, referenceValue: "" };
};

export function GaussSeidelForm({ onSubmit, isLoading, onReset }) {
  const [size, setSize] = useState(2);
  const [system, setSystem] = useState(() => createDefaultSystem(2));
  const [tolerance, setTolerance] = useState("0.000001");
  const [maxIterations, setMaxIterations] = useState("100");
  const [errors, setErrors] = useState({});

  const handleSizeChange = (newSize) => {
    if (newSize < 2 || newSize > 6) return;
    const oldMatrix = system.matrix;
    const oldVector = system.vector;
    const oldGuess = system.initialGuess;

    const newMatrix = Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => {
        if (oldMatrix[i] && oldMatrix[i][j] !== undefined) {
          return oldMatrix[i][j];
        }
        return i === j ? "4" : "1";
      })
    );

    const newVector = Array.from({ length: newSize }, (_, i) =>
      oldVector[i] !== undefined ? oldVector[i] : "1"
    );

    const newGuess = Array.from({ length: newSize }, (_, i) =>
      oldGuess[i] !== undefined ? oldGuess[i] : "0"
    );

    setSize(newSize);
    setSystem({
      matrix: newMatrix,
      vector: newVector,
      initialGuess: newGuess,
      referenceValue: system.referenceValue,
    });
    setErrors({});
  };

  const handleMatrixCellChange = (r, c, val) => {
    const updated = system.matrix.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? val : cell)) : row
    );
    setSystem((prev) => ({ ...prev, matrix: updated }));
    if (errors.matrix) setErrors((prev) => ({ ...prev, matrix: null }));
  };

  const handleVectorCellChange = (i, val) => {
    const updated = system.vector.map((cell, idx) => (idx === i ? val : cell));
    setSystem((prev) => ({ ...prev, vector: updated }));
    if (errors.vector) setErrors((prev) => ({ ...prev, vector: null }));
  };

  const handleGuessCellChange = (i, val) => {
    const updated = system.initialGuess.map((cell, idx) => (idx === i ? val : cell));
    setSystem((prev) => ({ ...prev, initialGuess: updated }));
  };

  const validate = () => {
    const errs = {};

    // Validate Matrix A
    let matrixValid = true;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const val = parseFloat(system.matrix[i][j]);
        if (system.matrix[i][j].trim() === "" || isNaN(val) || !isFinite(val)) {
          matrixValid = false;
        }
      }
    }
    if (!matrixValid) {
      errs.matrix = "All matrix A coefficients must be valid finite numbers.";
    }

    // Validate Vector b
    let vectorValid = true;
    for (let i = 0; i < size; i++) {
      const val = parseFloat(system.vector[i]);
      if (system.vector[i].trim() === "" || isNaN(val) || !isFinite(val)) {
        vectorValid = false;
      }
    }
    if (!vectorValid) {
      errs.vector = "All RHS vector b entries must be valid finite numbers.";
    }

    // Validate Initial Guess
    let guessValid = true;
    for (let i = 0; i < size; i++) {
      const val = parseFloat(system.initialGuess[i]);
      if (system.initialGuess[i].trim() === "" || isNaN(val) || !isFinite(val)) {
        guessValid = false;
      }
    }
    if (!guessValid) {
      errs.guess = "All initial guess values must be valid numbers.";
    }

    // Validate Tolerance and Max Iterations
    const tolVal = parseFloat(tolerance);
    if (tolerance.trim() === "" || isNaN(tolVal) || tolVal <= 0) {
      errs.tolerance = "Tolerance must be a positive number.";
    }

    const maxIterVal = parseInt(maxIterations, 10);
    if (maxIterations.trim() === "" || isNaN(maxIterVal) || maxIterVal < 1) {
      errs.maxIterations = "Max iterations must be an integer >= 1.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      matrix: system.matrix.map((row) => row.map((cell) => parseFloat(cell))),
      vector: system.vector.map((cell) => parseFloat(cell)),
      initial_guess: system.initialGuess.map((cell) => parseFloat(cell)),
      tolerance: parseFloat(tolerance),
      max_iterations: parseInt(maxIterations, 10),
    };

    if (system.referenceValue.trim() !== "") {
      try {
        const parsedRef = JSON.parse(system.referenceValue);
        if (Array.isArray(parsedRef) && parsedRef.length === size) {
          payload.reference_value = parsedRef.map(Number);
        }
      } catch {
        // Fallback: comma/space separated
        const parts = system.referenceValue.split(/[\s,]+/).filter(Boolean).map(Number);
        if (parts.length === size && parts.every((v) => !isNaN(v))) {
          payload.reference_value = parts;
        }
      }
    }

    onSubmit(payload);
  };

  const handleReset = () => {
    setSize(2);
    setSystem(createDefaultSystem(2));
    setTolerance("0.000001");
    setMaxIterations("100");
    setErrors({});
    if (onReset) onReset();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* System Dimension Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label className="form-label" style={{ margin: 0 }}>
          System Dimension (n × n)
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {[2, 3, 4, 5].map((dim) => (
            <button
              key={dim}
              type="button"
              onClick={() => handleSizeChange(dim)}
              className={size === dim ? "btn-primary" : "btn-secondary"}
              style={{
                padding: "0.25rem 0.65rem",
                fontSize: "0.75rem",
                borderRadius: "4px",
              }}
              disabled={isLoading}
            >
              {dim}×{dim}
            </button>
          ))}
        </div>
      </div>

      {/* Linear System Grid: A * x = b */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.75rem", fontWeight: 600 }}>
          COEFFICIENT MATRIX [A] AND RHS VECTOR [b]
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: `${size * 65 + 100}px` }}>
          {system.matrix.map((row, r) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {/* Matrix A Row */}
              {row.map((cell, c) => (
                <div key={c} style={{ flex: 1 }}>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    value={cell}
                    onChange={(e) => handleMatrixCellChange(r, c, e.target.value)}
                    style={{
                      padding: "0.35rem 0.5rem",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      backgroundColor: r === c ? "rgba(56, 189, 248, 0.08)" : "#1e293b",
                      borderColor: r === c ? "#38bdf8" : "#334155",
                    }}
                    placeholder={`A[${r + 1},${c + 1}]`}
                    disabled={isLoading}
                  />
                </div>
              ))}

              <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700, padding: "0 0.2rem" }}>
                x{r + 1} =
              </span>

              {/* RHS Vector b */}
              <div style={{ width: "70px" }}>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={system.vector[r]}
                  onChange={(e) => handleVectorCellChange(r, e.target.value)}
                  style={{
                    padding: "0.35rem 0.5rem",
                    fontSize: "0.85rem",
                    textAlign: "center",
                    backgroundColor: "#1e293b",
                    borderColor: "#38bdf8",
                  }}
                  placeholder={`b[${r + 1}]`}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>

        {errors.matrix && <div className="form-error-text" style={{ marginTop: "0.5rem" }}>{errors.matrix}</div>}
        {errors.vector && <div className="form-error-text">{errors.vector}</div>}
      </div>

      {/* Initial Guess Vector x0 */}
      <div className="form-group">
        <label className="form-label">
          Initial Guess Vector x0
        </label>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: "0.5rem" }}>
          {system.initialGuess.map((val, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>x0[{i + 1}]</span>
              <input
                type="number"
                step="any"
                className="form-input"
                value={val}
                onChange={(e) => handleGuessCellChange(i, e.target.value)}
                style={{ padding: "0.35rem 0.5rem", textAlign: "center", fontSize: "0.85rem" }}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
        {errors.guess && <div className="form-error-text">{errors.guess}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="gs-tol">
            Tolerance (ε) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="gs-tol"
            type="number"
            step="any"
            className={`form-input ${errors.tolerance ? "has-error" : ""}`}
            value={tolerance}
            onChange={(e) => setTolerance(e.target.value)}
            disabled={isLoading}
          />
          {errors.tolerance && <div className="form-error-text">{errors.tolerance}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gs-maxiter">
            Max Iterations <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="gs-maxiter"
            type="number"
            min="1"
            max="10000"
            className={`form-input ${errors.maxIterations ? "has-error" : ""}`}
            value={maxIterations}
            onChange={(e) => setMaxIterations(e.target.value)}
            disabled={isLoading}
          />
          {errors.maxIterations && <div className="form-error-text">{errors.maxIterations}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
          {isLoading ? "Computing..." : "Solve Linear System →"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default GaussSeidelForm;
