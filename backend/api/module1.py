"""Module I API Router: Solution of Equations and Linear Systems.

Endpoints:
- POST /api/module1/fixed-point
- POST /api/module1/secant
- POST /api/module1/gauss-seidel
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from core.errors import MathParsingError, NumeriLabError, SingularityError, ValidationError
from core.result import NumericalResult
from methods.module1 import solve_fixed_point, solve_gauss_seidel, solve_secant

router = APIRouter(
    prefix="/api/module1",
    tags=["Module 1: Solution of Equations and Linear Systems"],
)


class FixedPointRequest(BaseModel):
    """Request payload for Fixed Point Iteration."""
    function: str = Field(..., description="Mathematical expression for g(x), e.g., 'cos(x)' or '(x + 2/x)/2'")
    x0: float = Field(..., description="Initial approximation x0")
    tolerance: float = Field(default=1e-6, description="Convergence tolerance threshold")
    max_iterations: int = Field(default=100, description="Maximum number of iterations allowed")
    reference_value: Optional[float] = Field(default=None, description="Optional reference/root benchmark value")


class SecantRequest(BaseModel):
    """Request payload for Secant Method."""
    function: str = Field(..., description="Mathematical expression for f(x), e.g., 'x**2 - 4' or 'cos(x) - x'")
    x0: float = Field(..., description="First initial approximation x0")
    x1: float = Field(..., description="Second initial approximation x1")
    tolerance: float = Field(default=1e-6, description="Convergence tolerance threshold")
    max_iterations: int = Field(default=100, description="Maximum number of iterations allowed")
    reference_value: Optional[float] = Field(default=None, description="Optional reference/root benchmark value")


class GaussSeidelRequest(BaseModel):
    """Request payload for Gauss-Seidel Method."""
    matrix: List[List[float]] = Field(..., description="Square coefficient matrix A (n x n)")
    vector: List[float] = Field(..., description="Right-hand side constant vector b (length n)")
    initial_guess: Optional[List[float]] = Field(default=None, description="Initial guess vector x0 (length n)")
    tolerance: float = Field(default=1e-6, description="Convergence tolerance threshold")
    max_iterations: int = Field(default=100, description="Maximum number of iterations allowed")
    reference_value: Optional[List[float]] = Field(default=None, description="Optional reference solution vector")


@router.post(
    "/fixed-point",
    response_model=NumericalResult,
    summary="Solve equation via Fixed Point Iteration",
    description="Iteratively evaluates x_{n+1} = g(x_n) until convergence or max iterations.",
)
def api_fixed_point(payload: FixedPointRequest) -> NumericalResult:
    try:
        return solve_fixed_point(
            g_expr=payload.function,
            x0=payload.x0,
            tolerance=payload.tolerance,
            max_iterations=payload.max_iterations,
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
    "/secant",
    response_model=NumericalResult,
    summary="Find root via Secant Method",
    description="Approximates roots of f(x) = 0 using two starting points without derivatives.",
)
def api_secant(payload: SecantRequest) -> NumericalResult:
    try:
        return solve_secant(
            f_expr=payload.function,
            x0=payload.x0,
            x1=payload.x1,
            tolerance=payload.tolerance,
            max_iterations=payload.max_iterations,
            reference_value=payload.reference_value,
        )
    except (ValidationError, MathParsingError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except SingularityError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Singularity encountered: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )


@router.post(
    "/gauss-seidel",
    response_model=NumericalResult,
    summary="Solve linear system Ax = b via Gauss-Seidel Method",
    description="Iteratively solves linear systems by updating unknown variables sequentially.",
)
def api_gauss_seidel(payload: GaussSeidelRequest) -> NumericalResult:
    try:
        return solve_gauss_seidel(
            matrix_a=payload.matrix,
            vector_b=payload.vector,
            initial_guess=payload.initial_guess,
            tolerance=payload.tolerance,
            max_iterations=payload.max_iterations,
            reference_value=payload.reference_value,
        )
    except (ValidationError, SingularityError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )
