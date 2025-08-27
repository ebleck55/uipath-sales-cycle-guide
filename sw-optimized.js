/**
 * Optimized Service Worker for UiPath Sales Cycle Guide
 * Provides offline capability, smart caching, and performance optimization
 */

const CACHE_VERSION = 'v2.1.0';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  data: `data-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`
};

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resource configurations
const RESOURCE_CONFIG = {
  // Critical static assets - cache first
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    patterns: [
      /\.(js|css|html)$/,
      /\/js\//,
      /\/css\//,
      /tailwindcss/
    ]
  },
  
  // Data files - stale while revalidate
  data: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    patterns: [
      /\.json$/,
      /\/data\//,
      /personas\.json/,
      /resources\.json/,
      /use-cases\.json/
    ]
  },
  
  // Images - cache first with longer expiry
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    patterns: [
      /\.(png|jpg|jpeg|gif|webp|svg)$/,
      /\/assets\//,
      /\/images\//
    ]
  },
  
  // API calls - network first
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutes
    patterns: [
      /\/api\//,
      /anthropic\.com/,
      /claude\.ai/
    ]
  }
};

// Critical files to cache immediately
const CRITICAL_CACHE = [
  './',
  './index.html',
  './timeline-app.js',
  './js/data.js',
  './css/styles.css',
  './src/data/personas.json',
  './src/core/performance.js'
];

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', event => {
  console.log('SW: Installing optimized service worker', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.static).then(cache => {
        console.log('SW: Caching critical resources');
        return cache.addAll(CRITICAL_CACHE);
      }),
      self.skipWaiting()
    ])
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('SW: Activating optimized service worker', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName => {
            return !Object.values(CACHE_NAMES).includes(cacheName);
          })
          .map(cacheName => {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch event - intelligent caching strategies
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy
  const config = getResourceConfig(request.url);
  
  event.respondWith(
    handleRequest(request, config)
  );
});

/**
 * Get resource configuration based on URL
 */
function getResourceConfig(url) {
  for (const [type, config] of Object.entries(RESOURCE_CONFIG)) {
    if (config.patterns.some(pattern => pattern.test(url))) {
      return { ...config, type };
    }
  }
  
  // Default to stale-while-revalidate for unknown resources
  return {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 60 * 60 * 1000, // 1 hour
    type: 'default'
  };
}

/**
 * Handle request based on cache strategy
 */
async function handleRequest(request, config) {
  const cacheName = CACHE_NAMES[config.type] || CACHE_NAMES.dynamic;
  
  try {
    switch (config.strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheName, config);
        
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheName, config);
        
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheName, config);
        
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
        
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request, cacheName);
        
      default:
        return await staleWhileRevalidate(request, cacheName, config);
    }
  } catch (error) {
    console.warn('SW: Request failed:', request.url, error);
    return await handleFailure(request, cacheName);
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request, cacheName, config) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, config.maxAge)) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

/**
 * Network-first strategy
 */
async function networkFirst(request, cacheName, config) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName, config) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('SW: Background update failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return await networkPromise;
}

/**
 * Cache-only strategy
 */
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  return await cache.match(request);
}

/**
 * Check if cached response is expired
 */
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const date = new Date(dateHeader);
  const now = new Date();
  
  return (now.getTime() - date.getTime()) > maxAge;
}

/**
 * Handle request failures
 */
async function handleFailure(request, cacheName) {
  // Try to find a cached version
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return await caches.match('./offline.html') || new Response(
      '<h1>Offline</h1><p>This page is not available offline.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  // Return network error for other requests
  return new Response('Network error', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Message handling for cache management
 */
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
      
    case 'PRECACHE_URLS':
      precacheUrls(payload.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('SW: All caches cleared');
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const stats = {};
  
  for (const [key, name] of Object.entries(CACHE_NAMES)) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    stats[key] = {
      name,
      count: keys.length,
      urls: keys.map(req => req.url)
    };
  }
  
  return stats;
}

/**
 * Precache specific URLs
 */
async function precacheUrls(urls) {
  const cache = await caches.open(CACHE_NAMES.dynamic);
  await cache.addAll(urls);
  console.log('SW: Precached URLs:', urls);
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', event => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any offline actions that need to be synced
      handleBackgroundSync()
    );
  }
});

/**
 * Handle background sync
 */
async function handleBackgroundSync() {
  try {
    // Implement offline data synchronization here
    console.log('SW: Background sync completed');
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action) {
    // Handle action clicks
    console.log('SW: Notification action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

console.log('SW: Optimized service worker loaded', CACHE_VERSION);