/**
 * Google Gemini provider — May 2026 stack.
 *
 * Primary: gemini-3.5-flash (Google I/O May 20, 2026 — outperforms 3.1 Pro,
 *          4× faster output, 1M context, native code execution)
 * Fallbacks: 3.1 Pro → 2.5 Flash → 2.5 Pro
 *
 * Gemini's REST API uses path-positional model IDs:
 *   POST /v1beta/models/<model>:generateContent?key=<key>
 *
 * Request body shape (subset we use):
 *   { contents: [{ role, parts: [{ text }] }],
 *     systemInstruction?: { parts: [{ text }] },
 *     generationConfig: { temperature, maxOutputTokens, topP } }
 */

const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const GEMINI_MODELS = {
    primary: 'gemini-3.5-flash',
    fallbacks: ['gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-2.5-pro']
};

function buildEndpoint(model, apiKey) {
    return `${ENDPOINT_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

/**
 * Single-shot Gemini call. Returns { ok, model, text, raw, error }.
 * Caller is responsible for fallback orchestration.
 */
async function callOnce(model, apiKey, payload, signal) {
    const started = Date.now();
    let response;
    try {
        response = await fetch(buildEndpoint(model, apiKey), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal
        });
    } catch (err) {
        return {
            ok: false,
            model,
            elapsed_ms: Date.now() - started,
            error: { kind: 'network', message: err.message || String(err) }
        };
    }

    const elapsed_ms = Date.now() - started;

    if (!response.ok) {
        let detail;
        try {
            detail = await response.json();
        } catch {
            detail = await response.text().catch(() => '');
        }
        return {
            ok: false,
            model,
            status: response.status,
            elapsed_ms,
            error: { kind: 'upstream', status: response.status, detail }
        };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { ok: true, model, elapsed_ms, text, raw: data };
}

/**
 * Try the primary model, then fall back through GEMINI_MODELS.fallbacks
 * on 5xx errors or network failures. 4xx errors short-circuit (bad request
 * won't get better with a different model).
 */
export async function generate({ apiKey, contents, systemInstruction, generationConfig, signal }) {
    if (!apiKey) {
        return { ok: false, error: { kind: 'config', message: 'GEMINI_API_KEY not set' } };
    }
    const payload = {
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            ...generationConfig
        }
    };

    const chain = [GEMINI_MODELS.primary, ...GEMINI_MODELS.fallbacks];
    let lastError;
    for (const model of chain) {
        const result = await callOnce(model, apiKey, payload, signal);
        if (result.ok) return result;
        lastError = result;
        const status = result.error?.status;
        // Only fall back on transient/server errors. 4xx means our payload
        // is wrong — won't be fixed by another model.
        if (status && status >= 400 && status < 500) break;
    }
    return lastError || { ok: false, error: { kind: 'unknown', message: 'All Gemini models failed' } };
}
