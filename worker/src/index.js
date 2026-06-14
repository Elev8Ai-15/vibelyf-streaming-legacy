/**
 * VibeLyf API Worker — entry point.
 *
 * Cloudflare Workers ES Modules format. The default export's `fetch` method
 * is invoked for every incoming HTTP request. The `env` arg contains both
 * `vars` (plain config) and `secrets` (encrypted, set via `wrangler secret put`).
 *
 * Routing is a simple URL-pathname switch — keep it that way. If we end up
 * with >15 routes consider Hono, but for the current set vanilla is clearer.
 *
 * Routes (live):
 *   GET   /api/health
 *   POST  /api/llm/codegen        Workers AI (free) → Claude fallback; Claude for images/high-quality
 *   POST  /api/llm/api-gen        Claude Sonnet 4.6 + cached vocab system prompt
 *   POST  /api/llm/slang          Groq Llama 4 Scout → Groq 3.3-70B → Cerebras failover
 *   POST  /api/embed              oEmbed proxy (9+ platforms)
 *
 * Phase 1.H part 2 routes (TODO):
 *   POST  /api/voice/tts          ElevenLabs Conversational v2
 *   POST  /api/image/gen          fal.ai router (Flux / Ideogram / Recraft / Nano Banana Pro)
 *   Per-user rate limiting + Supabase JWT verification
 */

import { handlePreflight, withCors } from './lib/cors.js';
import { errors } from './lib/response.js';
import { checkRateLimit, cacheRateLimit, rateLimitedResponse, intEnv } from './lib/ratelimit.js';
import { supaRateLimit } from './lib/supalimit.js';
import { health } from './routes/health.js';
import { codegen } from './routes/codegen.js';
import { apiGen } from './routes/api-gen.js';
import { slang } from './routes/slang.js';
import { embed } from './routes/embed.js';

// Per-IP limits by route class. "heavy" routes call Claude (real money per
// request) — a human user can't legitimately exceed ~10 generations/min.
function limitFor(path, env) {
    const fast = intEnv(env.RATE_LIMIT_PER_MINUTE, 60);
    const heavy = intEnv(env.RATE_LIMIT_HEAVY_PER_MINUTE, 10);
    switch (path) {
        case '/api/llm/codegen':
        case '/api/llm/api-gen':
            return { routeClass: 'llm-heavy', limit: heavy };
        case '/api/llm/slang':
            return { routeClass: 'llm-fast', limit: fast };
        case '/api/embed':
            return { routeClass: 'embed', limit: fast };
        default:
            return null;
    }
}

async function route(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // CORS preflight — answer before any route logic
    if (request.method === 'OPTIONS') {
        return handlePreflight(request, env);
    }

    // Rate limiting — before any provider call so abuse never reaches a paid API.
    // Layers (cheapest first):
    //   1. Native CF ratelimit binding — kept wired, but verified NON-enforcing on
    //      this plan (always success:true); treated as best-effort only.
    //   2. Heavy (Claude) routes: Supabase rate_limits table — GLOBAL + durable.
    //   3. Fallback: in-memory per-isolate sliding window (also used when
    //      Supabase is unreachable — fail open on the store, never on the user).
    const lim = limitFor(path, env);
    if (lim) {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

        const binding = lim.routeClass === 'llm-heavy' ? env.HEAVY_LIMITER : env.FAST_LIMITER;
        if (binding && typeof binding.limit === 'function') {
            try {
                const verdict = await binding.limit({ key: `${lim.routeClass}:${ip}` });
                if (verdict && verdict.success === false) return rateLimitedResponse(60);
            } catch (e) {
                // Fail open on a binding error — consistent with the other layers,
                // so a transient platform hiccup never 500s a legitimate request.
                console.warn('native ratelimit binding threw, failing open:', e.message);
            }
        }

        // Heavy routes get the durable Supabase counter when available
        // (project currently PAUSED — supaRateLimit fails open until restored).
        let verdict = null;
        if (lim.routeClass === 'llm-heavy') {
            verdict = await supaRateLimit(env, {
                bucketKey: `ip:${ip}`,
                route: path,
                limit: lim.limit
            });
        }
        // Shared per-colo Cache API counter — the workhorse layer today.
        if (!verdict) verdict = await cacheRateLimit(lim.routeClass, ip, lim.limit);
        // Last resort: per-isolate in-memory window.
        if (!verdict) verdict = checkRateLimit(request, lim.routeClass, lim.limit);
        if (!verdict.allowed) return rateLimitedResponse(verdict.retryAfter || 60);
    }

    switch (path) {
        case '/':
        case '/api':
            return new Response(
                JSON.stringify({
                    name: 'vibelyf-api',
                    version: env.WORKER_VERSION || 'dev',
                    docs: 'See worker/README.md',
                    routes: [
                        'GET  /api/health',
                        'POST /api/llm/codegen',
                        'POST /api/llm/api-gen',
                        'POST /api/llm/slang',
                        'POST /api/embed'
                    ]
                }, null, 2),
                { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );

        case '/api/health':
            return health(request, env, ctx);

        case '/api/llm/codegen':
            return codegen(request, env, ctx);

        case '/api/llm/api-gen':
            return apiGen(request, env, ctx);

        case '/api/llm/slang':
            return slang(request, env, ctx);

        case '/api/embed':
            return embed(request, env, ctx);

        default:
            return errors.notFound(`No route for ${request.method} ${path}`);
    }
}

export default {
    /**
     * Daily cron (see wrangler.toml [triggers]): Supabase keep-alive + hygiene.
     * A real authenticated query counts as project activity, preventing the
     * free-tier inactivity pause that silently killed auth in June 2026.
     * Also prunes rate_limits rows older than 2 days so the table stays tiny.
     */
    async scheduled(event, env, ctx) {
        if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
        const headers = {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        };
        const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
        ctx.waitUntil((async () => {
            try {
                const ping = await fetch(
                    `${env.SUPABASE_URL}/rest/v1/rate_limits?select=id&limit=1`,
                    { headers }
                );
                const prune = await fetch(
                    `${env.SUPABASE_URL}/rest/v1/rate_limits?last_hit=lt.${encodeURIComponent(cutoff)}`,
                    { method: 'DELETE', headers }
                );
                console.log('keepalive', ping.status, 'prune', prune.status);
            } catch (e) {
                console.error('keepalive failed:', e.message);
            }
        })());
    },

    async fetch(request, env, ctx) {
        try {
            const response = await route(request, env, ctx);
            return withCors(response, request, env);
        } catch (err) {
            // Last-resort catch — any uncaught throw lands here so the client
            // sees a structured error instead of a generic 500 HTML page.
            console.error('Worker uncaught error:', err);
            const errResponse = errors.serverError(
                err && err.message ? err.message : 'Uncaught worker error',
                { stack: err && err.stack ? err.stack.split('\n').slice(0, 5) : undefined }
            );
            return withCors(errResponse, request, env);
        }
    }
};
