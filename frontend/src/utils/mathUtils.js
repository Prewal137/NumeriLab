/**
 * Mathematical String & Expression Utilities.
 * Provides safe expression normalization for user-friendly formulas.
 */

/**
 * Normalizes user mathematical expressions for Python/SymPy backend compatibility.
 * Replaces standard power notation `^` with exponentiation operator `**`.
 * Preserves expressions that already contain `**`.
 *
 * Examples:
 *   "2*x^3 - x + 3" -> "2*x**3 - x + 3"
 *   "x^2"           -> "x**2"
 *   "exp(-x**2)"    -> "exp(-x**2)"
 *
 * @param {string} expr - Mathematical expression string
 * @returns {string} Normalized expression string
 */
export function normalizeMathExpression(expr) {
  if (typeof expr !== "string") return expr;
  return expr.replace(/\^/g, "**");
}

export default normalizeMathExpression;
