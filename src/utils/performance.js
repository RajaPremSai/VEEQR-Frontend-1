// Performance optimization utilities

/**
 * Lazy load images with intersection observer
 */
export function setupLazyImages() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  // Preload critical fonts
  const fontPreloads = [
    "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600&display=swap",
  ];

  fontPreloads.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Optimize bundle loading with prefetch
 */
export function prefetchRoutes() {
  // Prefetch route chunks that are likely to be visited
  const routesToPrefetch = ["/user", "/guard", "/manager"];

  routesToPrefetch.forEach((route) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = route;
    document.head.appendChild(link);
  });
}

/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get connection speed for adaptive loading
 */
export function getConnectionSpeed() {
  if ("connection" in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }
  return null;
}

/**
 * Optimize images based on device capabilities
 */
export function getOptimalImageSize(baseWidth) {
  const dpr = window.devicePixelRatio || 1;
  const connection = getConnectionSpeed();

  // Reduce image quality on slow connections
  if (
    connection &&
    (connection.saveData || connection.effectiveType === "slow-2g")
  ) {
    return Math.floor(baseWidth * 0.7);
  }

  // Use device pixel ratio for high-DPI displays
  return Math.floor(baseWidth * Math.min(dpr, 2));
}

/**
 * Memory usage monitoring (development only)
 */
export function monitorMemoryUsage() {
  if (process.env.NODE_ENV === "development" && "memory" in performance) {
    const memInfo = performance.memory;
    console.log("Memory Usage:", {
      used: Math.round(memInfo.usedJSHeapSize / 1048576) + " MB",
      total: Math.round(memInfo.totalJSHeapSize / 1048576) + " MB",
      limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + " MB",
    });
  }
}

/**
 * Service Worker registration for caching
 */
export function registerServiceWorker() {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }
}

/**
 * Critical CSS detection
 */
export function loadNonCriticalCSS() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/non-critical.css";
  link.media = "print";
  link.onload = function () {
    this.media = "all";
  };
  document.head.appendChild(link);
}

/**
 * Preload route chunks for better performance
 */
export function preloadRouteChunks() {
  // Preload chunks based on user role
  const userRole = localStorage.getItem("userRole");
  const chunksToPreload = [];

  switch (userRole) {
    case "USER":
      chunksToPreload.push("/user/vehicles", "/user/logs");
      break;
    case "SECURITY_GUARD":
      chunksToPreload.push("/guard/scanner", "/guard/logs");
      break;
    case "MANAGER":
      chunksToPreload.push("/manager/users", "/manager/dashboard");
      break;
  }

  chunksToPreload.forEach((chunk) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = chunk;
    document.head.appendChild(link);
  });
}

/**
 * Optimize bundle loading with resource hints
 */
export function addResourceHints() {
  // DNS prefetch for external resources
  const dnsPrefetchUrls = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ];

  dnsPrefetchUrls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "dns-prefetch";
    link.href = url;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const preconnectUrls = ["https://fonts.googleapis.com"];

  preconnectUrls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = url;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Implement adaptive loading based on network conditions
 */
export function getAdaptiveLoadingStrategy() {
  const connection = getConnectionSpeed();

  if (!connection) {
    return { imageQuality: 0.8, enableAnimations: true, prefetchRoutes: true };
  }

  // Adjust strategy based on connection
  if (connection.saveData || connection.effectiveType === "slow-2g") {
    return {
      imageQuality: 0.5,
      enableAnimations: false,
      prefetchRoutes: false,
      lazyLoadImages: true,
    };
  }

  if (connection.effectiveType === "2g" || connection.effectiveType === "3g") {
    return {
      imageQuality: 0.7,
      enableAnimations: true,
      prefetchRoutes: false,
      lazyLoadImages: true,
    };
  }

  // Fast connection (4g)
  return {
    imageQuality: 0.9,
    enableAnimations: true,
    prefetchRoutes: true,
    lazyLoadImages: false,
  };
}

/**
 * Bundle size analyzer (development only)
 */
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === "development") {
    // Log bundle information
    const scripts = document.querySelectorAll("script[src]");
    const styles = document.querySelectorAll('link[rel="stylesheet"]');

    console.group("Bundle Analysis");
    console.log(`Scripts loaded: ${scripts.length}`);
    console.log(`Stylesheets loaded: ${styles.length}`);

    // Estimate bundle sizes (rough approximation)
    let totalScriptSize = 0;
    scripts.forEach((script, index) => {
      if (script.src.includes("assets")) {
        console.log(`Script ${index + 1}: ${script.src}`);
      }
    });

    console.groupEnd();
  }
}

/**
 * Performance metrics collection
 */
export function collectPerformanceMetrics() {
  if ("performance" in window) {
    // Wait for page to fully load
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const paint = performance.getEntriesByType("paint");

        const metrics = {
          // Core Web Vitals approximation
          FCP: paint.find((entry) => entry.name === "first-contentful-paint")
            ?.startTime,
          LCP: navigation.loadEventEnd - navigation.loadEventStart,
          CLS: 0, // Would need additional measurement

          // Loading metrics
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

          // Network metrics
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
        };

        if (process.env.NODE_ENV === "development") {
          console.table(metrics);
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === "production" && window.gtag) {
          Object.entries(metrics).forEach(([key, value]) => {
            if (value && value > 0) {
              window.gtag("event", "timing_complete", {
                name: key,
                value: Math.round(value),
              });
            }
          });
        }
      }, 0);
    });
  }
}
