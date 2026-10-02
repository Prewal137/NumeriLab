/**
 * NumeriLab Navigation Bar Component.
 */

export function Navbar({ activeTab, onTabChange }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        backgroundColor: "#1e293b",
        color: "#f8fafc",
        borderBottom: "1px solid #334155",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          N
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.025em" }}>
            NumeriLab
          </h1>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Interactive Numerical Methods Platform
          </span>
        </div>
      </div>

      <nav style={{ display: "flex", gap: "1rem" }}>
        {["dashboard", "modules", "verification"].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange && onTabChange(tab)}
            style={{
              background: activeTab === tab ? "#334155" : "transparent",
              color: activeTab === tab ? "#ffffff" : "#94a3b8",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              textTransform: "capitalize",
              transition: "all 0.2s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
