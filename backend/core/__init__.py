"""NumeriLab Backend Core Package.

Provides standardized result schemas, mathematical expression parsing,
validation utilities, and domain-specific exception handling.
"""

from .errors import (
    ConvergenceError,
    MathParsingError,
    NumeriLabError,
    ValidationError,
)
from .parser import SafeMathParser
from .result import NumericalResult, StepRecord

__all__ = [
    "NumeriLabError",
    "ValidationError",
    "ConvergenceError",
    "MathParsingError",
    "SafeMathParser",
    "NumericalResult",
    "StepRecord",
]
