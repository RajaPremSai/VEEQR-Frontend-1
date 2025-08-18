import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { useKeyboardNavigation } from "../utils/keyboardNavigation";

export default function NavBar() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Keyboard navigation shortcuts
  const shortcuts = {
    "alt+h": () => {
      const homeRoute = `/${profile?.role?.toLowerCase() || "user"}`;
      navigate(homeRoute);
    },
    "alt+p": () => {
      const profileRoute = `/${profile?.role?.toLowerCase() || "user"}/profile`;
      navigate(profileRoute);
    },
    "alt+l": () => logout(),
    escape: () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
  };

  // Add role-specific shortcuts
  if (profile?.role === "USER") {
    shortcuts["alt+v"] = () => navigate("/user/vehicles");
    shortcuts["alt+a"] = () => navigate("/user/announcements");
  } else if (profile?.role === "SECURITY_GUARD") {
    shortcuts["alt+s"] = () => navigate("/guard/scanner");
    shortcuts["alt+g"] = () => navigate("/guard/gates");
  } else if (profile?.role === "MANAGER") {
    shortcuts["alt+u"] = () => navigate("/manager/users");
    shortcuts["alt+g"] = () => navigate("/manager/guards");
    shortcuts["alt+v"] = () => navigate("/manager/u-vehicles");
    shortcuts["alt+a"] = () => navigate("/manager/announcements");
  }

  useKeyboardNavigation({
    shortcuts,
    onEscape: () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
  });

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
      <nav
        className="navbar-enhanced"
        role="navigation"
        aria-label="Main navigation"
      >
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
          <div
            className="navbar-nav-desktop"
            role="menubar"
            aria-label="Main menu"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  currentPath === item.path ? "active" : ""
                }`}
                style={{ "--role-color": getRoleColor(profile.role) }}
                role="menuitem"
                aria-current={currentPath === item.path ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMobileMenu();
                }
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
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
            <nav className="breadcrumb-nav" aria-label="Breadcrumb navigation">
              <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.path} className="breadcrumb-item">
                    {index > 0 && (
                      <span className="breadcrumb-separator" aria-hidden="true">
                        ›
                      </span>
                    )}
                    <Link
                      to={crumb.path}
                      className="breadcrumb-link"
                      style={{ "--role-color": getRoleColor(profile.role) }}
                      aria-current={
                        index === breadcrumbs.length - 1 ? "page" : undefined
                      }
                    >
                      <span className="breadcrumb-icon" aria-hidden="true">
                        {crumb.icon}
                      </span>
                      <span className="breadcrumb-label">{crumb.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}
      </nav>

      {/* Mobile Slide-out Menu */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      ></div>
      <div
        id="mobile-menu"
        className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Mobile navigation menu"
      >
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
          <button
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                closeMobileMenu();
              }
            }}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>

        <nav
          className="mobile-nav"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${
                currentPath === item.path ? "active" : ""
              }`}
              onClick={closeMobileMenu}
              style={{ "--role-color": getRoleColor(profile.role) }}
              role="menuitem"
              aria-current={currentPath === item.path ? "page" : undefined}
            >
              <span className="mobile-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
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
