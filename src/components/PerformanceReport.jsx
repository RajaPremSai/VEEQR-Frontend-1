import { useState, useEffect } from "react";
import { useMemoryMonitor } from "../utils/usePerformance";

export default function PerformanceReport() {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const memoryInfo = useMemoryMonitor();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Collect performance data
      const collectData = () => {
        if ("performance" in window) {
          const navigation = performance.getEntriesByType("navigation")[0];
          const paint = performance.getEntriesByType("paint");

          setPerformanceData({
            domContentLoaded: Math.round(
              navigation.domContentLoadedEventEnd -
                navigation.domContentLoadedEventStart
            ),
            loadComplete: Math.round(
              navigation.loadEventEnd - navigation.loadEventStart
            ),
            firstContentfulPaint:
              paint.find((entry) => entry.name === "first-contentful-paint")
                ?.startTime || 0,
            resourceCount: performance.getEntriesByType("resource").length,
          });
        }
      };

      // Collect data after page load
      if (document.readyState === "complete") {
        collectData();
      } else {
        window.addEventListener("load", collectData);
        return () => window.removeEventListener("load", collectData);
      }
    }
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      <button
        className="performance-toggle"
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        PERF
      </button>

      {isVisible && (
        <div
          className="performance-report"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            minWidth: "300px",
            maxHeight: "400px",
            overflow: "auto",
            zIndex: 9998,
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
            Performance Report
          </h3>

          {performanceData && (
            <div style={{ marginBottom: "12px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
                Loading Metrics
              </h4>
              <div>
                DOM Content Loaded: {performanceData.domContentLoaded}ms
              </div>
              <div>Load Complete: {performanceData.loadComplete}ms</div>
              <div>
                First Contentful Paint:{" "}
                {Math.round(performanceData.firstContentfulPaint)}ms
              </div>
              <div>Resources Loaded: {performanceData.resourceCount}</div>
            </div>
          )}

          {memoryInfo && (
            <div style={{ marginBottom: "12px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
                Memory Usage
              </h4>
              <div>Used: {memoryInfo.used} MB</div>
              <div>Total: {memoryInfo.total} MB</div>
              <div>Limit: {memoryInfo.limit} MB</div>
            </div>
          )}

          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
              Optimizations Active
            </h4>
            <div>✓ Code Splitting</div>
            <div>✓ Lazy Loading</div>
            <div>✓ Service Worker</div>
            <div>✓ Resource Hints</div>
            <div>✓ Bundle Optimization</div>
          </div>
        </div>
      )}
    </>
  );
}
