/**
 * MethodInputForm Component.
 * Dispatcher that renders the appropriate interactive parameter form for the selected numerical method.
 */

import { FixedPointForm } from "./module1/FixedPointForm";
import { SecantForm } from "./module1/SecantForm";
import { GaussSeidelForm } from "./module1/GaussSeidelForm";
import { LagrangeForm } from "./module2/LagrangeForm";
import { InverseLagrangeForm } from "./module2/InverseLagrangeForm";
import { CubicSplineForm } from "./module2/CubicSplineForm";
import { TrapezoidalForm } from "./module3/TrapezoidalForm";
import { SimpsonForm } from "./module3/SimpsonForm";
import { RombergForm } from "./module3/RombergForm";

export function MethodInputForm({ method, onSubmit, isLoading, onReset }) {
  if (!method) return null;

  switch (method.id) {
    case "fixed-point":
      return (
        <FixedPointForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "secant":
      return (
        <SecantForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "gauss-seidel":
      return (
        <GaussSeidelForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "lagrange":
      return (
        <LagrangeForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "inverse-lagrange":
      return (
        <InverseLagrangeForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "cubic-spline":
      return (
        <CubicSplineForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "trapezoidal":
      return (
        <TrapezoidalForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "simpson":
      return (
        <SimpsonForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    case "romberg":
      return (
        <RombergForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          onReset={onReset}
        />
      );

    default:
      return (
        <div className="slot-placeholder" style={{ minHeight: "180px" }}>
          <div style={{ fontWeight: 600, color: "#cbd5e1", marginBottom: "0.25rem" }}>
            {method.name} Form
          </div>
          <div style={{ fontSize: "0.825rem", maxWidth: "280px" }}>
            Interactive parameter inputs for Module {method.module} ({method.category}) will be mounted in upcoming module phases.
          </div>
        </div>
      );
  }
}

export default MethodInputForm;
