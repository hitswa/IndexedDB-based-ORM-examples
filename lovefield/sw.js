// Service Worker for TODO App
const CACHE_NAME = 'todo-app-v1.0';
const urlsToCache = [
    './',
    './index.html',
    './lovefield.min.js',
    './manifest.json'
];

// Install event - cache all assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Cache opened');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('Service Worker: All assets cached');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(function(error) {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('Service Worker: Cache cleanup complete');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', function(event) {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }

                // Otherwise, fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request).then(function(response) {
                    // Check if response is valid
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Add to cache for future use
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(function(error) {
                    console.error('Service Worker: Fetch failed:', error);
                    
                    // If it's an HTML request and network fails, return cached index.html
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/index.html');
                    }
                    
                    throw error;
                });
            })
    );
});

// Handle background sync for future enhancements
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        // Handle any background sync operations here
    }
});

// Handle push notifications for future enhancements
self.addEventListener('push', function(event) {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };

        event.waitUntil(
            self.registration.showNotification('TODO App', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message handling for communication with main thread
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.keys();
        }).then(function(keys) {
            event.ports[0].postMessage({
                type: 'CACHE_SIZE_RESPONSE',
                size: keys.length
            });
        });
    }
});