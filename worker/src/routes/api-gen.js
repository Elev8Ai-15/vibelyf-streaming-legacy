/**
 * POST /api/llm/api-gen
 *
 * Proxies API-generation (schema design + endpoint scaffolding) requests to
 * Claude Sonnet 4.6 with the 535-term cultural vocabulary in a cached system
 * prompt. First call writes the cache (1.25× input); subsequent reads within
 * 5 min TTL pay 0.1× input — projected 70-90% cost reduction.
 *
 * Request body:
 *   { prompt: string,              // user request describing the API
 *     systemContext?: string,      // optional extra instruction inserted before vocab
 *     temperature?: number,
 *     max_tokens?: number,
 *     skip_vocab?: boolean }       // for debugging cache impact
 *
 * Cache layout (system blocks, in order):
 *   block 0: BASE_INSTRUCTIONS      (stable across all VibeLyf requests)
 *   block 1: VOCAB_PROMPT_TEXT      (stable across all VibeLyf requests)
 *   block 2: systemContext          (per-route or per-feature, still cache-friendly)
 *                                   ← cache breakpoint applied to LAST block
 *
 * Anything in `messages[]` (the user prompt) is NOT cached and changes per request.
 */

import { messages, ANTHROPIC_MODELS } from '../providers/anthropic.js';
import { VOCAB_PROMPT_TEXT, VOCAB_PROMPT_BYTES } from '../data/vocab-prompt.js';
import { jsonOk, errors, readJson } from '../lib/response.js';

const BASE_INSTRUCTIONS = `You are the VibeLyf API generator. Your job is to take a user's natural-language description of an API or data system and return a complete, production-ready JSON schema describing entities, fields, relationships, and authentication.

The user may write in dialect, slang, or cultural shorthand. Use the cultural vocabulary reference below to interpret what they actually mean before designing the schema. Never reject a request for being informally written — translate it and proceed.

Respond ONLY with valid JSON matching this shape:
{
  "apiName": "descriptive_snake_case_name",
  "description": "What this API does in one sentence",
  "entities": [
    { "name": "EntityName", "fields": [{ "name": "id", "type": "string", "required": true, "unique": true }] }
  ],
  "relationships": [{ "from": "Entity1", "to": "Entity2", "type": "one-to-many" }],
  "auth": true
}

Field types are: string | int | float | boolean | datetime | text | json.
Every entity has an id, createdAt, and updatedAt field unless the user explicitly asks otherwise.`;

export async function apiGen(request, env, ctx) {
    if (request.method !== 'POST') return errors.methodNotAllowed();

    const body = await readJson(request);
    if (!body) return errors.badRequest('Request body must be valid JSON');
    if (typeof body.prompt !== 'string' || !body.prompt.trim()) {
        return errors.badRequest('Field "prompt" is required and must be a non-empty string');
    }

    // Build the cached system blocks. Order matters for cache stability.
    const systemBlocks = [BASE_INSTRUCTIONS];
    if (!body.skip_vocab) systemBlocks.push(VOCAB_PROMPT_TEXT);
    if (typeof body.systemContext === 'string' && body.systemContext.trim()) {
        systemBlocks.push(body.systemContext);
    }

    const result = await messages({
        apiKey: env.ANTHROPIC_API_KEY,
        system: systemBlocks,
        messages: [{ role: 'user', content: body.prompt }],
        model: ANTHROPIC_MODELS.primary,
        max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 4096,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.3
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
            cache: result.cache,
            vocab_bytes: body.skip_vocab ? 0 : VOCAB_PROMPT_BYTES
        }
    );
}
