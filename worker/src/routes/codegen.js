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

// Build Claude content blocks from either the simple shape or the Gemini-native
// shape. Gemini `inline_data` image parts (used by Image Forge for uploaded
// images) are translated to Claude base64 image blocks so multimodal requests work.
function extractContent(body) {
    if (typeof body.prompt === 'string') {
        return body.prompt.trim() ? [{ type: 'text', text: body.prompt }] : [];
    }
    if (!Array.isArray(body.contents)) return [];
    const blocks = [];
    for (const c of body.contents) {
        if (!Array.isArray(c.parts)) continue;
        for (const p of c.parts) {
            if (typeof p.text === 'string' && p.text.trim()) {
                blocks.push({ type: 'text', text: p.text });
            } else if (p.inline_data && p.inline_data.data) {
                blocks.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: p.inline_data.mime_type || 'image/png',
                        data: p.inline_data.data
                    }
                });
            }
        }
    }
    return blocks;
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

    const content = extractContent(body);
    if (!content.some((b) => b.type === 'text')) {
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
        messages: [{ role: 'user', content }],
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
