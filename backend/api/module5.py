"""Module V API Router: Boundary Value Problems and Partial Differential Equations.

Endpoints:
- POST /api/module5/linear-bvp
- POST /api/module5/laplace-poisson
- POST /api/module5/crank-nicolson
"""

from typing import Optional, Union
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from core.errors import MathParsingError, SingularityError, ValidationError
from core.result import NumericalResult
from methods.module5 import (
    solve_crank_nicolson,
    solve_laplace_poisson,
    solve_linear_bvp,
)

router = APIRouter(
    prefix="/api/module5",
    tags=["Module 5: BVPs and PDEs"],
)


class LinearBVPRequest(BaseModel):
    """Request payload for Two-Point Linear Boundary Value Problem."""
    p_expr: str = Field(default="0", description="Coefficient p(x) in y'' + p(x)y' + q(x)y = r(x)")
    q_expr: str = Field(default="0", description="Coefficient q(x) in y'' + p(x)y' + q(x)y = r(x)")
    r_expr: str = Field(default="0", description="RHS source function r(x)")
    a: float = Field(default=0.0, description="Left boundary coordinate a")
    b: float = Field(default=1.0, description="Right boundary coordinate b (b > a)")
    n: int = Field(default=20, description="Number of subintervals n (n >= 3)")
    alpha1: float = Field(default=1.0, description="Left BC coefficient alpha1 in alpha1*y(a) + beta1*y'(a) = gamma1")
    beta1: float = Field(default=0.0, description="Left BC coefficient beta1")
    gamma1: float = Field(default=0.0, description="Left BC value gamma1")
    alpha2: float = Field(default=1.0, description="Right BC coefficient alpha2 in alpha2*y(b) + beta2*y'(b) = gamma2")
    beta2: float = Field(default=0.0, description="Right BC coefficient beta2")
    gamma2: float = Field(default=0.0, description="Right BC value gamma2")
    reference_solution_expr: Optional[str] = Field(default=None, description="Optional exact analytical solution y(x)")


class LaplacePoissonRequest(BaseModel):
    """Request payload for 2D Laplace / Poisson Equation Solver."""
    pde_type: str = Field(default="laplace", description="'laplace' (f=0) or 'poisson'")
    source_expr: str = Field(default="0", description="Source term f(x, y) for Poisson equation")
    x_min: float = Field(default=0.0, description="Domain left boundary x_min")
    x_max: float = Field(default=1.0, description="Domain right boundary x_max (x_max > x_min)")
    y_min: float = Field(default=0.0, description="Domain bottom boundary y_min")
    y_max: float = Field(default=1.0, description="Domain top boundary y_max (y_max > y_min)")
    nx: int = Field(default=21, description="Grid resolution in x direction (3 <= nx <= 100)")
    ny: int = Field(default=21, description="Grid resolution in y direction (3 <= ny <= 100)")
    top_val: Union[float, str] = Field(default=100.0, description="Boundary value at y = y_max (scalar or expression in x)")
    bottom_val: Union[float, str] = Field(default=0.0, description="Boundary value at y = y_min (scalar or expression in x)")
    left_val: Union[float, str] = Field(default=0.0, description="Boundary value at x = x_min (scalar or expression in y)")
    right_val: Union[float, str] = Field(default=0.0, description="Boundary value at x = x_max (scalar or expression in y)")
    tolerance: float = Field(default=1e-5, description="Gauss-Seidel convergence tolerance > 0")
    max_iterations: int = Field(default=2000, description="Maximum iterations (1 <= max_iterations <= 20000)")


class CrankNicolsonRequest(BaseModel):
    """Request payload for Crank-Nicolson 1D Heat Equation Solver."""
    alpha: float = Field(default=1.0, description="Thermal diffusivity alpha > 0")
    x_min: float = Field(default=0.0, description="Left spatial coordinate x_min")
    x_max: float = Field(default=1.0, description="Right spatial coordinate x_max (x_max > x_min)")
    t_start: float = Field(default=0.0, description="Initial simulation time t_start")
    t_end: float = Field(default=0.1, description="Final simulation time t_end (t_end > t_start)")
    nx: int = Field(default=21, description="Number of spatial grid points (3 <= nx <= 500)")
    nt: int = Field(default=51, description="Number of temporal grid points (2 <= nt <= 2000)")
    u0_expr: str = Field(default="sin(pi*x)", description="Initial temperature profile u(x, t_start)")
    left_expr: Union[float, str] = Field(default=0.0, description="Left boundary temperature u(x_min, t)")
    right_expr: Union[float, str] = Field(default=0.0, description="Right boundary temperature u(x_max, t)")
    reference_expr: Optional[str] = Field(default=None, description="Optional exact analytical solution u(x, t)")


@router.post(
    "/linear-bvp",
    response_model=NumericalResult,
    summary="Solve Two-Point Linear Boundary Value Problem",
    description="Finite-difference solver for y'' + p(x)y' + q(x)y = r(x) on [a, b] with Robin/Dirichlet BCs.",
)
def api_linear_bvp(payload: LinearBVPRequest) -> NumericalResult:
    try:
        return solve_linear_bvp(
            p_expr=payload.p_expr,
            q_expr=payload.q_expr,
            r_expr=payload.r_expr,
            a=payload.a,
            b=payload.b,
            n=payload.n,
            alpha1=payload.alpha1,
            beta1=payload.beta1,
            gamma1=payload.gamma1,
            alpha2=payload.alpha2,
            beta2=payload.beta2,
            gamma2=payload.gamma2,
            reference_solution_expr=payload.reference_solution_expr,
        )
    except (ValidationError, MathParsingError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except SingularityError as e:
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
    "/laplace-poisson",
    response_model=NumericalResult,
    summary="Solve 2D Laplace / Poisson Elliptic PDE",
    description="Five-point finite difference stencil with Gauss-Seidel relaxation on rectangular domains.",
)
def api_laplace_poisson(payload: LaplacePoissonRequest) -> NumericalResult:
    try:
        return solve_laplace_poisson(
            pde_type=payload.pde_type,
            source_expr=payload.source_expr,
            x_min=payload.x_min,
            x_max=payload.x_max,
            y_min=payload.y_min,
            y_max=payload.y_max,
            nx=payload.nx,
            ny=payload.ny,
            top_val=payload.top_val,
            bottom_val=payload.bottom_val,
            left_val=payload.left_val,
            right_val=payload.right_val,
            tolerance=payload.tolerance,
            max_iterations=payload.max_iterations,
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
    "/crank-nicolson",
    response_model=NumericalResult,
    summary="Solve 1D Heat Equation via Crank-Nicolson Method",
    description="Implicit second-order in time and space finite-difference method for ∂u/∂t = α ∂²u/∂x².",
)
def api_crank_nicolson(payload: CrankNicolsonRequest) -> NumericalResult:
    try:
        return solve_crank_nicolson(
            alpha=payload.alpha,
            x_min=payload.x_min,
            x_max=payload.x_max,
            t_start=payload.t_start,
            t_end=payload.t_end,
            nx=payload.nx,
            nt=payload.nt,
            u0_expr=payload.u0_expr,
            left_expr=payload.left_expr,
            right_expr=payload.right_expr,
            reference_expr=payload.reference_expr,
        )
    except (ValidationError, MathParsingError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except SingularityError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal computation error: {str(e)}",
        )
