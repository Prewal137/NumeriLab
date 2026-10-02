"""Module IV: Numerical Solution of Ordinary Differential Equations.

Methods:
10. Euler's Method (solve_euler)
11. Modified Euler's Method (solve_modified_euler)
12. Fourth-Order Runge-Kutta (solve_rk4)
"""

from .euler import solve_euler
from .modified_euler import solve_modified_euler
from .rk4 import solve_rk4

__all__ = [
    "solve_euler",
    "solve_modified_euler",
    "solve_rk4",
]
