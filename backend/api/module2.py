"""Module II API Router: Interpolation and Approximation.

Endpoints will be defined for:
- Lagrange Interpolation (/api/module2/lagrange)
- Lagrange Inverse Interpolation (/api/module2/inverse-lagrange)
- Cubic Spline Interpolation (/api/module2/cubic-spline)
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/module2",
    tags=["Module 2: Interpolation and Approximation"],
)
