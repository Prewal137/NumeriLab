/**
 * NumeriLab API Service Layer.
 * 
 * Provides centralized Axios HTTP client and typed solver invocation functions
 * for all 15 numerical methods across Modules I through V.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Centralized registry of backend API endpoint paths.
 */
export const ENDPOINTS = {
  // System
  HEALTH: "/api/health",

  // Module I: Solution of Equations and Linear Systems
  FIXED_POINT: "/api/module1/fixed-point",
  SECANT: "/api/module1/secant",
  GAUSS_SEIDEL: "/api/module1/gauss-seidel",

  // Module II: Interpolation and Approximation
  LAGRANGE: "/api/module2/lagrange",
  INVERSE_LAGRANGE: "/api/module2/inverse-lagrange",
  CUBIC_SPLINE: "/api/module2/cubic-spline",

  // Module III: Numerical Differentiation and Integration
  TRAPEZOIDAL: "/api/module3/trapezoidal",
  SIMPSON: "/api/module3/simpson",
  ROMBERG: "/api/module3/romberg",

  // Module IV: Ordinary Differential Equations
  EULER: "/api/module4/euler",
  MODIFIED_EULER: "/api/module4/modified-euler",
  RK4: "/api/module4/rk4",

  // Module V: Boundary Value Problems and Partial Differential Equations
  LINEAR_BVP: "/api/module5/linear-bvp",
  LAPLACE_POISSON: "/api/module5/laplace-poisson",
  CRANK_NICOLSON: "/api/module5/crank-nicolson",
};

/**
 * Generic POST helper executing solver requests with standardized error extraction.
 * 
 * @param {string} endpoint - API route path
 * @param {object} payload - Method-specific request payload matching backend Pydantic schema
 * @returns {Promise<object>} Standardized NumericalResult response object
 */
export const postSolverRequest = async (endpoint, payload) => {
  try {
    const response = await api.post(endpoint, payload);
    return response.data;
  } catch (error) {
    // Extract structured error message returned from FastAPI HTTPException or network error
    const detail =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected computation error occurred.";

    const customError = new Error(
      typeof detail === "string" ? detail : JSON.stringify(detail)
    );
    customError.status = error.response?.status;
    customError.raw = error;
    throw customError;
  }
};

/**
 * Health check querying backend service status.
 */
export const healthCheck = async () => {
  const response = await api.get(ENDPOINTS.HEALTH);
  return response.data;
};

// ==============================================================================
// MODULE I: Solution of Equations and Linear Systems
// ==============================================================================

/**
 * Solves nonlinear equation using Fixed Point Iteration: x_{k+1} = g(x_k).
 * Payload: { function: string, x0: number, tolerance?: number, max_iterations?: number, reference_value?: number }
 */
export const solveFixedPoint = (payload) =>
  postSolverRequest(ENDPOINTS.FIXED_POINT, payload);

/**
 * Finds roots of f(x) = 0 using Secant Method.
 * Payload: { function: string, x0: number, x1: number, tolerance?: number, max_iterations?: number, reference_value?: number }
 */
export const solveSecant = (payload) =>
  postSolverRequest(ENDPOINTS.SECANT, payload);

/**
 * Solves diagonally dominant linear system Ax = b using Gauss-Seidel iteration.
 * Payload: { matrix: number[][], vector: number[], initial_guess?: number[], tolerance?: number, max_iterations?: number, reference_value?: number[] }
 */
export const solveGaussSeidel = (payload) =>
  postSolverRequest(ENDPOINTS.GAUSS_SEIDEL, payload);

// ==============================================================================
// MODULE II: Interpolation and Approximation
// ==============================================================================

/**
 * Evaluates unique polynomial interpolation at target_x using Lagrange form.
 * Payload: { x_points: number[], y_points: number[], target_x: number, reference_value?: number }
 */
export const solveLagrange = (payload) =>
  postSolverRequest(ENDPOINTS.LAGRANGE, payload);

/**
 * Estimates independent variable x corresponding to target_y via Inverse Lagrange.
 * Payload: { x_points: number[], y_points: number[], target_y: number, reference_value?: number }
 */
export const solveInverseLagrange = (payload) =>
  postSolverRequest(ENDPOINTS.INVERSE_LAGRANGE, payload);

/**
 * Constructs natural cubic spline and evaluates at target_x.
 * Payload: { x_points: number[], y_points: number[], target_x: number, reference_value?: number }
 */
export const solveCubicSpline = (payload) =>
  postSolverRequest(ENDPOINTS.CUBIC_SPLINE, payload);

// ==============================================================================
// MODULE III: Numerical Differentiation and Integration
// ==============================================================================

/**
 * Approximates definite integral via Composite Trapezoidal Rule.
 * Payload: { function: string, a: number, b: number, n?: number, reference_value?: number }
 */
export const solveTrapezoidal = (payload) =>
  postSolverRequest(ENDPOINTS.TRAPEZOIDAL, payload);

/**
 * Approximates definite integral via Composite Simpson's 1/3 Rule (even subintervals).
 * Payload: { function: string, a: number, b: number, n?: number, reference_value?: number }
 */
export const solveSimpson = (payload) =>
  postSolverRequest(ENDPOINTS.SIMPSON, payload);

/**
 * Evaluates high-precision integral via Richardson extrapolation (Romberg Integration).
 * Payload: { function: string, a: number, b: number, max_levels?: number, tolerance?: number, reference_value?: number }
 */
export const solveRomberg = (payload) =>
  postSolverRequest(ENDPOINTS.ROMBERG, payload);

// ==============================================================================
// MODULE IV: Ordinary Differential Equations (Initial Value Problems)
// ==============================================================================

/**
 * Solves dy/dx = f(x, y) via explicit first-order Euler's Method.
 * Payload: { function: string, x0: number, y0: number, x_end: number, h?: number, reference_value?: number }
 */
export const solveEuler = (payload) =>
  postSolverRequest(ENDPOINTS.EULER, payload);

/**
 * Solves dy/dx = f(x, y) via second-order Modified Euler's (Heun's) Method.
 * Payload: { function: string, x0: number, y0: number, x_end: number, h?: number, reference_value?: number }
 */
export const solveModifiedEuler = (payload) =>
  postSolverRequest(ENDPOINTS.MODIFIED_EULER, payload);

/**
 * Solves dy/dx = f(x, y) via Fourth-Order Runge-Kutta (RK4) Method.
 * Payload: { function: string, x0: number, y0: number, x_end: number, h?: number, reference_value?: number }
 */
export const solveRK4 = (payload) =>
  postSolverRequest(ENDPOINTS.RK4, payload);

// ==============================================================================
// MODULE V: Boundary Value Problems and Partial Differential Equations
// ==============================================================================

/**
 * Solves linear second-order two-point BVP y'' + p(x)y' + q(x)y = r(x) via finite differences.
 * Payload: { p_expr?: string, q_expr?: string, r_expr?: string, a?: number, b?: number, n?: number, alpha1?: number, beta1?: number, gamma1?: number, alpha2?: number, beta2?: number, gamma2?: number, reference_solution_expr?: string }
 */
export const solveLinearBVP = (payload) =>
  postSolverRequest(ENDPOINTS.LINEAR_BVP, payload);

/**
 * Solves 2D Laplace / Poisson elliptic PDE on rectangular domain via Gauss-Seidel.
 * Payload: { pde_type?: string, source_expr?: string, x_min?: number, x_max?: number, y_min?: number, y_max?: number, nx?: number, ny?: number, top_val?: number|string, bottom_val?: number|string, left_val?: number|string, right_val?: number|string, tolerance?: number, max_iterations?: number }
 */
export const solveLaplacePoisson = (payload) =>
  postSolverRequest(ENDPOINTS.LAPLACE_POISSON, payload);

/**
 * Solves 1D transient heat equation ∂u/∂t = α ∂²u/∂x² via implicit Crank-Nicolson method.
 * Payload: { alpha?: number, x_min?: number, x_max?: number, t_start?: number, t_end?: number, nx?: number, nt?: number, u0_expr?: string, left_expr?: number|string, right_expr?: number|string, reference_expr?: string }
 */
export const solveCrankNicolson = (payload) =>
  postSolverRequest(ENDPOINTS.CRANK_NICOLSON, payload);

export default api;