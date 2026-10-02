"""Module III: Numerical Differentiation and Integration.

Methods:
7. Trapezoidal Rule (solve_trapezoidal)
8. Simpson's 1/3 Rule (solve_simpson_one_third)
9. Romberg Integration (solve_romberg)
"""

from .romberg import solve_romberg
from .simpson import solve_simpson_one_third
from .trapezoidal import solve_trapezoidal

__all__ = [
    "solve_trapezoidal",
    "solve_simpson_one_third",
    "solve_romberg",
]
