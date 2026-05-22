/**
 * Structured JSON response helpers — every route uses these so the
 * browser sees a consistent envelope regardless of provider.
 *
 * Success envelope:
 *   { success: true, data: <provider-specific>, meta: { provider, model, elapsed_ms } }
 *
 * Error envelope:
 *   { success: false, error: { code, message, details? }, meta: { request_id } }
 */

export function jsonOk(data, meta = {}, init = {}) {
    return new Response(JSON.stringify({ success: true, data, meta }), {
        status: init.status || 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

export function jsonError(code, message, status = 400, details = undefined, meta = {}) {
    const body = {
        success: false,
        error: { code, message, ...(details !== undefined ? { details } : {}) },
        meta
    };
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

export const errors = {
    badRequest: (msg, details) => jsonError('BAD_REQUEST', msg, 400, details),
    unauthorized: (msg = 'Authentication required') => jsonError('UNAUTHORIZED', msg, 401),
    forbidden: (msg = 'Forbidden') => jsonError('FORBIDDEN', msg, 403),
    notFound: (msg = 'Route not found') => jsonError('NOT_FOUND', msg, 404),
    methodNotAllowed: (msg = 'Method not allowed') => jsonError('METHOD_NOT_ALLOWED', msg, 405),
    rateLimited: (msg = 'Rate limit exceeded') => jsonError('RATE_LIMITED', msg, 429),
    upstream: (provider, msg, details) =>
        jsonError('UPSTREAM_ERROR', msg, 502, { provider, ...details }),
    serverError: (msg = 'Internal worker error', details) =>
        jsonError('SERVER_ERROR', msg, 500, details)
};

export async function readJson(request) {
    try {
        return await request.json();
    } catch (e) {
        return null;
    }
}
