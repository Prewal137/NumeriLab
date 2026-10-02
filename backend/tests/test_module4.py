"""Module IV Test Suite.

Comprehensive tests for:
1. Euler's Explicit Method (solve_euler)
2. Modified Euler's Method / Heun's (solve_modified_euler)
3. Fourth-Order Runge-Kutta (solve_rk4)
"""

import math
import pytest

from core.errors import MathParsingError, ValidationError
from methods.module4 import (
    solve_euler,
    solve_modified_euler,
    solve_rk4,
)


# ==============================================================================
# 1. EULER'S METHOD TESTS
# ==============================================================================

def test_euler_exponential_growth():
    """Verify Euler on dy/dx = y, y(0) = 1 on [0, 1] with h = 0.1.
    Exact step-by-step: y_n = (1 + h)^n -> y(1.0) = 1.1^10 ≈ 2.59374246.
    """
    result = solve_euler(
        f_expr="y",
        x0=0.0,
        y0=1.0,
        x_end=1.0,
        h=0.1,
        reference_value=math.e,
    )
    assert result.success is True
    assert result.method == "euler"
    assert result.converged is True
    expected_euler = (1.1 ** 10)
    assert abs(result.final_value - expected_euler) < 1e-6
    assert result.iterations == 10
    assert result.error_analysis is not None
    assert abs(result.error_analysis.reference_value - math.e) < 1e-12
    # Verify first step table values
    first_step = result.table[0]
    assert first_step["step"] == 1
    assert abs(first_step["x_n"] - 0.0) < 1e-8
    assert abs(first_step["y_n"] - 1.0) < 1e-8
    assert abs(first_step["slope_f"] - 1.0) < 1e-8
    assert abs(first_step["y_next"] - 1.1) < 1e-8


def test_euler_decay_ode():
    """Verify Euler on dy/dx = -2*y, y(0) = 1 on [0, 0.5] with h = 0.05.
    y_n = (1 - 2h)^n = (0.9)^10 ≈ 0.34867844.
    """
    result = solve_euler(
        f_expr="-2*y",
        x0=0.0,
        y0=1.0,
        x_end=0.5,
        h=0.05,
        reference_value=math.exp(-1.0),
    )
    assert result.success is True
    expected_val = 0.9 ** 10
    assert abs(result.final_value - expected_val) < 1e-6


def test_euler_linear_ode_hand_calculation():
    """Verify Euler on dy/dx = x + y, y(0) = 1, h = 0.1 for 2 steps (x_end = 0.2).
    Step 1: y_1 = 1 + 0.1*(0 + 1) = 1.10
    Step 2: y_2 = 1.10 + 0.1*(0.1 + 1.10) = 1.22
    """
    result = solve_euler(
        f_expr="x + y",
        x0=0.0,
        y0=1.0,
        x_end=0.2,
        h=0.1,
    )
    assert result.success is True
    assert result.iterations == 2
    assert abs(result.table[0]["y_next"] - 1.10) < 1e-8
    assert abs(result.table[1]["y_next"] - 1.22) < 1e-8
    assert abs(result.final_value - 1.22) < 1e-8


def test_euler_partial_final_step():
    """Verify non-exact multiple step sizes land precisely on x_end without overshooting."""
    # From x0=0 to x_end=0.25 with h=0.1 -> 3 steps (h=0.1, h=0.1, h=0.05)
    result = solve_euler(
        f_expr="x",
        x0=0.0,
        y0=0.0,
        x_end=0.25,
        h=0.1,
    )
    assert result.success is True
    assert result.iterations == 3
    assert abs(result.table[2]["step_h"] - 0.05) < 1e-8


def test_euler_invalid_interval():
    """Verify that x_end <= x0 raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_euler(f_expr="y", x0=1.0, y0=1.0, x_end=0.5, h=0.1)
    with pytest.raises(ValidationError):
        solve_euler(f_expr="y", x0=1.0, y0=1.0, x_end=1.0, h=0.1)


def test_euler_invalid_h():
    """Verify that non-positive step sizes raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_euler(f_expr="y", x0=0.0, y0=1.0, x_end=1.0, h=0.0)
    with pytest.raises(ValidationError):
        solve_euler(f_expr="y", x0=0.0, y0=1.0, x_end=1.0, h=-0.1)


def test_euler_invalid_expression():
    """Verify that syntax errors in ODE expression raise MathParsingError."""
    with pytest.raises(MathParsingError):
        solve_euler(f_expr="y ** / x", x0=0.0, y0=1.0, x_end=1.0, h=0.1)


# ==============================================================================
# 2. MODIFIED EULER (HEUN) TESTS
# ==============================================================================

def test_modified_euler_exponential_growth():
    """Verify Modified Euler on dy/dx = y, y(0) = 1, h = 0.1 on [0, 1].
    Step multiplier: 1 + h + h^2/2 = 1.105 -> y(1.0) = 1.105^10 ≈ 2.71408085.
    Analytical e ≈ 2.71828183.
    """
    result = solve_modified_euler(
        f_expr="y",
        x0=0.0,
        y0=1.0,
        x_end=1.0,
        h=0.1,
        reference_value=math.e,
    )
    assert result.success is True
    assert result.method == "modified-euler"
    expected_heun = 1.105 ** 10
    assert abs(result.final_value - expected_heun) < 1e-6
    assert result.error_analysis is not None
    assert result.error_analysis.absolute_error < 0.01


def test_modified_euler_predictor_corrector_stages():
    """Verify predictor and corrector stage values explicitly:
    dy/dx = x + y, x0 = 0, y0 = 1, h = 0.1 (1 step).
    f(0, 1) = 1.0
    y_pred = 1 + 0.1*1.0 = 1.10
    f(0.1, 1.10) = 1.20
    y_corr = 1 + (0.1/2)*(1.0 + 1.20) = 1 + 0.05*(2.20) = 1.11
    """
    result = solve_modified_euler(
        f_expr="x + y",
        x0=0.0,
        y0=1.0,
        x_end=0.1,
        h=0.1,
    )
    assert result.success is True
    assert result.iterations == 1
    row = result.table[0]
    assert abs(row["f_curr"] - 1.0) < 1e-8
    assert abs(row["y_pred"] - 1.10) < 1e-8
    assert abs(row["f_pred"] - 1.20) < 1e-8
    assert abs(row["y_next"] - 1.11) < 1e-8
    assert abs(result.final_value - 1.11) < 1e-8


def test_modified_euler_partial_final_step():
    """Verify predictor-corrector handles non-integer multiples of h."""
    result = solve_modified_euler(
        f_expr="2*x",
        x0=0.0,
        y0=0.0,
        x_end=0.25,
        h=0.1,
    )
    assert result.success is True
    assert result.iterations == 3
    # dy/dx = 2x -> y(x) = x^2 -> y(0.25) = 0.0625 (exact for Heun on quadratics!)
    assert abs(result.final_value - 0.0625) < 1e-8


def test_modified_euler_invalid_inputs():
    """Verify validation on bounds and step size."""
    with pytest.raises(ValidationError):
        solve_modified_euler(f_expr="y", x0=2.0, y0=1.0, x_end=1.0, h=0.1)
    with pytest.raises(ValidationError):
        solve_modified_euler(f_expr="y", x0=0.0, y0=1.0, x_end=1.0, h=-0.05)


def test_modified_euler_invalid_expression():
    """Verify math syntax error rejection."""
    with pytest.raises(MathParsingError):
        solve_modified_euler(f_expr="y ++ * 2", x0=0.0, y0=1.0, x_end=1.0, h=0.1)


# ==============================================================================
# 3. FOURTH-ORDER RUNGE-KUTTA (RK4) TESTS
# ==============================================================================

def test_rk4_exponential_growth_accuracy():
    """Verify RK4 on dy/dx = y, y(0) = 1, h = 0.1 on [0, 1] achieves high-precision convergence to e."""
    result = solve_rk4(
        f_expr="y",
        x0=0.0,
        y0=1.0,
        x_end=1.0,
        h=0.1,
        reference_value=math.e,
    )
    assert result.success is True
    assert result.method == "rk4"
    assert result.iterations == 10
    # RK4 error on y'=y at x=1 with h=0.1 is ~ 1e-6
    assert abs(result.final_value - math.e) < 5e-6
    assert result.error_analysis is not None
    assert result.error_analysis.absolute_error < 5e-6


def test_rk4_explicit_stage_verification():
    """Explicitly verify k1, k2, k3, k4 stage calculations for one step:
    dy/dx = x + y, x0 = 0, y0 = 1, h = 0.2.
    k1 = f(0, 1) = 1.0
    k2 = f(0.1, 1 + 0.1*1.0) = f(0.1, 1.1) = 1.20
    k3 = f(0.1, 1 + 0.1*1.2) = f(0.1, 1.12) = 1.22
    k4 = f(0.2, 1 + 0.2*1.22) = f(0.2, 1.244) = 1.444
    y1 = 1 + (0.2/6)*(1.0 + 2*1.20 + 2*1.22 + 1.444) = 1 + (0.2/6)*(7.284) = 1.2428.
    """
    result = solve_rk4(
        f_expr="x + y",
        x0=0.0,
        y0=1.0,
        x_end=0.2,
        h=0.2,
    )
    assert result.success is True
    assert result.iterations == 1
    row = result.table[0]
    assert abs(row["k1"] - 1.0) < 1e-8
    assert abs(row["k2"] - 1.20) < 1e-8
    assert abs(row["k3"] - 1.22) < 1e-8
    assert abs(row["k4"] - 1.444) < 1e-8
    assert abs(row["y_next"] - 1.2428) < 1e-8
    assert abs(result.final_value - 1.2428) < 1e-8


def test_rk4_decay_ode():
    """Verify RK4 on dy/dx = -2*y, y(0) = 1, h = 0.1 on [0, 0.5] matches analytical e^(-1)."""
    exact = math.exp(-1.0)  # ≈ 0.36787944117
    result = solve_rk4(
        f_expr="-2*y",
        x0=0.0,
        y0=1.0,
        x_end=0.5,
        h=0.1,
        reference_value=exact,
    )
    assert result.success is True
    assert abs(result.final_value - exact) < 1e-5


def test_accuracy_hierarchy_euler_heun_rk4():
    """Verify standard accuracy hierarchy: |Error(RK4)| < |Error(Heun)| < |Error(Euler)| on identical problem."""
    f = "y"
    x0, y0, x_end, h = 0.0, 1.0, 1.0, 0.1
    exact = math.e

    r_euler = solve_euler(f, x0, y0, x_end, h, reference_value=exact)
    r_heun = solve_modified_euler(f, x0, y0, x_end, h, reference_value=exact)
    r_rk4 = solve_rk4(f, x0, y0, x_end, h, reference_value=exact)

    err_euler = r_euler.error_analysis.absolute_error
    err_heun = r_heun.error_analysis.absolute_error
    err_rk4 = r_rk4.error_analysis.absolute_error

    assert err_euler > err_heun > err_rk4
    assert err_euler > 0.1
    assert err_heun < 0.01
    assert err_rk4 < 1e-5


def test_rk4_partial_final_step():
    """Verify RK4 handles non-multiple step sizes gracefully."""
    result = solve_rk4(
        f_expr="x*y",
        x0=0.0,
        y0=1.0,
        x_end=0.25,
        h=0.1,
    )
    assert result.success is True
    assert result.iterations == 3
    # Analytical solution for y' = xy, y(0)=1 is y = exp(x^2/2) -> y(0.25) = exp(0.03125) ≈ 1.0317434
    exact = math.exp((0.25 ** 2) / 2.0)
    assert abs(result.final_value - exact) < 1e-5


def test_rk4_invalid_inputs():
    """Verify error handling on invalid interval and step size."""
    with pytest.raises(ValidationError):
        solve_rk4(f_expr="y", x0=1.0, y0=1.0, x_end=0.0, h=0.1)
    with pytest.raises(ValidationError):
        solve_rk4(f_expr="y", x0=0.0, y0=1.0, x_end=1.0, h=0.0)


def test_rk4_invalid_expression():
    """Verify rejection of malformed expression."""
    with pytest.raises(MathParsingError):
        solve_rk4(f_expr="y +* 2", x0=0.0, y0=1.0, x_end=1.0, h=0.1)
