/**
 * Cloudflare Workers AI provider — FREE-tier inference on CF's edge.
 *
 * This is the default code-generation engine: it runs on Cloudflare's own
 * network via the `env.AI` binding, so each call costs ~$0 within the daily
 * free Neuron allocation (and a tiny fraction of a cent beyond it) — orders of
 * magnitude cheaper than a per-token Claude bill. That economics is what makes
 * VibeLyf's AI features free for users at scale.
 *
 * Text-only. Image-input requests (Image Forge uploads) route to Claude instead,
 * which handles multimodal. Claude also serves as the quality fallback.
 *
 * Models: a small chain of capable open coder models; we fall through on error.
 */

export const WORKERSAI_MODELS = {
    primary: '@cf/qwen/qwen2.5-coder-32b-instruct',
    fallbacks: [
        '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        '@cf/meta/llama-3.1-8b-instruct-fast'
    ]
};

/**
 * Run a chat/code request through Workers AI.
 * @param {object} args
 * @param {object} args.ai        - the env.AI binding
 * @param {string} [args.system]  - optional system prompt
 * @param {string} args.prompt    - the user prompt (text)
 * @param {number} [args.max_tokens]
 * @param {number} [args.temperature]
 * @returns {Promise<{ok, text?, model?, elapsed_ms, error?}>}
 */
export async function generate({ ai, system, prompt, max_tokens = 8192, temperature = 0.7 }) {
    if (!ai || typeof ai.run !== 'function') {
        return { ok: false, error: { kind: 'config', message: 'Workers AI binding unavailable' } };
    }

    const messages = [];
    if (system && system.trim()) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });

    const chain = [WORKERSAI_MODELS.primary, ...WORKERSAI_MODELS.fallbacks];
    let lastErr;

    for (const model of chain) {
        const started = Date.now();
        try {
            const out = await ai.run(model, {
                messages,
                max_tokens,
                temperature
            });
            // Workers AI text models return { response: "..." }.
            const text = (out && (out.response ?? out.result?.response ?? out.text)) || '';
            if (text && text.trim()) {
                return { ok: true, text, model, elapsed_ms: Date.now() - started, raw: out };
            }
            lastErr = { kind: 'empty', model, message: 'Empty response' };
        } catch (e) {
            lastErr = { kind: 'upstream', model, message: e && e.message ? e.message : String(e) };
        }
    }

    return { ok: false, error: lastErr || { kind: 'unknown', message: 'All Workers AI models failed' } };
}
