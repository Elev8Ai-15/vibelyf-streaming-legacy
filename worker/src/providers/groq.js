/**
 * Groq provider — OpenAI-compatible chat completions endpoint.
 *
 * Primary: meta-llama/llama-4-scout-17b-16e-instruct (Llama 4 Scout, 17B active / 16E MoE, day-zero on GroqCloud, May 2026)
 * In-Groq fallback: llama-3.3-70b-versatile (legacy fallback — Groq doesn't expose Maverick yet)
 *
 * Cross-provider failover to Cerebras lives in routes/slang.js — when a Groq
 * call returns 429 or 5xx the route retries on Cerebras (also OpenAI-compatible).
 */

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export const GROQ_MODELS = {
    primary: 'meta-llama/llama-4-scout-17b-16e-instruct',
    fallback: 'llama-3.3-70b-versatile'
};

export async function chat({
    apiKey,
    model = GROQ_MODELS.primary,
    messages,
    temperature = 0.1,
    max_tokens = 500,
    response_format,        // { type: 'json_object' } when JSON mode desired
    signal
}) {
    if (!apiKey) {
        return { ok: false, error: { kind: 'config', message: 'GROQ_API_KEY not set' } };
    }

    const payload = {
        model,
        messages,
        temperature,
        max_tokens,
        ...(response_format ? { response_format } : {})
    };

    const started = Date.now();
    let response;
    try {
        response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
            signal
        });
    } catch (err) {
        return {
            ok: false,
            provider: 'groq',
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
            provider: 'groq',
            model,
            status: response.status,
            elapsed_ms,
            error: { kind: 'upstream', status: response.status, detail }
        };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return {
        ok: true,
        provider: 'groq',
        model,
        elapsed_ms,
        text,
        raw: data
    };
}
