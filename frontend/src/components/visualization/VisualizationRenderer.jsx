/**
 * Reusable Visualization Renderer.
 * Dispatches to specialized chart components based on backend VisualizationPayload.
 */

import { ConvergenceChart } from "./ConvergenceChart";
import { FunctionPlot } from "./FunctionPlot";
import { SurfaceHeatmapPlot } from "./SurfaceHeatmapPlot";
import { VisualizationEmptyState } from "./VisualizationEmptyState";

export function VisualizationRenderer({
  visualization,
  isLoading = false,
  height = 320,
}) {
  if (isLoading) {
    return (
      <VisualizationEmptyState
        title="Generating Visualization..."
        message="Computing convergence trajectories and numerical coordinates from the solver."
      />
    );
  }

  if (!visualization || !visualization.series || visualization.series.length === 0) {
    return (
      <VisualizationEmptyState
        title="No Visualization Data"
        message="Run the numerical solver to compute and plot the iteration trajectory."
      />
    );
  }

  const chartType = (visualization.chart_type || "line").toLowerCase();

  // Dispatch based on payload chart_type
  switch (chartType) {
    case "surface":
    case "heatmap":
    case "field":
      return <SurfaceHeatmapPlot visualization={visualization} height={height} />;

    case "function_curve":
    case "curve":
      return <FunctionPlot visualization={visualization} height={height} />;

    case "line":
    case "area":
    case "convergence":
    case "iteration_trajectory":
    case "scatter":
    default:
      return <ConvergenceChart visualization={visualization} height={height} />;
  }
}

export default VisualizationRenderer;
