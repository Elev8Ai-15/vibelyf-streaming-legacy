/**
 * Anthropic Claude provider — May 2026 stack, with prompt caching.
 *
 * Primary: claude-sonnet-4-6 (1M context beta available)
 *
 * Prompt caching is the headline reason this provider runs server-side:
 *   - System prompt + 535-term cultural vocabulary go BEFORE the cache breakpoint
 *   - User input goes AFTER (changes per request)
 *   - First call: cache write at 1.25× input price (5 min TTL) or 2× (1h TTL)
 *   - Subsequent calls within TTL: cache read at 0.10× input price (90% discount)
 *
 * Cache breakpoint placement is via `cache_control: { type: 'ephemeral' }` on
 * the last content block of `system`. Anthropic walks the conversation from
 * the start and caches everything up to and including the breakpoint.
 *
 * Docs: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
 */

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

export const ANTHROPIC_MODELS = {
    primary: 'claude-sonnet-4-6'
};

/**
 * Build the system blocks array with cache breakpoint on the last block.
 * Anthropic's `system` accepts either a string or an array of content blocks.
 * Using the array form is required for cache_control markers.
 */
export function buildCachedSystem(blocks) {
    if (!Array.isArray(blocks) || blocks.length === 0) return undefined;
    // Mark the LAST block as the cache breakpoint. Anything before it
    // (including itself) is cacheable; user messages after are not cached.
    return blocks.map((text, i) => {
        const block = { type: 'text', text };
        if (i === blocks.length - 1) {
            block.cache_control = { type: 'ephemeral' };
        }
        return block;
    });
}

export async function messages({
    apiKey,
    system,            // string OR array of strings (will be converted to cached blocks)
    messages,          // [{ role: 'user'|'assistant', content: string|array }]
    model = ANTHROPIC_MODELS.primary,
    max_tokens = 4096,
    temperature = 0.7,
    signal
}) {
    if (!apiKey) {
        return { ok: false, error: { kind: 'config', message: 'ANTHROPIC_API_KEY not set' } };
    }

    let systemField;
    if (typeof system === 'string') {
        systemField = system;
    } else if (Array.isArray(system) && system.length) {
        systemField = buildCachedSystem(system);
    }

    const payload = {
        model,
        max_tokens,
        temperature,
        ...(systemField ? { system: systemField } : {}),
        messages
    };

    const started = Date.now();
    let response;
    try {
        response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(payload),
            signal
        });
    } catch (err) {
        return {
            ok: false,
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
            status: response.status,
            elapsed_ms,
            error: { kind: 'upstream', status: response.status, detail }
        };
    }

    const data = await response.json();
    // Aggregate text from all content blocks (Claude returns array of blocks)
    const text = Array.isArray(data?.content)
        ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
        : '';

    // Cache stats surface via meta so the browser can see hit rate
    const usage = data?.usage || {};
    return {
        ok: true,
        model,
        elapsed_ms,
        text,
        raw: data,
        cache: {
            cache_creation_input_tokens: usage.cache_creation_input_tokens || 0,
            cache_read_input_tokens: usage.cache_read_input_tokens || 0,
            input_tokens: usage.input_tokens || 0,
            output_tokens: usage.output_tokens || 0
        }
    };
}
