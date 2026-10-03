/**
 * NumeriLab Numerical Orbit Logo Mark Component.
 * Precision-engineered geometric "N" with integrated mathematical convergence trajectory.
 */

export function NumeriLabLogo({ className = "navbar-logo-badge" }) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* Base Glass/Dark Gradient */}
          <linearGradient id="nl-bg-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0b132b" />
          </linearGradient>

          {/* Outer Border Gradient */}
          <linearGradient id="nl-border-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.5)" />
            <stop offset="50%" stopColor="rgba(99, 102, 241, 0.35)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.45)" />
          </linearGradient>

          {/* Geometric 'N' Gradient */}
          <linearGradient id="nl-n-grad" x1="9" y1="8" x2="23" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Orbit Trajectory Gradient */}
          <linearGradient id="nl-orbit-grad" x1="4" y1="12" x2="28" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.15)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.9)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0.8)" />
          </linearGradient>
        </defs>

        {/* Rounded Square Container */}
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7.5"
          fill="url(#nl-bg-grad)"
          stroke="url(#nl-border-grad)"
          strokeWidth="1.2"
        />

        {/* Subtle Top Inner Specular Highlight */}
        <path
          d="M 4 12 C 4 7.5 7.5 4 12 4 L 20 4"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Precision Numerical Orbit / Trajectory Curve */}
        <ellipse
          cx="16"
          cy="16"
          rx="10.5"
          ry="4.8"
          transform="rotate(-28 16 16)"
          stroke="url(#nl-orbit-grad)"
          strokeWidth="1.3"
          strokeDasharray="28 8"
          strokeLinecap="round"
        />

        {/* Orbit Trajectory Convergence Node */}
        <circle
          cx="22.2"
          cy="11.8"
          r="1.4"
          fill="#38bdf8"
          stroke="rgba(15, 23, 42, 0.8)"
          strokeWidth="0.6"
        />

        {/* Geometric "N" Core Identity */}
        <path
          d="M 9.5 22.5 L 9.5 9.5 L 22.5 22.5 L 22.5 9.5"
          stroke="url(#nl-n-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default NumeriLabLogo;
