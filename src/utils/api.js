import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth and performance
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Add request timestamp for performance monitoring
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for performance monitoring and error handling
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log slow requests in development
    if (process.env.NODE_ENV === "development" && duration > 1000) {
      console.warn(
        `Slow API request: ${response.config.url} took ${duration}ms`
      );
    }

    return response;
  },
  (error) => {
    // Handle network errors gracefully
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.config.url);
    }

    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// API caching utility for GET requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedGet = async (url, config = {}) => {
  const cacheKey = `${url}${JSON.stringify(config)}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get(url, config);
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });
    return response;
  } catch (error) {
    // Return cached data if available during errors
    if (cached) {
      console.warn("Using stale cache due to API error:", error.message);
      return cached.data;
    }
    throw error;
  }
};

// Clear cache utility
export const clearCache = () => {
  cache.clear();
};

export default api;
