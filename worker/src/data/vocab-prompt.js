/**
 * Stable text serialization of the cultural vocabulary for prompt caching.
 *
 * Anthropic's prompt cache keys on byte-exact prefix match. Any change to
 * the serialized output invalidates the cache, so this serializer is
 * deterministic — no Date.now(), no random ordering, no environment-dependent
 * formatting.
 *
 * Output is computed once at module load and reused across all requests
 * inside the same Worker isolate (which is the right granularity — each
 * isolate's Claude calls reuse the same cached prefix).
 */

import { VOCAB } from './vocab.js';

function formatTerm(t) {
    const parts = [`- "${t.term}"`];
    if (t.definition) parts.push(`= ${t.definition}`);
    if (t.origin) parts.push(`(${t.origin})`);
    if (t.examples && t.examples.length) {
        parts.push(`ex: ${t.examples.slice(0, 2).join(' | ')}`);
    }
    return parts.join(' ');
}

function formatCategory(name, body) {
    const lines = [`## ${name.toUpperCase()}`];
    if (body && Array.isArray(body)) {
        body.forEach((t) => lines.push(formatTerm(t)));
    } else if (body && Array.isArray(body.vocabulary)) {
        body.vocabulary.forEach((t) => lines.push(formatTerm(t)));
        if (Array.isArray(body.grammar)) {
            lines.push('### grammar');
            body.grammar.forEach((t) => lines.push(formatTerm(t)));
        }
    }
    return lines.join('\n');
}

function serialize(vocab) {
    const meta = vocab.metadata || {};
    const header = [
        '# VibeLyf Cultural Vocabulary Reference',
        `version: ${meta.version || '1.0.0'} | terms: ${meta.totalTerms || '?'} | categories: ${meta.categories || '?'}`,
        '',
        'Use these terms to interpret user requests written in dialect, slang,',
        'or cultural shorthand. When a user uses one of these terms, treat it',
        'as the literal definition for the purpose of building what they asked for.',
        ''
    ];
    const categoryNames = Object.keys(vocab)
        .filter((k) => k !== 'metadata' && typeof vocab[k] === 'object' && typeof vocab[k] !== 'function')
        // Skip helper-method properties that aren't actual term lists
        .filter((k) => Array.isArray(vocab[k]) || vocab[k].vocabulary || vocab[k].grammar)
        .sort();
    const body = categoryNames.map((n) => formatCategory(n, vocab[n]));
    return [...header, ...body].join('\n');
}

// Computed once per isolate, reused across requests.
export const VOCAB_PROMPT_TEXT = serialize(VOCAB);
export const VOCAB_PROMPT_BYTES = new TextEncoder().encode(VOCAB_PROMPT_TEXT).length;
