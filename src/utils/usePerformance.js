import { useEffect, useRef, useState } from "react";
import { getAdaptiveLoadingStrategy } from "./performance";

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName) {
  const renderStartTime = useRef(performance.now());
  const mountTime = useRef(null);

  useEffect(() => {
    mountTime.current = performance.now();
    const renderTime = mountTime.current - renderStartTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }

    // Cleanup
    return () => {
      if (process.env.NODE_ENV === "development") {
        const unmountTime = performance.now();
        const lifeTime = unmountTime - mountTime.current;
        console.log(`${componentName} lifetime: ${lifeTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

/**
 * Hook for adaptive loading based on network conditions
 */
export function useAdaptiveLoading() {
  const [strategy, setStrategy] = useState(() => getAdaptiveLoadingStrategy());

  useEffect(() => {
    // Update strategy when network conditions change
    if ("connection" in navigator) {
      const updateStrategy = () => {
        setStrategy(getAdaptiveLoadingStrategy());
      };

      navigator.connection.addEventListener("change", updateStrategy);
      return () => {
        navigator.connection.removeEventListener("change", updateStrategy);
      };
    }
  }, []);

  return strategy;
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
}

/**
 * Hook for debouncing values (performance optimization)
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling callbacks
 */
export function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());

  return (...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if ("memory" in performance && process.env.NODE_ENV === "development") {
      const updateMemoryInfo = () => {
        const memory = performance.memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
}

/**
 * Hook for preloading resources
 */
export function usePreloadResource(href, as = "script") {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [href, as]);
}
