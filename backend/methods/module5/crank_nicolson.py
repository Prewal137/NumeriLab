"""Crank-Nicolson Finite-Difference Solver for 1D Heat Equation.

Module: Module V (Boundary Value Problems and Partial Differential Equations)
Method: 15. Crank-Nicolson Method for 1D Heat Equation

Solves the parabolic PDE:
    ∂u/∂t = α ∂²u/∂x²   on   x_min <= x <= x_max,   t_start <= t <= t_end
with initial condition:
    u(x, t_start) = u0(x)
and Dirichlet boundary conditions:
    u(x_min, t) = g_left(t)
    u(x_max, t) = g_right(t)

Uses the unconditionally stable implicit Crank-Nicolson scheme with parameter:
    r = (α * Δt) / (2 * Δx²)
"""

import math
from typing import Any, Dict, List, Optional, Union
import numpy as np

from core.errors import MathParsingError, SingularityError, ValidationError
from core.parser import SafeMathParser
from core.result import ErrorAnalysis, NumericalResult, VisualizationPayload
from core.validation import validate_interval


def solve_crank_nicolson(
    alpha: float = 1.0,
    x_min: float = 0.0,
    x_max: float = 1.0,
    t_start: float = 0.0,
    t_end: float = 0.1,
    nx: int = 21,
    nt: int = 51,
    u0_expr: str = "sin(pi*x)",
    left_expr: Union[float, str] = 0.0,
    right_expr: Union[float, str] = 0.0,
    reference_expr: Optional[str] = None,
) -> NumericalResult:
    """Solves 1D heat equation via the implicit Crank-Nicolson finite-difference method.

    Args:
        alpha: Thermal diffusivity constant (alpha > 0).
        x_min: Left spatial boundary.
        x_max: Right spatial boundary (x_max > x_min).
        t_start: Initial simulation time.
        t_end: Final simulation time (t_end > t_start).
        nx: Number of spatial grid points (nx >= 3).
        nt: Number of temporal grid points / steps + 1 (nt >= 2).
        u0_expr: Initial spatial temperature profile u(x, t_start) as string expression of x.
        left_expr: Left boundary temperature u(x_min, t) (scalar or expression of t).
        right_expr: Right boundary temperature u(x_max, t) (scalar or expression of t).
        reference_expr: Optional exact analytical expression u(x, t) for error analysis.

    Returns:
        NumericalResult: Standardized container with spatial/temporal grids, full solution matrix U[t][x],
                         final temperature profile, slice visualization, and error metrics.
    """
    # 1. Validation
    if not isinstance(alpha, (int, float)) or alpha <= 0 or math.isnan(alpha) or math.isinf(alpha):
        raise ValidationError(f"Thermal diffusivity alpha must be a positive finite number, got {alpha}.")

    x_min_val, x_max_val = validate_interval(x_min, x_max)
    t_start_val, t_end_val = validate_interval(t_start, t_end)

    if not isinstance(nx, int) or isinstance(nx, bool) or nx < 3 or nx > 500:
        raise ValidationError(f"Spatial resolution nx must be an integer between 3 and 500, got {nx}.")

    if not isinstance(nt, int) or isinstance(nt, bool) or nt < 2 or nt > 2000:
        raise ValidationError(f"Temporal resolution nt must be an integer between 2 and 2000, got {nt}.")

    if nx * nt > 200000:
        raise ValidationError(f"Total grid points nx * nt ({nx * nt}) exceeds safety limit of 200,000.")

    # 2. Compile Expression Functions
    try:
        u0_func = SafeMathParser.compile_function(u0_expr.strip(), variable_names=("x",))
    except MathParsingError as e:
        raise MathParsingError(f"Invalid initial condition u0(x): {str(e)}")

    def _compile_boundary(val: Union[float, str], name: str):
        if isinstance(val, (int, float)):
            if math.isnan(val) or math.isinf(val):
                raise ValidationError(f"Boundary value '{name}' must be finite.")
            c = float(val)
            return lambda _: c
        val_str = str(val).strip()
        try:
            c = float(val_str)
            return lambda _: c
        except ValueError:
            pass
        return SafeMathParser.compile_function(val_str, variable_names=("t",))

    left_func = _compile_boundary(left_expr, "left_expr")
    right_func = _compile_boundary(right_expr, "right_expr")

    ref_func = None
    if reference_expr and reference_expr.strip():
        try:
            ref_func = SafeMathParser.compile_function(reference_expr.strip(), variable_names=("x", "t"))
        except MathParsingError as e:
            raise MathParsingError(f"Invalid reference solution expression: {str(e)}")

    # 3. Discretization Grid
    dx = (x_max_val - x_min_val) / float(nx - 1)
    dt = (t_end_val - t_start_val) / float(nt - 1)

    x_grid = [x_min_val + i * dx if i < nx - 1 else x_max_val for i in range(nx)]
    t_grid = [t_start_val + m * dt if m < nt - 1 else t_end_val for m in range(nt)]

    # Discretization parameter r = alpha * dt / (2 * dx^2)
    r = float(alpha) * dt / (2.0 * dx * dx)

    # 4. Initialize Solution Matrix U of shape (nt, nx)
    U = np.zeros((nt, nx), dtype=float)

    # Initial condition at t = 0
    try:
        for i in range(nx):
            val = float(u0_func(x_grid[i]))
            if math.isnan(val) or math.isinf(val):
                return NumericalResult(
                    success=False,
                    method="crank-nicolson",
                    module=5,
                    final_value=None,
                    iterations=0,
                    converged=False,
                    error=f"Initial condition u0(x) evaluated to non-finite value at x = {x_grid[i]:.4f}.",
                    explanation="Initial condition must be finite across [x_min, x_max].",
                )
            U[0, i] = val
    except Exception as e:
        return NumericalResult(
            success=False,
            method="crank-nicolson",
            module=5,
            final_value=None,
            iterations=0,
            converged=False,
            error=f"Error evaluating initial condition u0(x): {str(e)}",
            explanation="Failed during initial condition evaluation.",
        )

    # Apply boundary conditions across time
    try:
        for m in range(nt):
            U[m, 0] = float(left_func(t_grid[m]))
            U[m, nx - 1] = float(right_func(t_grid[m]))
    except Exception as e:
        return NumericalResult(
            success=False,
            method="crank-nicolson",
            module=5,
            final_value=None,
            iterations=0,
            converged=False,
            error=f"Error evaluating boundary conditions: {str(e)}",
            explanation="Failed during boundary condition evaluation.",
        )

    # 5. Build Crank-Nicolson Tridiagonal Matrix A for Interior Nodes
    n_int = nx - 2  # Number of interior spatial nodes (indices 1 to nx-2)
    A = np.zeros((n_int, n_int), dtype=float)
    for i in range(n_int):
        A[i, i] = 1.0 + 2.0 * r
        if i > 0:
            A[i, i - 1] = -r
        if i < n_int - 1:
            A[i, i + 1] = -r

    # 6. Time-Stepping Loop
    d_vec = np.zeros(n_int, dtype=float)
    for m in range(nt - 1):
        u_current = U[m, :]
        u_left_next = U[m + 1, 0]
        u_right_next = U[m + 1, nx - 1]

        # Compute RHS vector d
        for k in range(n_int):
            i = k + 1
            d_vec[k] = r * u_current[i - 1] + (1.0 - 2.0 * r) * u_current[i] + r * u_current[i + 1]

        # Add boundary contributions to first and last interior equations
        d_vec[0] += r * u_left_next
        d_vec[-1] += r * u_right_next

        # Solve linear system A * u_next_int = d
        try:
            u_next_int = np.linalg.solve(A, d_vec)
        except np.linalg.LinAlgError as e:
            raise SingularityError(f"Crank-Nicolson tridiagonal system is singular at time-step {m + 1}: {str(e)}")

        if any(math.isnan(v) or math.isinf(v) or abs(v) > 1e100 for v in u_next_int):
            return NumericalResult(
                success=False,
                method="crank-nicolson",
                module=5,
                final_value=None,
                iterations=m + 1,
                converged=False,
                error=f"Solution exploded or contained non-finite values at time step {m + 1}.",
                explanation="Numerical divergence detected during time-stepping.",
            )

        U[m + 1, 1:nx - 1] = u_next_int

    # 7. Final-Time Profile and Tabular Summary
    final_profile = [round(float(v), 8) for v in U[-1, :]]

    # Reference Solution Comparison at Final Time (t = t_end)
    y_exact_final: Optional[List[float]] = None
    abs_errors: Optional[List[float]] = None
    if ref_func is not None:
        y_exact_final = []
        abs_errors = []
        for i in range(nx):
            try:
                ex = float(ref_func(x_grid[i], t_end_val))
                y_exact_final.append(ex)
                abs_errors.append(abs(U[-1, i] - ex))
            except Exception:
                y_exact_final = None
                abs_errors = None
                break

    # Build solution table at final time t_end
    table: List[Dict[str, Any]] = []
    for i in range(nx):
        row: Dict[str, Any] = {
            "index": i,
            "x_i": round(x_grid[i], 6),
            "u_final": round(float(U[-1, i]), 8),
            "u_initial": round(float(U[0, i]), 8),
        }
        if y_exact_final is not None:
            row["u_exact"] = round(y_exact_final[i], 8)
            row["abs_error"] = round(abs_errors[i], 8)
        table.append(row)

    err_analysis = None
    if abs_errors is not None:
        max_abs = max(abs_errors)
        max_ref = max(abs(v) for v in y_exact_final)
        rel_err = max_abs / max_ref if max_ref > 1e-15 else max_abs
        err_analysis = ErrorAnalysis(
            reference_value=[round(v, 8) for v in y_exact_final],
            absolute_error=[round(v, 8) for v in abs_errors],
            relative_error=rel_err,
        )

    # 8. Visualization Payload
    # Sample 4-5 key time snapshots (t=0, 25%, 50%, 75%, 100%)
    time_indices = sorted(list(set([
        0,
        nt // 4,
        nt // 2,
        (3 * nt) // 4,
        nt - 1,
    ])))

    series_list: List[Dict[str, Any]] = []
    for idx in time_indices:
        t_val = t_grid[idx]
        series_list.append({
            "name": f"t = {t_val:.4f}",
            "data": [{"x": round(x_grid[i], 6), "y": round(float(U[idx, i]), 6)} for i in range(nx)],
        })

    if y_exact_final is not None:
        series_list.append({
            "name": f"Exact Reference at t = {t_end_val:.4f}",
            "data": [{"x": round(x_grid[i], 6), "y": round(y_exact_final[i], 6)} for i in range(nx)],
        })

    U_rounded = [[round(float(U[m, i]), 6) for i in range(nx)] for m in range(nt)]

    vis_payload = VisualizationPayload(
        chart_type="line",
        title=f"1D Heat Equation Crank-Nicolson Evolution (r = {r:.4f})",
        x_label="x",
        y_label="u(x, t)",
        series=series_list,
        metadata={
            "r_parameter": round(r, 6),
            "alpha": alpha,
            "dx": round(dx, 6),
            "dt": round(dt, 6),
            "nx": nx,
            "nt": nt,
            "x_min": x_min_val,
            "x_max": x_max_val,
            "t_start": t_start_val,
            "t_end": t_end_val,
            "matrix_u": U_rounded,
        },
    )

    # 9. Pedagogical Explanation
    max_final = float(np.max(np.abs(U[-1, :])))
    explanation = (
        f"Implicit Crank-Nicolson method stepped {nt - 1} time intervals from t = {t_start_val} to {t_end_val} "
        f"(dt = {dt:.5f}) across {nx} spatial nodes (dx = {dx:.4f}). "
        f"Diffusive mesh parameter r = (α*dt)/(2*dx²) = {r:.4f}. "
        f"Maximum magnitude at t = {t_end_val}: {max_final:.6f}."
    )

    return NumericalResult(
        success=True,
        method="crank-nicolson",
        module=5,
        final_value=final_profile,
        iterations=nt - 1,
        converged=True,
        error=None,
        error_analysis=err_analysis,
        table=table,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "alpha": alpha,
            "u0_expr": u0_expr,
            "r_parameter": round(r, 8),
            "dx": round(dx, 8),
            "dt": round(dt, 8),
            "nx": nx,
            "nt": nt,
            "x_min": x_min_val,
            "x_max": x_max_val,
            "t_start": t_start_val,
            "t_end": t_end_val,
            "x_grid": [round(x, 8) for x in x_grid],
            "t_grid": [round(t, 8) for t in t_grid],
        },
    )
