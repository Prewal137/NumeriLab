/**
 * Reusable Convergence and Iteration Trajectory Chart.
 * Powered by Recharts with NumeriLab Dark Theme styling.
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "../results/formatters";

const PALETTE = [
  "#38bdf8", // Sky blue (primary)
  "#818cf8", // Indigo
  "#34d399", // Emerald
  "#fbbf24", // Amber
  "#f43f5e", // Rose
  "#c084fc", // Purple
  "#22d3ee", // Cyan
  "#f97316", // Orange
];

/**
 * Custom Tooltip for dark mode visualization.
 */
function CustomTooltip({ active, payload, label, xLabel }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "0.75rem 1rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        fontSize: "0.8rem",
        color: "#f8fafc",
        minWidth: "160px",
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: "0.4rem", fontWeight: 600, borderBottom: "1px solid #334155", paddingBottom: "0.25rem" }}>
        {xLabel || "Iteration"}: <span style={{ color: "#f8fafc" }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {payload.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#cbd5e1" }}>{item.name}:</span>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: item.color }}>
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConvergenceChart({ visualization, height = 300 }) {
  if (!visualization || !visualization.series || visualization.series.length === 0) {
    return null;
  }

  const { title, x_label = "Iteration", y_label = "Value", series = [] } = visualization;

  // Transform backend series data into merged Recharts rows
  // Backend series: [ { name: "x1", data: [{x: 0, y: 0.1}, {x: 1, y: 0.2}] }, ... ]
  // Map series configurations
  const seriesConfigMap = new Map();
  const pointsMap = new Map();
  const seriesNames = [];

  series.forEach((s) => {
    const sName = s.name || "Value";
    seriesNames.push(sName);
    seriesConfigMap.set(sName, s);
    if (Array.isArray(s.data)) {
      s.data.forEach((pt) => {
        const xVal = typeof pt.x === "number" ? Number(pt.x.toFixed(6)) : pt.x;
        if (!pointsMap.has(xVal)) {
          pointsMap.set(xVal, { x: xVal });
        }
        pointsMap.get(xVal)[sName] = pt.y;
      });
    }
  });

  // Sort by x coordinate ascending
  const chartData = Array.from(pointsMap.values()).sort((a, b) => {
    if (typeof a.x === "number" && typeof b.x === "number") {
      return a.x - b.x;
    }
    return String(a.x).localeCompare(String(b.x));
  });

  if (chartData.length === 0) {
    return null;
  }

  // Determine if dots should be shown on continuous lines
  const showDots = chartData.length <= 40;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      {/* Chart Header */}
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>
            {title}
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "4px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#94a3b8",
              fontFamily: "var(--mono)",
            }}
          >
            {chartData.length} Points
          </span>
        </div>
      )}

      {/* Chart Canvas */}
      <div
        style={{
          width: "100%",
          height: `${height}px`,
          backgroundColor: "#0b1120",
          borderRadius: "8px",
          border: "1px solid #334155",
          padding: "1rem 1rem 0.5rem 0.5rem",
          boxSizing: "border-box",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 25, left: 10, bottom: 20 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={{ stroke: "#334155" }}
              tickFormatter={(val) => {
                if (typeof val === "number") {
                  if (Math.abs(val) < 0.001 && val !== 0) return val.toExponential(2);
                  return Number.isInteger(val) ? val.toString() : val.toFixed(2);
                }
                return val;
              }}
              label={{
                value: x_label,
                position: "insideBottom",
                offset: -12,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={{ stroke: "#334155" }}
              domain={["auto", "auto"]}
              tickFormatter={(val) => {
                if (typeof val === "number") {
                  if (Math.abs(val) < 0.001 && val !== 0) return val.toExponential(2);
                  return Number.isInteger(val) ? val.toString() : val.toFixed(3);
                }
                return val;
              }}
              label={{
                value: y_label,
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <Tooltip
              content={<CustomTooltip xLabel={x_label} />}
              cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            {seriesNames.length > 1 && (
              <Legend
                verticalAlign="top"
                height={32}
                wrapperStyle={{
                  paddingBottom: "8px",
                  fontSize: "0.8rem",
                  color: "#cbd5e1",
                }}
              />
            )}
            {seriesNames.map((sName, index) => {
              const color = PALETTE[index % PALETTE.length];
              const sCfg = seriesConfigMap.get(sName) || {};
              const isScatter = sCfg.type === "scatter";

              return (
                <Line
                  key={sName}
                  type="monotone"
                  dataKey={sName}
                  name={sName}
                  stroke={isScatter ? "transparent" : color}
                  strokeWidth={isScatter ? 0 : 2}
                  connectNulls={true}
                  dot={
                    isScatter
                      ? {
                          r: 5,
                          fill: color,
                          stroke: "#ffffff",
                          strokeWidth: 1.5,
                        }
                      : showDots
                      ? {
                          r: 3.5,
                          fill: color,
                          stroke: "#0f172a",
                          strokeWidth: 1.5,
                        }
                      : false
                  }
                  activeDot={{
                    r: isScatter ? 7 : 5,
                    fill: color,
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={true}
                  animationDuration={600}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ConvergenceChart;
