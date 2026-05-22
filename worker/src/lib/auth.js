/**
 * Supabase JWT verification — STUB for Phase 1.H part 1.
 *
 * Full implementation lands in Phase 1.H part 2 after the Supabase project
 * is created (Phase 1.D). For now we extract the bearer token if present
 * but don't verify it, and return a "guest" identity when missing.
 *
 * Once Supabase is up:
 *   1. Fetch the project's JWT secret from env.SUPABASE_JWT_SECRET
 *   2. Verify the HS256 signature using Web Crypto subtle.verify()
 *   3. Check exp / iss / aud claims
 *   4. Return the user's UUID from the `sub` claim
 *
 * For now the only consumer (rate limiter) treats unknown users as
 * IP-based buckets so unauthenticated traffic still gets bounded.
 */

export function extractBearer(request) {
    const auth = request.headers.get('Authorization') || '';
    if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
    return null;
}

export async function identifyUser(request /*, env */) {
    const token = extractBearer(request);
    if (!token) {
        return { kind: 'guest', id: null, verified: false };
    }
    // TODO Phase 1.H part 2 — verify against Supabase JWT secret.
    // For now we accept-without-verify so the browser can pass through
    // a Supabase session token once auth lands; the rate limiter will
    // still fall back to IP buckets until verification is real.
    return { kind: 'token-present', id: null, verified: false, raw: token };
}

export function clientIp(request) {
    return (
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        'unknown'
    );
}
