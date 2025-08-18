// Keyboard Navigation Utilities
import { useEffect, useCallback, useRef } from "react";

// Keyboard navigation hook for managing focus and shortcuts
export const useKeyboardNavigation = (options = {}) => {
  const {
    enableArrowKeys = false,
    enableTabTrapping = false,
    shortcuts = {},
    onEscape = null,
    containerRef = null,
  } = options;

  const focusableElementsRef = useRef([]);

  // Get all focusable elements within a container
  const getFocusableElements = useCallback((container = document) => {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "textarea:not([disabled])",
      "select:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ");

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(
      (el) => {
        // Filter out hidden elements
        const style = window.getComputedStyle(el);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          el.offsetParent !== null
        );
      }
    );
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

      // Handle escape key
      if (key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle custom shortcuts
      const shortcutKey = `${ctrlKey ? "ctrl+" : ""}${metaKey ? "cmd+" : ""}${
        altKey ? "alt+" : ""
      }${shiftKey ? "shift+" : ""}${key.toLowerCase()}`;

      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
        return;
      }

      // Handle arrow key navigation
      if (
        enableArrowKeys &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)
      ) {
        event.preventDefault();
        handleArrowNavigation(key);
        return;
      }

      // Handle tab trapping
      if (enableTabTrapping && key === "Tab") {
        handleTabTrapping(event);
        return;
      }
    },
    [shortcuts, onEscape, enableArrowKeys, enableTabTrapping]
  );

  // Handle arrow key navigation
  const handleArrowNavigation = useCallback(
    (key) => {
      const container = containerRef?.current || document;
      const focusableElements = getFocusableElements(container);
      const currentIndex = focusableElements.indexOf(document.activeElement);

      if (currentIndex === -1) return;

      let nextIndex;
      switch (key) {
        case "ArrowUp":
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          break;
        case "ArrowDown":
          nextIndex =
            currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          break;
        case "ArrowLeft":
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          break;
        case "ArrowRight":
          nextIndex =
            currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          break;
        default:
          return;
      }

      focusableElements[nextIndex]?.focus();
    },
    [containerRef, getFocusableElements]
  );

  // Handle tab trapping for modals and dialogs
  const handleTabTrapping = useCallback(
    (event) => {
      const container = containerRef?.current;
      if (!container) return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [containerRef, getFocusableElements]
  );

  // Set up event listeners
  useEffect(() => {
    const container = containerRef?.current || document;
    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, containerRef]);

  // Update focusable elements reference
  useEffect(() => {
    const container = containerRef?.current || document;
    focusableElementsRef.current = getFocusableElements(container);
  });

  return {
    focusableElements: focusableElementsRef.current,
    getFocusableElements,
    focusFirst: () => focusableElementsRef.current[0]?.focus(),
    focusLast: () =>
      focusableElementsRef.current[
        focusableElementsRef.current.length - 1
      ]?.focus(),
    focusNext: () => {
      const currentIndex = focusableElementsRef.current.indexOf(
        document.activeElement
      );
      const nextIndex =
        currentIndex < focusableElementsRef.current.length - 1
          ? currentIndex + 1
          : 0;
      focusableElementsRef.current[nextIndex]?.focus();
    },
    focusPrevious: () => {
      const currentIndex = focusableElementsRef.current.indexOf(
        document.activeElement
      );
      const prevIndex =
        currentIndex > 0
          ? currentIndex - 1
          : focusableElementsRef.current.length - 1;
      focusableElementsRef.current[prevIndex]?.focus();
    },
  };
};

// Focus management utilities
export const focusManager = {
  // Store and restore focus
  storeFocus: () => {
    focusManager._previousFocus = document.activeElement;
  },

  restoreFocus: () => {
    if (
      focusManager._previousFocus &&
      typeof focusManager._previousFocus.focus === "function"
    ) {
      focusManager._previousFocus.focus();
      focusManager._previousFocus = null;
    }
  },

  // Focus trap for modals and dialogs
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
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

    container.addEventListener("keydown", handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  },

  // Check if element is focusable
  isFocusable: (element) => {
    if (!element || element.disabled) return false;

    const focusableElements = ["button", "input", "textarea", "select", "a"];

    const tagName = element.tagName.toLowerCase();
    const hasTabIndex =
      element.hasAttribute("tabindex") &&
      element.getAttribute("tabindex") !== "-1";
    const isContentEditable = element.contentEditable === "true";

    return (
      focusableElements.includes(tagName) || hasTabIndex || isContentEditable
    );
  },

  // Get next/previous focusable element
  getNextFocusable: (current, container = document) => {
    const focusableElements = Array.from(
      container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    );

    const currentIndex = focusableElements.indexOf(current);
    return focusableElements[currentIndex + 1] || focusableElements[0];
  },

  getPreviousFocusable: (current, container = document) => {
    const focusableElements = Array.from(
      container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    );

    const currentIndex = focusableElements.indexOf(current);
    return (
      focusableElements[currentIndex - 1] ||
      focusableElements[focusableElements.length - 1]
    );
  },
};

// Keyboard shortcut definitions for the application
export const keyboardShortcuts = {
  // Global shortcuts
  global: {
    "alt+h": "Go to home/dashboard",
    "alt+p": "Go to profile",
    "alt+l": "Logout",
    "ctrl+k": "Open command palette",
    escape: "Close modal/dialog",
    "?": "Show keyboard shortcuts help",
  },

  // User portal shortcuts
  user: {
    "alt+v": "Go to vehicles",
    "alt+l": "Go to logs",
    "alt+a": "Go to announcements",
    "ctrl+n": "Add new vehicle",
  },

  // Security guard shortcuts
  guard: {
    "alt+s": "Open QR scanner",
    "alt+l": "Go to logs",
    "alt+g": "Go to gates",
    space: "Start/stop scanning (when in scanner)",
  },

  // Manager shortcuts
  manager: {
    "alt+u": "Go to users",
    "alt+g": "Go to guards",
    "alt+v": "Go to vehicles",
    "alt+a": "Go to announcements",
    "ctrl+n": "Add new item",
  },
};

// Detect if user is navigating with keyboard
export const useKeyboardUser = () => {
  useEffect(() => {
    let isKeyboardUser = false;

    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        isKeyboardUser = true;
        document.body.classList.add("keyboard-user");
        document.body.classList.remove("mouse-user");
      }
    };

    const handleMouseDown = () => {
      isKeyboardUser = false;
      document.body.classList.add("mouse-user");
      document.body.classList.remove("keyboard-user");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    // Set initial state
    document.body.classList.add("mouse-user");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);
};

// Announce to screen readers
export const announce = (message, priority = "polite") => {
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", priority);
  announcer.setAttribute("aria-atomic", "true");
  announcer.className = "sr-only";
  announcer.textContent = message;

  document.body.appendChild(announcer);

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};
