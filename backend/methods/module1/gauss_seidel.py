"""Gauss-Seidel Iterative Method for Linear Systems.

Module: Module I (Solution of Equations and Linear Systems)
Method: 3. Gauss-Seidel Method

System:
    A x = b

Iterative update formula:
    x_i^{(k+1)} = (b_i - sum_{j < i} a_{ij} x_j^{(k+1)} - sum_{j > i} a_{ij} x_j^{(k)}) / a_{ii}

Sequentially updates each unknown using the most recent values available within the current iteration.
"""

import math
from typing import Any, Dict, List, Optional, Sequence
import numpy as np
from core.errors import SingularityError, ValidationError
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_max_iterations, validate_square_matrix, validate_tolerance


def solve_gauss_seidel(
    matrix_a: Sequence[Sequence[float]],
    vector_b: Sequence[float],
    initial_guess: Optional[Sequence[float]] = None,
    tolerance: float = 1e-6,
    max_iterations: int = 100,
    reference_value: Optional[Sequence[float]] = None,
) -> NumericalResult:
    """Solves a system of linear equations Ax = b using the Gauss-Seidel iterative method.

    Args:
        matrix_a: Coefficient matrix A (must be a square matrix of size n x n).
        vector_b: Constant right-hand side vector b (length n).
        initial_guess: Optional starting vector x0 (length n, defaults to all zeros).
        tolerance: Stopping criterion tolerance for infinity norm of successive differences ||x^{(k+1)} - x^{(k)}||_inf.
        max_iterations: Maximum number of iterations allowed.
        reference_value: Optional analytical / benchmark solution vector for error calculation.

    Returns:
        NumericalResult: Standardized result container with iteration table, solution vector,
                         diagonal dominance analysis, and convergence metadata.
    """
    # 1. Validation
    tol = validate_tolerance(tolerance)
    max_iter = validate_max_iterations(max_iterations)
    n = validate_square_matrix(matrix_a)

    if vector_b is None or len(vector_b) != n:
        raise ValidationError(
            f"Dimension mismatch: Vector b must have length {n}, but got {len(vector_b) if vector_b else 0}."
        )

    # Convert to Python floats
    A = [[float(val) for val in row] for row in matrix_a]
    b = [float(val) for val in vector_b]

    # Validate or initialize initial guess
    if initial_guess is not None:
        if len(initial_guess) != n:
            raise ValidationError(
                f"Dimension mismatch: Initial guess must have length {n}, but got {len(initial_guess)}."
            )
        x = [float(val) for val in initial_guess]
    else:
        x = [0.0] * n

    # Diagonal validation: Ensure a_ii != 0
    for i in range(n):
        if abs(A[i][i]) < 1e-15:
            raise SingularityError(
                f"Gauss-Seidel requires non-zero diagonal coefficients. Zero detected at A[{i},{i}]."
            )

    # Check for Strict Diagonal Dominance: |a_ii| > sum_{j != i} |a_ij|
    is_diagonally_dominant = True
    dominance_margins: List[float] = []
    for i in range(n):
        diag = abs(A[i][i])
        off_diag_sum = sum(abs(A[i][j]) for j in range(n) if j != i)
        margin = diag - off_diag_sum
        dominance_margins.append(margin)
        if diag <= off_diag_sum:
            is_diagonally_dominant = False

    table: List[Dict[str, Any]] = []
    series_by_var: Dict[str, List[Dict[str, Any]]] = {f"x{i+1}": [{"x": 0, "y": x[i]}] for i in range(n)}
    converged = False
    final_error: Optional[float] = None

    for k in range(1, max_iter + 1):
        x_old = list(x)

        for i in range(n):
            sum_terms = sum(A[i][j] * x[j] for j in range(n) if j != i)
            x[i] = (b[i] - sum_terms) / A[i][i]

        # Check for numeric overflow or NaN
        if any(math.isnan(val) or math.isinf(val) or abs(val) > 1e100 for val in x):
            return NumericalResult(
                success=False,
                method="gauss-seidel",
                module=1,
                final_value=None,
                iterations=k,
                converged=False,
                error=f"Gauss-Seidel iteration diverged at step {k} (values exceeded numerical limit).",
                table=table,
                explanation="The iteration diverged. Note that Gauss-Seidel is guaranteed to converge only for strictly diagonally dominant or symmetric positive-definite matrices.",
                metadata={"is_diagonally_dominant": is_diagonally_dominant},
            )

        # Compute Infinity Norm of the step difference: max_i |x_i^{(k+1)} - x_i^{(k)}|
        step_error = max(abs(x[i] - x_old[i]) for i in range(n))
        final_error = step_error

        row_values = {f"x{i+1}": round(x[i], 8) for i in range(n)}
        table.append({
            "iteration": k,
            "values": row_values,
            "error": round(step_error, 8),
        })

        for i in range(n):
            series_by_var[f"x{i+1}"].append({"x": k, "y": round(x[i], 8)})

        if step_error < tol:
            converged = True
            break

    # 3. Error Analysis
    err_analysis = None
    if reference_value is not None:
        if len(reference_value) != n:
            raise ValidationError(
                f"Reference solution length ({len(reference_value)}) does not match system dimension ({n})."
            )
        ref_vec = [float(v) for v in reference_value]
        abs_errors = [abs(x[i] - ref_vec[i]) for i in range(n)]
        max_abs_err = max(abs_errors)
        ref_norm = max(abs(v) for v in ref_vec)
        rel_err = max_abs_err / ref_norm if ref_norm > 1e-15 else max_abs_err

        err_analysis = ErrorAnalysis(
            reference_value=ref_vec,
            absolute_error=abs_errors,
            relative_error=rel_err,
            estimated_error=final_error,
        )
    elif final_error is not None:
        err_analysis = ErrorAnalysis(estimated_error=final_error)

    # 4. Visualization Payload
    vis_series = [
        {"name": var_name, "data": points} for var_name, points in series_by_var.items()
    ]
    vis_payload = VisualizationPayload(
        chart_type="line",
        title="Gauss-Seidel Convergence of Unknowns",
        x_label="Iteration",
        y_label="Variable Value",
        series=vis_series,
        metadata={"dimension": n, "is_diagonally_dominant": is_diagonally_dominant},
    )

    # 5. Explanation
    diag_status = (
        "Matrix is strictly diagonally dominant (convergence guaranteed)."
        if is_diagonally_dominant
        else "Matrix is not strictly diagonally dominant (convergence is not guaranteed)."
    )

    if converged:
        solution_str = ", ".join(f"x{i+1} ≈ {x[i]:.6f}" for i in range(n))
        explanation = (
            f"Gauss-Seidel converged in {len(table)} iterations to ({solution_str}) "
            f"with tolerance {tol}. {diag_status}"
        )
    else:
        explanation = (
            f"Gauss-Seidel reached the maximum iteration limit ({max_iter}) "
            f"without achieving tolerance {tol}. {diag_status}"
        )

    return NumericalResult(
        success=True,
        method="gauss-seidel",
        module=1,
        final_value=[round(val, 8) for val in x],
        iterations=len(table),
        converged=converged,
        error=None if converged else f"Maximum iteration limit ({max_iter}) reached without convergence.",
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "dimension": n,
            "is_diagonally_dominant": is_diagonally_dominant,
            "tolerance": tol,
            "max_iterations": max_iter,
        },
    )
