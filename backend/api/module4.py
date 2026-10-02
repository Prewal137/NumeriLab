"""Module IV API Router: Numerical Solution of Ordinary Differential Equations.

Endpoints will be defined for:
- Euler's Method (/api/module4/euler)
- Modified Euler's Method (/api/module4/modified-euler)
- Fourth-Order Runge-Kutta (/api/module4/rk4)
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/module4",
    tags=["Module 4: Numerical Solution of ODEs"],
)
