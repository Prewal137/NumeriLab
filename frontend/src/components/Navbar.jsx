/**
 * NumeriLab Dynamic Island-Style Floating Glass Navigation Bar Component.
 * Responsive morphing navigation container with smooth scroll-aware transitions.
 * Navigation: [☰ Modules] [Dashboard] [Connected]
 */

import { useEffect, useState } from "react";
import { NumeriLabLogo } from "./NumeriLabLogo";

export function Navbar({ activeTab, onTabChange, onToggleSidebar, backendStatus }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 45);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getStatusClass = () => {
    if (backendStatus === "Connected") return "connected";
    if (backendStatus === "Disconnected") return "disconnected";
    return "checking";
  };

  return (
    <div className={`floating-navbar-wrapper ${isScrolled ? "is-scrolled" : ""}`}>
      <header
        className={`floating-navbar ${isScrolled ? "is-scrolled" : ""}`}
        role="banner"
        aria-label="Application Header"
      >
        {/* Brand Group */}
        <button
          type="button"
          className="navbar-brand-group"
          onClick={() => onTabChange && onTabChange("dashboard")}
          aria-label="NumeriLab Dashboard"
        >
          <NumeriLabLogo />
          <div className="navbar-brand-text">
            <span className="navbar-brand-title">NumeriLab</span>
            <span className="navbar-brand-subtitle">Interactive Numerical Studio</span>
          </div>
        </button>

        {/* Action Controls & Navigation: [☰ Modules] [Dashboard] [Connected] */}
        <div className="navbar-actions">
          {/* Single Modules Control: Opens Course Navigation Drawer */}
          <button
            type="button"
            className="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle modules navigation drawer"
            title="Browse course modules and numerical methods"
          >
            <span className="toggle-icon" aria-hidden="true">☰</span>
            <span className="btn-text">Modules</span>
          </button>

          {/* Direct Navigation Links: Dashboard only */}
          <nav className="nav-links-group" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => onTabChange && onTabChange("dashboard")}
              aria-current={activeTab === "dashboard" ? "page" : undefined}
            >
              Dashboard
            </button>
          </nav>

          {/* Backend Connection Indicator */}
          {backendStatus && (
            <div
              className="backend-indicator-badge"
              title={`Backend status: ${backendStatus}`}
              aria-label={`Backend status: ${backendStatus}`}
            >
              <span className={`status-dot ${getStatusClass()}`} />
              <span className="status-text">{backendStatus}</span>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default Navbar;
