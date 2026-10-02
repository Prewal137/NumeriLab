"""Module III API Router: Numerical Differentiation and Integration.

Endpoints:
- POST /api/module3/trapezoidal
- POST /api/module3/simpson
- POST /api/module3/romberg
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from core.errors import MathParsingError, ValidationError
from core.result import NumericalResult
from methods.module3 import (
    solve_romberg,
    solve_simpson_one_third,
    solve_trapezoidal,
)

router = APIRouter(
    prefix="/api/module3",
    tags=["Module 3: Numerical Differentiation and Integration"],
)


class TrapezoidalRequest(BaseModel):
    """Request payload for Composite Trapezoidal Rule."""
    function: str = Field(..., description="Integrand expression f(x), e.g., 'sin(x)', 'x**2', 'exp(-x**2)'")
    a: float = Field(..., description="Lower integration limit")
    b: float = Field(..., description="Upper integration limit (b > a)")
    n: int = Field(default=10, description="Number of subintervals (n >= 1)")
    reference_value: Optional[float] = Field(default=None, description="Optional exact reference integral value")


class SimpsonRequest(BaseModel):
    """Request payload for Composite Simpson's 1/3 Rule."""
    function: str = Field(..., description="Integrand expression f(x), e.g., 'sin(x)', 'x**4', 'exp(-x)'")
    a: float = Field(..., description="Lower integration limit")
    b: float = Field(..., description="Upper integration limit (b > a)")
    n: int = Field(default=10, description="Number of subintervals (MUST be positive even integer >= 2)")
    reference_value: Optional[float] = Field(default=None, description="Optional exact reference integral value")


class RombergRequest(BaseModel):
    """Request payload for Romberg Integration."""
    function: str = Field(..., description="Integrand expression f(x), e.g., 'sin(x)', 'exp(-x**2)'")
    a: float = Field(..., description="Lower integration limit")
    b: float = Field(..., description="Upper integration limit (b > a)")
    max_levels: int = Field(default=5, description="Maximum number of extrapolation levels (1 to 12)")
    tolerance: float = Field(default=1e-8, description="Convergence tolerance threshold")
    reference_value: Optional[float] = Field(default=None, description="Optional exact reference integral value")


@router.post(
    "/trapezoidal",
    response_model=NumericalResult,
    summary="Compute Definite Integral using Trapezoidal Rule",
    description="Approximates definite integral via composite trapezoidal quadrature.",
)
def api_trapezoidal(payload: TrapezoidalRequest) -> NumericalResult:
    try:
        return solve_trapezoidal(
            f_expr=payload.function,
            a=payload.a,
            b=payload.b,
            n=payload.n,
            reference_value=payload.reference_value,
        )
    except (ValidationError, MathParsingError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )


@router.post(
    "/simpson",
    response_model=NumericalResult,
    summary="Compute Definite Integral using Simpson's 1/3 Rule",
    description="Approximates definite integral using parabolic composite Simpson quadrature on even subintervals.",
)
def api_simpson(payload: SimpsonRequest) -> NumericalResult:
    try:
        return solve_simpson_one_third(
            f_expr=payload.function,
            a=payload.a,
            b=payload.b,
            n=payload.n,
            reference_value=payload.reference_value,
        )
    except (ValidationError, MathParsingError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )


@router.post(
    "/romberg",
    response_model=NumericalResult,
    summary="Compute Definite Integral using Romberg Integration",
    description="Accelerates trapezoidal estimates via successive Richardson extrapolation.",
)
def api_romberg(payload: RombergRequest) -> NumericalResult:
    try:
        return solve_romberg(
            f_expr=payload.function,
            a=payload.a,
            b=payload.b,
            max_levels=payload.max_levels,
            tolerance=payload.tolerance,
            reference_value=payload.reference_value,
        )
    except (ValidationError, MathParsingError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )
