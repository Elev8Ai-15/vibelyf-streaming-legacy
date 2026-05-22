/**
 * CORS handling for the VibeLyf API Worker.
 *
 * Reads ALLOWED_ORIGINS from env (comma-separated). Echoes the request's
 * Origin back when it matches the allow-list; otherwise omits CORS headers
 * so the browser blocks the response.
 *
 * Wildcards are intentionally NOT supported — we want explicit origins so
 * a misconfigured deploy doesn't accept calls from arbitrary sites.
 */

const DEFAULT_ALLOWED_HEADERS = 'Authorization, Content-Type, X-VibeLyf-User';
const DEFAULT_ALLOWED_METHODS = 'GET, POST, OPTIONS';
const PREFLIGHT_MAX_AGE = '86400'; // 24h

export function parseAllowedOrigins(env) {
    const raw = (env && env.ALLOWED_ORIGINS) || '';
    return raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
}

export function resolveOrigin(request, env) {
    const requestOrigin = request.headers.get('Origin');
    if (!requestOrigin) return null;
    const allowed = parseAllowedOrigins(env);
    return allowed.includes(requestOrigin) ? requestOrigin : null;
}

export function corsHeaders(request, env) {
    const origin = resolveOrigin(request, env);
    const headers = {
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
        'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS,
        'Access-Control-Max-Age': PREFLIGHT_MAX_AGE
    };
    if (origin) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    }
    return headers;
}

export function handlePreflight(request, env) {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
    });
}

export function withCors(response, request, env) {
    const headers = new Headers(response.headers);
    const cors = corsHeaders(request, env);
    for (const [k, v] of Object.entries(cors)) {
        headers.set(k, v);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
