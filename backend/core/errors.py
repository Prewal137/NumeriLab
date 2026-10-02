"""NumeriLab Custom Application Exceptions.

Defines the error hierarchy for numerical computations, validation,
and mathematical expression parsing.
"""

from typing import Any, Dict, Optional


class NumeriLabError(Exception):
    """Base exception class for all NumeriLab application errors."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ValidationError(NumeriLabError):
    """Raised when user inputs fail structural, domain, or mathematical constraints."""
    pass


class MathParsingError(NumeriLabError):
    """Raised when parsing or sanitizing a user mathematical expression fails."""
    pass


class ConvergenceError(NumeriLabError):
    """Raised when an iterative numerical method fails to converge within tolerances."""
    pass


class SingularityError(NumeriLabError):
    """Raised when division by zero, singular matrix, or undefined value is encountered."""
    pass


class MethodNotImplementedError(NumeriLabError):
    """Raised when an endpoint or method stub is invoked prior to implementation."""
    pass
