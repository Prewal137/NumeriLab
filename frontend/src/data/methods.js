/**
 * NumeriLab Methods Registry & Metadata
 * 
 * Comprehensive metadata definition for all 15 numerical methods across 5 modules.
 */

export const MODULES = [
  {
    id: 1,
    name: "Module I",
    title: "Solution of Equations & Linear Systems",
    description: "Root-finding algorithms for non-linear equations and iterative solvers for linear systems of equations.",
  },
  {
    id: 2,
    name: "Module II",
    title: "Interpolation & Approximation",
    description: "Polynomial interpolation, inverse interpolation techniques, and piecewise cubic spline construction.",
  },
  {
    id: 3,
    name: "Module III",
    title: "Numerical Differentiation & Integration",
    description: "Newton-Cotes quadrature formulas, composite numerical integration, and Richardson extrapolation-based Romberg integration.",
  },
  {
    id: 4,
    name: "Module IV",
    title: "Ordinary Differential Equations",
    description: "Step-by-step single-step numerical integrators for initial value problems (IVPs).",
  },
  {
    id: 5,
    name: "Module V",
    title: "BVPs & Partial Differential Equations",
    description: "Finite difference methods for boundary value problems, elliptic 2D field equations, and parabolic transient heat diffusion.",
  },
];

export const METHODS = [
  // MODULE I: Solution of Equations and Linear Systems
  {
    id: "fixed-point",
    name: "Fixed Point Iteration",
    module: 1,
    category: "Solution of Equations",
    description: "Finds roots of f(x)=0 by iteratively evaluating x_{k+1} = g(x_k) until convergence criteria are met.",
    route: "/module1/fixed-point",
  },
  {
    id: "secant",
    name: "Secant Method",
    module: 1,
    category: "Solution of Equations",
    description: "Approximates roots using secant lines across two successive approximations without requiring analytical derivatives.",
    route: "/module1/secant",
  },
  {
    id: "gauss-seidel",
    name: "Gauss-Seidel Method",
    module: 1,
    category: "Linear Systems",
    description: "Iteratively solves diagonally dominant linear systems Ax=b using immediately updated component values.",
    route: "/module1/gauss-seidel",
  },

  // MODULE II: Interpolation and Approximation
  {
    id: "lagrange",
    name: "Lagrange Interpolation",
    module: 2,
    category: "Interpolation",
    description: "Constructs the unique lowest-degree polynomial that passes through a discrete set of given data points.",
    route: "/module2/lagrange",
  },
  {
    id: "inverse-lagrange",
    name: "Lagrange Inverse Interpolation",
    module: 2,
    category: "Interpolation",
    description: "Estimates the unknown argument x corresponding to a specified target value y by inverting the interpolation polynomial.",
    route: "/module2/inverse-lagrange",
  },
  {
    id: "cubic-spline",
    name: "Cubic Spline Interpolation",
    module: 2,
    category: "Splines",
    description: "Constructs piecewise continuous cubic polynomials with C2 continuity across all interior data knots.",
    route: "/module2/cubic-spline",
  },

  // MODULE III: Numerical Differentiation and Integration
  {
    id: "trapezoidal",
    name: "Trapezoidal Rule",
    module: 3,
    category: "Numerical Integration",
    description: "Approximates definite integrals by partitioning the integration domain into linear trapezoids.",
    route: "/module3/trapezoidal",
  },
  {
    id: "simpson",
    name: "Simpson's 1/3 Rule",
    module: 3,
    category: "Numerical Integration",
    description: "Performs numerical quadrature using parabolic segment approximations across pairs of adjacent subintervals.",
    route: "/module3/simpson",
  },
  {
    id: "romberg",
    name: "Romberg Integration",
    module: 3,
    category: "Numerical Integration",
    description: "Accelerates composite trapezoidal quadrature using successive Richardson extrapolation to achieve higher-order accuracy.",
    route: "/module3/romberg",
  },

  // MODULE IV: Ordinary Differential Equations
  {
    id: "euler",
    name: "Euler's Method",
    module: 4,
    category: "Initial Value Problems",
    description: "First-order explicit numerical stepping method for initial value ordinary differential equations.",
    route: "/module4/euler",
  },
  {
    id: "modified-euler",
    name: "Modified Euler's Method",
    module: 4,
    category: "Initial Value Problems",
    description: "Second-order predictor-corrector method (Heun's method) averaging interval slope estimates.",
    route: "/module4/modified-euler",
  },
  {
    id: "rk4",
    name: "Fourth-Order Runge-Kutta (RK4)",
    module: 4,
    category: "Initial Value Problems",
    description: "Classic high-precision fourth-order integration method computing a weighted average of four trial slopes per step.",
    route: "/module4/rk4",
  },

  // MODULE V: Boundary Value Problems and Partial Differential Equations
  {
    id: "linear-bvp",
    name: "Two-Point Linear BVP",
    module: 5,
    category: "Boundary Value Problems",
    description: "Solves second-order linear two-point boundary value problems using central finite difference discretization.",
    route: "/module5/linear-bvp",
  },
  {
    id: "laplace-poisson",
    name: "2D Laplace/Poisson Equation",
    module: 5,
    category: "Partial Differential Equations",
    description: "Solves 2D steady-state potential and diffusion field equations on rectangular domains using a five-point finite difference stencil.",
    route: "/module5/laplace-poisson",
  },
  {
    id: "crank-nicolson",
    name: "Crank-Nicolson Method (1D Heat Equation)",
    module: 5,
    category: "Partial Differential Equations",
    description: "Unconditionally stable, second-order implicit finite difference scheme for solving 1D parabolic transient heat conduction.",
    route: "/module5/crank-nicolson",
  },
];

export const getModuleById = (id) => MODULES.find((m) => m.id === Number(id)) || null;
export const getMethodById = (id) => METHODS.find((m) => m.id === id) || null;
export const getMethodsByModule = (moduleId) => METHODS.filter((m) => m.module === Number(moduleId));
