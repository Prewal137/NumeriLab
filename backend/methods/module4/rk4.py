"""Fourth-Order Runge-Kutta Method (RK4) for Ordinary Differential Equations.

Module: Module IV (Numerical Solution of Ordinary Differential Equations)
Method: 12. Fourth-Order Runge-Kutta (RK4)

Mathematical formulation:
    dy/dx = f(x, y),   y(x0) = y0
    k1 = f(x_n, y_n)
    k2 = f(x_n + h/2, y_n + (h/2)*k1)
    k3 = f(x_n + h/2, y_n + (h/2)*k2)
    k4 = f(x_n + h, y_n + h*k3)
    y_{n+1} = y_n + (h / 6) * [k1 + 2*k2 + 2*k3 + k4]
    x_{n+1} = x_n + h
"""

import math
from typing import Any, Dict, List, Optional
from core.errors import MathParsingError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload


def solve_rk4(
    f_expr: str,
    x0: float,
    y0: float,
    x_end: float,
    h: float,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Solves an initial value problem (IVP) using the classical Fourth-Order Runge-Kutta method.

    Args:
        f_expr: Mathematical expression string for dy/dx = f(x, y) (e.g., 'y - x**2 + 1', 'x + y', '-2*y').
        x0: Initial independent variable x coordinate.
        y0: Initial condition value y(x0).
        x_end: Target integration endpoint (must be strictly greater than x0).
        h: Step size (positive finite real number).
        reference_value: Optional analytical or benchmark exact value at x_end for error analysis.

    Returns:
        NumericalResult: Standardized result container with k1..k4 stage breakdown table,
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
        current_h = min(step_h, x_target - x_curr)
        half_h = current_h / 2.0

        # Stage 1: k1 = f(x_n, y_n)
        try:
            k1 = float(f_func(x_curr, y_curr))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=y_curr,
                iterations=step_idx - 1,
                converged=False,
                error=f"Evaluation error of k1 at step {step_idx} (x={x_curr:.6f}, y={y_curr:.6f}): {str(e)}",
                table=table,
                explanation="Failed to evaluate derivative function at stage k1.",
            )

        if math.isnan(k1) or math.isinf(k1) or abs(k1) > 1e100:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=None,
                iterations=step_idx - 1,
                converged=False,
                error=f"Stage k1 evaluated to non-finite value ({k1}) at step {step_idx}.",
                table=table,
                explanation="Numerical divergence encountered at stage k1.",
            )

        # Stage 2: k2 = f(x_n + h/2, y_n + (h/2)*k1)
        x_mid = x_curr + half_h
        y_k1 = y_curr + half_h * k1
        try:
            k2 = float(f_func(x_mid, y_k1))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=y_curr,
                iterations=step_idx - 1,
                converged=False,
                error=f"Evaluation error of k2 at step {step_idx} (x={x_mid:.6f}, y={y_k1:.6f}): {str(e)}",
                table=table,
                explanation="Failed to evaluate derivative function at stage k2.",
            )

        if math.isnan(k2) or math.isinf(k2) or abs(k2) > 1e100:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=None,
                iterations=step_idx - 1,
                converged=False,
                error=f"Stage k2 evaluated to non-finite value ({k2}) at step {step_idx}.",
                table=table,
                explanation="Numerical divergence encountered at stage k2.",
            )

        # Stage 3: k3 = f(x_n + h/2, y_n + (h/2)*k2)
        y_k2 = y_curr + half_h * k2
        try:
            k3 = float(f_func(x_mid, y_k2))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=y_curr,
                iterations=step_idx - 1,
                converged=False,
                error=f"Evaluation error of k3 at step {step_idx} (x={x_mid:.6f}, y={y_k2:.6f}): {str(e)}",
                table=table,
                explanation="Failed to evaluate derivative function at stage k3.",
            )

        if math.isnan(k3) or math.isinf(k3) or abs(k3) > 1e100:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=None,
                iterations=step_idx - 1,
                converged=False,
                error=f"Stage k3 evaluated to non-finite value ({k3}) at step {step_idx}.",
                table=table,
                explanation="Numerical divergence encountered at stage k3.",
            )

        # Stage 4: k4 = f(x_n + h, y_n + h*k3)
        x_end_step = x_curr + current_h
        y_k3 = y_curr + current_h * k3
        try:
            k4 = float(f_func(x_end_step, y_k3))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=y_curr,
                iterations=step_idx - 1,
                converged=False,
                error=f"Evaluation error of k4 at step {step_idx} (x={x_end_step:.6f}, y={y_k3:.6f}): {str(e)}",
                table=table,
                explanation="Failed to evaluate derivative function at stage k4.",
            )

        if math.isnan(k4) or math.isinf(k4) or abs(k4) > 1e100:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=None,
                iterations=step_idx - 1,
                converged=False,
                error=f"Stage k4 evaluated to non-finite value ({k4}) at step {step_idx}.",
                table=table,
                explanation="Numerical divergence encountered at stage k4.",
            )

        # Weighted RK4 combination: y_{n+1} = y_n + (h/6) * (k1 + 2*k2 + 2*k3 + k4)
        y_next = y_curr + (current_h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
        x_next = x_curr + current_h

        if math.isnan(y_next) or math.isinf(y_next) or abs(y_next) > 1e100:
            return NumericalResult(
                success=False,
                method="rk4",
                module=4,
                final_value=None,
                iterations=step_idx,
                converged=False,
                error=f"Solution y diverged to non-finite value ({y_next}) at step {step_idx}.",
                table=table,
                explanation="RK4 stepping diverged beyond numerical overflow limits.",
            )

        table.append({
            "step": step_idx,
            "x_n": round(x_curr, 8),
            "y_n": round(y_curr, 8),
            "k1": round(k1, 8),
            "k2": round(k2, 8),
            "k3": round(k3, 8),
            "k4": round(k4, 8),
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
        title=f"Fourth-Order Runge-Kutta (RK4) Solution for dy/dx = {f_expr}",
        x_label="x",
        y_label="y(x)",
        series=[
            {
                "name": "RK4 Solution",
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
        f"Fourth-Order Runge-Kutta completed {step_idx} steps with nominal h = {h} "
        f"from x0 = {x0} to x_end = {x_end}, reaching y({x_end}) ≈ {y_curr:.8f}."
    )

    return NumericalResult(
        success=True,
        method="rk4",
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
