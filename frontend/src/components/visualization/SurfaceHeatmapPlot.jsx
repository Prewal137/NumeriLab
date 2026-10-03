/**
 * 2D Surface & Heatmap Field Visualization Component.
 * Renders continuous colormapped potential/diffusion fields for 2D Laplace, Poisson, and PDE solutions.
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { formatNumber } from "../results/formatters";

/**
 * Maps normalized scalar value t in [0, 1] to a scientific thermal/turbo colormap RGB.
 */
function interpolateColormap(t) {
  const clamped = Math.max(0, Math.min(1, t));

  // High-contrast 6-stop Turbo/Thermal colormap: Deep Blue -> Cyan -> Emerald -> Yellow -> Orange -> Crimson
  const stops = [
    { pos: 0.0, r: 30, g: 58, b: 138 },    // Dark Blue
    { pos: 0.2, r: 14, g: 165, b: 233 },   // Sky Blue
    { pos: 0.4, r: 16, g: 185, b: 129 },   // Emerald Green
    { pos: 0.6, r: 234, g: 179, b: 8 },    // Bright Yellow
    { pos: 0.8, r: 249, g: 115, b: 22 },   // Orange
    { pos: 1.0, r: 225, g: 29, b: 72 },    // Crimson Red
  ];

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].pos && clamped <= stops[i + 1].pos) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.pos - lower.pos;
  const factor = range === 0 ? 0 : (clamped - lower.pos) / range;

  const r = Math.round(lower.r + factor * (upper.r - lower.r));
  const g = Math.round(lower.g + factor * (upper.g - lower.g));
  const b = Math.round(lower.b + factor * (upper.b - lower.b));

  return `rgb(${r}, ${g}, ${b})`;
}

export function SurfaceHeatmapPlot({ visualization, height = 340 }) {
  const canvasRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [viewMode, setViewMode] = useState("heatmap"); // "heatmap" | "matrix"

  // Extract grid and 2D matrix
  const matrix = useMemo(() => {
    const series = visualization?.series?.[0] || {};
    const metadata = visualization?.metadata || {};

    if (series.matrix && Array.isArray(series.matrix)) return series.matrix;
    if (metadata.matrix_u && Array.isArray(metadata.matrix_u)) return metadata.matrix_u;

    // Fallback if data is list of {x, y, z}
    if (Array.isArray(series.data) && series.data.length > 0 && series.data[0].z !== undefined) {
      const nx = metadata.nx || 21;
      const ny = metadata.ny || 21;
      const mat = [];
      for (let j = 0; j < ny; j++) {
        const row = [];
        for (let i = 0; i < nx; i++) {
          const idx = j * nx + i;
          row.push(series.data[idx] ? series.data[idx].z : 0);
        }
        mat.push(row);
      }
      return mat;
    }
    return [];
  }, [visualization]);

  const ny = matrix.length;
  const nx = ny > 0 && Array.isArray(matrix[0]) ? matrix[0].length : 0;

  const metadata = visualization?.metadata || {};
  const xGrid = metadata.x_grid || (nx > 0 ? Array.from({ length: nx }, (_, i) => i) : []);
  const yGrid = metadata.y_grid || (ny > 0 ? Array.from({ length: ny }, (_, j) => j) : []);

  // Compute global min and max
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const v = matrix[j][i];
        if (typeof v === "number" && !isNaN(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }
    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 1;
    if (min === max) max = min + 1e-6;
    return { minVal: min, maxVal: max };
  }, [matrix, nx, ny]);

  // Render Canvas colormap
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || nx === 0 || ny === 0) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, width, canvasHeight);

    const cellW = width / nx;
    const cellH = canvasHeight / ny;
    const span = maxVal - minVal;

    for (let j = 0; j < ny; j++) {
      // Draw from top (j = ny - 1) to bottom (j = 0) so y increases upwards
      const drawY = (ny - 1 - j) * cellH;
      for (let i = 0; i < nx; i++) {
        const val = matrix[j][i];
        const norm = span === 0 ? 0.5 : (val - minVal) / span;
        ctx.fillStyle = interpolateColormap(norm);
        ctx.fillRect(i * cellW, drawY, Math.ceil(cellW) + 0.5, Math.ceil(cellH) + 0.5);
      }
    }

    // Overlay subtle grid lines if grid is small enough
    if (nx <= 30 && ny <= 30) {
      ctx.strokeStyle = "rgba(15, 23, 42, 0.25)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= nx; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, canvasHeight);
        ctx.stroke();
      }
      for (let j = 0; j <= ny; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * cellH);
        ctx.lineTo(width, j * cellH);
        ctx.stroke();
      }
    }
  }, [matrix, nx, ny, minVal, maxVal]);

  useEffect(() => {
    if (viewMode === "heatmap") {
      drawHeatmap();
    }
  }, [drawHeatmap, viewMode]);

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || nx === 0 || ny === 0) return;

    const rect = canvas.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    const i = Math.floor((xPos / rect.width) * nx);
    const jFromTop = Math.floor((yPos / rect.height) * ny);
    const j = ny - 1 - jFromTop;

    if (i >= 0 && i < nx && j >= 0 && j < ny) {
      const val = matrix[j][i];
      setHoveredCell({
        i,
        j,
        x: xGrid[i] !== undefined ? xGrid[i] : i,
        y: yGrid[j] !== undefined ? yGrid[j] : j,
        val,
      });
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredCell(null);
  };

  if (nx === 0 || ny === 0) {
    return (
      <div className="slot-placeholder" style={{ minHeight: `${height}px` }}>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
          No 2D spatial grid field data available for this computation.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      {/* Visualizer Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>
            {visualization.title || "2D Potential / Solution Field Heatmap"}
          </div>
          <span
            style={{
              fontSize: "0.725rem",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#38bdf8",
              fontFamily: "var(--mono)",
            }}
          >
            {nx} × {ny} Grid Nodes
          </span>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button
            type="button"
            onClick={() => setViewMode("heatmap")}
            style={{
              background: viewMode === "heatmap" ? "#38bdf8" : "#1e293b",
              color: viewMode === "heatmap" ? "#0f172a" : "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "4px",
              padding: "0.2rem 0.55rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Colormap Field
          </button>
          <button
            type="button"
            onClick={() => setViewMode("matrix")}
            style={{
              background: viewMode === "matrix" ? "#38bdf8" : "#1e293b",
              color: viewMode === "matrix" ? "#0f172a" : "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "4px",
              padding: "0.2rem 0.55rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Matrix Grid View
          </button>
        </div>
      </div>

      {viewMode === "heatmap" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 90px",
            gap: "1rem",
            backgroundColor: "#0b1120",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "1rem",
            alignItems: "center",
          }}
        >
          {/* Main 2D Heatmap Canvas with Axes Labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", fontFamily: "var(--mono)" }}>
              <span>y_max = {formatNumber(yGrid[ny - 1])}</span>
              <span style={{ color: "#38bdf8" }}>↑ {visualization.y_label || "y"}</span>
            </div>

            <div style={{ position: "relative", width: "100%", height: `${height - 90}px` }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={260}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "6px",
                  display: "block",
                  cursor: "crosshair",
                }}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
              />

              {/* Hover Tooltip Overlay */}
              {hoveredCell && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid #38bdf8",
                    borderRadius: "6px",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.75rem",
                    color: "#f8fafc",
                    fontFamily: "var(--mono)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                    pointerEvents: "none",
                  }}
                >
                  <div>Node: [{hoveredCell.i}, {hoveredCell.j}]</div>
                  <div>x: {formatNumber(hoveredCell.x)}, y: {formatNumber(hoveredCell.y)}</div>
                  <div style={{ color: "#38bdf8", fontWeight: 700, marginTop: "2px" }}>
                    u(x, y) = {formatNumber(hoveredCell.val)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", fontFamily: "var(--mono)" }}>
              <span>x_min = {formatNumber(xGrid[0])}</span>
              <span style={{ color: "#38bdf8" }}>{visualization.x_label || "x"} →</span>
              <span>x_max = {formatNumber(xGrid[nx - 1])}</span>
            </div>
          </div>

          {/* Colorbar Scale Legend */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
              height: `${height - 90}px`,
              justifyContent: "space-between",
              borderLeft: "1px solid #1e293b",
              paddingLeft: "0.75rem",
            }}
          >
            <div style={{ fontSize: "0.7rem", color: "#f43f5e", fontFamily: "var(--mono)", fontWeight: 700 }}>
              {formatNumber(maxVal)}
            </div>

            <div
              style={{
                width: "16px",
                height: "100%",
                borderRadius: "4px",
                background: "linear-gradient(to bottom, rgb(225, 29, 72), rgb(249, 115, 22), rgb(234, 179, 8), rgb(16, 185, 129), rgb(14, 165, 233), rgb(30, 58, 138))",
                border: "1px solid #334155",
              }}
            />

            <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontFamily: "var(--mono)", fontWeight: 700 }}>
              {formatNumber(minVal)}
            </div>
          </div>
        </div>
      ) : (
        /* Matrix Grid View */
        <div
          style={{
            maxHeight: `${height}px`,
            overflowX: "auto",
            overflowY: "auto",
            backgroundColor: "#0b1120",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "0.75rem",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              fontSize: "0.75rem",
              fontFamily: "var(--mono)",
              textAlign: "center",
              width: "100%",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <th style={{ padding: "0.4rem", color: "#94a3b8" }}>y \ x</th>
                {xGrid.map((x, i) => (
                  <th key={i} style={{ padding: "0.4rem", color: "#38bdf8" }}>
                    {formatNumber(x)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, jFromTop) => {
                const j = ny - 1 - jFromTop;
                return (
                  <tr key={jFromTop} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "0.35rem 0.5rem", color: "#38bdf8", fontWeight: 600 }}>
                      {formatNumber(yGrid[j])}
                    </td>
                    {row.map((val, i) => {
                      const span = maxVal - minVal;
                      const norm = span === 0 ? 0.5 : (val - minVal) / span;
                      return (
                        <td
                          key={i}
                          style={{
                            padding: "0.35rem 0.5rem",
                            backgroundColor: `rgba(56, 189, 248, ${0.05 + norm * 0.25})`,
                            color: "#f8fafc",
                          }}
                        >
                          {formatNumber(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SurfaceHeatmapPlot;
