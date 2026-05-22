/**
 * POST /api/llm/codegen
 *
 * Proxies code-generation requests to Gemini 3.5 Flash (with fallback chain).
 *
 * Request body:
 *   { prompt: string, systemInstruction?: string, temperature?: number, maxOutputTokens?: number }
 *
 * Or the Gemini-native shape if the browser wants more control:
 *   { contents: [...], systemInstruction?: {...}, generationConfig?: {...} }
 *
 * Success response:
 *   { success: true, data: { text, raw }, meta: { provider, model, elapsed_ms } }
 */

import { generate, GEMINI_MODELS } from '../providers/gemini.js';
import { jsonOk, errors, readJson } from '../lib/response.js';

export async function codegen(request, env, ctx) {
    if (request.method !== 'POST') return errors.methodNotAllowed();

    const body = await readJson(request);
    if (!body) return errors.badRequest('Request body must be valid JSON');

    // Normalize the two shapes: simple {prompt, systemInstruction} OR full Gemini shape.
    let contents, systemInstruction, generationConfig;
    if (Array.isArray(body.contents)) {
        contents = body.contents;
        systemInstruction = body.systemInstruction;
        generationConfig = body.generationConfig;
    } else if (typeof body.prompt === 'string') {
        contents = [{ role: 'user', parts: [{ text: body.prompt }] }];
        if (typeof body.systemInstruction === 'string') {
            systemInstruction = { parts: [{ text: body.systemInstruction }] };
        }
        generationConfig = {};
        if (typeof body.temperature === 'number') generationConfig.temperature = body.temperature;
        if (typeof body.maxOutputTokens === 'number') generationConfig.maxOutputTokens = body.maxOutputTokens;
    } else {
        return errors.badRequest('Provide either { prompt: string } or { contents: [...] }');
    }

    const result = await generate({
        apiKey: env.GEMINI_API_KEY,
        contents,
        systemInstruction,
        generationConfig
    });

    if (!result.ok) {
        return errors.upstream('gemini', result.error?.message || 'Gemini call failed', {
            attempted_chain: [GEMINI_MODELS.primary, ...GEMINI_MODELS.fallbacks],
            last: result
        });
    }

    return jsonOk(
        { text: result.text, raw: result.raw },
        { provider: 'gemini', model: result.model, elapsed_ms: result.elapsed_ms }
    );
}
