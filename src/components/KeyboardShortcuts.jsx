import React, { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { keyboardShortcuts } from "../utils/keyboardNavigation";
import Modal from "./Modal";

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useAuth();

  // Listen for keyboard shortcut to open help
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not in an input field
        const activeElement = document.activeElement;
        const isInInput =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.contentEditable === "true");

        if (!isInInput) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRoleShortcuts = () => {
    if (!profile) return {};

    switch (profile.role) {
      case "USER":
        return keyboardShortcuts.user;
      case "SECURITY_GUARD":
        return keyboardShortcuts.guard;
      case "MANAGER":
        return keyboardShortcuts.manager;
      default:
        return {};
    }
  };

  const formatShortcut = (shortcut) => {
    return shortcut.split("+").map((key, index, array) => (
      <React.Fragment key={key}>
        <kbd className="keyboard-shortcut-key">
          {key === "ctrl"
            ? "Ctrl"
            : key === "alt"
            ? "Alt"
            : key === "shift"
            ? "Shift"
            : key === "cmd"
            ? "Cmd"
            : key === "space"
            ? "Space"
            : key === "escape"
            ? "Esc"
            : key.toUpperCase()}
        </kbd>
        {index < array.length - 1 && <span className="shortcut-plus">+</span>}
      </React.Fragment>
    ));
  };

  const globalShortcuts = keyboardShortcuts.global;
  const roleShortcuts = getRoleShortcuts();

  return (
    <>
      {/* Keyboard shortcut trigger button */}
      <button
        className="keyboard-shortcuts-trigger"
        onClick={() => setIsOpen(true)}
        title="Keyboard shortcuts (Press ? for help)"
        aria-label="Show keyboard shortcuts"
      >
        <span className="shortcut-icon">⌨️</span>
      </button>

      {/* Keyboard shortcuts modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Keyboard Shortcuts"
        size="large"
        className="keyboard-shortcuts-modal"
      >
        <div className="shortcuts-content">
          <div className="shortcuts-intro">
            <p>
              Use these keyboard shortcuts to navigate the application more
              efficiently.
            </p>
          </div>

          <div className="shortcuts-sections">
            {/* Global shortcuts */}
            <div className="shortcuts-section">
              <h3 className="shortcuts-section-title">Global Shortcuts</h3>
              <div className="shortcuts-list">
                {Object.entries(globalShortcuts).map(
                  ([shortcut, description]) => (
                    <div key={shortcut} className="shortcut-item">
                      <div className="shortcut-keys">
                        {formatShortcut(shortcut)}
                      </div>
                      <div className="shortcut-description">{description}</div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Role-specific shortcuts */}
            {Object.keys(roleShortcuts).length > 0 && (
              <div className="shortcuts-section">
                <h3 className="shortcuts-section-title">
                  {profile?.role === "USER"
                    ? "User"
                    : profile?.role === "SECURITY_GUARD"
                    ? "Security Guard"
                    : profile?.role === "MANAGER"
                    ? "Manager"
                    : "Role"}{" "}
                  Shortcuts
                </h3>
                <div className="shortcuts-list">
                  {Object.entries(roleShortcuts).map(
                    ([shortcut, description]) => (
                      <div key={shortcut} className="shortcut-item">
                        <div className="shortcut-keys">
                          {formatShortcut(shortcut)}
                        </div>
                        <div className="shortcut-description">
                          {description}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Navigation tips */}
            <div className="shortcuts-section">
              <h3 className="shortcuts-section-title">Navigation Tips</h3>
              <div className="shortcuts-tips">
                <div className="tip-item">
                  <strong>Tab:</strong> Navigate between interactive elements
                </div>
                <div className="tip-item">
                  <strong>Shift + Tab:</strong> Navigate backwards
                </div>
                <div className="tip-item">
                  <strong>Enter/Space:</strong> Activate buttons and links
                </div>
                <div className="tip-item">
                  <strong>Arrow Keys:</strong> Navigate within lists and menus
                </div>
                <div className="tip-item">
                  <strong>Escape:</strong> Close modals and cancel actions
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default KeyboardShortcuts;
