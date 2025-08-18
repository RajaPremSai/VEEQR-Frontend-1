import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";

export default function NavBar() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const getRoleIcon = (role) => {
    switch (role) {
      case "MANAGER":
        return "👨‍💼";
      case "SECURITY_GUARD":
        return "🛡️";
      case "USER":
        return "👤";
      default:
        return "👤";
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case "MANAGER":
        return "Manager";
      case "SECURITY_GUARD":
        return "Security Guard";
      case "USER":
        return "User";
      default:
        return "User";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "MANAGER":
        return "var(--primary-600)";
      case "SECURITY_GUARD":
        return "var(--success-600)";
      case "USER":
        return "var(--info-600)";
      default:
        return "var(--primary-600)";
    }
  };

  const getNavigationItems = (role) => {
    switch (role) {
      case "USER":
        return [
          { path: "/user", label: "Dashboard", icon: "📊" },
          { path: "/user/vehicles", label: "My Vehicles", icon: "🚗" },
          { path: "/user/logs", label: "My Logs", icon: "📋" },
          { path: "/user/announcements", label: "Announcements", icon: "📢" },
          { path: "/user/profile", label: "My Profile", icon: "👤" },
        ];
      case "SECURITY_GUARD":
        return [
          { path: "/guard", label: "Dashboard", icon: "📊" },
          { path: "/guard/scanner", label: "QR Scanner", icon: "📱" },
          { path: "/guard/logs", label: "Entry Logs", icon: "📋" },
          { path: "/guard/gates", label: "Gates", icon: "🚪" },
          { path: "/guard/profile", label: "My Profile", icon: "👤" },
        ];
      case "MANAGER":
        return [
          { path: "/manager", label: "Dashboard", icon: "📊" },
          { path: "/manager/users", label: "Users", icon: "👥" },
          { path: "/manager/guards", label: "Guards", icon: "🛡️" },
          {
            path: "/manager/u-vehicles",
            label: "University Vehicles",
            icon: "🚌",
          },
          {
            path: "/manager/personal-vehicles",
            label: "Personal Vehicles",
            icon: "🚗",
          },
          { path: "/manager/gates", label: "Gates", icon: "🚪" },
          {
            path: "/manager/announcements",
            label: "Announcements",
            icon: "📢",
          },
          { path: "/manager/logs", label: "Logs", icon: "📋" },
        ];
      default:
        return [];
    }
  };

  // Generate breadcrumbs based on current location
  useEffect(() => {
    if (!profile) return;

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const navItems = getNavigationItems(profile.role);
    const crumbs = [];

    // Add role home
    const roleHome = navItems.find(
      (item) => item.path === `/${pathSegments[0]}`
    );
    if (roleHome) {
      crumbs.push({
        label: roleHome.label,
        path: roleHome.path,
        icon: roleHome.icon,
      });
    }

    // Add current page if not home
    if (pathSegments.length > 1) {
      const currentPath = `/${pathSegments[0]}/${pathSegments[1]}`;
      const currentItem = navItems.find((item) => item.path === currentPath);
      if (currentItem && currentItem.path !== roleHome?.path) {
        crumbs.push({
          label: currentItem.label,
          path: currentItem.path,
          icon: currentItem.icon,
        });
      }
    }

    setBreadcrumbs(crumbs);
  }, [location.pathname, profile]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!profile) return null;

  const navigationItems = getNavigationItems(profile.role);
  const currentPath = location.pathname;

  return (
    <>
      <nav className="navbar-enhanced">
        <div className="navbar-container">
          {/* Logo and Brand */}
          <div className="navbar-brand">
            <div
              className="logo-icon"
              style={{ background: getRoleColor(profile.role) }}
            >
              🔐
            </div>
            <div className="brand-text">
              <div className="brand-name">UniPass</div>
              <div className="brand-tagline">
                Smart Access for Smarter Campuses
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav-desktop">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  currentPath === item.path ? "active" : ""
                }`}
                style={{ "--role-color": getRoleColor(profile.role) }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile and Actions */}
          <div className="navbar-actions">
            {/* User Avatar */}
            <div
              className="user-avatar"
              style={{ "--role-color": getRoleColor(profile.role) }}
            >
              <div className="avatar-icon">{getRoleIcon(profile.role)}</div>
              <div className="user-info">
                <div className="user-name">
                  {profile.firstName} {profile.lastName}
                </div>
                <div className="user-role">{getRoleName(profile.role)}</div>
              </div>
            </div>

            {/* Logout Button */}
            <button className="logout-btn" onClick={logout} title="Sign Out">
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Sign Out</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <div className="breadcrumb-container">
            <div className="breadcrumb-nav">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="breadcrumb-item">
                  {index > 0 && <span className="breadcrumb-separator">›</span>}
                  <Link
                    to={crumb.path}
                    className="breadcrumb-link"
                    style={{ "--role-color": getRoleColor(profile.role) }}
                  >
                    <span className="breadcrumb-icon">{crumb.icon}</span>
                    <span className="breadcrumb-label">{crumb.label}</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Slide-out Menu */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
      ></div>
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-user-info">
            <div
              className="mobile-avatar"
              style={{ background: getRoleColor(profile.role) }}
            >
              {getRoleIcon(profile.role)}
            </div>
            <div>
              <div className="mobile-user-name">
                {profile.firstName} {profile.lastName}
              </div>
              <div className="mobile-user-role">
                {getRoleName(profile.role)}
              </div>
            </div>
          </div>
          <button className="mobile-menu-close" onClick={closeMobileMenu}>
            ✕
          </button>
        </div>

        <nav className="mobile-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${
                currentPath === item.path ? "active" : ""
              }`}
              onClick={closeMobileMenu}
              style={{ "--role-color": getRoleColor(profile.role) }}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <button
            className="mobile-logout-btn"
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
          >
            <span className="mobile-logout-icon">🚪</span>
            <span className="mobile-logout-text">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
