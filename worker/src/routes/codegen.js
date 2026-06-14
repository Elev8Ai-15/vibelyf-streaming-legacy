/**
 * POST /api/llm/codegen
 *
 * FREE-FIRST code generation. To keep VibeLyf's AI features free for users at
 * scale, text-only requests default to Cloudflare Workers AI (runs on CF's edge,
 * ~$0/call within the free allocation). Claude Sonnet 4.6 is used for:
 *   - image-input requests (Image Forge uploads — Workers AI coder models are text-only)
 *   - the quality fallback when Workers AI fails or returns empty
 *   - explicit high-quality requests ({ quality: "high" })
 *
 * (History: started on Gemini 3.5 Flash; switched to Claude on 2026-06-04 when the
 * Gemini GCP project was denied; added the free Workers AI default on 2026-06-12.)
 *
 * Request body (either shape accepted):
 *   { prompt: string, systemInstruction?: string, temperature?: number, maxOutputTokens?: number, quality?: "high" }
 *   { contents: [{ parts: [{ text }|{ inline_data }] }], systemInstruction?: {...}, generationConfig?: {...} }
 *
 * Success response:
 *   { success: true, data: { text, raw }, meta: { provider, model, elapsed_ms, cache? } }
 */

import { messages as claudeMessages, ANTHROPIC_MODELS } from '../providers/anthropic.js';
import { generate as workersAiGenerate } from '../providers/workersai.js';
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
    if (content.length === 0) {
        // Accept any non-empty content (text and/or image). Image-only requests
        // are valid — Image Forge can send an uploaded image with minimal text.
        return errors.badRequest('Provide { prompt: string } or { contents: [{ parts: [{ text | inline_data }] }] }');
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
    const clampedTemp = Math.min(Math.max(temperature, 0), 1);

    const hasImage = content.some((b) => b.type === 'image');
    const wantsHighQuality = body.quality === 'high';

    // ── FREE path: Workers AI for text-only, normal-quality requests ──
    if (!hasImage && !wantsHighQuality && env.AI) {
        const textPrompt = content.filter((b) => b.type === 'text').map((b) => b.text).join('\n\n');
        const wai = await workersAiGenerate({
            ai: env.AI,
            system,
            prompt: textPrompt,
            max_tokens,
            temperature: clampedTemp
        });
        if (wai.ok) {
            return jsonOk(
                { text: wai.text, raw: wai.raw },
                { provider: 'workers-ai', model: wai.model, elapsed_ms: wai.elapsed_ms, cost: 'free' }
            );
        }
        // Fall through to Claude on any Workers AI failure (quality fallback).
        console.warn('Workers AI codegen failed, falling back to Claude:', wai.error?.message);
    }

    // ── PAID path: Claude (image input, high-quality, or Workers AI fallback) ──
    const result = await claudeMessages({
        apiKey: env.ANTHROPIC_API_KEY,
        system,
        messages: [{ role: 'user', content }],
        model: ANTHROPIC_MODELS.primary,
        max_tokens,
        temperature: clampedTemp
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
