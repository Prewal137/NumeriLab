"""Module V Test Suite.

Comprehensive unit and integration tests for:
1. Two-Point Linear Boundary Value Problem (solve_linear_bvp)
2. 2D Laplace / Poisson Equation (solve_laplace_poisson)
3. Crank-Nicolson Method for 1D Heat Equation (solve_crank_nicolson)
4. Module V API Handlers and Request Models
"""

import math
from fastapi import HTTPException
import numpy as np
import pytest

from api.module5 import (
    CrankNicolsonRequest,
    LaplacePoissonRequest,
    LinearBVPRequest,
    api_crank_nicolson,
    api_laplace_poisson,
    api_linear_bvp,
)
from core.errors import MathParsingError, SingularityError, ValidationError
from methods.module5 import (
    solve_crank_nicolson,
    solve_laplace_poisson,
    solve_linear_bvp,
)


# ==============================================================================
# 1. TWO-POINT LINEAR BOUNDARY VALUE PROBLEM TESTS
# ==============================================================================

def test_linear_bvp_parabolic_benchmark():
    """Verify BVP solver on y'' = -2 on [0, 1] with Dirichlet BCs y(0)=0, y(1)=0.
    Exact analytical solution is y(x) = x*(1-x), which has a maximum y(0.5) = 0.25.
    """
    n = 20
    result = solve_linear_bvp(
        p_expr="0",
        q_expr="0",
        r_expr="-2",
        a=0.0,
        b=1.0,
        n=n,
        alpha1=1.0,
        beta1=0.0,
        gamma1=0.0,
        alpha2=1.0,
        beta2=0.0,
        gamma2=0.0,
        reference_solution_expr="x*(1-x)",
    )

    assert result.success is True
    assert result.method == "linear-bvp"
    assert result.converged is True
    assert result.iterations == n + 1
    assert len(result.final_value) == n + 1

    # Exact check at midpoint x = 0.5 (index 10)
    mid_idx = n // 2
    assert abs(result.final_value[mid_idx] - 0.25) < 1e-6
    assert abs(result.final_value[0] - 0.0) < 1e-10
    assert abs(result.final_value[-1] - 0.0) < 1e-10

    # Error analysis
    assert result.error_analysis is not None
    assert result.error_analysis.relative_error < 1e-6
    assert len(result.table) == n + 1
    assert result.visualization is not None
    assert result.visualization.chart_type == "line"


def test_linear_bvp_variable_coefficients_sinh():
    """Verify BVP solver on y'' - y = 0 on [0, 1] with y(0)=0, y(1)=sinh(1) ≈ 1.17520119.
    Exact solution: y(x) = sinh(x).
    """
    sinh_1 = math.sinh(1.0)
    result = solve_linear_bvp(
        p_expr="0",
        q_expr="-1",
        r_expr="0",
        a=0.0,
        b=1.0,
        n=50,
        alpha1=1.0,
        beta1=0.0,
        gamma1=0.0,
        alpha2=1.0,
        beta2=0.0,
        gamma2=sinh_1,
        reference_solution_expr="sinh(x)",
    )

    assert result.success is True
    assert abs(result.final_value[0] - 0.0) < 1e-8
    assert abs(result.final_value[-1] - sinh_1) < 1e-8
    # Check midpoint x=0.5 -> sinh(0.5) ≈ 0.5210953
    sinh_half = math.sinh(0.5)
    assert abs(result.final_value[25] - sinh_half) < 1e-4


def test_linear_bvp_robin_neumann_bc():
    """Verify BVP solver with Robin/Neumann BC: y'' = 0 on [0, 1] with y'(0) = 2 and y(1) = 5.
    Exact solution: y(x) = 2*x + 3 -> y(0) = 3.
    """
    result = solve_linear_bvp(
        p_expr="0",
        q_expr="0",
        r_expr="0",
        a=0.0,
        b=1.0,
        n=20,
        alpha1=0.0,
        beta1=1.0,
        gamma1=2.0,  # y'(0) = 2
        alpha2=1.0,
        beta2=0.0,
        gamma2=5.0,  # y(1) = 5
    )

    assert result.success is True
    # y(0) should be 3.0
    assert abs(result.final_value[0] - 3.0) < 1e-4
    assert abs(result.final_value[-1] - 5.0) < 1e-8


def test_linear_bvp_invalid_interval():
    """Verify validation error when b <= a."""
    with pytest.raises(ValidationError):
        solve_linear_bvp(a=1.0, b=0.0)
    with pytest.raises(ValidationError):
        solve_linear_bvp(a=1.0, b=1.0)


def test_linear_bvp_invalid_grid_size():
    """Verify validation error on invalid subinterval count."""
    with pytest.raises(ValidationError):
        solve_linear_bvp(n=2)
    with pytest.raises(ValidationError):
        solve_linear_bvp(n=5000)


def test_linear_bvp_invalid_bc_coefficients():
    """Verify validation error when both alpha and beta are zero."""
    with pytest.raises(ValidationError):
        solve_linear_bvp(alpha1=0.0, beta1=0.0, gamma1=1.0)
    with pytest.raises(ValidationError):
        solve_linear_bvp(alpha2=0.0, beta2=0.0, gamma2=1.0)


def test_linear_bvp_non_finite_evaluation():
    """Verify graceful error return on singular/non-finite coefficient functions."""
    result = solve_linear_bvp(
        p_expr="1 / (x - 0.5)",
        a=0.0,
        b=1.0,
        n=10,
    )
    assert result.success is False
    assert result.error is not None


# ==============================================================================
# 2. 2D LAPLACE / POISSON EQUATION TESTS
# ==============================================================================

def test_laplace_constant_boundaries_symmetry():
    """Verify 2D Laplace equation with top=100, bottom=0, left=0, right=0 on [0, 1] x [0, 1].
    The harmonic field must exhibit left-right symmetry: u(x, y) = u(1-x, y).
    """
    nx, ny = 11, 11
    result = solve_laplace_poisson(
        pde_type="laplace",
        x_min=0.0,
        x_max=1.0,
        y_min=0.0,
        y_max=1.0,
        nx=nx,
        ny=ny,
        top_val=100.0,
        bottom_val=0.0,
        left_val=0.0,
        right_val=0.0,
        tolerance=1e-6,
        max_iterations=2000,
    )

    assert result.success is True
    assert result.method == "laplace-poisson"
    assert result.converged is True
    u_matrix = result.final_value
    assert len(u_matrix) == ny
    assert len(u_matrix[0]) == nx

    # Verify symmetry around middle column
    mid_j = ny // 2
    for i in range(nx // 2):
        assert abs(u_matrix[mid_j][i] - u_matrix[mid_j][nx - 1 - i]) < 1e-4

    # Center value must be between 0 and 100 (for Dirichlet with 3 zero walls and 1 top wall, center ≈ 25.0)
    center_val = u_matrix[ny // 2][nx // 2]
    assert 20.0 < center_val < 30.0


def test_laplace_uniform_boundary_equilibrium():
    """Verify Laplace equation with identical Dirichlet boundaries (all 50.0) yields 50.0 everywhere."""
    result = solve_laplace_poisson(
        pde_type="laplace",
        nx=9,
        ny=9,
        top_val=50.0,
        bottom_val=50.0,
        left_val=50.0,
        right_val=50.0,
        tolerance=1e-7,
        max_iterations=500,
    )

    assert result.success is True
    assert result.converged is True
    for row in result.final_value:
        for val in row:
            assert abs(val - 50.0) < 1e-4


def test_laplace_poisson_boundary_preservation():
    """Verify boundary rows/columns remain intact."""
    top, bottom, left, right = 80.0, 20.0, 40.0, 60.0
    result = solve_laplace_poisson(
        pde_type="laplace",
        nx=7,
        ny=7,
        top_val=top,
        bottom_val=bottom,
        left_val=left,
        right_val=right,
        tolerance=1e-5,
    )
    assert result.success is True
    u = result.final_value
    # Bottom interior
    for i in range(1, 6):
        assert abs(u[0][i] - bottom) < 1e-6
        assert abs(u[-1][i] - top) < 1e-6
    for j in range(1, 6):
        assert abs(u[j][0] - left) < 1e-6
        assert abs(u[j][-1] - right) < 1e-6


def test_poisson_known_source_sine():
    """Verify Poisson solver with source f(x, y) = -2*pi^2 * sin(pi*x) * sin(pi*y) on [0, 1]^2 with zero BCs.
    Exact solution is u(x, y) = sin(pi*x)*sin(pi*y), so at center (0.5, 0.5), u ≈ 1.0.
    """
    result = solve_laplace_poisson(
        pde_type="poisson",
        source_expr="-2 * (pi**2) * sin(pi*x) * sin(pi*y)",
        x_min=0.0,
        x_max=1.0,
        y_min=0.0,
        y_max=1.0,
        nx=21,
        ny=21,
        top_val=0.0,
        bottom_val=0.0,
        left_val=0.0,
        right_val=0.0,
        tolerance=1e-5,
        max_iterations=3000,
    )

    assert result.success is True
    assert result.converged is True
    center_val = result.final_value[10][10]
    # Exact center is 1.0; 21x21 finite difference with Gauss-Seidel should be within 0.05
    assert abs(center_val - 1.0) < 0.05


def test_laplace_poisson_invalid_inputs():
    """Verify validation errors for domains, grid resolution, and iterations."""
    with pytest.raises(ValidationError):
        solve_laplace_poisson(x_min=1.0, x_max=0.0)
    with pytest.raises(ValidationError):
        solve_laplace_poisson(y_min=2.0, y_max=1.0)
    with pytest.raises(ValidationError):
        solve_laplace_poisson(nx=2)
    with pytest.raises(ValidationError):
        solve_laplace_poisson(ny=150)
    with pytest.raises(ValidationError):
        solve_laplace_poisson(tolerance=-1e-4)
    with pytest.raises(ValidationError):
        solve_laplace_poisson(pde_type="hyperbolic")


def test_laplace_poisson_max_iterations_behavior():
    """Verify max iterations limit is respected and reported correctly."""
    result = solve_laplace_poisson(
        pde_type="laplace",
        nx=31,
        ny=31,
        top_val=100.0,
        bottom_val=0.0,
        left_val=0.0,
        right_val=0.0,
        tolerance=1e-12,  # Unrealistically tight
        max_iterations=5,
    )

    assert result.success is True
    assert result.converged is False
    assert result.iterations == 5
    assert "Maximum iterations" in (result.error or "")


# ==============================================================================
# 3. CRANK-NICOLSON METHOD FOR 1D HEAT EQUATION TESTS
# ==============================================================================

def test_crank_nicolson_diffusion_benchmark():
    """Verify Crank-Nicolson on ∂u/∂t = α ∂²u/∂x² with α=1, u(x,0)=sin(pi*x), u(0,t)=u(1,t)=0.
    Analytical solution: u(x, t) = exp(-pi^2 * t) * sin(pi*x).
    """
    t_end = 0.05
    result = solve_crank_nicolson(
        alpha=1.0,
        x_min=0.0,
        x_max=1.0,
        t_start=0.0,
        t_end=t_end,
        nx=21,
        nt=51,
        u0_expr="sin(pi*x)",
        left_expr=0.0,
        right_expr=0.0,
        reference_expr="exp(-pi**2 * t) * sin(pi*x)",
    )

    assert result.success is True
    assert result.method == "crank-nicolson"
    assert result.converged is True
    assert result.iterations == 50  # nt - 1

    # Check midpoint value at t_end
    expected_mid = math.exp(-(math.pi ** 2) * t_end) * math.sin(math.pi * 0.5)
    computed_mid = result.final_value[10]
    assert abs(computed_mid - expected_mid) < 0.01

    # Check error analysis
    assert result.error_analysis is not None
    assert result.error_analysis.relative_error < 0.02


def test_crank_nicolson_initial_condition_and_boundaries():
    """Verify initial condition at t=0 and boundaries at all times."""
    result = solve_crank_nicolson(
        alpha=0.5,
        x_min=0.0,
        x_max=2.0,
        t_start=0.0,
        t_end=0.2,
        nx=11,
        nt=21,
        u0_expr="x * (2 - x)",
        left_expr=0.0,
        right_expr=0.0,
    )

    assert result.success is True
    matrix_u = result.visualization.metadata["matrix_u"]
    assert len(matrix_u) == 21
    assert len(matrix_u[0]) == 11

    # Initial profile at t=0: u(1.0, 0) = 1.0*(2 - 1.0) = 1.0
    assert abs(matrix_u[0][5] - 1.0) < 1e-4

    # Boundaries must be 0 for all time steps
    for m in range(21):
        assert abs(matrix_u[m][0] - 0.0) < 1e-6
        assert abs(matrix_u[m][-1] - 0.0) < 1e-6


def test_crank_nicolson_r_parameter_calculation():
    """Verify mesh diffusion parameter r = alpha * dt / (2 * dx^2)."""
    alpha = 2.0
    x_min, x_max, nx = 0.0, 1.0, 11  # dx = 0.1, dx^2 = 0.01
    t_start, t_end, nt = 0.0, 0.1, 11  # dt = 0.01
    # r = (2.0 * 0.01) / (2 * 0.01) = 1.0
    result = solve_crank_nicolson(
        alpha=alpha,
        x_min=x_min,
        x_max=x_max,
        t_start=t_start,
        t_end=t_end,
        nx=nx,
        nt=nt,
        u0_expr="sin(pi*x)",
    )

    assert result.success is True
    assert abs(result.metadata["r_parameter"] - 1.0) < 1e-8


def test_crank_nicolson_single_step_hand_calculation():
    """Verify single time step on nx=3, nt=2, alpha=1, x in [0, 1], t in [0, 0.1].
    dx = 0.5, dt = 0.1 -> r = 1.0 * 0.1 / (2 * 0.25) = 0.2.
    u0 = [0, 1.0, 0].
    (1 + 2r) u_1^1 = (1 - 2r) u_1^0 -> 1.4 * u_1^1 = 0.6 * 1.0 -> u_1^1 = 0.6 / 1.4 = 3/7 ≈ 0.42857143.
    """
    result = solve_crank_nicolson(
        alpha=1.0,
        x_min=0.0,
        x_max=1.0,
        t_start=0.0,
        t_end=0.1,
        nx=3,
        nt=2,
        u0_expr="sin(pi*x)",
        left_expr=0.0,
        right_expr=0.0,
    )

    assert result.success is True
    expected_u1 = 3.0 / 7.0
    assert abs(result.final_value[1] - expected_u1) < 1e-6


def test_crank_nicolson_invalid_inputs():
    """Verify error handling on invalid physical parameters and grids."""
    with pytest.raises(ValidationError):
        solve_crank_nicolson(alpha=-1.0)
    with pytest.raises(ValidationError):
        solve_crank_nicolson(alpha=0.0)
    with pytest.raises(ValidationError):
        solve_crank_nicolson(x_min=1.0, x_max=0.5)
    with pytest.raises(ValidationError):
        solve_crank_nicolson(t_start=1.0, t_end=0.5)
    with pytest.raises(ValidationError):
        solve_crank_nicolson(nx=2)
    with pytest.raises(ValidationError):
        solve_crank_nicolson(nt=1)
    with pytest.raises(MathParsingError):
        solve_crank_nicolson(u0_expr="x +* 2")


# ==============================================================================
# 4. MODULE V FASTAPI ENDPOINT INTEGRATION TESTS
# ==============================================================================

def test_api_linear_bvp_endpoint():
    """Verify api_linear_bvp router handler with valid payload."""
    payload = LinearBVPRequest(
        p_expr="0",
        q_expr="0",
        r_expr="-2",
        a=0.0,
        b=1.0,
        n=10,
        alpha1=1.0,
        beta1=0.0,
        gamma1=0.0,
        alpha2=1.0,
        beta2=0.0,
        gamma2=0.0,
        reference_solution_expr="x*(1-x)",
    )
    result = api_linear_bvp(payload)
    assert result.success is True
    assert result.method == "linear-bvp"
    assert len(result.final_value) == 11
    assert abs(result.final_value[5] - 0.25) < 1e-6


def test_api_laplace_poisson_endpoint():
    """Verify api_laplace_poisson router handler with valid payload."""
    payload = LaplacePoissonRequest(
        pde_type="laplace",
        x_min=0.0,
        x_max=1.0,
        y_min=0.0,
        y_max=1.0,
        nx=11,
        ny=11,
        top_val=100.0,
        bottom_val=0.0,
        left_val=0.0,
        right_val=0.0,
        tolerance=1e-4,
        max_iterations=500,
    )
    result = api_laplace_poisson(payload)
    assert result.success is True
    assert result.method == "laplace-poisson"
    assert len(result.final_value) == 11


def test_api_crank_nicolson_endpoint():
    """Verify api_crank_nicolson router handler with valid payload."""
    payload = CrankNicolsonRequest(
        alpha=1.0,
        x_min=0.0,
        x_max=1.0,
        t_start=0.0,
        t_end=0.05,
        nx=11,
        nt=21,
        u0_expr="sin(pi*x)",
        left_expr=0.0,
        right_expr=0.0,
    )
    result = api_crank_nicolson(payload)
    assert result.success is True
    assert result.method == "crank-nicolson"
    assert len(result.final_value) == 11


def test_api_module5_validation_errors():
    """Verify HTTPException 400 Bad Request on invalid inputs through API layer."""
    with pytest.raises(HTTPException) as exc_info:
        api_linear_bvp(LinearBVPRequest(a=1.0, b=0.0, n=10))
    assert exc_info.value.status_code == 400

    with pytest.raises(HTTPException) as exc_info:
        api_laplace_poisson(LaplacePoissonRequest(nx=2))
    assert exc_info.value.status_code == 400

    with pytest.raises(HTTPException) as exc_info:
        api_crank_nicolson(CrankNicolsonRequest(alpha=-1.0))
    assert exc_info.value.status_code == 400
