import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children, className = "" }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("enter");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("exit");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "exit") {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("enter");
      }, 200); // Match exit animation duration

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={`page-transition page-transition-${transitionStage} ${className}`}
      key={displayLocation.pathname}
    >
      {children}
    </div>
  );
}

// Hook for managing loading states during transitions
export function usePageTransition() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(null);

  useEffect(() => {
    if (previousLocation && previousLocation.pathname !== location.pathname) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
    setPreviousLocation(location);
  }, [location, previousLocation]);

  return { isTransitioning, location, previousLocation };
}

// Component for wrapping individual pages with transition effects
export function TransitionWrapper({ children, className = "" }) {
  return (
    <div className={`transition-wrapper ${className}`}>
      <div className="transition-content">{children}</div>
    </div>
  );
}
