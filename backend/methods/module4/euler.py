"""Euler's Explicit Method for Ordinary Differential Equations.

Module: Module IV (Numerical Solution of Ordinary Differential Equations)
Method: 10. Euler's Method

Mathematical formulation:
    dy/dx = f(x, y),   y(x0) = y0
    y_{n+1} = y_n + h * f(x_n, y_n)
    x_{n+1} = x_n + h
"""

import math
from typing import Any, Dict, List, Optional
from core.errors import MathParsingError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload


def solve_euler(
    f_expr: str,
    x0: float,
    y0: float,
    x_end: float,
    h: float,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Solves an initial value problem (IVP) using the standard explicit Euler's method.

    Args:
        f_expr: Mathematical expression string for dy/dx = f(x, y) (e.g., 'y - x**2 + 1', 'x + y', '-2*y').
        x0: Initial independent variable x coordinate.
        y0: Initial condition value y(x0).
        x_end: Target integration endpoint (must be strictly greater than x0).
        h: Step size (positive finite real number).
        reference_value: Optional analytical or benchmark exact value at x_end for error analysis.

    Returns:
        NumericalResult: Standardized result container with step trajectory table,
                         final approximation y(x_end), error analysis, and visualization data.
    """
    # 1. Input Validation
    if not f_expr or not isinstance(f_expr, str) or not f_expr.strip():
        raise ValidationError("Function expression dy/dx = f(x, y) cannot be empty.")

    for name, val in [("x0", x0), ("y0", y0), ("x_end", x_end), ("h", h)]:
        if val is None or not isinstance(val, (int, float)):
            raise ValidationError(f"Parameter '{name}' must be a real numerical value.")
        if math.isnan(val) or math.isinf(val):
            raise ValidationError(f"Parameter '{name}' must be finite (got {val}).")

    x_curr = float(x0)
    y_curr = float(y0)
    x_target = float(x_end)
    step_h = float(h)

    if x_target <= x_curr:
        raise ValidationError(f"x_end ({x_target}) must be strictly greater than x0 ({x_curr}).")

    if step_h <= 0.0:
        raise ValidationError(f"Step size h must be strictly positive (got {step_h}).")

    # Guard against excessive step counts
    interval_span = x_target - x_curr
    estimated_steps = math.ceil(interval_span / step_h)
    if estimated_steps > 100000:
        raise ValidationError(
            f"Step size h = {step_h} results in too many steps ({estimated_steps} > 100000). "
            "Please use a larger step size."
        )

    # 2. Compile ODE Function f(x, y)
    f_func = SafeMathParser.compile_function(f_expr, variable_names=("x", "y"))

    # 3. Iteration Loop
    table: List[Dict[str, Any]] = []
    solution_points: List[Dict[str, float]] = [{"x": round(x_curr, 8), "y": round(y_curr, 8)}]
    step_idx = 0

    while x_curr < x_target - 1e-12:
        step_idx += 1
        # Adjust step size for final partial step to avoid overshooting x_end
        current_h = min(step_h, x_target - x_curr)

        try:
            slope = float(f_func(x_curr, y_curr))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="euler",
                module=4,
                final_value=y_curr,
                iterations=step_idx - 1,
                converged=False,
                error=f"Evaluation error of f(x, y) at step {step_idx} (x={x_curr:.6f}, y={y_curr:.6f}): {str(e)}",
                table=table,
                explanation="Failed to evaluate derivative function due to domain or mathematical error.",
            )

        if math.isnan(slope) or math.isinf(slope) or abs(slope) > 1e100:
            return NumericalResult(
                success=False,
                method="euler",
                module=4,
                final_value=None,
                iterations=step_idx - 1,
                converged=False,
                error=f"Slope evaluated to non-finite or extreme value ({slope}) at step {step_idx}.",
                table=table,
                explanation="Numerical divergence encountered during stepping.",
            )

        y_next = y_curr + current_h * slope
        x_next = x_curr + current_h

        if math.isnan(y_next) or math.isinf(y_next) or abs(y_next) > 1e100:
            return NumericalResult(
                success=False,
                method="euler",
                module=4,
                final_value=None,
                iterations=step_idx,
                converged=False,
                error=f"Solution y diverged to non-finite value ({y_next}) at step {step_idx}.",
                table=table,
                explanation="Euler stepping diverged beyond numerical overflow limits.",
            )

        table.append({
            "step": step_idx,
            "x_n": round(x_curr, 8),
            "y_n": round(y_curr, 8),
            "slope_f": round(slope, 8),
            "step_h": round(current_h, 8),
            "y_next": round(y_next, 8),
        })

        x_curr = x_next
        y_curr = y_next
        solution_points.append({"x": round(x_curr, 8), "y": round(y_curr, 8)})

    # 4. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(y_curr - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
        )

    # 5. Visualization Payload
    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Euler's Method Solution for dy/dx = {f_expr}",
        x_label="x",
        y_label="y(x)",
        series=[
            {
                "name": "Euler Solution",
                "data": solution_points,
            }
        ],
        metadata={
            "f_expr": f_expr,
            "x0": x0,
            "y0": y0,
            "x_end": x_end,
            "h": h,
            "total_steps": step_idx,
        },
    )

    # 6. Explanation
    explanation = (
        f"Euler's explicit method completed {step_idx} steps with nominal h = {h} "
        f"from x0 = {x0} to x_end = {x_end}, reaching y({x_end}) ≈ {y_curr:.8f}."
    )

    return NumericalResult(
        success=True,
        method="euler",
        module=4,
        final_value=round(y_curr, 8),
        iterations=step_idx,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "f_expr": f_expr,
            "x0": x0,
            "y0": y0,
            "x_end": x_end,
            "h": h,
            "total_steps": step_idx,
        },
    )
