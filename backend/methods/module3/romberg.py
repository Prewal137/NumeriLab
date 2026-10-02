"""Romberg Integration Method.

Module: Module III (Numerical Differentiation and Integration)
Method: 9. Romberg Integration

Accelerates the convergence of composite trapezoidal quadrature approximations using
successive Richardson extrapolation:
    R(k, 0) = Composite Trapezoidal approximation with 2^k subintervals
    R(k, j) = R(k, j-1) + [R(k, j-1) - R(k-1, j-1)] / (4^j - 1),  for j = 1, ..., k.
"""

import math
from typing import Any, Dict, List, Optional
from core.errors import MathParsingError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_interval, validate_tolerance


def solve_romberg(
    f_expr: str,
    a: float,
    b: float,
    max_levels: int = 5,
    tolerance: float = 1e-8,
    reference_value: Optional[float] = None,
) -> NumericalResult:
    """Computes high-accuracy definite integral of f(x) on [a, b] using Romberg Integration.

    Args:
        f_expr: Mathematical expression string for integrand f(x) (e.g., 'sin(x)', 'exp(-x**2)').
        a: Lower integration limit.
        b: Upper integration limit (must be strictly greater than a).
        max_levels: Maximum number of extrapolation levels/rows in the Romberg tableau (integer between 1 and 12).
        tolerance: Stopping tolerance threshold for difference between successive diagonal estimates.
        reference_value: Optional analytical benchmark integral value.

    Returns:
        NumericalResult: Standardized result container with full Romberg tableau, best estimate,
                         convergence status, and visualization of extrapolation accuracy.
    """
    # 1. Validation
    if not isinstance(max_levels, int) or isinstance(max_levels, bool) or max_levels < 1 or max_levels > 12:
        raise ValidationError(
            f"max_levels must be an integer between 1 and 12, got {max_levels}."
        )

    tol = validate_tolerance(tolerance, min_tol=1e-15, max_tol=1.0)
    a_val, b_val = validate_interval(a, b)

    if not f_expr or not isinstance(f_expr, str) or not f_expr.strip():
        raise ValidationError("Function expression cannot be empty.")

    # 2. Compile Integrand Function
    f_func = SafeMathParser.compile_function(f_expr, variable_names=("x",))

    try:
        fa = float(f_func(a_val))
        fb = float(f_func(b_val))
    except Exception as e:
        return NumericalResult(
            success=False,
            method="romberg",
            module=3,
            final_value=None,
            iterations=0,
            converged=False,
            error=f"Evaluation error at interval boundary: {str(e)}",
            explanation="Failed to evaluate the integrand at interval endpoints.",
        )

    if math.isnan(fa) or math.isinf(fa) or math.isnan(fb) or math.isinf(fb):
        return NumericalResult(
            success=False,
            method="romberg",
            module=3,
            final_value=None,
            iterations=0,
            converged=False,
            error="Integrand evaluated to non-finite value at interval endpoints.",
            explanation="Integrand must be finite and bounded across the integration domain.",
        )

    # 3. Construct Romberg Tableau
    R: List[List[float]] = [[0.0] * (k + 1) for k in range(max_levels)]
    table: List[Dict[str, Any]] = []
    diagonal_estimates: List[float] = []
    estimated_errors: List[Optional[float]] = []

    # Level 0 (single trapezoid across [a, b])
    h0 = b_val - a_val
    R[0][0] = 0.5 * h0 * (fa + fb)
    diagonal_estimates.append(R[0][0])
    estimated_errors.append(None)

    table.append({
        "level": 0,
        "subintervals": 1,
        "step_size": round(h0, 8),
        "trapezoidal_R_k_0": round(R[0][0], 8),
        "extrapolations": [],
        "best_estimate": round(R[0][0], 8),
        "estimated_error": None,
    })

    converged = False
    levels_computed = 1
    final_val = R[0][0]
    final_err_est = None

    for k in range(1, max_levels):
        levels_computed = k + 1
        hk = h0 / (2.0 ** k)

        # Efficient recursive trapezoidal sum using newly introduced midpoints
        sum_new = 0.0
        for i in range(1, 2 ** k, 2):
            xi = a_val + i * hk
            try:
                f_val = float(f_func(xi))
            except Exception as e:
                return NumericalResult(
                    success=False,
                    method="romberg",
                    module=3,
                    final_value=final_val,
                    iterations=k,
                    converged=False,
                    error=f"Evaluation error at x = {xi:.6f}: {str(e)}",
                    table=table,
                    explanation="Integrand evaluation error encountered during Romberg refinement.",
                )

            if math.isnan(f_val) or math.isinf(f_val):
                return NumericalResult(
                    success=False,
                    method="romberg",
                    module=3,
                    final_value=final_val,
                    iterations=k,
                    converged=False,
                    error=f"Integrand produced non-finite value ({f_val}) at x = {xi:.6f}.",
                    table=table,
                    explanation="Function divergence or singularity detected.",
                )

            sum_new += f_val

        R[k][0] = 0.5 * R[k - 1][0] + hk * sum_new

        # Richardson Extrapolations: R(k, j) = R(k, j-1) + [R(k, j-1) - R(k-1, j-1)] / (4^j - 1)
        for j in range(1, k + 1):
            factor = 4.0 ** j - 1.0
            R[k][j] = R[k][j - 1] + (R[k][j - 1] - R[k - 1][j - 1]) / factor

        current_best = R[k][k]
        prev_best = R[k - 1][k - 1]
        err_est = abs(current_best - prev_best)
        final_err_est = err_est
        final_val = current_best

        diagonal_estimates.append(current_best)
        estimated_errors.append(err_est)

        extrap_vals = [round(R[k][j], 8) for j in range(1, k + 1)]
        table.append({
            "level": k,
            "subintervals": 2 ** k,
            "step_size": round(hk, 8),
            "trapezoidal_R_k_0": round(R[k][0], 8),
            "extrapolations": extrap_vals,
            "best_estimate": round(current_best, 8),
            "estimated_error": round(err_est, 10),
        })

        if err_est < tol:
            converged = True
            break

    # 4. Error Analysis
    err_analysis = None
    if reference_value is not None:
        ref = float(reference_value)
        abs_err = abs(final_val - ref)
        rel_err = abs_err / abs(ref) if abs(ref) > 1e-15 else abs_err
        err_analysis = ErrorAnalysis(
            reference_value=ref,
            absolute_error=abs_err,
            relative_error=rel_err,
            estimated_error=final_err_est,
        )
    elif final_err_est is not None:
        err_analysis = ErrorAnalysis(estimated_error=final_err_est)

    # 5. Visualization Payload
    vis_series = [
        {
            "name": "Romberg Diagonal Estimate R(k,k)",
            "data": [{"x": k_idx, "y": round(est, 8)} for k_idx, est in enumerate(diagonal_estimates)],
        },
        {
            "name": "Initial Trapezoidal Column R(k,0)",
            "data": [{"x": k_idx, "y": round(R[k_idx][0], 8)} for k_idx in range(levels_computed)],
        },
    ]

    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Romberg Integration Convergence for f(x) = {f_expr}",
        x_label="Romberg Level (k)",
        y_label="Integral Estimate",
        series=vis_series,
        metadata={
            "levels_computed": levels_computed,
            "tableau_size": f"{levels_computed}x{levels_computed}",
            "tolerance": tol,
        },
    )

    # 6. Explanation
    explanation = (
        f"Romberg Integration across {levels_computed} refinement levels (2^{levels_computed-1} max subintervals) "
        f"evaluated integral of f(x) = {f_expr} on [{a_val}, {b_val}] to R({levels_computed-1},{levels_computed-1}) ≈ {final_val:.8f}."
    )
    if converged:
        explanation += f" Satisfied convergence tolerance ({tol}) with estimated step difference {final_err_est:.2e}."
    else:
        explanation += f" Completed all {max_levels} configured levels."

    return NumericalResult(
        success=True,
        method="romberg",
        module=3,
        final_value=round(final_val, 8),
        iterations=levels_computed,
        converged=converged,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "f_expr": f_expr,
            "a": a_val,
            "b": b_val,
            "max_levels": max_levels,
            "levels_computed": levels_computed,
            "tolerance": tol,
            "romberg_tableau": [[round(val, 8) for val in row] for row in R[:levels_computed]],
        },
    )
