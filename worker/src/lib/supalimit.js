/**
 * Supabase-backed rate limiting (Phase 1.H Part 2 — the PDR design).
 *
 * Uses the existing `rate_limits` table (schema v1.1):
 *   UNIQUE(bucket_key, route, window_start, window_granularity)
 *
 * Strategy: read the current minute-window count, reject if over limit, else
 * upsert count+1 via PostgREST `resolution=merge-duplicates`. The read+write
 * pair is not atomic — heavy concurrency can undercount slightly — but it is
 * GLOBAL and durable, which the per-isolate and (non-enforcing) native-binding
 * approaches are not. An atomic RPC can replace this later with one SQL function.
 *
 * Fail-open by design: if Supabase is unreachable or secrets are missing, we
 * return null and the caller falls back to the in-memory limiter. An outage of
 * the rate-limit store must not take down the product.
 */

const GRANULARITY = 'minute';

function minuteWindowStart() {
    const d = new Date();
    d.setUTCSeconds(0, 0);
    return d.toISOString();
}

function headers(env) {
    return {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Returns { allowed, retryAfter? } or null if Supabase is not configured /
 * unreachable (caller should fall back to the in-memory limiter).
 */
export async function supaRateLimit(env, { bucketKey, route, limit }) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return null;

    const windowStart = minuteWindowStart();
    const base = `${env.SUPABASE_URL}/rest/v1/rate_limits`;
    const filter =
        `bucket_key=eq.${encodeURIComponent(bucketKey)}` +
        `&route=eq.${encodeURIComponent(route)}` +
        `&window_start=eq.${encodeURIComponent(windowStart)}` +
        `&window_granularity=eq.${GRANULARITY}`;

    try {
        const readResp = await fetch(`${base}?${filter}&select=count`, { headers: headers(env) });
        if (!readResp.ok) return null;
        const rows = await readResp.json();
        const current = Array.isArray(rows) && rows[0] ? (rows[0].count || 0) : 0;

        if (current >= limit) {
            const now = new Date();
            const retryAfter = Math.max(1, 60 - now.getUTCSeconds());
            return { allowed: false, retryAfter };
        }

        const writeResp = await fetch(`${base}?on_conflict=bucket_key,route,window_start,window_granularity`, {
            method: 'POST',
            headers: { ...headers(env), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
                bucket_key: bucketKey,
                route,
                window_start: windowStart,
                window_granularity: GRANULARITY,
                count: current + 1,
                last_hit: new Date().toISOString()
            })
        });
        if (!writeResp.ok) return null; // fail open → caller falls back

        return { allowed: true };
    } catch (e) {
        return null; // network failure → fail open to in-memory fallback
    }
}
