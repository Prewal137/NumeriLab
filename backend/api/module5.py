"""Module V API Router: Boundary Value Problems and Partial Differential Equations.

Endpoints will be defined for:
- Two-Point Linear Boundary Value Problem (/api/module5/linear-bvp)
- 2D Laplace/Poisson Equation (/api/module5/laplace-poisson)
- Crank-Nicolson Method for 1D Heat Equation (/api/module5/crank-nicolson)
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/module5",
    tags=["Module 5: BVPs and PDEs"],
)
