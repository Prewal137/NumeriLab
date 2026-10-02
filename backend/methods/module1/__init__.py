"""Module I: Solution of Equations and Linear Systems.

Methods:
1. Fixed Point Iteration (solve_fixed_point)
2. Secant Method (solve_secant)
3. Gauss-Seidel Method (solve_gauss_seidel)
"""

from .fixed_point import solve_fixed_point
from .gauss_seidel import solve_gauss_seidel
from .secant import solve_secant

__all__ = [
    "solve_fixed_point",
    "solve_secant",
    "solve_gauss_seidel",
]
