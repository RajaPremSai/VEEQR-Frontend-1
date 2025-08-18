import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "./state/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import PerformanceReport from "./components/PerformanceReport";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import { useKeyboardUser } from "./utils/keyboardNavigation";

// Lazy load portal components for better code splitting
const UserPortal = lazy(() => import("./portals/UserPortal"));
const GuardPortal = lazy(() => import("./portals/GuardPortal"));
const ManagerPortal = lazy(() => import("./portals/ManagerPortal"));

export default function App() {
  const { isAuthenticated, profile } = useAuth();

  // Initialize keyboard user detection
  useKeyboardUser();

  const roleHome = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (profile?.role === "USER") return <Navigate to="/user" />;
    if (profile?.role === "SECURITY_GUARD") return <Navigate to="/guard" />;
    if (profile?.role === "MANAGER") return <Navigate to="/manager" />;
    return <Navigate to="/login" />;
  };

  return (
    <ErrorBoundary fallbackMessage="The application encountered an error. Please refresh the page to continue.">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Routes>
        <Route path="/" element={roleHome()} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route
            path="/user/*"
            element={
              <ErrorBoundary fallbackMessage="User portal encountered an error.">
                <Suspense fallback={<LoadingSpinner />}>
                  <UserPortal />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["SECURITY_GUARD"]} />}>
          <Route
            path="/guard/*"
            element={
              <ErrorBoundary fallbackMessage="Security guard portal encountered an error.">
                <Suspense fallback={<LoadingSpinner />}>
                  <GuardPortal />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
          <Route
            path="/manager/*"
            element={
              <ErrorBoundary fallbackMessage="Manager portal encountered an error.">
                <Suspense fallback={<LoadingSpinner />}>
                  <ManagerPortal />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Performance monitoring in development */}
      <PerformanceReport />

      {/* Keyboard shortcuts help - only show when authenticated */}
      {isAuthenticated && <KeyboardShortcuts />}
    </ErrorBoundary>
  );
}
