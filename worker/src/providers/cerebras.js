/**
 * Cerebras provider — OpenAI-compatible chat completions endpoint.
 *
 * Used as cross-provider failover when Groq rate-limits or errors. Cerebras
 * Cloud's free tier gives 1M tokens/day with no credit card and ~2,600 tok/s
 * inference speed, making it a generous backstop for the slang-detection
 * fast brain.
 *
 * Model: llama-4-scout (matches Groq's lighter Llama 4 for consistent quality)
 */

const ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';

export const CEREBRAS_MODELS = {
    primary: 'llama-4-scout'
};

export async function chat({
    apiKey,
    model = CEREBRAS_MODELS.primary,
    messages,
    temperature = 0.1,
    max_tokens = 500,
    response_format,
    signal
}) {
    if (!apiKey) {
        return { ok: false, error: { kind: 'config', message: 'CEREBRAS_API_KEY not set' } };
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
            provider: 'cerebras',
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
            provider: 'cerebras',
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
        provider: 'cerebras',
        model,
        elapsed_ms,
        text,
        raw: data
    };
}
