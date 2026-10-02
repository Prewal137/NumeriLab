"""Natural Cubic Spline Interpolation Method.

Module: Module II (Interpolation and Approximation)
Method: 6. Cubic Spline Interpolation

Constructs piecewise cubic polynomials S_i(x) for each interval [x_i, x_{i+1}]:
    S_i(x) = a_i + b_i*(x - x_i) + c_i*(x - x_i)^2 + d_i*(x - x_i)^3

Satisfies C2 continuity (continuous first and second derivatives at interior knots)
with Natural Boundary Conditions: S''_0(x_0) = 0 and S''_{n-2}(x_{n-1}) = 0 (c_0 = c_{n-1} = 0).
"""

import math
from typing import Any, Dict, List, Optional, Sequence, Tuple
import numpy as np
from core.errors import ValidationError
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload


def solve_cubic_spline(
    x_points: Sequence[float],
    y_points: Sequence[float],
    target_x: float,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Constructs a Natural Cubic Spline and evaluates it at the target x coordinate.

    Args:
        x_points: Array of knot x coordinates (at least 3 points, distinct values).
        y_points: Array of knot y coordinates (same length as x_points).
        target_x: Target x coordinate inside the knot domain [x_min, x_max].
        reference_value: Optional analytical or benchmark reference value for comparison.

    Returns:
        NumericalResult: Standardized result container with interval piecewise coefficients
                         (a_i, b_i, c_i, d_i), evaluated spline value, and continuous curve visualization.
    """
    # 1. Input Validation
    if x_points is None or y_points is None:
        raise ValidationError("x_points and y_points cannot be None.")
    if target_x is None or not isinstance(target_x, (int, float)):
        raise ValidationError("Target x must be a real numerical value.")
    if math.isnan(target_x) or math.isinf(target_x):
        raise ValidationError("Target x must be a finite real number.")

    if len(x_points) != len(y_points):
        raise ValidationError(
            f"x and y datasets must have the same length (got {len(x_points)} and {len(y_points)})."
        )
    if len(x_points) < 3:
        raise ValidationError(
            f"Cubic spline interpolation requires at least 3 data points, but received {len(x_points)}."
        )

    # Convert to Python floats and validate finiteness
    raw_points: List[Tuple[float, float]] = []
    for i, (x, y) in enumerate(zip(x_points, y_points)):
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            raise ValidationError(f"Data point {i} contains non-numeric values: ({x}, {y}).")
        if math.isnan(x) or math.isinf(x) or math.isnan(y) or math.isinf(y):
            raise ValidationError(f"Data point {i} contains non-finite values (NaN or Inf): ({x}, {y}).")
        raw_points.append((float(x), float(y)))

    # Sort data points strictly by x coordinate
    sorted_points = sorted(raw_points, key=lambda p: p[0])
    x_vals = [p[0] for p in sorted_points]
    y_vals = [p[1] for p in sorted_points]
    n = len(x_vals)

    # Check for duplicate x coordinates
    for i in range(n - 1):
        if abs(x_vals[i + 1] - x_vals[i]) < 1e-15:
            raise ValidationError(
                f"Duplicate x-coordinate detected (x = {x_vals[i]}). All spline knots must have distinct x-coordinates."
            )

    tx = float(target_x)
    min_x, max_x = x_vals[0], x_vals[-1]

    # Reject out-of-range extrapolation per requirements
    if tx < min_x or tx > max_x:
        raise ValidationError(
            f"Target x ({tx}) is outside the interpolation interval [{min_x}, {max_x}]. "
            "Extrapolation is not permitted for cubic splines."
        )

    # 2. Compute Spline Coefficients
    # Step intervals h_i = x_{i+1} - x_i for i = 0, ..., n-2
    num_intervals = n - 1
    h = [x_vals[i + 1] - x_vals[i] for i in range(num_intervals)]

    # a_i = y_i
    a = [y_vals[i] for i in range(num_intervals)]

    # Set up tridiagonal system for c_i (second derivatives / 2)
    # Size of system for c_0, ..., c_{n-1} is n x n with c_0 = 0 and c_{n-1} = 0
    A_tri = np.zeros((n, n), dtype=float)
    rhs = np.zeros(n, dtype=float)

    # Natural boundary conditions
    A_tri[0, 0] = 1.0
    rhs[0] = 0.0
    A_tri[n - 1, n - 1] = 1.0
    rhs[n - 1] = 0.0

    # Interior equations: h_{i-1}*c_{i-1} + 2*(h_{i-1} + h_i)*c_i + h_i*c_{i+1} = 3 * ((y_{i+1}-y_i)/h_i - (y_i-y_{i-1})/h_{i-1})
    for i in range(1, n - 1):
        A_tri[i, i - 1] = h[i - 1]
        A_tri[i, i] = 2.0 * (h[i - 1] + h[i])
        A_tri[i, i + 1] = h[i]
        rhs[i] = 3.0 * ((y_vals[i + 1] - y_vals[i]) / h[i] - (y_vals[i] - y_vals[i - 1]) / h[i - 1])

    c_all = np.linalg.solve(A_tri, rhs).tolist()

    # Compute b_i and d_i coefficients for each interval i = 0, ..., n-2
    b: List[float] = []
    c: List[float] = []
    d: List[float] = []

    for i in range(num_intervals):
        c_i = c_all[i]
        c_next = c_all[i + 1]
        d_i = (c_next - c_i) / (3.0 * h[i])
        b_i = (y_vals[i + 1] - y_vals[i]) / h[i] - (h[i] / 3.0) * (2.0 * c_i + c_next)

        b.append(b_i)
        c.append(c_i)
        d.append(d_i)

    # 3. Evaluate Spline at target_x
    # Locate interval index k such that x_vals[k] <= tx <= x_vals[k+1]
    interval_k = 0
    if math.isclose(tx, max_x, rel_tol=1e-12, abs_tol=1e-12):
        interval_k = num_intervals - 1
    else:
        for i in range(num_intervals):
            if x_vals[i] <= tx <= x_vals[i + 1]:
                interval_k = i
                break

    dx = tx - x_vals[interval_k]
    evaluated_y = (
        a[interval_k]
        + b[interval_k] * dx
        + c[interval_k] * (dx ** 2)
        + d[interval_k] * (dx ** 3)
    )

    # 4. Build Table of Spline Interval Polynomials
    table: List[Dict[str, Any]] = []
    for i in range(num_intervals):
        poly_str = (
            f"S_{i}(x) = {a[i]:.6f} + {b[i]:.6f}*(x - {x_vals[i]:.4f}) "
            f"+ {c[i]:.6f}*(x - {x_vals[i]:.4f})^2 + {d[i]:.6f}*(x - {x_vals[i]:.4f})^3"
        )
        table.append({
            "interval": i,
            "x_start": round(x_vals[i], 6),
            "x_end": round(x_vals[i + 1], 6),
            "h_i": round(h[i], 6),
            "a_i": round(a[i], 8),
            "b_i": round(b[i], 8),
            "c_i": round(c[i], 8),
            "d_i": round(d[i], 8),
            "polynomial": poly_str,
        })

    # 5. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(evaluated_y - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
        )

    # 6. Visualization: Sample Continuous Spline Curve Across All Intervals
    curve_points: List[Dict[str, float]] = []
    samples_per_interval = 25

    for i in range(num_intervals):
        for s in range(samples_per_interval):
            sx = x_vals[i] + (s / (samples_per_interval - 1)) * h[i] if samples_per_interval > 1 else x_vals[i]
            sdx = sx - x_vals[i]
            sy = a[i] + b[i] * sdx + c[i] * (sdx ** 2) + d[i] * (sdx ** 3)
            curve_points.append({"x": round(sx, 6), "y": round(sy, 6)})

    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Natural Cubic Spline ({num_intervals} Intervals, {n} Knots)",
        x_label="x",
        y_label="S(x)",
        series=[
            {
                "name": "Natural Cubic Spline S(x)",
                "data": curve_points,
            },
            {
                "name": "Knots",
                "type": "scatter",
                "data": [{"x": x_vals[k], "y": y_vals[k]} for k in range(n)],
            },
            {
                "name": "Target Evaluation",
                "type": "scatter",
                "data": [{"x": tx, "y": round(evaluated_y, 8)}],
            },
        ],
        metadata={
            "num_knots": n,
            "num_intervals": num_intervals,
            "target_x": tx,
            "active_interval": interval_k,
        },
    )

    # 7. Explanation
    explanation = (
        f"Natural Cubic Spline constructed across {num_intervals} polynomial intervals. "
        f"Evaluated on interval [{x_vals[interval_k]:.4f}, {x_vals[interval_k+1]:.4f}] at x = {tx:.6f}, "
        f"yielding S({tx:.6f}) = {evaluated_y:.8f}."
    )

    return NumericalResult(
        success=True,
        method="cubic-spline",
        module=2,
        final_value=round(evaluated_y, 8),
        iterations=num_intervals,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "num_knots": n,
            "num_intervals": num_intervals,
            "boundary_condition": "natural (S''(x0) = S''(xn) = 0)",
            "target_x": tx,
            "evaluated_interval": interval_k,
            "coefficients": [
                {"a": a[i], "b": b[i], "c": c[i], "d": d[i]} for i in range(num_intervals)
            ],
        },
    )
