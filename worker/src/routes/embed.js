/**
 * POST /api/embed
 *
 * Unified oEmbed proxy + URL transformer for "open inside VibeLyf" cockpit UX.
 *
 * Genspark's original code flagged 14 platforms as canEmbed:false (new-tab only).
 * Research May 2026 (notes/embed-api-audit-2026-05-23.md if archived) revealed
 * 9 of those 14 now have working oEmbed / per-content embed paths that
 * Genspark didn't know about. This single route covers them all.
 *
 * Request body:
 *   { platform: 'x'|'twitter'|'tiktok'|'reddit'|'facebook'|'instagram'|
 *               'threads'|'snapchat'|'youtube'|'soundcloud'|'vimeo'|
 *               'spotify'|'apple-music'|'pinterest',
 *     url: string,           // the share URL of the specific post/video/etc.
 *     max_width?: number,    // optional, passed through to oEmbed
 *     max_height?: number }  // optional, passed through to oEmbed
 *
 * Success response:
 *   {
 *     success: true,
 *     data: {
 *       type: 'rich'|'video'|'link'|'iframe',
 *       html?: string,        // for oEmbed providers
 *       src?: string,         // for direct iframe URL (apple-music)
 *       title?: string,
 *       author_name?: string,
 *       height?: number,
 *       width?: number,
 *       thumbnail_url?: string,
 *       provider_name?: string
 *     },
 *     meta: { platform, source: 'oembed'|'url-transformer'|'client-widget', elapsed_ms? }
 *   }
 *
 * Security:
 *   - URL must match the expected domain pattern for the platform (SSRF defense
 *     beyond the oEmbed provider's own validation).
 *   - URLs must be HTTPS.
 *   - oEmbed providers each have their own URL validation; we trust their 4xx
 *     for non-matching URLs.
 */

import { jsonOk, errors, readJson } from '../lib/response.js';

// Map platform → oEmbed endpoint builder
const OEMBED_PROVIDERS = {
    // X / Twitter — publish.twitter.com still serves oEmbed free (API is not free; embed is)
    x:        (url) => `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`,
    twitter:  (url) => `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`,

    // TikTok — first-party oEmbed
    tiktok:   (url) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,

    // Reddit — has /oembed AND embed.reddit.com blockquote path; oEmbed is simpler
    reddit:   (url) => `https://www.reddit.com/oembed?url=${encodeURIComponent(url)}`,

    // Meta tokenless oEmbed Read (since Oct 2025) — public posts only
    facebook:  (url) => `https://graph.facebook.com/v19.0/oembed_post?url=${encodeURIComponent(url)}`,
    instagram: (url) => `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}`,
    threads:   (url) => `https://www.threads.net/oembed?url=${encodeURIComponent(url)}`,

    // Snapchat Spotlight oEmbed
    snapchat: (url) => `https://www.snapchat.com/oembed?url=${encodeURIComponent(url)}`,

    // Already-supported platforms — included here for response-shape consistency
    youtube:    (url) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    soundcloud: (url) => `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    vimeo:      (url) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
    spotify:    (url) => `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
};

// Platforms where we use a URL transformation OR client-side widget loader
// instead of calling a remote oEmbed endpoint.
const URL_TRANSFORMERS = {
    // Apple Music — public share URLs differ from embed URLs only by subdomain
    // https://music.apple.com/us/album/abc → https://embed.music.apple.com/us/album/abc
    'apple-music': (url) => {
        const embedSrc = url.replace(/(https?:\/\/)(music\.apple\.com)/, '$1embed.$2');
        return {
            type: 'iframe',
            src: embedSrc,
            height: 450,
            width: 660,
            provider_name: 'Apple Music',
            attributes: 'allow="autoplay *; encrypted-media *; fullscreen *" frameborder="0" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"'
        };
    },

    // Pinterest — uses client-side widget loader (pinit.js) rather than server oEmbed
    pinterest: (url) => {
        return {
            type: 'rich',
            html: `<a data-pin-do="embedPin" data-pin-width="medium" href="${url}"></a><script async defer src="https://assets.pinterest.com/js/pinit.js"></script>`,
            height: 600,
            provider_name: 'Pinterest'
        };
    }
};

// Per-platform URL validation (defense-in-depth beyond what the oEmbed provider does)
// Matches the host portion of the URL.
const URL_VALIDATORS = {
    x:           /^https:\/\/(www\.|mobile\.)?(twitter|x)\.com\//i,
    twitter:     /^https:\/\/(www\.|mobile\.)?(twitter|x)\.com\//i,
    tiktok:      /^https:\/\/(www\.|m\.|vm\.)?tiktok\.com\//i,
    reddit:      /^https:\/\/(www\.|old\.|new\.)?(reddit\.com|redd\.it)\//i,
    facebook:    /^https:\/\/(www\.|m\.|web\.|business\.)?(facebook|fb)\.com\//i,
    instagram:   /^https:\/\/(www\.)?instagram\.com\//i,
    threads:     /^https:\/\/(www\.)?threads\.(net|com)\//i,
    snapchat:    /^https:\/\/(www\.)?snapchat\.com\//i,
    youtube:     /^https:\/\/(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i,
    soundcloud:  /^https:\/\/(www\.|m\.|on\.)?soundcloud\.com\//i,
    vimeo:       /^https:\/\/(www\.|player\.)?vimeo\.com\//i,
    spotify:     /^https:\/\/(open\.|play\.)?spotify\.com\//i,
    'apple-music': /^https:\/\/(www\.)?music\.apple\.com\//i,
    pinterest:   /^https:\/\/(www\.|.+\.)?pinterest\.([a-z]{2,4})\//i
};

export async function embed(request, env, ctx) {
    if (request.method !== 'POST') return errors.methodNotAllowed();

    const body = await readJson(request);
    if (!body) return errors.badRequest('Request body must be valid JSON');

    const { platform, url, max_width, max_height } = body;
    if (typeof platform !== 'string' || !platform.trim()) {
        return errors.badRequest('"platform" required (string)');
    }
    if (typeof url !== 'string' || !url.trim()) {
        return errors.badRequest('"url" required (string)');
    }

    const plat = platform.toLowerCase().trim();

    // Validate URL shape + domain match
    if (!url.startsWith('https://')) {
        return errors.badRequest('URL must be HTTPS');
    }
    const validator = URL_VALIDATORS[plat];
    if (validator && !validator.test(url)) {
        return errors.badRequest(
            `URL does not match expected ${plat} domain pattern`,
            { hint: `Expected URL matching ${validator}` }
        );
    }

    // URL transformer path (no external API call needed)
    if (URL_TRANSFORMERS[plat]) {
        const data = URL_TRANSFORMERS[plat](url);
        return jsonOk(data, { platform: plat, source: 'url-transformer' });
    }

    // oEmbed path
    const builder = OEMBED_PROVIDERS[plat];
    if (!builder) {
        return errors.badRequest(
            `Unsupported platform "${plat}"`,
            { supported: [...Object.keys(OEMBED_PROVIDERS), ...Object.keys(URL_TRANSFORMERS)] }
        );
    }

    let endpoint = builder(url);
    if (typeof max_width === 'number' && max_width > 0) {
        endpoint += `&maxwidth=${max_width}`;
    }
    if (typeof max_height === 'number' && max_height > 0) {
        endpoint += `&maxheight=${max_height}`;
    }

    const started = Date.now();
    let resp;
    try {
        resp = await fetch(endpoint, {
            headers: {
                'User-Agent': 'VibeLyf-Embed-Proxy/1.0 (+https://vibelyf.com)',
                'Accept': 'application/json'
            }
        });
    } catch (err) {
        return errors.upstream(plat, `oEmbed network error: ${err.message}`, { endpoint });
    }
    const elapsed_ms = Date.now() - started;

    if (!resp.ok) {
        let detail;
        try {
            detail = await resp.json();
        } catch {
            detail = (await resp.text().catch(() => '')).slice(0, 500);
        }
        return errors.upstream(
            plat,
            `oEmbed provider returned ${resp.status}`,
            { endpoint, status: resp.status, detail }
        );
    }

    let data;
    try {
        data = await resp.json();
    } catch (err) {
        return errors.upstream(plat, 'oEmbed response was not valid JSON', { endpoint });
    }

    return jsonOk(data, { platform: plat, source: 'oembed', endpoint, elapsed_ms });
}
