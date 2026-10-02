"""Lagrange Interpolation Method.

Module: Module II (Interpolation and Approximation)
Method: 4. Lagrange Interpolation

Mathematical form:
    P(x) = sum_{i=0}^{n-1} y_i * L_i(x)
    L_i(x) = prod_{j != i} (x - x_j) / (x_i - x_j)

Constructs the unique lowest-degree polynomial passing through a discrete set of data points.
"""

import math
from typing import Any, Dict, List, Optional, Sequence, Tuple
from core.errors import ValidationError
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_data_points


def solve_lagrange_interpolation(
    x_points: Sequence[float],
    y_points: Sequence[float],
    target_x: float,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Computes the Lagrange polynomial interpolation at a target x coordinate.

    Args:
        x_points: Array of x coordinates (must contain at least 2 distinct real numbers).
        y_points: Array of corresponding y coordinates (same length as x_points).
        target_x: The x value at which to evaluate the interpolation polynomial.
        reference_value: Optional exact or analytical reference value for error calculation.

    Returns:
        NumericalResult: Standardized result container with basis polynomial values,
                         individual point contributions, interpolated value, and visualization data.
    """
    # 1. Validation
    if x_points is None or y_points is None:
        raise ValidationError("x_points and y_points cannot be None.")
    if target_x is None or not isinstance(target_x, (int, float)):
        raise ValidationError("Target x must be a real numerical value.")
    if math.isnan(target_x) or math.isinf(target_x):
        raise ValidationError("Target x must be a finite real number.")

    validate_data_points(x_points, y_points, min_points=2)

    # Convert to Python floats and validate finiteness
    x_vals: List[float] = []
    y_vals: List[float] = []
    for i, (x, y) in enumerate(zip(x_points, y_points)):
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            raise ValidationError(f"Data point {i} contains non-numeric values: ({x}, {y}).")
        if math.isnan(x) or math.isinf(x) or math.isnan(y) or math.isinf(y):
            raise ValidationError(f"Data point {i} contains non-finite values (NaN or Inf): ({x}, {y}).")
        x_vals.append(float(x))
        y_vals.append(float(y))

    n = len(x_vals)
    tx = float(target_x)

    # 2. Compute Lagrange Basis Polynomials L_i(target_x) and Contributions
    table: List[Dict[str, Any]] = []
    interpolated_value = 0.0
    basis_weights: List[float] = []

    for i in range(n):
        l_i = 1.0
        for j in range(n):
            if i != j:
                diff = x_vals[i] - x_vals[j]
                if abs(diff) < 1e-15:
                    raise ValidationError(
                        f"Duplicate x-coordinate detected at indices {i} and {j} (x = {x_vals[i]})."
                    )
                l_i *= (tx - x_vals[j]) / diff

        contribution = y_vals[i] * l_i
        interpolated_value += contribution
        basis_weights.append(l_i)

        table.append({
            "index": i,
            "x_i": round(x_vals[i], 8),
            "y_i": round(y_vals[i], 8),
            "basis_L_i": round(l_i, 8),
            "contribution": round(contribution, 8),
        })

    # 3. Check Interpolation vs Extrapolation
    min_x, max_x = min(x_vals), max(x_vals)
    is_extrapolation = tx < min_x or tx > max_x

    # 4. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(interpolated_value - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
        )

    # 5. Visualization Curve Sampling
    span = max_x - min_x
    plot_min = min(min_x, tx) - 0.1 * (span if span > 0 else 1.0)
    plot_max = max(max_x, tx) + 0.1 * (span if span > 0 else 1.0)

    num_samples = 100
    curve_points: List[Dict[str, float]] = []
    step_size = (plot_max - plot_min) / (num_samples - 1) if num_samples > 1 else 1.0

    for s in range(num_samples):
        sx = plot_min + s * step_size
        sy = 0.0
        for i in range(n):
            basis = 1.0
            for j in range(n):
                if i != j:
                    basis *= (sx - x_vals[j]) / (x_vals[i] - x_vals[j])
            sy += y_vals[i] * basis
        curve_points.append({"x": round(sx, 6), "y": round(sy, 6)})

    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Lagrange Interpolation Polynomial (Degree {n-1})",
        x_label="x",
        y_label="P(x)",
        series=[
            {
                "name": f"P_{n-1}(x) Polynomial",
                "data": curve_points,
            },
            {
                "name": "Data Knots",
                "type": "scatter",
                "data": [{"x": x_vals[k], "y": y_vals[k]} for k in range(n)],
            },
            {
                "name": "Interpolated Target",
                "type": "scatter",
                "data": [{"x": tx, "y": round(interpolated_value, 8)}],
            },
        ],
        metadata={
            "degree": n - 1,
            "is_extrapolation": is_extrapolation,
            "target_x": tx,
        },
    )

    # 6. Explanation
    operation_type = "extrapolation" if is_extrapolation else "interpolation"
    explanation = (
        f"Lagrange {operation_type} of degree {n-1} evaluated at x = {tx:.6f} "
        f"yields P({tx:.6f}) = {interpolated_value:.8f} across {n} data points."
    )
    if is_extrapolation:
        explanation += f" Warning: target x is outside the data domain [{min_x:.4f}, {max_x:.4f}]."

    return NumericalResult(
        success=True,
        method="lagrange",
        module=2,
        final_value=round(interpolated_value, 8),
        iterations=n,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "degree": n - 1,
            "num_points": n,
            "target_x": tx,
            "is_extrapolation": is_extrapolation,
            "domain_min_x": min_x,
            "domain_max_x": max_x,
        },
    )
