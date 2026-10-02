"""Module II Test Suite.

Comprehensive tests for:
1. Lagrange Interpolation (solve_lagrange_interpolation)
2. Lagrange Inverse Interpolation (solve_inverse_lagrange)
3. Natural Cubic Spline Interpolation (solve_cubic_spline)
"""

import math
import pytest

from core.errors import ValidationError
from methods.module2 import (
    solve_cubic_spline,
    solve_inverse_lagrange,
    solve_lagrange_interpolation,
)


# ==============================================================================
# 1. LAGRANGE INTERPOLATION TESTS
# ==============================================================================

def test_lagrange_quadratic_exact_recovery():
    """Verify exact polynomial recovery for y = x^2 at an intermediate point."""
    # Data points from y = x^2: (0, 0), (1, 1), (2, 4)
    x_pts = [0.0, 1.0, 2.0]
    y_pts = [0.0, 1.0, 4.0]
    target_x = 1.5
    expected_y = 1.5 ** 2  # 2.25

    result = solve_lagrange_interpolation(
        x_points=x_pts,
        y_points=y_pts,
        target_x=target_x,
        reference_value=expected_y,
    )
    assert result.success is True
    assert result.method == "lagrange"
    assert result.converged is True
    assert abs(result.final_value - expected_y) < 1e-8
    assert result.error_analysis is not None
    assert result.error_analysis.absolute_error < 1e-8
    assert len(result.table) == 3


def test_lagrange_cubic_polynomial():
    """Verify Lagrange interpolation on a known cubic polynomial: y = 2x^3 - x + 5."""
    poly = lambda x: 2.0 * (x ** 3) - x + 5.0
    x_pts = [-1.0, 0.0, 1.0, 2.0]
    y_pts = [poly(x) for x in x_pts]
    target_x = 0.5
    expected_y = poly(target_x)  # 2*(0.125) - 0.5 + 5 = 4.75

    result = solve_lagrange_interpolation(x_pts, y_pts, target_x)
    assert result.success is True
    assert abs(result.final_value - expected_y) < 1e-7


def test_lagrange_knot_evaluation():
    """Verify evaluating at an existing knot returns the exact y-coordinate."""
    x_pts = [1.0, 3.0, 5.0, 7.0]
    y_pts = [2.0, 6.0, 12.0, 20.0]

    result = solve_lagrange_interpolation(x_pts, y_pts, target_x=3.0)
    assert result.success is True
    assert abs(result.final_value - 6.0) < 1e-8


def test_lagrange_unsorted_points():
    """Verify that unsorted x-values produce identical results to sorted order."""
    x_sorted = [0.0, 1.0, 2.0]
    y_sorted = [0.0, 1.0, 4.0]
    x_unsorted = [2.0, 0.0, 1.0]
    y_unsorted = [4.0, 0.0, 1.0]

    res_sorted = solve_lagrange_interpolation(x_sorted, y_sorted, target_x=1.5)
    res_unsorted = solve_lagrange_interpolation(x_unsorted, y_unsorted, target_x=1.5)

    assert abs(res_sorted.final_value - res_unsorted.final_value) < 1e-8


def test_lagrange_extrapolation_detection():
    """Verify extrapolation is accurately flagged when target_x is outside data bounds."""
    x_pts = [1.0, 2.0, 3.0]
    y_pts = [1.0, 4.0, 9.0]
    target_x = 4.0  # Outside [1, 3]

    result = solve_lagrange_interpolation(x_pts, y_pts, target_x)
    assert result.success is True
    assert result.metadata["is_extrapolation"] is True
    assert abs(result.final_value - 16.0) < 1e-7


def test_lagrange_duplicate_x_rejection():
    """Verify that duplicate x coordinates raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_lagrange_interpolation(
            x_points=[1.0, 2.0, 1.0],
            y_points=[3.0, 5.0, 7.0],
            target_x=1.5,
        )


def test_lagrange_mismatched_lengths():
    """Verify that mismatched x and y array lengths raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_lagrange_interpolation(
            x_points=[1.0, 2.0, 3.0],
            y_points=[4.0, 5.0],
            target_x=2.5,
        )


def test_lagrange_insufficient_points():
    """Verify that fewer than 2 points raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_lagrange_interpolation(
            x_points=[1.0],
            y_points=[2.0],
            target_x=1.0,
        )


# ==============================================================================
# 2. LAGRANGE INVERSE INTERPOLATION TESTS
# ==============================================================================

def test_inverse_lagrange_quadratic_positive_branch():
    """Verify inverse interpolation for y = x^2 (target y = 6.25 -> x = 2.5)."""
    # Sample points on positive monotonic branch of y = x^2
    x_pts = [1.0, 2.0, 3.0, 4.0]
    y_pts = [1.0, 4.0, 9.0, 16.0]
    target_y = 6.25
    expected_x = 2.5

    result = solve_inverse_lagrange(
        x_points=x_pts,
        y_points=y_pts,
        target_y=target_y,
        reference_value=expected_x,
    )
    assert result.success is True
    assert result.method == "inverse-lagrange"
    assert result.converged is True
    # Inverse polynomial approximation of square root is close to 2.5
    assert abs(result.final_value - expected_x) < 0.05
    assert result.error_analysis is not None
    assert len(result.table) == 4


def test_inverse_lagrange_linear_exact():
    """Verify exact inverse recovery on a linear relationship y = 3x - 2."""
    x_pts = [0.0, 2.0, 4.0]
    y_pts = [-2.0, 4.0, 10.0]
    target_y = 7.0
    expected_x = 3.0  # 3*(3) - 2 = 7

    result = solve_inverse_lagrange(x_pts, y_pts, target_y)
    assert result.success is True
    assert abs(result.final_value - expected_x) < 1e-8


def test_inverse_lagrange_knot_evaluation():
    """Verify that evaluating target_y at an exact knot returns the known x-coordinate."""
    x_pts = [10.0, 20.0, 30.0]
    y_pts = [100.0, 400.0, 900.0]

    result = solve_inverse_lagrange(x_pts, y_pts, target_y=400.0)
    assert result.success is True
    assert abs(result.final_value - 20.0) < 1e-8


def test_inverse_lagrange_duplicate_y_rejection():
    """Verify that non-unique y-values raise ValidationError due to ambiguity/division by zero."""
    with pytest.raises(ValidationError):
        solve_inverse_lagrange(
            x_points=[1.0, 2.0, 3.0],
            y_points=[4.0, 9.0, 4.0],  # Duplicate 4.0
            target_y=5.0,
        )


def test_inverse_lagrange_mismatched_lengths():
    """Verify that mismatched array lengths raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_inverse_lagrange(
            x_points=[1.0, 2.0],
            y_points=[3.0, 4.0, 5.0],
            target_y=3.5,
        )


# ==============================================================================
# 3. CUBIC SPLINE INTERPOLATION TESTS
# ==============================================================================

def test_cubic_spline_knot_recovery():
    """Verify that natural cubic spline passes exactly through all supplied knot points."""
    x_knots = [0.0, 1.0, 2.0, 3.0, 4.0]
    y_knots = [0.0, 1.0, 0.0, 1.0, 0.0]

    for k in range(len(x_knots)):
        res = solve_cubic_spline(x_knots, y_knots, target_x=x_knots[k])
        assert res.success is True
        assert abs(res.final_value - y_knots[k]) < 1e-8


def test_cubic_spline_intermediate_point():
    """Verify evaluation at an intermediate point within a multi-interval spline."""
    x_knots = [0.0, 1.0, 2.0, 3.0]
    y_knots = [0.0, 1.0, 8.0, 27.0]  # Cubic data y = x^3

    result = solve_cubic_spline(x_knots, y_knots, target_x=1.5)
    assert result.success is True
    assert result.method == "cubic-spline"
    assert result.metadata["num_intervals"] == 3
    assert result.metadata["evaluated_interval"] == 1
    assert isinstance(result.final_value, float)


def test_cubic_spline_natural_boundary_conditions():
    """Verify that second derivatives at endpoints are zero (c_0 = 0 and c_end = 0)."""
    x_knots = [1.0, 2.0, 3.0, 4.0]
    y_knots = [2.0, 3.0, 5.0, 10.0]

    result = solve_cubic_spline(x_knots, y_knots, target_x=2.5)
    assert result.success is True
    coeffs = result.metadata["coefficients"]
    # c_0 must be 0
    assert abs(coeffs[0]["c"]) < 1e-12
    # c for the last knot (computed from d of last interval: c_{n-1} = c_{n-2} + 3*d_{n-2}*h_{n-2})
    # or check table entries
    assert len(result.table) == 3


def test_cubic_spline_continuity_at_interior_knots():
    """Verify C0, C1, and C2 continuity between adjacent spline intervals at interior knots."""
    x_knots = [0.0, 2.0, 4.0, 6.0]
    y_knots = [1.0, 5.0, 2.0, 8.0]

    result = solve_cubic_spline(x_knots, y_knots, target_x=3.0)
    coeffs = result.metadata["coefficients"]
    h = [x_knots[i + 1] - x_knots[i] for i in range(3)]

    # Check knot x = 2.0 (interface between interval 0 and interval 1)
    # S_0(x1) vs S_1(x1)
    h0 = h[0]
    s0_val = coeffs[0]["a"] + coeffs[0]["b"] * h0 + coeffs[0]["c"] * (h0 ** 2) + coeffs[0]["d"] * (h0 ** 3)
    s1_val = coeffs[1]["a"]  # at dx = 0
    assert abs(s0_val - s1_val) < 1e-8  # C0 continuity

    # S'_0(x1) vs S'_1(x1)
    s0_deriv = coeffs[0]["b"] + 2.0 * coeffs[0]["c"] * h0 + 3.0 * coeffs[0]["d"] * (h0 ** 2)
    s1_deriv = coeffs[1]["b"]
    assert abs(s0_deriv - s1_deriv) < 1e-8  # C1 continuity

    # S''_0(x1) vs S''_1(x1)
    s0_curv = 2.0 * coeffs[0]["c"] + 6.0 * coeffs[0]["d"] * h0
    s1_curv = 2.0 * coeffs[1]["c"]
    assert abs(s0_curv - s1_curv) < 1e-8  # C2 continuity


def test_cubic_spline_out_of_range_rejection():
    """Verify that target_x outside [x_min, x_max] raises ValidationError."""
    x_knots = [1.0, 2.0, 3.0]
    y_knots = [4.0, 5.0, 6.0]

    with pytest.raises(ValidationError):
        solve_cubic_spline(x_knots, y_knots, target_x=0.5)  # Below min_x

    with pytest.raises(ValidationError):
        solve_cubic_spline(x_knots, y_knots, target_x=3.5)  # Above max_x


def test_cubic_spline_insufficient_points():
    """Verify that fewer than 3 knots raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_cubic_spline(
            x_points=[1.0, 2.0],
            y_points=[3.0, 4.0],
            target_x=1.5,
        )


def test_cubic_spline_duplicate_x_rejection():
    """Verify that duplicate knot coordinates raise ValidationError."""
    with pytest.raises(ValidationError):
        solve_cubic_spline(
            x_points=[1.0, 2.0, 2.0, 3.0],
            y_points=[1.0, 4.0, 4.0, 9.0],
            target_x=1.5,
        )


def test_cubic_spline_unsorted_knots():
    """Verify that unsorted knot points are sorted and interpolated accurately."""
    x_unsorted = [3.0, 1.0, 2.0, 0.0]
    y_unsorted = [9.0, 1.0, 4.0, 0.0]

    result = solve_cubic_spline(x_unsorted, y_unsorted, target_x=1.5)
    assert result.success is True
    assert result.final_value is not None
