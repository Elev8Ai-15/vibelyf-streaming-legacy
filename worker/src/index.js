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
 * Phase 1.H part 1 routes (live):
 *   GET   /api/health
 *   POST  /api/llm/codegen        Gemini 3.5 Flash (with fallback chain)
 *   POST  /api/llm/api-gen        Claude Sonnet 4.6 + cached vocab system prompt
 *   POST  /api/llm/slang          Groq Llama 4 Maverick → Scout → Cerebras failover
 *
 * Phase 1.H part 2 routes (TODO):
 *   POST  /api/voice/tts          ElevenLabs Conversational v2
 *   POST  /api/image/gen          fal.ai router (Flux / Ideogram / Recraft / Nano Banana Pro)
 *   Per-user rate limiting + Supabase JWT verification
 */

import { handlePreflight, withCors } from './lib/cors.js';
import { errors } from './lib/response.js';
import { health } from './routes/health.js';
import { codegen } from './routes/codegen.js';
import { apiGen } from './routes/api-gen.js';
import { slang } from './routes/slang.js';

async function route(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // CORS preflight — answer before any route logic
    if (request.method === 'OPTIONS') {
        return handlePreflight(request, env);
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
                        'POST /api/llm/slang'
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

        default:
            return errors.notFound(`No route for ${request.method} ${path}`);
    }
}

export default {
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
