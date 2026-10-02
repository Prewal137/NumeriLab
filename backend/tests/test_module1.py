"""Module I Test Suite.

Comprehensive tests for:
1. Fixed Point Iteration (solve_fixed_point)
2. Secant Method (solve_secant)
3. Gauss-Seidel Method (solve_gauss_seidel)
"""

import math
import numpy as np
import pytest

from core.errors import MathParsingError, SingularityError, ValidationError
from methods.module1 import solve_fixed_point, solve_gauss_seidel, solve_secant


# ==============================================================================
# 1. FIXED POINT ITERATION TESTS
# ==============================================================================

def test_fixed_point_cosine_convergence():
    """Verify convergence of g(x) = cos(x) to the Dottie number (known root ~ 0.7390851332)."""
    result = solve_fixed_point(
        g_expr="cos(x)",
        x0=0.5,
        tolerance=1e-6,
        max_iterations=100,
    )
    assert result.success is True
    assert result.converged is True
    assert result.method == "fixed-point"
    assert result.final_value is not None
    # Verify mathematically known fixed point: cos(0.73908513) ≈ 0.73908513
    assert abs(result.final_value - 0.7390851332) < 1e-4
    assert result.iterations > 0
    assert len(result.table) == result.iterations


def test_fixed_point_quadratic_babylonian():
    """Verify Babylonian square root formula for sqrt(2): g(x) = (x + 2/x) / 2."""
    known_sqrt2 = math.sqrt(2.0)
    result = solve_fixed_point(
        g_expr="(x + 2/x) / 2",
        x0=1.0,
        tolerance=1e-8,
        max_iterations=50,
        reference_value=known_sqrt2,
    )
    assert result.success is True
    assert result.converged is True
    assert abs(result.final_value - known_sqrt2) < 1e-8
    assert result.error_analysis is not None
    assert result.error_analysis.reference_value == known_sqrt2
    assert result.error_analysis.absolute_error < 1e-8


def test_fixed_point_error_analysis():
    """Verify absolute and relative error calculations with a user-provided reference value."""
    result = solve_fixed_point(
        g_expr="exp(-x)",
        x0=0.5,
        tolerance=1e-5,
        max_iterations=100,
        reference_value=0.56714329,
    )
    assert result.success is True
    assert result.error_analysis is not None
    assert result.error_analysis.reference_value == 0.56714329
    assert result.error_analysis.absolute_error is not None
    assert result.error_analysis.relative_error is not None
    assert result.error_analysis.absolute_error < 1e-4


def test_fixed_point_invalid_expression():
    """Verify that malformed mathematical expressions raise MathParsingError."""
    with pytest.raises(MathParsingError):
        solve_fixed_point(g_expr="x +* invalid_syntax 3", x0=1.0)


def test_fixed_point_invalid_tolerance():
    """Verify that negative or zero tolerance raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_fixed_point(g_expr="cos(x)", x0=0.5, tolerance=-0.001)


def test_fixed_point_max_iterations_reached():
    """Verify proper reporting when maximum iterations are exhausted without convergence."""
    # g(x) = x + 0.1 will never converge (step error always 0.1 > tolerance 1e-6)
    result = solve_fixed_point(
        g_expr="x + 0.1",
        x0=0.0,
        tolerance=1e-6,
        max_iterations=10,
    )
    assert result.success is True
    assert result.converged is False
    assert result.iterations == 10
    assert result.error is not None
    assert "Maximum iteration limit" in result.error


def test_fixed_point_divergence_handling():
    """Verify that divergent iterations (e.g. exponential growth) are caught cleanly."""
    result = solve_fixed_point(
        g_expr="2*x**2 + 5",
        x0=10.0,
        tolerance=1e-6,
        max_iterations=50,
    )
    assert result.success is False or result.converged is False


# ==============================================================================
# 2. SECANT METHOD TESTS
# ==============================================================================

def test_secant_quadratic_root():
    """Verify finding the positive root of f(x) = x^2 - 4 (known root = 2.0)."""
    result = solve_secant(
        f_expr="x**2 - 4",
        x0=1.0,
        x1=3.0,
        tolerance=1e-6,
        max_iterations=50,
        reference_value=2.0,
    )
    assert result.success is True
    assert result.converged is True
    assert result.method == "secant"
    assert abs(result.final_value - 2.0) < 1e-6
    assert result.error_analysis is not None
    assert result.error_analysis.absolute_error < 1e-6


def test_secant_transcendental_root():
    """Verify root of f(x) = x*exp(x) - 1 (Lambert-W root ≈ 0.5671432904)."""
    known_root = 0.5671432904
    result = solve_secant(
        f_expr="x*exp(x) - 1",
        x0=0.0,
        x1=1.0,
        tolerance=1e-7,
        max_iterations=50,
    )
    assert result.success is True
    assert result.converged is True
    assert abs(result.final_value - known_root) < 1e-6


def test_secant_identical_initial_guesses():
    """Verify that identical starting points x0 == x1 raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_secant(f_expr="x**2 - 4", x0=2.0, x1=2.0)


def test_secant_invalid_expression():
    """Verify that invalid expressions raise MathParsingError."""
    with pytest.raises(MathParsingError):
        solve_secant(f_expr="sin(x +", x0=1.0, x1=2.0)


def test_secant_zero_denominator_handling():
    """Verify safe handling when f(x0) == f(x1) away from root (division by zero risk)."""
    # For f(x) = x^2, f(-1) = 1 and f(1) = 1. f(1) - f(-1) = 0.
    result = solve_secant(
        f_expr="x**2",
        x0=-1.0,
        x1=1.0,
        tolerance=1e-6,
        max_iterations=10,
    )
    assert result.success is False
    assert result.converged is False
    assert "denominator" in result.error.lower()


def test_secant_max_iterations_exhausted():
    """Verify non-convergence status when max_iterations is set very low."""
    result = solve_secant(
        f_expr="cos(x) - x",
        x0=0.0,
        x1=1.0,
        tolerance=1e-12,
        max_iterations=1,
    )
    assert result.success is True
    assert result.converged is False
    assert result.iterations == 1


# ==============================================================================
# 3. GAUSS-SEIDEL METHOD TESTS
# ==============================================================================

def test_gauss_seidel_3x3_convergent_system():
    """Verify solving a known 3x3 diagonally dominant linear system:
    4x1 +  x2 +  x3 = 6
     x1 + 5x2 +  x3 = 7
     x1 +  x2 + 6x3 = 8
    Independent analytical / NumPy solution: [1.0, 1.0, 1.0].
    """
    A = [
        [4.0, 1.0, 1.0],
        [1.0, 5.0, 1.0],
        [1.0, 1.0, 6.0],
    ]
    b = [6.0, 7.0, 8.0]
    expected_solution = np.linalg.solve(np.array(A), np.array(b)).tolist()

    result = solve_gauss_seidel(
        matrix_a=A,
        vector_b=b,
        tolerance=1e-6,
        max_iterations=100,
        reference_value=expected_solution,
    )
    assert result.success is True
    assert result.converged is True
    assert result.method == "gauss-seidel"
    assert result.metadata["is_diagonally_dominant"] is True

    # Verify each component matches analytical solution [1, 1, 1]
    for calc_val, exp_val in zip(result.final_value, expected_solution):
        assert abs(calc_val - exp_val) < 1e-5


def test_gauss_seidel_4x4_system():
    """Verify solving a 4x4 diagonally dominant system with independent NumPy verification."""
    A = [
        [10.0, -1.0,  2.0,  0.0],
        [-1.0, 11.0, -1.0,  3.0],
        [ 2.0, -1.0, 10.0, -1.0],
        [ 0.0,  3.0, -1.0,  8.0],
    ]
    b = [6.0, 25.0, -11.0, 15.0]
    expected = np.linalg.solve(np.array(A), np.array(b)).tolist()

    result = solve_gauss_seidel(
        matrix_a=A,
        vector_b=b,
        tolerance=1e-7,
        max_iterations=100,
    )
    assert result.success is True
    assert result.converged is True
    for calc, exp in zip(result.final_value, expected):
        assert abs(calc - exp) < 1e-5


def test_gauss_seidel_non_square_matrix():
    """Verify that a non-square matrix raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_gauss_seidel(
            matrix_a=[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
            vector_b=[1.0, 2.0],
        )


def test_gauss_seidel_dimension_mismatch_vector():
    """Verify that vector b dimension mismatch raises ValidationError."""
    with pytest.raises(ValidationError):
        solve_gauss_seidel(
            matrix_a=[[2.0, 1.0], [1.0, 3.0]],
            vector_b=[1.0, 2.0, 3.0],
        )


def test_gauss_seidel_zero_diagonal():
    """Verify that zero on the main diagonal raises SingularityError."""
    with pytest.raises(SingularityError):
        solve_gauss_seidel(
            matrix_a=[[0.0, 1.0], [1.0, 3.0]],
            vector_b=[1.0, 2.0],
        )


def test_gauss_seidel_with_reference_value():
    """Verify full error analysis calculation with user reference vector."""
    A = [[5.0, 1.0], [2.0, 6.0]]
    b = [11.0, 22.0]
    expected = np.linalg.solve(np.array(A), np.array(b)).tolist()

    result = solve_gauss_seidel(
        matrix_a=A,
        vector_b=b,
        tolerance=1e-6,
        max_iterations=50,
        reference_value=expected,
    )
    assert result.success is True
    assert result.error_analysis is not None
    assert result.error_analysis.reference_value == expected
    assert all(err < 1e-5 for err in result.error_analysis.absolute_error)
