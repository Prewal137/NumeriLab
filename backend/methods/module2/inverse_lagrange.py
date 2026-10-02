"""Lagrange Inverse Interpolation Method.

Module: Module II (Interpolation and Approximation)
Method: 5. Lagrange Inverse Interpolation

Mathematical form:
    x(y) = sum_{i=0}^{n-1} x_i * L'_i(y)
    L'_i(y) = prod_{j != i} (y - y_j) / (y_i - y_j)

Estimates the independent variable x corresponding to a specified target value y
by treating x as a polynomial function of y across the given discrete data points.
"""

import math
from typing import Any, Dict, List, Optional, Sequence
from core.errors import ValidationError
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload


def solve_inverse_lagrange(
    x_points: Sequence[float],
    y_points: Sequence[float],
    target_y: float,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Estimates the unknown argument x corresponding to a specified target value y using inverse Lagrange interpolation.

    Args:
        x_points: Array of x coordinates (at least 2 real numbers).
        y_points: Array of corresponding y coordinates (must be distinct and same length as x_points).
        target_y: The y value for which to estimate the corresponding x.
        reference_value: Optional analytical or benchmark reference value for x.

    Returns:
        NumericalResult: Standardized result container with inverse basis values,
                         individual coordinate contributions, estimated x-value, and visualization.
    """
    # 1. Validation
    if x_points is None or y_points is None:
        raise ValidationError("x_points and y_points cannot be None.")
    if target_y is None or not isinstance(target_y, (int, float)):
        raise ValidationError("Target y must be a real numerical value.")
    if math.isnan(target_y) or math.isinf(target_y):
        raise ValidationError("Target y must be a finite real number.")

    if len(x_points) != len(y_points):
        raise ValidationError(
            f"x and y datasets must have the same length (got {len(x_points)} and {len(y_points)})."
        )
    if len(x_points) < 2:
        raise ValidationError(
            f"At least 2 data points are required for inverse interpolation, but received {len(x_points)}."
        )

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

    n = len(y_vals)
    ty = float(target_y)

    # Validate distinct y coordinates to avoid division by zero
    for i in range(n):
        for j in range(i + 1, n):
            if abs(y_vals[i] - y_vals[j]) < 1e-15:
                raise ValidationError(
                    f"Duplicate y-coordinate detected at indices {i} and {j} (y = {y_vals[i]}). "
                    "Inverse interpolation requires distinct y-values."
                )

    # 2. Compute Inverse Lagrange Polynomial x(target_y) = sum x_i * L'_i(target_y)
    table: List[Dict[str, Any]] = []
    estimated_x = 0.0

    for i in range(n):
        l_prime_i = 1.0
        for j in range(n):
            if i != j:
                l_prime_i *= (ty - y_vals[j]) / (y_vals[i] - y_vals[j])

        contribution = x_vals[i] * l_prime_i
        estimated_x += contribution

        table.append({
            "index": i,
            "x_i": round(x_vals[i], 8),
            "y_i": round(y_vals[i], 8),
            "basis_L_prime_i": round(l_prime_i, 8),
            "contribution": round(contribution, 8),
        })

    # 3. Check Interpolation vs Extrapolation in y-domain
    min_y, max_y = min(y_vals), max(y_vals)
    is_extrapolation = ty < min_y or ty > max_y

    # 4. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(estimated_x - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
        )

    # 5. Visualization Curve Sampling (x as function of y)
    span_y = max_y - min_y
    plot_min_y = min(min_y, ty) - 0.1 * (span_y if span_y > 0 else 1.0)
    plot_max_y = max(max_y, ty) + 0.1 * (span_y if span_y > 0 else 1.0)

    num_samples = 100
    curve_points: List[Dict[str, float]] = []
    step_size = (plot_max_y - plot_min_y) / (num_samples - 1) if num_samples > 1 else 1.0

    for s in range(num_samples):
        sy = plot_min_y + s * step_size
        sx = 0.0
        for i in range(n):
            basis = 1.0
            for j in range(n):
                if i != j:
                    basis *= (sy - y_vals[j]) / (y_vals[i] - y_vals[j])
            sx += x_vals[i] * basis
        curve_points.append({"x": round(sx, 6), "y": round(sy, 6)})

    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Lagrange Inverse Interpolation (Degree {n-1})",
        x_label="x (estimated)",
        y_label="y (target)",
        series=[
            {
                "name": "Inverse Interpolation Curve x(y)",
                "data": curve_points,
            },
            {
                "name": "Data Knots",
                "type": "scatter",
                "data": [{"x": x_vals[k], "y": y_vals[k]} for k in range(n)],
            },
            {
                "name": "Estimated Point",
                "type": "scatter",
                "data": [{"x": round(estimated_x, 8), "y": ty}],
            },
        ],
        metadata={
            "degree": n - 1,
            "is_extrapolation": is_extrapolation,
            "target_y": ty,
        },
    )

    # 6. Explanation
    operation_type = "extrapolation" if is_extrapolation else "interpolation"
    explanation = (
        f"Lagrange inverse {operation_type} of degree {n-1} estimated x ≈ {estimated_x:.8f} "
        f"for target y = {ty:.6f} across {n} data points."
    )
    if is_extrapolation:
        explanation += f" Warning: target y is outside the supplied y range [{min_y:.4f}, {max_y:.4f}]."

    return NumericalResult(
        success=True,
        method="inverse-lagrange",
        module=2,
        final_value=round(estimated_x, 8),
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
            "target_y": ty,
            "is_extrapolation": is_extrapolation,
            "domain_min_y": min_y,
            "domain_max_y": max_y,
        },
    )
