"""Module III API Router: Numerical Differentiation and Integration.

Endpoints will be defined for:
- Trapezoidal Rule (/api/module3/trapezoidal)
- Simpson's 1/3 Rule (/api/module3/simpson)
- Romberg Integration (/api/module3/romberg)
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/module3",
    tags=["Module 3: Numerical Differentiation and Integration"],
)
