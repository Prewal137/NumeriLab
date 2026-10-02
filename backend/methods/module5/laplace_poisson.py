"""2D Laplace and Poisson Equation Solver using Finite Differences (Gauss-Seidel).

Module: Module V (Boundary Value Problems and Partial Differential Equations)
Method: 14. 2D Laplace/Poisson Equation (Five-Point Finite Difference Stencil)

Solves elliptic PDEs of the form:
    ∂²u/∂x² + ∂²u/∂y² = f(x, y)   on   [x_min, x_max] × [y_min, y_max]

where:
- Laplace equation: f(x, y) = 0
- Poisson equation: f(x, y) is a specified source term

Discretized using standard 5-point finite-difference stencil and solved via Gauss-Seidel iteration.
"""

import math
from typing import Any, Dict, List, Optional, Union
import numpy as np

from core.errors import MathParsingError, ValidationError
from core.parser import SafeMathParser
from core.result import NumericalResult, VisualizationPayload
from core.validation import validate_interval


def solve_laplace_poisson(
    pde_type: str = "laplace",
    source_expr: str = "0",
    x_min: float = 0.0,
    x_max: float = 1.0,
    y_min: float = 0.0,
    y_max: float = 1.0,
    nx: int = 21,
    ny: int = 21,
    top_val: Union[float, str] = 100.0,
    bottom_val: Union[float, str] = 0.0,
    left_val: Union[float, str] = 0.0,
    right_val: Union[float, str] = 0.0,
    tolerance: float = 1e-5,
    max_iterations: int = 2000,
) -> NumericalResult:
    """Solves the 2D Laplace or Poisson equation on a rectangular domain with Dirichlet boundaries.

    Args:
        pde_type: 'laplace' or 'poisson' (case-insensitive).
        source_expr: RHS source term f(x, y) as a mathematical string (ignored for Laplace).
        x_min: Left domain boundary.
        x_max: Right domain boundary (x_max > x_min).
        y_min: Bottom domain boundary.
        y_max: Top domain boundary (y_max > y_min).
        nx: Number of spatial grid points in x direction (3 <= nx <= 100).
        ny: Number of spatial grid points in y direction (3 <= ny <= 100).
        top_val: Top boundary condition at y = y_max (scalar value or expression in terms of x).
        bottom_val: Bottom boundary condition at y = y_min (scalar value or expression in terms of x).
        left_val: Left boundary condition at x = x_min (scalar value or expression in terms of y).
        right_val: Right boundary condition at x = x_max (scalar value or expression in terms of y).
        tolerance: Maximum interior point change convergence criterion (|u_new - u_old| < tol).
        max_iterations: Maximum allowed Gauss-Seidel iterations (1 <= max_iterations <= 20000).

    Returns:
        NumericalResult: Standardized container with 2D solution matrix, convergence history,
                         surface/heatmap visualization payload, and metadata.
    """
    # 1. Validation
    x_min_val, x_max_val = validate_interval(x_min, x_max)
    y_min_val, y_max_val = validate_interval(y_min, y_max)

    if not isinstance(nx, int) or isinstance(nx, bool) or nx < 3 or nx > 100:
        raise ValidationError(f"Grid resolution nx must be an integer between 3 and 100, got {nx}.")
    if not isinstance(ny, int) or isinstance(ny, bool) or ny < 3 or ny > 100:
        raise ValidationError(f"Grid resolution ny must be an integer between 3 and 100, got {ny}.")

    if nx * ny > 10000:
        raise ValidationError(f"Total grid nodes nx * ny ({nx * ny}) exceeds safety limit of 10,000.")

    if not isinstance(tolerance, (int, float)) or tolerance <= 0 or math.isnan(tolerance) or math.isinf(tolerance):
        raise ValidationError(f"Convergence tolerance must be a positive finite number, got {tolerance}.")

    if not isinstance(max_iterations, int) or isinstance(max_iterations, bool) or max_iterations < 1 or max_iterations > 20000:
        raise ValidationError(f"max_iterations must be an integer between 1 and 20000, got {max_iterations}.")

    pde_norm = str(pde_type).strip().lower()
    if pde_norm not in ("laplace", "poisson"):
        raise ValidationError(f"Invalid pde_type '{pde_type}'. Must be 'laplace' or 'poisson'.")

    # 2. Compile Source and Boundary Functions
    f_func = None
    if pde_norm == "poisson":
        source_str = source_expr.strip() if (source_expr and source_expr.strip()) else "0"
        try:
            f_func = SafeMathParser.compile_function(source_str, variable_names=("x", "y"))
        except MathParsingError as e:
            raise MathParsingError(f"Invalid source function f(x, y): {str(e)}")

    def _compile_boundary(val: Union[float, str], var: str, name: str):
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
        return SafeMathParser.compile_function(val_str, variable_names=(var,))

    top_func = _compile_boundary(top_val, "x", "top_val")
    bottom_func = _compile_boundary(bottom_val, "x", "bottom_val")
    left_func = _compile_boundary(left_val, "y", "left_val")
    right_func = _compile_boundary(right_val, "y", "right_val")

    # 3. Discretize Grid
    dx = (x_max_val - x_min_val) / float(nx - 1)
    dy = (y_max_val - y_min_val) / float(ny - 1)
    x_grid = [x_min_val + i * dx if i < nx - 1 else x_max_val for i in range(nx)]
    y_grid = [y_min_val + j * dy if j < ny - 1 else y_max_val for j in range(ny)]

    # 4. Initialize Solution Grid u[j, i] (shape: ny x nx)
    u = np.zeros((ny, nx), dtype=float)

    # Evaluate boundary nodes
    try:
        for i in range(nx):
            u[0, i] = float(bottom_func(x_grid[i]))
            u[ny - 1, i] = float(top_func(x_grid[i]))
        for j in range(ny):
            u[j, 0] = float(left_func(y_grid[j]))
            u[j, nx - 1] = float(right_func(y_grid[j]))
    except Exception as e:
        return NumericalResult(
            success=False,
            method="laplace-poisson",
            module=5,
            final_value=None,
            iterations=0,
            converged=False,
            error=f"Error evaluating boundary expressions: {str(e)}",
            explanation="Failed to evaluate boundary condition expressions.",
        )

    # Reconcile corners by averaging adjacent boundary edges
    u[0, 0] = 0.5 * (u[0, 0] + float(left_func(y_grid[0])))
    u[0, nx - 1] = 0.5 * (u[0, nx - 1] + float(right_func(y_grid[0])))
    u[ny - 1, 0] = 0.5 * (u[ny - 1, 0] + float(left_func(y_grid[-1])))
    u[ny - 1, nx - 1] = 0.5 * (u[ny - 1, nx - 1] + float(right_func(y_grid[-1])))

    # Initialize interior nodes to the average boundary value
    boundary_mean = float(np.mean(np.concatenate([u[0, :], u[-1, :], u[:, 0], u[:, -1]])))
    u[1:-1, 1:-1] = boundary_mean

    # Evaluate Source Term Matrix F[j, i]
    F = np.zeros((ny, nx), dtype=float)
    if pde_norm == "poisson" and f_func is not None:
        try:
            for j in range(1, ny - 1):
                for i in range(1, nx - 1):
                    val = float(f_func(x_grid[i], y_grid[j]))
                    if math.isnan(val) or math.isinf(val):
                        return NumericalResult(
                            success=False,
                            method="laplace-poisson",
                            module=5,
                            final_value=None,
                            iterations=0,
                            converged=False,
                            error=f"Source function f(x, y) evaluated to non-finite value at ({x_grid[i]:.4f}, {y_grid[j]:.4f}).",
                            explanation="Source function f(x, y) must be finite throughout the domain.",
                        )
                    F[j, i] = val
        except Exception as e:
            return NumericalResult(
                success=False,
                method="laplace-poisson",
                module=5,
                final_value=None,
                iterations=0,
                converged=False,
                error=f"Error evaluating source function f(x, y): {str(e)}",
                explanation="Failed during evaluation of source term f(x, y).",
            )

    # 5. Gauss-Seidel Iteration Loop
    dx2 = dx * dx
    dy2 = dy * dy
    denom = 2.0 * (dx2 + dy2)
    factor_x = dy2 / denom
    factor_y = dx2 / denom
    factor_f = (dx2 * dy2) / denom

    converged = False
    iterations_run = 0
    final_change = 0.0

    history: List[Dict[str, Any]] = []

    for it in range(1, max_iterations + 1):
        max_change = 0.0
        for j in range(1, ny - 1):
            for i in range(1, nx - 1):
                u_new = factor_x * (u[j, i + 1] + u[j, i - 1]) + factor_y * (u[j + 1, i] + u[j - 1, i]) - factor_f * F[j, i]
                change = abs(u_new - u[j, i])
                if change > max_change:
                    max_change = change
                u[j, i] = u_new

        iterations_run = it
        final_change = max_change

        # Record iteration history sample (initial steps, log-spaced or periodic, and final)
        if it <= 5 or it % max(1, max_iterations // 20) == 0 or max_change < tolerance or it == max_iterations:
            center_val = float(u[ny // 2, nx // 2])
            history.append({
                "iteration": it,
                "max_change": round(max_change, 8),
                "center_value": round(center_val, 8),
            })

        if math.isnan(max_change) or math.isinf(max_change) or max_change > 1e100:
            return NumericalResult(
                success=False,
                method="laplace-poisson",
                module=5,
                final_value=None,
                iterations=iterations_run,
                converged=False,
                error="Gauss-Seidel iterations diverged to non-finite or excessively large values.",
                explanation="Numerical divergence detected during PDE relaxation.",
            )

        if max_change < tolerance:
            converged = True
            break

    # 6. Visualization Payload
    # Meshgrid series for 3D surface and heatmap rendering
    mesh_points: List[Dict[str, Any]] = []
    for j in range(ny):
        for i in range(nx):
            mesh_points.append({
                "x": round(x_grid[i], 6),
                "y": round(y_grid[j], 6),
                "z": round(float(u[j, i]), 6),
            })

    u_matrix_rounded = [[round(float(u[j, i]), 6) for i in range(nx)] for j in range(ny)]

    vis_payload = VisualizationPayload(
        chart_type="surface",
        title=f"2D {pde_norm.capitalize()} Equation Solution Field ({nx}×{ny} grid)",
        x_label="x",
        y_label="y",
        z_label="u(x, y)",
        series=[
            {
                "name": f"{pde_norm.capitalize()} Solution u(x, y)",
                "data": mesh_points,
                "matrix": u_matrix_rounded,
            }
        ],
        metadata={
            "nx": nx,
            "ny": ny,
            "dx": round(dx, 6),
            "dy": round(dy, 6),
            "x_min": x_min_val,
            "x_max": x_max_val,
            "y_min": y_min_val,
            "y_max": y_max_val,
            "z_min": round(float(np.min(u)), 6),
            "z_max": round(float(np.max(u)), 6),
            "x_grid": [round(x, 6) for x in x_grid],
            "y_grid": [round(y, 6) for y in y_grid],
        },
    )

    # 7. Pedagogical Explanation
    center_val = float(u[ny // 2, nx // 2])
    status_str = "converged" if converged else "reached max iterations without fully meeting tolerance"
    explanation = (
        f"Solved 2D {pde_norm.capitalize()} equation on [{x_min_val}, {x_max_val}] × [{y_min_val}, {y_max_val}] "
        f"using a {nx}×{ny} grid (dx = {dx:.4f}, dy = {dy:.4f}). "
        f"Gauss-Seidel relaxation {status_str} in {iterations_run} iterations "
        f"with final change {final_change:.2e} (tolerance = {tolerance:.2e}). "
        f"Center field value u({x_grid[nx // 2]:.2f}, {y_grid[ny // 2]:.2f}) ≈ {center_val:.6f}."
    )

    return NumericalResult(
        success=True,
        method="laplace-poisson",
        module=5,
        final_value=u_matrix_rounded,
        iterations=iterations_run,
        converged=converged,
        error=None if converged else f"Maximum iterations ({max_iterations}) reached without reaching tolerance {tolerance}.",
        table=history,
        visualization=vis_payload,
        explanation=explanation,
        metadata={
            "pde_type": pde_norm,
            "source_expr": source_expr if pde_norm == "poisson" else "0",
            "x_min": x_min_val,
            "x_max": x_max_val,
            "y_min": y_min_val,
            "y_max": y_max_val,
            "nx": nx,
            "ny": ny,
            "dx": round(dx, 8),
            "dy": round(dy, 8),
            "final_change": round(final_change, 8),
            "tolerance": tolerance,
            "center_value": round(center_val, 8),
            "x_grid": [round(x, 8) for x in x_grid],
            "y_grid": [round(y, 8) for y in y_grid],
        },
    )
