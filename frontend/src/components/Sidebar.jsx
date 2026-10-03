/**
 * NumeriLab Collapsible Floating Navigation Drawer Component.
 * Displays modules and quick access navigation in a toggleable glass overlay drawer.
 */

import { useEffect } from "react";
import { MODULES, METHODS } from "../data/methods";

export function Sidebar({
  isOpen,
  onClose,
  selectedModule,
  onSelectModule,
  activeTab,
  onNavigateTab,
}) {
  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Semi-transparent backdrop with click-to-close */}
      <div
        className={`sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Floating Glass Drawer */}
      <aside
        className={`sidebar-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Course navigation drawer"
      >
        {/* Drawer Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-title">
            <span style={{ color: "var(--accent-blue)" }}>❖</span>
            <span>NumeriLab Navigator</span>
          </div>
          <button
            type="button"
            className="btn-drawer-close"
            onClick={onClose}
            aria-label="Close navigation drawer"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="sidebar-content">
          {/* Quick Primary Navigation: Dashboard only */}
          <div className="sidebar-section-label">Main View</div>
          <button
            type="button"
            className={`sidebar-module-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              onNavigateTab && onNavigateTab("dashboard");
              onClose();
            }}
          >
            <div className="sidebar-module-item-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.95rem" }}>⌂</span>
                <span className="sidebar-module-name">Dashboard</span>
              </div>
            </div>
          </button>

          {/* Course Modules */}
          <div className="sidebar-section-label" style={{ marginTop: "1rem" }}>
            Course Modules (I – V)
          </div>
          {MODULES.map((mod) => {
            const isSelected = selectedModule === mod.id && activeTab === "modules";
            const moduleMethodCount = METHODS.filter((m) => m.module === mod.id).length;

            return (
              <button
                key={mod.id}
                type="button"
                className={`sidebar-module-item ${isSelected ? "active" : ""}`}
                onClick={() => {
                  onSelectModule && onSelectModule(mod.id);
                  onClose();
                }}
              >
                <div className="sidebar-module-item-header">
                  <span className="sidebar-module-name">{mod.name}</span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: isSelected ? "var(--accent-blue)" : "var(--text-dim)",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {moduleMethodCount} methods
                  </span>
                </div>
                <div className="sidebar-module-title">{mod.title}</div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
