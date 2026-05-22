/**
 * 📱 VIBELYF SERVICE WORKER
 * 
 * Enables PWA features:
 *   - Home screen install on mobile
 *   - Offline caching of core assets
 *   - Background sync for vocabulary
 *   - Fast subsequent loads
 * 
 * CREATED: March 2026
 */

const CACHE_NAME = 'vibelyf-v2026.03';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/js/cultural-vocabulary-master.js',
    '/js/linguistics-engine-v32.js',
    '/js/vibelyf-learning-loop.js',
    '/js/vibelyf-code-generator.js',
    '/js/vibelyf-app-renderer.js',
    '/js/vibelyf-orchestrator.js',
    '/js/vibelyf-enhanced-communication.js',
    '/js/vibelyf-groq-brain.js',
    '/js/vibelyf-voice-input.js',
    '/js/vibelyf-image-forge-engine.js',
    '/js/vibelyf-image-editor.js',
    '/js/claude-api-generator.js',
    '/js/vibelyf-integration.js',
    '/js/vibelyf-integration-exports.js',
    '/js/vibelyf-diagnostic.js',
    '/css/api-generator.css',
    '/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
    console.log('📱 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📱 Caching core assets');
                return cache.addAll(CORE_ASSETS).catch(err => {
                    console.warn('📱 Some assets failed to cache:', err);
                    // Don't fail install if some assets aren't available
                    return Promise.resolve();
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    console.log('📱 Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log(`📱 Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch — network-first with cache fallback
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API calls (Gemini, Groq, Claude, PostHog, etc.)
    if (url.hostname.includes('googleapis.com') ||
        url.hostname.includes('groq.com') ||
        url.hostname.includes('anthropic.com') ||
        url.hostname.includes('posthog.com') ||
        url.hostname.includes('i.posthog.com')) {
        return;
    }

    // Network-first strategy for HTML files (always fresh)
    if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache the fresh response
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first strategy for static assets (JS, CSS, fonts, images)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached, but also update cache in background
                    fetch(event.request).then((networkResponse) => {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                    }).catch(() => {});
                    return cachedResponse;
                }

                // Not in cache — fetch from network
                return fetch(event.request).then((networkResponse) => {
                    // Cache it for next time
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return networkResponse;
                });
            })
            .catch(() => {
                // Offline and not cached — return fallback for navigation
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Background sync for vocabulary submissions (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-vocabulary') {
        console.log('📱 Background sync: vocabulary');
        // Future: sync pending terms to server
    }
});
