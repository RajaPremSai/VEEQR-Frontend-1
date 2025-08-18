import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./state/AuthContext";
import {
  setupLazyImages,
  preloadCriticalResources,
  registerServiceWorker,
  monitorMemoryUsage,
  addResourceHints,
  preloadRouteChunks,
  collectPerformanceMetrics,
  analyzeBundleSize,
} from "./utils/performance";
import "./styles.css";

// Initialize performance optimizations
addResourceHints();
preloadCriticalResources();
registerServiceWorker();
collectPerformanceMetrics();

// Setup lazy loading after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setupLazyImages();
  preloadRouteChunks();

  // Development-only optimizations
  if (process.env.NODE_ENV === "development") {
    monitorMemoryUsage();
    analyzeBundleSize();
    // Monitor memory every 30 seconds in development
    setInterval(monitorMemoryUsage, 30000);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
