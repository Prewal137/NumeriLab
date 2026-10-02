"""Module III Test Suite.

Comprehensive tests for:
1. Composite Trapezoidal Rule (solve_trapezoidal)
2. Composite Simpson's 1/3 Rule (solve_simpson_one_third)
3. Romberg Integration (solve_romberg)
"""

import math
import pytest

from core.errors import MathParsingError, ValidationError
from methods.module3 import (
    solve_romberg,
    solve_simpson_one_third,
    solve_trapezoidal,
)


# ==============================================================================
# 1. TRAPEZOIDAL RULE TESTS
# ==============================================================================

def test_trapezoidal_constant_function():
    """Verify exact integral for constant function: integral_{1}^{4} 5 dx = 15.0."""
    result = solve_trapezoidal(f_expr="5", a=1.0, b=4.0, n=6)
    assert result.success is True
    assert result.method == "trapezoidal"
    assert abs(result.final_value - 15.0) < 1e-8


def test_trapezoidal_linear_function():
    """Verify exact integral for linear function: integral_{0}^{2} (3*x + 1) dx = 8.0."""
    result = solve_trapezoidal(f_expr="3*x + 1", a=0.0, b=2.0, n=4)
    assert result.success is True
    assert abs(result.final_value - 8.0) < 1e-8


def test_trapezoidal_quadratic_convergence():
    """Verify convergence on quadratic integrand: integral_{0}^{1} x^2 dx = 1/3."""
    known_val = 1.0 / 3.0
    res_10 = solve_trapezoidal(f_expr="x**2", a=0.0, b=1.0, n=10, reference_value=known_val)
    res_100 = solve_trapezoidal(f_expr="x**2", a=0.0, b=1.0, n=100, reference_value=known_val)

    assert res_10.success is True
    assert res_100.success is True
    # Error should decrease with smaller step size
    assert abs(res_100.final_value - known_val) < abs(res_10.final_value - known_val)
    assert res_100.error_analysis is not None
    assert res_100.error_analysis.absolute_error < 1e-4


def test_trapezoidal_sine_integral():
    """Verify integral of sin(x) on [0, pi] = 2.0."""
    result = solve_trapezoidal(f_expr="sin(x)", a=0.0, b=math.pi, n=50, reference_value=2.0)
    assert result.success is True
    assert abs(result.final_value - 2.0) < 1e-3
    assert result.error_analysis.absolute_error < 1e-3


def test_trapezoidal_invalid_limits():
    """Verify that lower limit >= upper limit raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_trapezoidal(f_expr="x**2", a=2.0, b=1.0, n=10)
    with pytest.raises(ValidationError):
        solve_trapezoidal(f_expr="x**2", a=2.0, b=2.0, n=10)


def test_trapezoidal_invalid_n():
    """Verify that n <= 0 raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_trapezoidal(f_expr="x**2", a=0.0, b=1.0, n=0)
    with pytest.raises(ValidationError):
        solve_trapezoidal(f_expr="x**2", a=0.0, b=1.0, n=-4)


def test_trapezoidal_invalid_expression():
    """Verify that syntax errors in expression raise MathParsingError."""
    with pytest.raises(MathParsingError):
        solve_trapezoidal(f_expr="sin(x ++ 2", a=0.0, b=1.0, n=10)


# ==============================================================================
# 2. SIMPSON'S 1/3 RULE TESTS
# ==============================================================================

def test_simpson_cubic_exactness():
    """Verify Simpson's 1/3 exactness for polynomials up to degree 3:
    integral_{0}^{2} (2x^3 - x + 3) dx = [0.5x^4 - 0.5x^2 + 3x]_0^2 = 8 - 2 + 6 = 12.0.
    """
    result = solve_simpson_one_third(
        f_expr="2*x**3 - x + 3",
        a=0.0,
        b=2.0,
        n=2,  # Even n
        reference_value=12.0,
    )
    assert result.success is True
    assert result.method == "simpson"
    assert abs(result.final_value - 12.0) < 1e-8
    assert result.error_analysis.absolute_error < 1e-8


def test_simpson_exponential_integral():
    """Verify integral of e^x on [0, 1] = e - 1."""
    known_val = math.e - 1.0
    result = solve_simpson_one_third(
        f_expr="exp(x)",
        a=0.0,
        b=1.0,
        n=10,
        reference_value=known_val,
    )
    assert result.success is True
    assert abs(result.final_value - known_val) < 1e-5


def test_simpson_fourth_degree_polynomial():
    """Verify integral of x^4 on [0, 1] = 0.2."""
    result = solve_simpson_one_third(
        f_expr="x**4",
        a=0.0,
        b=1.0,
        n=20,
        reference_value=0.2,
    )
    assert result.success is True
    assert abs(result.final_value - 0.2) < 1e-5


def test_simpson_odd_n_rejection():
    """Verify that odd number of subintervals n is rejected with clear ValidationError."""
    with pytest.raises(ValidationError) as exc_info:
        solve_simpson_one_third(f_expr="x**2", a=0.0, b=1.0, n=5)
    assert "even" in str(exc_info.value).lower()


def test_simpson_invalid_n():
    """Verify that n < 2 raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_simpson_one_third(f_expr="x**2", a=0.0, b=1.0, n=0)


def test_simpson_invalid_limits():
    """Verify that a >= b raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_simpson_one_third(f_expr="x**2", a=5.0, b=2.0, n=4)


def test_simpson_invalid_expression():
    """Verify that malformed expression raises MathParsingError."""
    with pytest.raises(MathParsingError):
        solve_simpson_one_third(f_expr="x ** / 3", a=0.0, b=1.0, n=4)


# ==============================================================================
# 3. ROMBERG INTEGRATION TESTS
# ==============================================================================

def test_romberg_polynomial_exactness():
    """Verify Romberg integration on polynomial:
    integral_{0}^{1} (x^4 + 2x^2 + 1) dx = 1/5 + 2/3 + 1 = 28/15 ≈ 1.8666666667.
    """
    known_val = 28.0 / 15.0
    result = solve_romberg(
        f_expr="x**4 + 2*x**2 + 1",
        a=0.0,
        b=1.0,
        max_levels=4,
        reference_value=known_val,
    )
    assert result.success is True
    assert result.method == "romberg"
    assert abs(result.final_value - known_val) < 1e-7
    assert result.error_analysis.absolute_error < 1e-7


def test_romberg_sine_integral_high_precision():
    """Verify Romberg integration on sin(x) on [0, pi] = 2.0 achieves high precision."""
    result = solve_romberg(
        f_expr="sin(x)",
        a=0.0,
        b=math.pi,
        max_levels=5,
        reference_value=2.0,
    )
    assert result.success is True
    assert abs(result.final_value - 2.0) < 1e-8


def test_romberg_gaussian_integral():
    """Verify Romberg on standard normal integrand exp(-x^2) on [0, 1] ≈ 0.7468241328."""
    # sqrt(pi)/2 * erf(1) ≈ 0.746824132812427
    known_erf = 0.7468241328
    result = solve_romberg(
        f_expr="exp(-x**2)",
        a=0.0,
        b=1.0,
        max_levels=5,
        tolerance=1e-8,
        reference_value=known_erf,
    )
    assert result.success is True
    assert abs(result.final_value - known_erf) < 1e-6
    assert len(result.table) >= 2


def test_romberg_tableau_structure():
    """Verify that Romberg table records levels, trapezoidal initial columns, and extrapolations."""
    result = solve_romberg(f_expr="exp(x)", a=0.0, b=1.0, max_levels=4)
    assert result.success is True
    assert len(result.table) == 4
    # Level 0 has 0 extrapolations, level 1 has 1, level 2 has 2, level 3 has 3
    for k, row in enumerate(result.table):
        assert len(row["extrapolations"]) == k
        assert row["subintervals"] == 2 ** k


def test_romberg_invalid_max_levels():
    """Verify that non-positive or overly large max_levels raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_romberg(f_expr="x**2", a=0.0, b=1.0, max_levels=0)
    with pytest.raises(ValidationError):
        solve_romberg(f_expr="x**2", a=0.0, b=1.0, max_levels=15)


def test_romberg_invalid_limits():
    """Verify that a >= b raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_romberg(f_expr="x**2", a=3.0, b=1.0, max_levels=4)


def test_romberg_invalid_expression():
    """Verify that malformed expression raises MathParsingError."""
    with pytest.raises(MathParsingError):
        solve_romberg(f_expr="exp(x +", a=0.0, b=1.0, max_levels=4)
