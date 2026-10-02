"""Module IV API Router: Numerical Solution of Ordinary Differential Equations.

Endpoints:
- POST /api/module4/euler
- POST /api/module4/modified-euler
- POST /api/module4/rk4
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from core.errors import MathParsingError, ValidationError
from core.result import NumericalResult
from methods.module4 import (
    solve_euler,
    solve_modified_euler,
    solve_rk4,
)

router = APIRouter(
    prefix="/api/module4",
    tags=["Module 4: Numerical Solution of ODEs"],
)


class EulerRequest(BaseModel):
    """Request payload for Euler's Method."""
    function: str = Field(..., description="ODE derivative expression dy/dx = f(x, y), e.g., 'y - x**2 + 1', 'x + y'")
    x0: float = Field(..., description="Initial independent variable x0")
    y0: float = Field(..., description="Initial condition value y(x0)")
    x_end: float = Field(..., description="Target integration endpoint x_end (x_end > x0)")
    h: float = Field(default=0.1, description="Step size h > 0")
    reference_value: Optional[float] = Field(default=None, description="Optional analytical reference value y(x_end)")


class ModifiedEulerRequest(BaseModel):
    """Request payload for Modified Euler's (Heun's) Method."""
    function: str = Field(..., description="ODE derivative expression dy/dx = f(x, y), e.g., 'y - x**2 + 1', 'x + y'")
    x0: float = Field(..., description="Initial independent variable x0")
    y0: float = Field(..., description="Initial condition value y(x0)")
    x_end: float = Field(..., description="Target integration endpoint x_end (x_end > x0)")
    h: float = Field(default=0.1, description="Step size h > 0")
    reference_value: Optional[float] = Field(default=None, description="Optional analytical reference value y(x_end)")


class RK4Request(BaseModel):
    """Request payload for Fourth-Order Runge-Kutta (RK4) Method."""
    function: str = Field(..., description="ODE derivative expression dy/dx = f(x, y), e.g., 'y - x**2 + 1', 'x + y'")
    x0: float = Field(..., description="Initial independent variable x0")
    y0: float = Field(..., description="Initial condition value y(x0)")
    x_end: float = Field(..., description="Target integration endpoint x_end (x_end > x0)")
    h: float = Field(default=0.1, description="Step size h > 0")
    reference_value: Optional[float] = Field(default=None, description="Optional analytical reference value y(x_end)")


@router.post(
    "/euler",
    response_model=NumericalResult,
    summary="Solve Initial Value Problem via Euler's Method",
    description="Explicit first-order step-by-step numerical solver for dy/dx = f(x, y).",
)
def api_euler(payload: EulerRequest) -> NumericalResult:
    try:
        return solve_euler(
            f_expr=payload.function,
            x0=payload.x0,
            y0=payload.y0,
            x_end=payload.x_end,
            h=payload.h,
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
    "/modified-euler",
    response_model=NumericalResult,
    summary="Solve Initial Value Problem via Modified Euler's Method",
    description="Second-order predictor-corrector (Heun's) method for dy/dx = f(x, y).",
)
def api_modified_euler(payload: ModifiedEulerRequest) -> NumericalResult:
    try:
        return solve_modified_euler(
            f_expr=payload.function,
            x0=payload.x0,
            y0=payload.y0,
            x_end=payload.x_end,
            h=payload.h,
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
    "/rk4",
    response_model=NumericalResult,
    summary="Solve Initial Value Problem via Fourth-Order Runge-Kutta",
    description="High-precision fourth-order single-step method evaluating four trial slopes per step.",
)
def api_rk4(payload: RK4Request) -> NumericalResult:
    try:
        return solve_rk4(
            f_expr=payload.function,
            x0=payload.x0,
            y0=payload.y0,
            x_end=payload.x_end,
            h=payload.h,
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
