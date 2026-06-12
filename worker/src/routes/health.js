/**
 * GET /api/health
 *
 * Liveness + configuration probe. Returns Worker version, allowed origins,
 * and a boolean per provider indicating whether its API key is configured.
 *
 * NEVER returns the key value itself — only whether it's present.
 */

import { jsonOk, errors } from '../lib/response.js';
import { parseAllowedOrigins } from '../lib/cors.js';
import { VOCAB_PROMPT_BYTES } from '../data/vocab-prompt.js';

export async function health(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return errors.methodNotAllowed();
    }
    return jsonOk({
        status: 'ok',
        version: env.WORKER_VERSION || '0.0.0',
        time: new Date().toISOString(),
        providers: {
            gemini: Boolean(env.GEMINI_API_KEY),
            anthropic: Boolean(env.ANTHROPIC_API_KEY),
            groq: Boolean(env.GROQ_API_KEY),
            cerebras: Boolean(env.CEREBRAS_API_KEY),
            supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY)
        },
        cors: {
            allowed_origins: parseAllowedOrigins(env)
        },
        vocab: {
            bytes: VOCAB_PROMPT_BYTES,
            cached: true
        },
        rate_limiter: {
            heavy_binding: Boolean(env.HEAVY_LIMITER && typeof env.HEAVY_LIMITER.limit === 'function'),
            fast_binding: Boolean(env.FAST_LIMITER && typeof env.FAST_LIMITER.limit === 'function'),
            fallback_heavy_per_min: env.RATE_LIMIT_HEAVY_PER_MINUTE || null,
            fallback_fast_per_min: env.RATE_LIMIT_PER_MINUTE || null
        }
    });
}
