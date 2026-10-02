"""Fixed Point Iteration Method.

Module: Module I (Solution of Equations and Linear Systems)
Method: 1. Fixed Point Iteration

Mathematical form:
    x_{n+1} = g(x_n)

Solves for fixed points where x = g(x), equivalent to finding roots of f(x) = x - g(x) = 0.
"""

import math
from typing import Any, Dict, List, Optional
from core.errors import ConvergenceError, MathParsingError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_max_iterations, validate_tolerance


def solve_fixed_point(
    g_expr: str,
    x0: float,
    tolerance: float = 1e-6,
    max_iterations: int = 100,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Solves for a fixed point of g(x) using Fixed Point Iteration.

    Args:
        g_expr: Mathematical expression string for g(x) (e.g., 'cos(x)' or '(x + 2/x)/2').
        x0: Initial approximation value.
        tolerance: Stopping criteria tolerance for |x_{n+1} - x_n|.
        max_iterations: Maximum number of iterations allowed.
        reference_value: Optional analytical or benchmark reference value for error calculation.

    Returns:
        NumericalResult: Standardized result container with step table, convergence status,
                         error metrics, and visualization payload.
    """
    # 1. Validation
    tol = validate_tolerance(tolerance)
    max_iter = validate_max_iterations(max_iterations)
    if x0 is None or not isinstance(x0, (int, float)):
        raise ValidationError("Initial approximation x0 must be a real number.")
    x_curr = float(x0)

    # 2. Compile g(x)
    g_func = SafeMathParser.compile_function(g_expr, variable_names=("x",))

    table: List[Dict[str, Any]] = []
    x_history: List[float] = [x_curr]
    converged = False
    final_error: Optional[float] = None

    for k in range(1, max_iter + 1):
        try:
            x_next = float(g_func(x_curr))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="fixed-point",
                module=1,
                final_value=x_curr,
                iterations=k - 1,
                converged=False,
                error=f"Evaluation error at iteration {k} with x = {x_curr}: {str(e)}",
                table=table,
                explanation="Numerical evaluation failed during iteration due to arithmetic or domain error.",
            )

        if math.isnan(x_next) or math.isinf(x_next) or abs(x_next) > 1e100:
            return NumericalResult(
                success=False,
                method="fixed-point",
                module=1,
                final_value=None,
                iterations=k,
                converged=False,
                error=f"Iteration diverged to non-finite value or exceeded numerical bounds at step {k}.",
                table=table,
                explanation="The fixed-point iteration diverged. Ensure |g'(x)| < 1 near the fixed point for convergence.",
            )

        step_error = abs(x_next - x_curr)
        final_error = step_error

        table.append({
            "iteration": k,
            "x_current": round(x_curr, 10),
            "x_next": round(x_next, 10),
            "error": round(step_error, 10),
        })
        x_history.append(x_next)

        if step_error < tol:
            converged = True
            x_curr = x_next
            break

        x_curr = x_next

    # 3. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(x_curr - ref)
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
        title=f"Fixed Point Iteration Convergence for g(x) = {g_expr}",
        x_label="Iteration",
        y_label="x value",
        series=[
            {
                "name": "Approximation Trajectory",
                "data": [{"x": i, "y": val} for i, val in enumerate(x_history)],
            }
        ],
        metadata={"g_expression": g_expr, "initial_x0": x0},
    )

    # 5. Explanation
    if converged:
        explanation = (
            f"Fixed Point Iteration successfully converged in {len(table)} iterations to "
            f"x ≈ {x_curr:.8f} with step tolerance {tol}."
        )
    else:
        explanation = (
            f"Fixed Point Iteration reached the maximum iteration limit ({max_iter}) "
            f"without satisfying tolerance {tol}. Current approximation is x ≈ {x_curr:.8f}."
        )

    return NumericalResult(
        success=True,
        method="fixed-point",
        module=1,
        final_value=x_curr,
        iterations=len(table),
        converged=converged,
        error=None if converged else f"Maximum iteration limit ({max_iter}) reached without convergence.",
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={"g_expr": g_expr, "x0": x0, "tolerance": tol, "max_iterations": max_iter},
    )
