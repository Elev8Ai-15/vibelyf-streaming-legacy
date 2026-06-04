/**
 * POST /api/llm/codegen
 *
 * Proxies code-generation requests to Claude Sonnet 4.6.
 *
 * NOTE (2026-06-04): switched from Gemini 3.5 Flash to Anthropic Claude after the
 * Gemini GCP project was denied access (403 PERMISSION_DENIED). Claude is a strong
 * code generator, so this doubles as a quality upgrade. The request/response
 * contract is unchanged, so the SPA modules need no edits — they still POST the
 * Gemini-native { contents, generationConfig } shape and read data.text back.
 *
 * Request body (either shape accepted):
 *   { prompt: string, systemInstruction?: string, temperature?: number, maxOutputTokens?: number }
 *   { contents: [{ parts: [{ text }] }], systemInstruction?: {...}, generationConfig?: {...} }
 *
 * Success response:
 *   { success: true, data: { text, raw }, meta: { provider, model, elapsed_ms, cache } }
 */

import { messages as claudeMessages, ANTHROPIC_MODELS } from '../providers/anthropic.js';
import { jsonOk, errors, readJson } from '../lib/response.js';

const DEFAULT_MAX_TOKENS = 8192; // HTML app generation can be long
const MAX_TOKENS_CEILING = 16384;

// Pull a flat prompt string out of either the simple or Gemini-native shape.
function extractPrompt(body) {
    if (typeof body.prompt === 'string') return body.prompt;
    if (Array.isArray(body.contents)) {
        return body.contents
            .map((c) => (Array.isArray(c.parts) ? c.parts.map((p) => p.text || '').join('\n') : ''))
            .filter(Boolean)
            .join('\n\n');
    }
    return '';
}

// systemInstruction may be a string or a Gemini { parts: [{ text }] } object.
function extractSystem(body) {
    const si = body.systemInstruction;
    if (typeof si === 'string') return si.trim() || undefined;
    if (si && Array.isArray(si.parts)) {
        const text = si.parts.map((p) => p.text || '').join('\n').trim();
        return text || undefined;
    }
    return undefined;
}

export async function codegen(request, env, ctx) {
    if (request.method !== 'POST') return errors.methodNotAllowed();

    const body = await readJson(request);
    if (!body) return errors.badRequest('Request body must be valid JSON');

    const prompt = extractPrompt(body).trim();
    if (!prompt) {
        return errors.badRequest('Provide either { prompt: string } or { contents: [{ parts: [{ text }] }] }');
    }

    const system = extractSystem(body);

    // Map Gemini-style generation params onto Anthropic params.
    const gen = body.generationConfig || {};
    const temperature =
        typeof body.temperature === 'number' ? body.temperature
        : typeof gen.temperature === 'number' ? gen.temperature
        : 0.7;
    const requested =
        typeof body.maxOutputTokens === 'number' ? body.maxOutputTokens
        : typeof gen.maxOutputTokens === 'number' ? gen.maxOutputTokens
        : DEFAULT_MAX_TOKENS;
    const max_tokens = Math.min(Math.max(requested, 256), MAX_TOKENS_CEILING);

    const result = await claudeMessages({
        apiKey: env.ANTHROPIC_API_KEY,
        system,
        messages: [{ role: 'user', content: prompt }],
        model: ANTHROPIC_MODELS.primary,
        max_tokens,
        // Anthropic temperature range is 0..1; clamp in case a Gemini caller sent >1.
        temperature: Math.min(Math.max(temperature, 0), 1)
    });

    if (!result.ok) {
        return errors.upstream(
            'anthropic',
            result.error?.detail?.error?.message || result.error?.message || 'Claude call failed',
            { last: result }
        );
    }

    return jsonOk(
        { text: result.text, raw: result.raw },
        {
            provider: 'anthropic',
            model: result.model,
            elapsed_ms: result.elapsed_ms,
            cache: result.cache
        }
    );
}
