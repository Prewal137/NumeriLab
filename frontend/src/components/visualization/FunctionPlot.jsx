/**
 * FunctionPlot Component.
 * Visualizes continuous function curves, interpolation curves, and discrete evaluation nodes.
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

const CURVE_PALETTE = [
  "#38bdf8", // Primary curve (Sky)
  "#f43f5e", // Roots / target line (Rose)
  "#34d399", // Reference curve (Emerald)
  "#fbbf24", // Intermediates (Amber)
];

function FunctionPlotTooltip({ active, payload, label, xLabel }) {
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
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: "0.35rem", fontWeight: 600, borderBottom: "1px solid #334155", paddingBottom: "0.2rem" }}>
        {xLabel || "x"}: <span style={{ color: "#f8fafc" }}>{formatNumber(label)}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {payload.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <span style={{ color: "#cbd5e1" }}>{item.name}:</span>
            <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: item.color }}>
              {formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FunctionPlot({ visualization, height = 300 }) {
  if (!visualization || !visualization.series || visualization.series.length === 0) {
    return null;
  }

  const { title, x_label = "x", y_label = "f(x)", series = [] } = visualization;

  const pointsMap = new Map();
  const seriesNames = [];

  series.forEach((s) => {
    const sName = s.name || "Curve";
    seriesNames.push(sName);
    if (Array.isArray(s.data)) {
      s.data.forEach((pt) => {
        const xVal = pt.x;
        if (!pointsMap.has(xVal)) {
          pointsMap.set(xVal, { x: xVal });
        }
        pointsMap.get(xVal)[sName] = pt.y;
      });
    }
  });

  const chartData = Array.from(pointsMap.values()).sort((a, b) => {
    if (typeof a.x === "number" && typeof b.x === "number") {
      return a.x - b.x;
    }
    return String(a.x).localeCompare(String(b.x));
  });

  if (chartData.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f8fafc" }}>
            {title}
          </div>
        </div>
      )}

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
              label={{
                value: y_label,
                angle: -90,
                position: "insideLeft",
                offset: 5,
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />
            <Tooltip content={<FunctionPlotTooltip xLabel={x_label} />} />
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
              const color = CURVE_PALETTE[index % CURVE_PALETTE.length];
              return (
                <Line
                  key={sName}
                  type="monotone"
                  dataKey={sName}
                  name={sName}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FunctionPlot;
