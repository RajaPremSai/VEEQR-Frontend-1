import React, { useEffect, useState } from "react";

// Screen Reader Announcer Component
export const ScreenReaderAnnouncer = ({
  message,
  priority = "polite",
  clearAfter = 1000,
}) => {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (message) {
      setAnnouncement(message);

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setAnnouncement("");
        }, clearAfter);

        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  if (!announcement) return null;

  return (
    <div
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
      role="status"
    >
      {announcement}
    </div>
  );
};

// Live Region Component for dynamic content updates
export const LiveRegion = ({
  children,
  priority = "polite",
  atomic = true,
  relevant = "additions text",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`live-region ${className}`}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
      {...props}
    >
      {children}
    </div>
  );
};

// Skip Navigation Links Component
export const SkipNavigation = ({ links = [] }) => {
  const defaultLinks = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#navigation", label: "Skip to navigation" },
    { href: "#footer", label: "Skip to footer" },
  ];

  const navigationLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav className="skip-navigation" aria-label="Skip navigation">
      {navigationLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.focus();
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

// Focus Trap Component for modals and dialogs
export const FocusTrap = ({
  children,
  active = true,
  className = "",
  ...props
}) => {
  const trapRef = React.useRef(null);

  useEffect(() => {
    if (!active || !trapRef.current) return;

    const focusableElements = trapRef.current.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    firstElement.focus();

    trapRef.current.addEventListener("keydown", handleTabKey);

    return () => {
      if (trapRef.current) {
        trapRef.current.removeEventListener("keydown", handleTabKey);
      }
    };
  }, [active]);

  return (
    <div ref={trapRef} className={`focus-trap ${className}`} {...props}>
      {children}
    </div>
  );
};

// Accessible Heading Component with proper hierarchy
export const AccessibleHeading = ({
  level = 1,
  children,
  className = "",
  id,
  ...props
}) => {
  const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}`;

  return (
    <HeadingTag
      id={id}
      className={`heading heading-${level} ${className}`}
      {...props}
    >
      {children}
    </HeadingTag>
  );
};

// Accessible Button Component with proper ARIA attributes
export const AccessibleButton = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  ariaPressed,
  className = "",
  onClick,
  ...props
}) => {
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <button
      className={`accessible-btn accessible-btn--${variant} accessible-btn--${size} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="accessible-btn-spinner" aria-hidden="true">
          <span className="sr-only">Loading...</span>
        </span>
      )}
      {children}
    </button>
  );
};

// Accessible Link Component
export const AccessibleLink = ({
  children,
  href,
  external = false,
  ariaLabel,
  className = "",
  ...props
}) => {
  const linkProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <a
      href={href}
      className={`accessible-link ${className}`}
      aria-label={
        ariaLabel || (external ? `${children} (opens in new tab)` : undefined)
      }
      {...linkProps}
      {...props}
    >
      {children}
      {external && <span className="sr-only"> (opens in new tab)</span>}
    </a>
  );
};

// Accessible Table Component
export const AccessibleTable = ({
  children,
  caption,
  className = "",
  ...props
}) => {
  return (
    <table className={`accessible-table ${className}`} role="table" {...props}>
      {caption && (
        <caption className="accessible-table-caption">{caption}</caption>
      )}
      {children}
    </table>
  );
};

// Accessible Form Group Component
export const AccessibleFormGroup = ({
  children,
  legend,
  error,
  className = "",
  ...props
}) => {
  return (
    <fieldset
      className={`accessible-form-group ${className}`}
      aria-invalid={error ? "true" : "false"}
      {...props}
    >
      {legend && <legend className="accessible-form-legend">{legend}</legend>}
      {children}
      {error && (
        <div className="accessible-form-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </fieldset>
  );
};

// Accessible Status Component for dynamic updates
export const AccessibleStatus = ({
  children,
  type = "status",
  priority = "polite",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`accessible-status accessible-status--${type} ${className}`}
      role={type}
      aria-live={priority}
      aria-atomic="true"
      {...props}
    >
      {children}
    </div>
  );
};

// Hook for managing focus
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState(null);

  const storeFocus = () => {
    setFocusedElement(document.activeElement);
  };

  const restoreFocus = () => {
    if (focusedElement && typeof focusedElement.focus === "function") {
      focusedElement.focus();
      setFocusedElement(null);
    }
  };

  const focusElement = (selector) => {
    const element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    if (element && typeof element.focus === "function") {
      element.focus();
    }
  };

  return {
    storeFocus,
    restoreFocus,
    focusElement,
    focusedElement,
  };
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const [announcement, setAnnouncement] = useState("");

  const announce = (message, priority = "polite") => {
    setAnnouncement(""); // Clear first to ensure re-announcement
    setTimeout(() => {
      setAnnouncement(message);
    }, 10);

    // Clear after announcement
    setTimeout(() => {
      setAnnouncement("");
    }, 1000);
  };

  return {
    announce,
    announcement,
  };
};
