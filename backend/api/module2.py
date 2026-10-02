"""Module II API Router: Interpolation and Approximation.

Endpoints:
- POST /api/module2/lagrange
- POST /api/module2/inverse-lagrange
- POST /api/module2/cubic-spline
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from core.errors import ValidationError
from core.result import NumericalResult
from methods.module2 import (
    solve_cubic_spline,
    solve_inverse_lagrange,
    solve_lagrange_interpolation,
)

router = APIRouter(
    prefix="/api/module2",
    tags=["Module 2: Interpolation and Approximation"],
)


class LagrangeRequest(BaseModel):
    """Request payload for Lagrange Interpolation."""
    x_points: List[float] = Field(..., description="Array of x coordinates (at least 2 points)")
    y_points: List[float] = Field(..., description="Array of y coordinates (same length as x_points)")
    target_x: float = Field(..., description="Target x coordinate to interpolate")
    reference_value: Optional[float] = Field(default=None, description="Optional analytical reference value")


class InverseLagrangeRequest(BaseModel):
    """Request payload for Lagrange Inverse Interpolation."""
    x_points: List[float] = Field(..., description="Array of x coordinates (at least 2 points)")
    y_points: List[float] = Field(..., description="Array of y coordinates (must have distinct values)")
    target_y: float = Field(..., description="Target y coordinate to estimate corresponding x")
    reference_value: Optional[float] = Field(default=None, description="Optional analytical reference value")


class CubicSplineRequest(BaseModel):
    """Request payload for Natural Cubic Spline Interpolation."""
    x_points: List[float] = Field(..., description="Array of knot x coordinates (at least 3 points)")
    y_points: List[float] = Field(..., description="Array of knot y coordinates (same length as x_points)")
    target_x: float = Field(..., description="Target x coordinate to evaluate spline")
    reference_value: Optional[float] = Field(default=None, description="Optional analytical reference value")


@router.post(
    "/lagrange",
    response_model=NumericalResult,
    summary="Compute Lagrange Polynomial Interpolation",
    description="Evaluates the unique polynomial passing through given data points at target x.",
)
def api_lagrange(payload: LagrangeRequest) -> NumericalResult:
    try:
        return solve_lagrange_interpolation(
            x_points=payload.x_points,
            y_points=payload.y_points,
            target_x=payload.target_x,
            reference_value=payload.reference_value,
        )
    except ValidationError as e:
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
    "/inverse-lagrange",
    response_model=NumericalResult,
    summary="Compute Lagrange Inverse Interpolation",
    description="Estimates independent variable x for a specified target y value.",
)
def api_inverse_lagrange(payload: InverseLagrangeRequest) -> NumericalResult:
    try:
        return solve_inverse_lagrange(
            x_points=payload.x_points,
            y_points=payload.y_points,
            target_y=payload.target_y,
            reference_value=payload.reference_value,
        )
    except ValidationError as e:
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
    "/cubic-spline",
    response_model=NumericalResult,
    summary="Compute Natural Cubic Spline Interpolation",
    description="Constructs piecewise C2 continuous cubic polynomials and evaluates at target x.",
)
def api_cubic_spline(payload: CubicSplineRequest) -> NumericalResult:
    try:
        return solve_cubic_spline(
            x_points=payload.x_points,
            y_points=payload.y_points,
            target_x=payload.target_x,
            reference_value=payload.reference_value,
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )
