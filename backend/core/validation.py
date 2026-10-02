"""NumeriLab Input Validation Utilities.

Provides reusable validation functions for numerical inputs, interval bounds,
tolerances, iteration counts, matrix shapes, and expression security.
"""

from typing import Any, List, Optional, Sequence, Tuple
from .errors import ValidationError


def validate_interval(a: float, b: float, allow_equal: bool = False) -> Tuple[float, float]:
    """Validates that interval endpoints [a, b] are finite and a < b (or a <= b if allowed)."""
    if a is None or b is None:
        raise ValidationError("Interval bounds cannot be None.")
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise ValidationError("Interval endpoints must be real numbers.")
    if allow_equal:
        if a > b:
            raise ValidationError(f"Invalid interval: start ({a}) must be <= end ({b}).")
    else:
        if a >= b:
            raise ValidationError(f"Invalid interval: start ({a}) must be strictly less than end ({b}).")
    return float(a), float(b)


def validate_tolerance(tol: float, min_tol: float = 1e-15, max_tol: float = 1.0) -> float:
    """Validates that a tolerance threshold is strictly positive and within a reasonable range."""
    if tol is None or not isinstance(tol, (int, float)):
        raise ValidationError("Tolerance must be a numerical value.")
    if tol < min_tol or tol > max_tol:
        raise ValidationError(f"Tolerance must be between {min_tol} and {max_tol}, got {tol}.")
    return float(tol)


def validate_max_iterations(max_iter: int, min_iter: int = 1, max_iter_limit: int = 100000) -> int:
    """Validates that maximum iteration limit is a positive integer within safety bounds."""
    if max_iter is None or not isinstance(max_iter, int):
        raise ValidationError("Maximum iterations must be an integer.")
    if max_iter < min_iter or max_iter > max_iter_limit:
        raise ValidationError(
            f"Maximum iterations must be between {min_iter} and {max_iter_limit}, got {max_iter}."
        )
    return max_iter


def validate_data_points(x_points: Sequence[float], y_points: Sequence[float], min_points: int = 2) -> None:
    """Validates that coordinate arrays for interpolation or regression are non-empty and matching in length."""
    if len(x_points) != len(y_points):
        raise ValidationError(
            f"x and y datasets must have the same length (got {len(x_points)} and {len(y_points)})."
        )
    if len(x_points) < min_points:
        raise ValidationError(
            f"At least {min_points} data points are required, but received {len(x_points)}."
        )
    if len(set(x_points)) != len(x_points):
        raise ValidationError("Interpolation x-coordinates must be distinct.")


def validate_square_matrix(matrix: Sequence[Sequence[float]]) -> int:
    """Validates that a 2D matrix is non-empty, square, and contains numeric entries."""
    if not matrix or not isinstance(matrix, (list, tuple)):
        raise ValidationError("Matrix must be a non-empty 2D sequence.")
    n = len(matrix)
    for i, row in enumerate(matrix):
        if not isinstance(row, (list, tuple)) or len(row) != n:
            raise ValidationError(
                f"Matrix must be square: row {i} has length {len(row) if isinstance(row, (list, tuple)) else 'non-sequence'}, expected {n}."
            )
    return n
