"""Finite Difference Method for Two-Point Linear Boundary Value Problems (BVPs).

Module: Module V (Boundary Value Problems and Partial Differential Equations)
Method: 13. Two-Point Linear Boundary Value Problem

Solves the second-order linear differential equation:
    y'' + p(x)y' + q(x)y = r(x)   on   a <= x <= b
with boundary conditions:
    alpha1 * y(a) + beta1 * y'(a) = gamma1
    alpha2 * y(b) + beta2 * y'(b) = gamma2
"""

import math
from typing import Any, Dict, List, Optional
import numpy as np
from core.errors import MathParsingError, SingularityError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_interval


def solve_linear_bvp(
    p_expr: str = "0",
    q_expr: str = "0",
    r_expr: str = "0",
    a: float = 0.0,
    b: float = 1.0,
    n: int = 20,
    alpha1: float = 1.0,
    beta1: float = 0.0,
    gamma1: float = 0.0,
    alpha2: float = 1.0,
    beta2: float = 0.0,
    gamma2: float = 0.0,
    reference_solution_expr: Optional[str] = None,
) -> NumericalResult:
    """Solves a second-order linear two-point BVP using the central finite-difference method.

    Args:
        p_expr: Coefficient of y' as a function of x (default "0").
        q_expr: Coefficient of y as a function of x (default "0").
        r_expr: Right-hand side source term r(x) (default "0").
        a: Left boundary x-coordinate.
        b: Right boundary x-coordinate (b > a).
        n: Number of spatial subintervals (n >= 3).
        alpha1, beta1, gamma1: Left boundary condition alpha1*y(a) + beta1*y'(a) = gamma1.
        alpha2, beta2, gamma2: Right boundary condition alpha2*y(b) + beta2*y'(b) = gamma2.
        reference_solution_expr: Optional exact analytical expression y(x) for error benchmark.

    Returns:
        NumericalResult: Standardized result container with grid coordinates x_i,
                         computed solution vector y_i, coefficient matrix diagnostics, and visualization.
    """
    # 1. Validation
    a_val, b_val = validate_interval(a, b)

    if not isinstance(n, int) or isinstance(n, bool) or n < 3 or n > 2000:
        raise ValidationError(f"Number of subintervals n must be an integer between 3 and 2000, got {n}.")

    for name, val in [
        ("alpha1", alpha1), ("beta1", beta1), ("gamma1", gamma1),
        ("alpha2", alpha2), ("beta2", beta2), ("gamma2", gamma2)
    ]:
        if val is None or not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
            raise ValidationError(f"Boundary parameter '{name}' must be a finite real number.")

    a1, b1, g1 = float(alpha1), float(beta1), float(gamma1)
    a2, b2, g2 = float(alpha2), float(beta2), float(gamma2)

    if abs(a1) < 1e-15 and abs(b1) < 1e-15:
        raise ValidationError("Left boundary condition requires at least one non-zero coefficient (alpha1 or beta1).")
    if abs(a2) < 1e-15 and abs(b2) < 1e-15:
        raise ValidationError("Right boundary condition requires at least one non-zero coefficient (alpha2 or beta2).")

    # 2. Compile Coefficient Functions
    p_func = SafeMathParser.compile_function(p_expr if p_expr.strip() else "0", variable_names=("x",))
    q_func = SafeMathParser.compile_function(q_expr if q_expr.strip() else "0", variable_names=("x",))
    r_func = SafeMathParser.compile_function(r_expr if r_expr.strip() else "0", variable_names=("x",))

    ref_func = None
    if reference_solution_expr and reference_solution_expr.strip():
        ref_func = SafeMathParser.compile_function(reference_solution_expr.strip(), variable_names=("x",))

    # 3. Discretization Grid
    num_nodes = n + 1
    h = (b_val - a_val) / float(n)
    h2 = h * h
    x_grid = [a_val + i * h if i < n else b_val for i in range(num_nodes)]

    # 4. Construct Finite Difference Matrix A and RHS vector B (Size: (n+1) x (n+1))
    A_mat = np.zeros((num_nodes, num_nodes), dtype=float)
    B_vec = np.zeros(num_nodes, dtype=float)

    # Left Boundary Condition at Node 0
    if abs(b1) < 1e-15:
        # Dirichlet: y(a) = gamma1 / alpha1
        A_mat[0, 0] = a1
        B_vec[0] = g1
    else:
        # Robin/Neumann: alpha1*y0 + beta1 * (-3y0 + 4y1 - y2)/(2h) = gamma1
        A_mat[0, 0] = a1 - (1.5 * b1 / h)
        A_mat[0, 1] = 2.0 * b1 / h
        A_mat[0, 2] = -0.5 * b1 / h
        B_vec[0] = g1

    # Interior Nodes i = 1, ..., n-1
    for i in range(1, n):
        xi = x_grid[i]
        try:
            pi = float(p_func(xi))
            qi = float(q_func(xi))
            ri = float(r_func(xi))
        except Exception as e:
            return NumericalResult(
                success=False,
                method="linear-bvp",
                module=5,
                final_value=None,
                iterations=0,
                converged=False,
                error=f"Evaluation error of coefficient functions at x = {xi:.6f}: {str(e)}",
                explanation="Failed to evaluate BVP coefficient functions (p, q, or r).",
            )

        if any(math.isnan(v) or math.isinf(v) for v in (pi, qi, ri)):
            return NumericalResult(
                success=False,
                method="linear-bvp",
                module=5,
                final_value=None,
                iterations=0,
                converged=False,
                error=f"Coefficient evaluated to non-finite value at x = {xi:.6f}.",
                explanation="BVP coefficients must be continuous and finite on [a, b].",
            )

        # Finite difference equation:
        # (1 - h/2 * p_i) * y_{i-1} + (-2 + h^2 * q_i) * y_i + (1 + h/2 * p_i) * y_{i+1} = h^2 * r_i
        A_mat[i, i - 1] = 1.0 - 0.5 * h * pi
        A_mat[i, i] = -2.0 + h2 * qi
        A_mat[i, i + 1] = 1.0 + 0.5 * h * pi
        B_vec[i] = h2 * ri

    # Right Boundary Condition at Node n
    if abs(b2) < 1e-15:
        # Dirichlet: y(b) = gamma2 / alpha2
        A_mat[n, n] = a2
        B_vec[n] = g2
    else:
        # Robin/Neumann: alpha2*yn + beta2 * (3yn - 4y_{n-1} + y_{n-2})/(2h) = gamma2
        A_mat[n, n - 2] = 0.5 * b2 / h
        A_mat[n, n - 1] = -2.0 * b2 / h
        A_mat[n, n] = a2 + (1.5 * b2 / h)
        B_vec[n] = g2

    # 5. Solve Algebraic System
    try:
        y_solution = np.linalg.solve(A_mat, B_vec).tolist()
    except np.linalg.LinAlgError as e:
        raise SingularityError(f"Linear BVP algebraic system is singular or ill-conditioned: {str(e)}")

    if any(math.isnan(val) or math.isinf(val) or abs(val) > 1e100 for val in y_solution):
        return NumericalResult(
            success=False,
            method="linear-bvp",
            module=5,
            final_value=None,
            iterations=num_nodes,
            converged=False,
            error="Solution vector contains non-finite numbers or overflowed numerical bounds.",
            explanation="The discretized BVP system yielded divergent solution values.",
        )

    # 6. Table Construction and Reference Error
    table: List[Dict[str, Any]] = []
    y_exact_vals: Optional[List[float]] = None
    abs_errors: Optional[List[float]] = None

    if ref_func is not None:
        y_exact_vals = []
        abs_errors = []
        for i in range(num_nodes):
            try:
                y_ex = float(ref_func(x_grid[i]))
                y_exact_vals.append(y_ex)
                abs_errors.append(abs(y_solution[i] - y_ex))
            except Exception:
                y_exact_vals = None
                abs_errors = None
                break

    for i in range(num_nodes):
        row: Dict[str, Any] = {
            "index": i,
            "x_i": round(x_grid[i], 8),
            "y_i": round(y_solution[i], 8),
        }
        if y_exact_vals is not None:
            row["y_exact"] = round(y_exact_vals[i], 8)
            row["abs_error"] = round(abs_errors[i], 8)
        table.append(row)

    # Error analysis
    err_analysis = None
    if abs_errors is not None:
        max_abs_err = max(abs_errors)
        max_ref = max(abs(v) for v in y_exact_vals)
        rel_err = max_abs_err / max_ref if max_ref > 1e-15 else max_abs_err
        err_analysis = ErrorAnalysis(
            reference_value=[round(v, 8) for v in y_exact_vals],
            absolute_error=[round(v, 8) for v in abs_errors],
            relative_error=rel_err,
        )

    # 7. Visualization Payload
    series_list: List[Dict[str, Any]] = [
        {
            "name": "BVP Solution y(x)",
            "data": [{"x": round(x_grid[k], 6), "y": round(y_solution[k], 6)} for k in range(num_nodes)],
        }
    ]
    if y_exact_vals is not None:
        series_list.append({
            "name": "Exact Reference y_exact(x)",
            "data": [{"x": round(x_grid[k], 6), "y": round(y_exact_vals[k], 6)} for k in range(num_nodes)],
        })

    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"Two-Point Linear BVP Solution (n = {n} subintervals)",
        x_label="x",
        y_label="y(x)",
        series=series_list,
        metadata={
            "a": a_val,
            "b": b_val,
            "step_size_h": h,
            "grid_nodes": num_nodes,
        },
    )

    # 8. Explanation
    explanation = (
        f"Central finite-difference method discretized the BVP y'' + ({p_expr})y' + ({q_expr})y = {r_expr} "
        f"over [{a_val}, {b_val}] using {n} subintervals (h = {h:.4f}). "
        f"Boundary values: y(a) ≈ {y_solution[0]:.6f}, y(b) ≈ {y_solution[-1]:.6f}."
    )

    return NumericalResult(
        success=True,
        method="linear-bvp",
        module=5,
        final_value=[round(val, 8) for val in y_solution],
        iterations=num_nodes,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "p_expr": p_expr,
            "q_expr": q_expr,
            "r_expr": r_expr,
            "a": a_val,
            "b": b_val,
            "n_subintervals": n,
            "step_size_h": h,
            "y_left": round(y_solution[0], 8),
            "y_right": round(y_solution[-1], 8),
        },
    )
