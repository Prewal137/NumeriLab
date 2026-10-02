/**
 * NumeriLab Sidebar Component.
 * Displays modules and quick access navigation for numerical methods.
 */

import { MODULES } from "../data/methods";

export function Sidebar({ selectedModule, onSelectModule }) {
  return (
    <aside
      style={{
        width: "260px",
        backgroundColor: "#0f172a",
        color: "#94a3b8",
        padding: "1.5rem 1rem",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "0.5rem", paddingLeft: "0.5rem" }}>
        Course Modules
      </div>
      {MODULES.map((mod) => {
        const isSelected = selectedModule === mod.id;
        return (
          <button
            key={mod.id}
            onClick={() => onSelectModule && onSelectModule(mod.id)}
            style={{
              textAlign: "left",
              backgroundColor: isSelected ? "#1e293b" : "transparent",
              color: isSelected ? "#38bdf8" : "#94a3b8",
              border: "1px solid",
              borderColor: isSelected ? "#38bdf8" : "transparent",
              borderRadius: "8px",
              padding: "0.75rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{mod.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
              {mod.title}
            </div>
          </button>
        );
      })}
    </aside>
  );
}

export default Sidebar;
