"""NumeriLab Controlled Mathematical Expression Parser.

Provides secure parsing, validation, and lambdification of mathematical expressions
using SymPy with strict token whitelisting and error handling.
"""

from typing import Any, Callable, List, Optional, Sequence
import sympy as sp
from .errors import MathParsingError

# Whitelisted standard mathematical functions in SymPy
ALLOWED_FUNCTIONS = {
    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "asin": sp.asin,
    "acos": sp.acos,
    "atan": sp.atan,
    "sinh": sp.sinh,
    "cosh": sp.cosh,
    "tanh": sp.tanh,
    "exp": sp.exp,
    "log": sp.log,
    "ln": sp.log,
    "log10": lambda x: sp.log(x, 10),
    "sqrt": sp.sqrt,
    "abs": sp.Abs,
    "pi": sp.pi,
    "e": sp.E,
}


class SafeMathParser:
    """Safely parses string representations of mathematical expressions into SymPy symbols and lambdified functions."""

    @staticmethod
    def parse_expression(expr_str: str, variable_names: Sequence[str] = ("x",)) -> sp.Expr:
        """Parses a mathematical string expression with given allowed variable symbols.
        
        Args:
            expr_str: The mathematical expression as a string (e.g., 'x**2 - 4*cos(x)').
            variable_names: Allowed free variables (e.g., ('x',) or ('x', 'y') or ('t', 'y')).
            
        Returns:
            SymPy Expr representing the parsed formula.
            
        Raises:
            MathParsingError: If parsing fails or invalid/unsafe tokens are supplied.
        """
        if not expr_str or not expr_str.strip():
            raise MathParsingError("Mathematical expression cannot be empty.")

        expr_clean = expr_str.strip()

        # Build symbol table
        symbols_dict = {name: sp.Symbol(name, real=True) for name in variable_names}
        local_dict = {**symbols_dict, **ALLOWED_FUNCTIONS}

        try:
            parsed_expr = sp.parse_expr(
                expr_clean,
                local_dict=local_dict,
                transformations=sp.parsing.sympy_parser.standard_transformations + (
                    sp.parsing.sympy_parser.implicit_multiplication_application,
                ),
                evaluate=True,
            )
        except Exception as e:
            raise MathParsingError(f"Failed to parse mathematical expression '{expr_str}': {str(e)}")

        # Verify free symbols are only the expected variables
        allowed_sym_set = set(symbols_dict.values())
        actual_free = parsed_expr.free_symbols
        unauthorized_syms = actual_free - allowed_sym_set
        if unauthorized_syms:
            raise MathParsingError(
                f"Expression contains unauthorized variables: {[s.name for s in unauthorized_syms]}. Allowed: {list(variable_names)}"
            )

        return parsed_expr

    @classmethod
    def compile_function(
        cls,
        expr_str: str,
        variable_names: Sequence[str] = ("x",),
        modules: str = "numpy"
    ) -> Callable[..., Any]:
        """Compiles a mathematical string into a fast, vector-capable numerical callable.
        
        Args:
            expr_str: Mathematical expression string.
            variable_names: Sequence of variable names in parameter order.
            modules: Backend evaluation library ('numpy' or 'math').
            
        Returns:
            Callable function taking numeric arguments.
        """
        expr = cls.parse_expression(expr_str, variable_names)
        symbols = [sp.Symbol(name, real=True) for name in variable_names]
        try:
            return sp.lambdify(symbols, expr, modules=modules)
        except Exception as e:
            raise MathParsingError(f"Failed to compile function for '{expr_str}': {str(e)}")
