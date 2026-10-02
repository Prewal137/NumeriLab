"""NumeriLab Standardized Result Architecture.

Defines Pydantic models representing solver outputs, iteration records,
error metrics, tabular data, and visualization payloads across all 15 numerical methods.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class StepRecord(BaseModel):
    """Represents a single iteration or step in an iterative or stepped numerical method."""
    step: int = Field(..., description="Step or iteration index (0-indexed or 1-indexed)")
    values: Dict[str, Any] = Field(
        default_factory=dict,
        description="Key-value mapping of intermediate variables (e.g., x, f(x), error)"
    )


class VisualizationPayload(BaseModel):
    """Structured data payload designed to directly feed frontend charting components."""
    chart_type: str = Field(
        ...,
        description="Type of chart to render (e.g., 'line', 'scatter', 'surface', 'contour', 'convergence')"
    )
    title: Optional[str] = Field(None, description="Plot title")
    x_label: Optional[str] = Field(None, description="X-axis label")
    y_label: Optional[str] = Field(None, description="Y-axis label")
    z_label: Optional[str] = Field(None, description="Z-axis label (for 2D/3D grids)")
    series: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Data series containing points, curves, reference curves, or mesh grids"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional auxiliary plotting configuration or visual cues"
    )


class ErrorAnalysis(BaseModel):
    """Encapsulates precision and error metrics comparing calculated and reference results."""
    reference_value: Optional[Union[float, List[float], Dict[str, Any]]] = Field(
        None, description="Analytical or high-precision benchmark reference value"
    )
    absolute_error: Optional[Union[float, List[float]]] = Field(
        None, description="|Calculated - Reference|"
    )
    relative_error: Optional[Union[float, List[float]]] = Field(
        None, description="|Calculated - Reference| / |Reference|"
    )
    estimated_error: Optional[float] = Field(
        None, description="A posteriori error estimate or step difference tolerance"
    )


class NumericalResult(BaseModel):
    """Standardized response container for all NumeriLab numerical methods."""

    success: bool = Field(..., description="Indicates if computation completed without runtime exception")
    method: str = Field(..., description="Unique identifier or display name of the numerical method")
    module: Optional[int] = Field(None, description="Module number (1 through 5)")

    # Primary Output
    final_value: Optional[Any] = Field(
        None, description="Final calculated scalar, vector, polynomial coefficients, or grid solution"
    )

    # Iteration & Convergence Metadata
    iterations: Optional[int] = Field(
        None, description="Total number of iterations or sub-intervals executed"
    )
    converged: Optional[bool] = Field(
        None, description="Whether tolerance criteria were satisfied within max iteration limits"
    )

    # Error & Accuracy
    error: Optional[str] = Field(
        None, description="Error message description if success is False or convergence failed"
    )
    error_analysis: Optional[ErrorAnalysis] = Field(
        None, description="Comprehensive error metrics (absolute, relative, benchmark error)"
    )

    # Tabular & Visual Data
    table: Optional[List[Dict[str, Any]]] = Field(
        None, description="Structured rows for frontend tabular display of iteration steps"
    )
    visualization: Optional[VisualizationPayload] = Field(
        None, description="Visualization data formatted for frontend charting"
    )

    # Pedagogical Context
    explanation: Optional[str] = Field(
        None, description="Brief mathematical explanation or step-by-step summary of the result"
    )

    # Custom extensible metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extensible method-specific metadata (e.g. condition number, relaxation parameter)"
    )
