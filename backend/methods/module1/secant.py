"""Secant Method.

Module: Module I (Solution of Equations and Linear Systems)
Method: 2. Secant Method

Formula:
    x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))

Approximates roots of non-linear equations f(x) = 0 iteratively using
two distinct initial approximations without requiring derivative computations.
"""

import math
from typing import Any, Dict, List, Optional
from core.errors import MathParsingError, SingularityError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_max_iterations, validate_tolerance


def solve_secant(
    f_expr: str,
    x0: float,
    x1: float,
    tolerance: float = 1e-6,
    max_iterations: int = 100,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Solves for a root of f(x) = 0 using the Secant Method.

    Args:
        f_expr: Mathematical expression string for f(x) (e.g., 'x**2 - 4' or 'cos(x) - x').
        x0: First initial approximation.
        x1: Second initial approximation (must be distinct from x0).
        tolerance: Stopping criteria tolerance for |x_{n+1} - x_n| or |f(x_{n+1})|.
        max_iterations: Maximum number of iterations allowed.
        reference_value: Optional analytical or benchmark root value for error calculation.

    Returns:
        NumericalResult: Standardized result container with iteration table, convergence status,
                         error metrics, and visualization payload.
    """
    # 1. Input Validation
    tol = validate_tolerance(tolerance)
    max_iter = validate_max_iterations(max_iterations)

    if x0 is None or not isinstance(x0, (int, float)):
        raise ValidationError("Initial approximation x0 must be a real number.")
    if x1 is None or not isinstance(x1, (int, float)):
        raise ValidationError("Initial approximation x1 must be a real number.")

    x_prev = float(x0)
    x_curr = float(x1)

    if math.isclose(x_prev, x_curr, rel_tol=1e-14, abs_tol=1e-14):
        raise ValidationError("Initial approximations x0 and x1 must be distinct.")

    # 2. Compile f(x)
    f_func = SafeMathParser.compile_function(f_expr, variable_names=("x",))

    try:
        f_prev = float(f_func(x_prev))
        f_curr = float(f_func(x_curr))
    except Exception as e:
        return NumericalResult(
            success=False,
            method="secant",
            module=1,
            final_value=None,
            iterations=0,
            converged=False,
            error=f"Failed to evaluate initial function values: {str(e)}",
            explanation="Function evaluation failed at initial points x0 or x1.",
        )

    if math.isnan(f_prev) or math.isinf(f_prev) or math.isnan(f_curr) or math.isinf(f_curr):
        return NumericalResult(
            success=False,
            method="secant",
            module=1,
            final_value=None,
            iterations=0,
            converged=False,
            error="Initial function values evaluated to NaN or infinity.",
            explanation="Ensure function f(x) is well-defined and finite across initial approximations.",
        )

    # Check if an initial point is already an exact root
    if abs(f_prev) < 1e-15:
        return _build_immediate_root_result(f_expr, x_prev, f_prev, tol, reference_value, 0)
    if abs(f_curr) < 1e-15:
        return _build_immediate_root_result(f_expr, x_curr, f_curr, tol, reference_value, 1)

    table: List[Dict[str, Any]] = []
    x_history: List[float] = [x_prev, x_curr]
    converged = False
    final_error: Optional[float] = None
    final_root = x_curr

    for k in range(1, max_iter + 1):
        denominator = f_curr - f_prev

        if abs(denominator) < 1e-15:
            # Denominator too small - division by zero risk
            if abs(f_curr) < tol:
                converged = True
                final_root = x_curr
                break
            return NumericalResult(
                success=False,
                method="secant",
                module=1,
                final_value=x_curr,
                iterations=k - 1,
                converged=False,
                error="Secant denominator (f(x_n) - f(x_{n-1})) became too small (< 1e-15), risking division by zero.",
                table=table,
                explanation="The difference f(x_n) - f(x_{n-1}) is zero or near-zero without finding a root, causing numerical stagnation.",
            )

        # Secant formula
        x_next = x_curr - f_curr * (x_curr - x_prev) / denominator

        if math.isnan(x_next) or math.isinf(x_next) or abs(x_next) > 1e100:
            return NumericalResult(
                success=False,
                method="secant",
                module=1,
                final_value=None,
                iterations=k,
                converged=False,
                error=f"Secant iteration diverged to non-finite value at step {k}.",
                table=table,
                explanation="The secant step generated a non-finite or extreme coordinate value.",
            )

        try:
            f_next = float(f_func(x_next))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="secant",
                module=1,
                final_value=x_next,
                iterations=k,
                converged=False,
                error=f"Function evaluation failed at x = {x_next}: {str(e)}",
                table=table,
                explanation="Evaluation error encountered at new secant approximation.",
            )

        step_error = abs(x_next - x_curr)
        final_error = step_error
        final_root = x_next

        table.append({
            "iteration": k,
            "x_prev": round(x_prev, 10),
            "x_curr": round(x_curr, 10),
            "f_prev": round(f_prev, 10),
            "f_curr": round(f_curr, 10),
            "x_next": round(x_next, 10),
            "f_next": round(f_next, 10),
            "error": round(step_error, 10),
        })
        x_history.append(x_next)

        # Convergence test
        if step_error < tol or abs(f_next) < tol:
            converged = True
            break

        # Shift variables for next step
        x_prev, f_prev = x_curr, f_curr
        x_curr, f_curr = x_next, f_next

    # 3. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(final_root - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
            estimated_error=final_error,
        )
    elif final_error is not None:
        err_analysis = ErrorAnalysis(estimated_error=final_error)

    # 4. Visualization Payload
    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Secant Method Root Convergence for f(x) = {f_expr}",
        x_label="Iteration",
        y_label="Root Approximation x",
        series=[
            {
                "name": "Secant Approximations",
                "data": [{"x": i, "y": val} for i, val in enumerate(x_history)],
            }
        ],
        metadata={"f_expression": f_expr, "x0": x0, "x1": x1},
    )

    # 5. Explanation
    if converged:
        explanation = (
            f"Secant Method successfully converged in {len(table)} iterations to "
            f"root x ≈ {final_root:.8f} with tolerance {tol}."
        )
    else:
        explanation = (
            f"Secant Method reached the maximum iteration limit ({max_iter}) "
            f"without satisfying tolerance {tol}. Current approximation is x ≈ {final_root:.8f}."
        )

    return NumericalResult(
        success=True,
        method="secant",
        module=1,
        final_value=final_root,
        iterations=len(table),
        converged=converged,
        error=None if converged else f"Maximum iteration limit ({max_iter}) reached without convergence.",
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={"f_expr": f_expr, "x0": x0, "x1": x1, "tolerance": tol, "max_iterations": max_iter},
    )


def _build_immediate_root_result(
    f_expr: str,
    root: float,
    f_val: float,
    tol: float,
    reference_value: Optional[float],
    step: int,
) -> NumericalResult:
    """Helper to return an exact or immediate root found at the initial boundary."""
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(root - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
            estimated_error=abs(f_val),
        )

    return NumericalResult(
        success=True,
        method="secant",
        module=1,
        final_value=root,
        iterations=step,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=[{
            "iteration": step,
            "x_curr": round(root, 10),
            "f_curr": round(f_val, 10),
            "error": 0.0,
        }],
        explanation=f"Initial point x = {root} is an exact root (|f(x)| < 1e-15).",
        metadata={"f_expr": f_expr, "tolerance": tol},
    )
