"""Module II: Interpolation and Approximation.

Methods:
4. Lagrange Interpolation (solve_lagrange_interpolation)
5. Lagrange Inverse Interpolation (solve_inverse_lagrange)
6. Cubic Spline Interpolation (solve_cubic_spline)
"""

from .cubic_spline import solve_cubic_spline
from .inverse_lagrange import solve_inverse_lagrange
from .lagrange import solve_lagrange_interpolation

__all__ = [
    "solve_lagrange_interpolation",
    "solve_inverse_lagrange",
    "solve_cubic_spline",
]
