"""Module I API Router: Solution of Equations and Linear Systems.

Endpoints will be defined for:
- Fixed Point Iteration (/api/module1/fixed-point)
- Secant Method (/api/module1/secant)
- Gauss-Seidel Method (/api/module1/gauss-seidel)
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/module1",
    tags=["Module 1: Solution of Equations and Linear Systems"],
)
