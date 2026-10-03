/**
 * Numerical Result Value Formatters.
 * Formats scalar numbers, vectors, scientific notation, and complex nested data structures safely.
 */

/**
 * Formats numbers into clean decimal or scientific notation.
 */
export function formatNumber(val, decimals = 8) {
  if (typeof val !== "number" || isNaN(val)) return String(val);
  if (!isFinite(val)) return val > 0 ? "Infinity" : "-Infinity";
  if (val === 0) return "0";

  const absVal = Math.abs(val);
  if (absVal < 1e-5 || absVal >= 1e8) {
    return val.toExponential(6);
  }
  return Number.isInteger(val) ? val.toString() : val.toFixed(decimals);
}

/**
 * Formats any cell value (scalar, vector, nested object) safely for UI display.
 */
export function formatCellValue(cell) {
  if (cell === null || cell === undefined) return "—";
  if (typeof cell === "number") return formatNumber(cell);
  if (typeof cell === "boolean") return cell ? "true" : "false";
  if (Array.isArray(cell)) {
    return `[${cell.map((v) => formatCellValue(v)).join(", ")}]`;
  }
  if (typeof cell === "object") {
    return Object.entries(cell)
      .map(([k, v]) => `${k} = ${formatCellValue(v)}`)
      .join("; ");
  }
  return String(cell);
}
