// Enhanced Service Worker with advanced caching strategies
const CACHE_NAME = "veeqr-v2";
const STATIC_CACHE = "veeqr-static-v2";
const DYNAMIC_CACHE = "veeqr-dynamic-v2";
const API_CACHE = "veeqr-api-v2";

// Static assets to cache immediately
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = ["/api/auth/profile", "/api/announcements"];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement different caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Default: try cache first, then network
  event.respondWith(cacheFirstStrategy(request, DYNAMIC_CACHE));
});

// Network-first strategy (good for API calls and dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's a navigation request and no cache, return offline page
    if (request.mode === "navigate") {
      return caches.match("/");
    }

    throw error;
  }
}

// Cache-first strategy (good for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // For images, return a placeholder
    if (request.destination === "image") {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } }
      );
    }

    throw error;
  }
}

// Background sync for failed API requests (if supported)
if ("sync" in self.registration) {
  self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
      event.waitUntil(handleBackgroundSync());
    }
  });
}

async function handleBackgroundSync() {
  // Handle any queued requests when connection is restored
  console.log("Background sync triggered");
}
