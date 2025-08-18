import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { PageLoader } from "./LoadingStates";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, profile } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(null);

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Small delay to show loading state

    return () => clearTimeout(timer);
  }, []);

  // Handle route transitions
  useEffect(() => {
    if (previousLocation && previousLocation.pathname !== location.pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 150); // Quick transition

      return () => clearTimeout(timer);
    }
    setPreviousLocation(location);
  }, [location, previousLocation]);

  // Show loading state during initial load
  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show transition loading for route changes
  if (isTransitioning) {
    return (
      <div className="route-transition">
        <div className="route-transition-loader">
          <div className="transition-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="protected-route-container">
      <div className="route-content">
        <Outlet />
      </div>
    </div>
  );
}
