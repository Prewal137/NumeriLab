"""Composite Trapezoidal Rule for Numerical Integration.

Module: Module III (Numerical Differentiation and Integration)
Method: 7. Trapezoidal Rule

Mathematical form:
    integral_{a}^{b} f(x) dx approx (h / 2) * [f(x_0) + 2 * sum_{i=1}^{n-1} f(x_i) + f(x_n)]
    where h = (b - a) / n and x_i = a + i * h.
"""

import math
from typing import Any, Dict, List, Optional
from core.errors import MathParsingError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_interval


def solve_trapezoidal(
    f_expr: str,
    a: float,
    b: float,
    n: int = 10,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Approximates the definite integral of f(x) from a to b using the Composite Trapezoidal Rule.

    Args:
        f_expr: Mathematical expression string for integrand f(x) (e.g., 'sin(x)', 'x**2', 'exp(-x**2)').
        a: Lower integration limit.
        b: Upper integration limit (must be strictly greater than a).
        n: Number of subintervals (positive integer >= 1).
        reference_value: Optional analytical or high-precision benchmark integral value.

    Returns:
        NumericalResult: Standardized result container with step size h, table of node values
                         and quadrature weights, integral approximation, and visualization payload.
    """
    # 1. Validation
    if not isinstance(n, int) or isinstance(n, bool) or n < 1:
        raise ValidationError(f"Number of subintervals n must be a positive integer (n >= 1), got {n}.")

    a_val, b_val = validate_interval(a, b)

    if not f_expr or not isinstance(f_expr, str) or not f_expr.strip():
        raise ValidationError("Function expression cannot be empty.")

    # 2. Compile Integrand Function
    f_func = SafeMathParser.compile_function(f_expr, variable_names=("x",))

    h = (b_val - a_val) / float(n)
    table: List[Dict[str, Any]] = []
    x_nodes: List[float] = []
    f_nodes: List[float] = []

    sum_weighted = 0.0

    for i in range(n + 1):
        xi = a_val + i * h if i < n else b_val  # Avoid roundoff on endpoint
        x_nodes.append(xi)

        try:
            f_val = float(f_func(xi))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="trapezoidal",
                module=3,
                final_value=None,
                iterations=i,
                converged=False,
                error=f"Evaluation error at node x_{i} = {xi:.6f}: {str(e)}",
                explanation="Failed to evaluate the integrand due to mathematical singularity or domain error.",
            )

        if math.isnan(f_val) or math.isinf(f_val):
            return NumericalResult(
                success=False,
                method="trapezoidal",
                module=3,
                final_value=None,
                iterations=i,
                converged=False,
                error=f"Integrand evaluated to non-finite value ({f_val}) at node x_{i} = {xi:.6f}.",
                explanation="The function has a singularity or undefined value within the integration interval.",
            )

        f_nodes.append(f_val)
        weight = 1.0 if (i == 0 or i == n) else 2.0
        term_contribution = (h / 2.0) * weight * f_val
        sum_weighted += weight * f_val

        table.append({
            "index": i,
            "x_i": round(xi, 8),
            "f_x_i": round(f_val, 8),
            "weight": int(weight),
            "contribution": round(term_contribution, 8),
        })

    integral_approx = (h / 2.0) * sum_weighted

    # 3. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(integral_approx - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
        )

    # 4. Visualization Curve Sampling
    num_curve_samples = 120
    curve_points: List[Dict[str, float]] = []
    dx_sample = (b_val - a_val) / (num_curve_samples - 1)
    for s in range(num_curve_samples):
        sx = a_val + s * dx_sample if s < num_curve_samples - 1 else b_val
        try:
            sy = float(f_func(sx))
            if not (math.isnan(sy) or math.isinf(sy)):
                curve_points.append({"x": round(sx, 6), "y": round(sy, 6)})
        except Exception:
            pass

    trapezoid_segments: List[Dict[str, Any]] = []
    for i in range(n):
        trapezoid_segments.append({
            "subinterval": i + 1,
            "x_start": round(x_nodes[i], 6),
            "x_end": round(x_nodes[i + 1], 6),
            "y_start": round(f_nodes[i], 6),
            "y_end": round(f_nodes[i + 1], 6),
            "sub_area": round((h / 2.0) * (f_nodes[i] + f_nodes[i + 1]), 8),
        })

    vis_payload = VisualizationPayload(
        chart_type="area",
        title=f"Composite Trapezoidal Rule (n = {n}, h = {h:.4f}) for f(x) = {f_expr}",
        x_label="x",
        y_label="f(x)",
        series=[
            {
                "name": "Integrand f(x)",
                "data": curve_points,
            },
            {
                "name": "Quadrature Nodes",
                "type": "scatter",
                "data": [{"x": x_nodes[k], "y": f_nodes[k]} for k in range(n + 1)],
            },
        ],
        metadata={
            "n_subintervals": n,
            "step_size": h,
            "trapezoid_segments": trapezoid_segments,
        },
    )

    # 5. Explanation
    explanation = (
        f"Composite Trapezoidal Rule with n = {n} subintervals (step size h = {h:.6f}) "
        f"evaluated integral of f(x) = {f_expr} on [{a_val}, {b_val}] to ≈ {integral_approx:.8f}."
    )

    return NumericalResult(
        success=True,
        method="trapezoidal",
        module=3,
        final_value=round(integral_approx, 8),
        iterations=n,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "f_expr": f_expr,
            "a": a_val,
            "b": b_val,
            "n_subintervals": n,
            "step_size_h": h,
        },
    )
