/**
 * Per-IP rate limiting for the VibeLyf API Worker (Phase 1.H Part 2).
 *
 * Why: CORS only protects against *browsers* on other origins. Anyone with curl
 * can hit the LLM routes directly and burn real provider credit. This is the
 * first line of defense; durable per-USER limiting (Supabase `rate_limits` +
 * JWT identity) layers on top once auth ships.
 *
 * Design: sliding-window approximation (current window count + previous window
 * count weighted by overlap), keyed by `route-class:client-ip`, stored in
 * module-scope memory. State is PER ISOLATE — Cloudflare may run several
 * isolates across colos, so a determined distributed attacker can exceed the
 * nominal limit by a small multiple. That still reduces worst-case abuse by
 * orders of magnitude, which is the goal here.
 */

const WINDOW_MS = 60_000;
const buckets = new Map(); // key -> { windowId, count, prev }
let lastPrune = 0;

export function checkRateLimit(request, routeClass, limitPerMinute) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = `${routeClass}:${ip}`;
    const now = Date.now();
    const windowId = Math.floor(now / WINDOW_MS);

    // Bound memory: drop buckets idle for 2+ windows, at most once per window.
    if (now - lastPrune > WINDOW_MS) {
        for (const [k, b] of buckets) {
            if (windowId - b.windowId >= 2) buckets.delete(k);
        }
        lastPrune = now;
    }

    let b = buckets.get(key);
    if (!b || b.windowId !== windowId) {
        b = {
            windowId,
            count: 0,
            prev: b && b.windowId === windowId - 1 ? b.count : 0
        };
        buckets.set(key, b);
    }

    const elapsedFrac = (now % WINDOW_MS) / WINDOW_MS;
    const effective = b.count + b.prev * (1 - elapsedFrac);

    if (effective >= limitPerMinute) {
        const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now % WINDOW_MS)) / 1000));
        return { allowed: false, retryAfter };
    }

    b.count += 1;
    return { allowed: true };
}

/** Structured 429 with a Retry-After header (same envelope as lib/response.js). */
export function rateLimitedResponse(retryAfter) {
    return new Response(
        JSON.stringify({
            success: false,
            error: { code: 'RATE_LIMITED', message: `Rate limit exceeded. Retry in ${retryAfter}s.` },
            meta: {}
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Retry-After': String(retryAfter)
            }
        }
    );
}

/** Parse a positive-int env var with a fallback. */
export function intEnv(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Cache-API-backed counter — shared across ALL isolates in a colo (unlike the
 * module-scope Map above, which is per-isolate and which sequential requests
 * from one client routinely miss). Read-modify-write isn't atomic, so heavy
 * parallelism can undercount, but sequential hammering — the common abuse
 * pattern — is reliably caught. Returns null on any cache error (caller falls
 * back to the in-memory limiter).
 */
export async function cacheRateLimit(routeClass, ip, limit) {
    try {
        const windowId = Math.floor(Date.now() / WINDOW_MS);
        // Synthetic internal URL as the cache key; never fetched for real.
        const key = `https://rate-limit.vibelyf.internal/${routeClass}/${encodeURIComponent(ip)}/${windowId}`;
        const cache = caches.default;

        let count = 0;
        const hit = await cache.match(key);
        if (hit) count = parseInt(await hit.text(), 10) || 0;

        if (count >= limit) {
            const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (Date.now() % WINDOW_MS)) / 1000));
            return { allowed: false, retryAfter };
        }

        await cache.put(key, new Response(String(count + 1), {
            headers: { 'Cache-Control': 'max-age=120' }
        }));
        return { allowed: true };
    } catch (e) {
        return null;
    }
}
