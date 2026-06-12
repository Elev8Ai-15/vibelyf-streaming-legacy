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

// Bump this on every deploy that changes cached assets. The activate handler
// deletes any cache whose name != CACHE_NAME, so a new version forces fresh
// core assets and purges the stale cache. (2026-06-04: bumped for the Worker-
// proxy LLM cutover — old cache was serving pre-cutover JS to returning visitors.)
const CACHE_NAME = 'vibelyf-v2026.06.12a';
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
    '/js/vibelyf-bluesky.js',
    '/js/vibelyf-mastodon.js',
    '/js/vibelyf-lemmy.js',
    '/js/vibelyf-voice-input.js',
    '/js/vibelyf-image-forge-engine.js',
    '/js/vibelyf-image-editor.js',
    '/js/claude-api-generator.js',
    '/js/vibelyf-integration.js',
    '/js/vibelyf-integration-exports.js',
    '/js/vibelyf-diagnostic.js',
    '/css/vibelyf.css',
    '/css/red-glassmorphism.css',
    '/css/api-generator.css',
    '/privacy.html',
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

    // Only handle SAME-ORIGIN requests. Cross-origin GETs (Worker API, Bluesky /
    // Mastodon / Lemmy feed APIs, CDNs, analytics) go straight to the network —
    // caching them here served STALE feed data and grew the cache without bound.
    if (url.origin !== self.location.origin) return;

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
