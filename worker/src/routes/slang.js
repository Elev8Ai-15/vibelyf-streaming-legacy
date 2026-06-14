/**
 * POST /api/llm/slang
 *
 * Fast-brain slang detection / clarification / intent classification.
 *
 * Provider chain (Groq doesn't expose Maverick; Scout is primary):
 *   1. Groq Llama 4 Scout         (primary — ~300 tok/s, sub-second)
 *   2. Groq Llama 3.3 70B Versatile (in-Groq fallback on rate-limit / error)
 *   3. Cerebras Llama 4 Scout     (cross-provider failover — free tier 1M tok/day)
 *
 * Request body:
 *   { messages?: [{ role, content }],   // OpenAI-style chat history
 *     systemPrompt?: string,             // shorthand when no messages array
 *     userMessage?: string,              // shorthand when no messages array
 *     temperature?: number,
 *     max_tokens?: number,
 *     jsonMode?: boolean }               // request JSON-formatted response
 *
 * Response meta includes which provider + model actually served the request,
 * so the browser can surface "served by Groq" vs "served by Cerebras (failover)".
 */

import { chat as groqChat, GROQ_MODELS } from '../providers/groq.js';
import { chat as cerebrasChat, CEREBRAS_MODELS } from '../providers/cerebras.js';
import { jsonOk, errors, readJson } from '../lib/response.js';

// HTTP status codes that justify failing over to the next provider/model.
// 4xx other than 429 means the request is malformed — won't help to retry.
function shouldFailover(status) {
    if (!status) return true; // network error, no response
    return status === 408 || status === 425 || status === 429 || status >= 500;
}

function normalizeMessages(body) {
    if (Array.isArray(body.messages) && body.messages.length) return body.messages;
    const out = [];
    if (typeof body.systemPrompt === 'string' && body.systemPrompt.trim()) {
        out.push({ role: 'system', content: body.systemPrompt });
    }
    if (typeof body.userMessage === 'string' && body.userMessage.trim()) {
        out.push({ role: 'user', content: body.userMessage });
    }
    return out;
}

export async function slang(request, env, ctx) {
    if (request.method !== 'POST') return errors.methodNotAllowed();

    const body = await readJson(request);
    if (!body) return errors.badRequest('Request body must be valid JSON');

    const messages = normalizeMessages(body);
    if (!messages.length) {
        return errors.badRequest('Provide either { messages: [...] } or { systemPrompt, userMessage }');
    }

    const baseArgs = {
        messages,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.1,
        max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 500,
        response_format: body.jsonMode ? { type: 'json_object' } : undefined
    };

    const attempts = [];

    // 1) Groq primary
    let result = await groqChat({ ...baseArgs, apiKey: env.GROQ_API_KEY, model: GROQ_MODELS.primary });
    attempts.push({ provider: 'groq', model: GROQ_MODELS.primary, ok: result.ok, status: result.status });
    if (result.ok) return jsonOk({ text: result.text, raw: result.raw }, buildMeta(result, attempts));

    // 2) Groq fallback model — only on transient errors
    if (shouldFailover(result.status)) {
        result = await groqChat({ ...baseArgs, apiKey: env.GROQ_API_KEY, model: GROQ_MODELS.fallback });
        attempts.push({ provider: 'groq', model: GROQ_MODELS.fallback, ok: result.ok, status: result.status });
        if (result.ok) return jsonOk({ text: result.text, raw: result.raw }, buildMeta(result, attempts));
    }

    // 3) Cerebras cross-provider failover
    if (shouldFailover(result.status) && env.CEREBRAS_API_KEY) {
        result = await cerebrasChat({ ...baseArgs, apiKey: env.CEREBRAS_API_KEY, model: CEREBRAS_MODELS.primary });
        attempts.push({ provider: 'cerebras', model: CEREBRAS_MODELS.primary, ok: result.ok, status: result.status });
        if (result.ok) return jsonOk({ text: result.text, raw: result.raw }, buildMeta(result, attempts));
    }

    return errors.upstream(
        result.provider || 'groq',
        result.error?.detail?.error?.message || result.error?.message || 'All slang providers failed',
        { attempts, last: result }
    );
}

function buildMeta(result, attempts) {
    return {
        provider: result.provider,
        model: result.model,
        elapsed_ms: result.elapsed_ms,
        attempts
    };
}
