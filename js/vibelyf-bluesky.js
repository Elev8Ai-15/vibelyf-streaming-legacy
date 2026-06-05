/**
 * 🦋 VIBELYF — BLUESKY NATIVE FEED
 *
 * Phase 2.B / Task #27. Renders a NATIVE, VibeLyf-styled Bluesky feed inside the
 * cockpit (#main-content) — not an iframe. Uses the AT Protocol public AppView,
 * which needs NO auth and NO API key:
 *   - app.bsky.feed.getAuthorFeed  (posts for a handle)
 *   - app.bsky.actor.getProfile    (validate a user-added handle)
 *
 * The default seed is a small set of well-known Bluesky/dev accounts; Brad should
 * curate DEFAULT_SEEDS to the real indie-creator / vibecoder list. Users can add
 * their own handles (persisted in localStorage) on top of the seed.
 *
 * Post text is HTML-escaped before render (it's third-party user content). The
 * whole card links out to bsky.app; we deliberately do not auto-linkify inline.
 */

window.BlueskyIntegration = {
    APPVIEW: 'https://public.api.bsky.app/xrpc',
    STORAGE_KEY: 'vibelyf_bluesky_handles',
    // Curated indie-hacker / vibecoder / AI-builder seed — all verified real + active
    // on Bluesky as of 2026-06-04 (follower counts + recent posts checked). Edit freely.
    DEFAULT_SEEDS: [
        'petecodes.bsky.social',  // Pete Codes — No CS Degree, indie community
        'tsanlis.bsky.social',    // Thomas Sanlis — indie hacker (uneed.best)
        'jimraptis.com',          // Jim Raptis — micro-SaaS (MagicPattern)
        'nordcraft.com',          // Nordcraft — AI app builder
        'jasonleow.bsky.social'   // Jason Leow — indie hacker / solopreneur
    ],
    POSTS_PER_ACTOR: 8,

    state: { loading: false },

    // ── handle persistence ───────────────────────────────────────────────
    getHandles() {
        try {
            const s = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            if (Array.isArray(s) && s.length) return s;
        } catch (e) { /* fall through to defaults */ }
        return this.DEFAULT_SEEDS.slice();
    },
    saveHandles(arr) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
    },
    resetHandles() {
        try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
        this.open();
    },

    // ── entry point (called by the 🦋 right-rail widget) ──────────────────
    async open() {
        const main = document.getElementById('main-content');
        if (!main) return;

        // Highlight the feeds nav if present; clear any other active nav state.
        document.querySelectorAll('#left-nav .nav-item').forEach((n) => n.classList.remove('active'));

        main.style.padding = '0';
        main.style.display = 'block';
        main.style.overflowY = 'auto';
        main.style.background = 'var(--vl-bg, #F2F2F2)';
        main.innerHTML = this.shellHtml();

        const input = document.getElementById('vlBskyHandleInput');
        if (input) {
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.addHandle(); });
        }
        this.renderHandleChips();
        this.loadFeed();
    },

    shellHtml() {
        return `
            <div style="max-width: 720px; margin: 0 auto; padding: var(--vl-space-5, 24px) var(--vl-space-4, 16px) 64px;">
                <header style="display:flex; align-items:center; gap:12px; margin-bottom: 18px;">
                    <div style="font-size: 30px; line-height:1;">🦋</div>
                    <div style="flex:1;">
                        <h2 style="margin:0; font-family: var(--vl-font-display, sans-serif); font-size: var(--vl-text-2xl, 1.6rem); color: var(--vl-text, #16181a);">Bluesky</h2>
                        <div style="font-size: var(--vl-text-xs, 12px); color: var(--vl-text-muted, #5E6164);">Native feed · AT Protocol · no login required</div>
                    </div>
                    <button onclick="BlueskyIntegration.loadFeed()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Refresh">↻</button>
                    <button onclick="VibeLyfApp.returnToHome()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Close">✕</button>
                </header>

                <div style="display:flex; gap:8px; margin-bottom:12px;">
                    <input id="vlBskyHandleInput" type="text" placeholder="Add a handle (e.g. jay.bsky.team)"
                        style="flex:1; padding:9px 12px; border:1px solid var(--vl-surface-border,#d4d4d4); border-radius: var(--vl-radius-md,10px); background: var(--vl-bg-elevated,#fff); color: var(--vl-text,#16181a); font-size:14px;">
                    <button onclick="BlueskyIntegration.addHandle()" class="vl-btn vl-btn-primary vl-btn-sm">Add</button>
                </div>
                <div id="vlBskyChips" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px;"></div>

                <div id="vlBskyFeed"></div>
            </div>`;
    },

    // ── handle chips (removable) ──────────────────────────────────────────
    renderHandleChips() {
        const wrap = document.getElementById('vlBskyChips');
        if (!wrap) return;
        const handles = this.getHandles();
        wrap.innerHTML = handles.map((h) => `
            <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 6px 3px 10px; background: var(--vl-bg-elevated,#fff); border:1px solid var(--vl-surface-border,#d4d4d4); border-radius: var(--vl-radius-pill,999px); font-size:12px; color: var(--vl-text,#16181a);">
                @${this.escapeHtml(h)}
                <button onclick="BlueskyIntegration.removeHandle('${this.escapeAttr(h)}')" title="Remove" style="border:none; background:transparent; cursor:pointer; color: var(--vl-text-muted,#5E6164); font-size:14px; line-height:1; padding:0 2px;">×</button>
            </span>`).join('') +
            `<button onclick="BlueskyIntegration.resetHandles()" style="border:none; background:transparent; cursor:pointer; color: var(--vl-text-muted,#5E6164); font-size:12px; text-decoration:underline;">reset</button>`;
    },

    async addHandle() {
        const input = document.getElementById('vlBskyHandleInput');
        if (!input) return;
        let handle = (input.value || '').trim().replace(/^@/, '');
        if (!handle) return;
        // Bare username → assume .bsky.social
        if (!handle.includes('.')) handle = `${handle}.bsky.social`;

        const handles = this.getHandles();
        if (handles.includes(handle)) { input.value = ''; return; }

        input.disabled = true;
        const ok = await this.validateHandle(handle);
        input.disabled = false;
        if (!ok) {
            input.style.borderColor = 'var(--vl-danger, #d9534f)';
            input.placeholder = `Couldn't find @${handle} — try again`;
            input.value = '';
            setTimeout(() => { input.style.borderColor = ''; }, 2000);
            return;
        }
        handles.push(handle);
        this.saveHandles(handles);
        input.value = '';
        this.renderHandleChips();
        this.loadFeed();
    },

    removeHandle(handle) {
        const handles = this.getHandles().filter((h) => h !== handle);
        this.saveHandles(handles);
        this.renderHandleChips();
        this.loadFeed();
    },

    async validateHandle(handle) {
        try {
            const resp = await fetch(`${this.APPVIEW}/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`);
            return resp.ok;
        } catch (e) { return false; }
    },

    // ── feed load + render ────────────────────────────────────────────────
    async loadFeed() {
        const feedEl = document.getElementById('vlBskyFeed');
        if (!feedEl) return;
        this.state.loading = true;
        feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">🦋 Loading the feed…</div>`;

        const handles = this.getHandles();
        const results = await Promise.allSettled(handles.map((h) => this.fetchAuthorFeed(h)));

        let posts = [];
        results.forEach((r) => { if (r.status === 'fulfilled' && Array.isArray(r.value)) posts.push(...r.value); });

        // De-dupe by URI, newest first.
        const seen = new Set();
        posts = posts.filter((p) => (seen.has(p.uri) ? false : seen.add(p.uri)));
        posts.sort((a, b) => new Date(b.ts) - new Date(a.ts));

        this.state.loading = false;
        if (!posts.length) {
            feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">No posts found. Add a handle above to build your feed.</div>`;
            return;
        }
        feedEl.innerHTML = posts.map((p) => this.renderCard(p)).join('');
    },

    async fetchAuthorFeed(handle) {
        try {
            const url = `${this.APPVIEW}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=${this.POSTS_PER_ACTOR}&filter=posts_no_replies`;
            const resp = await fetch(url);
            if (!resp.ok) return [];
            const data = await resp.json();
            return (data.feed || []).map((item) => this.normalize(item)).filter(Boolean);
        } catch (e) { return []; }
    },

    normalize(item) {
        const post = item && item.post;
        if (!post) return null;
        const a = post.author || {};
        const r = post.record || {};
        const rkey = (post.uri || '').split('/').pop();
        const reason = item.reason || {};
        const isRepost = (reason['$type'] || '').includes('repost');
        return {
            uri: post.uri,
            handle: a.handle || '',
            name: a.displayName || a.handle || 'unknown',
            avatar: a.avatar || '',
            text: r.text || '',
            ts: post.indexedAt || r.createdAt || '',
            likes: post.likeCount || 0,
            reposts: post.repostCount || 0,
            replies: post.replyCount || 0,
            images: this.extractImages(post.embed),
            url: a.handle ? `https://bsky.app/profile/${a.handle}/post/${rkey}` : '#',
            repostedBy: isRepost ? (reason.by && (reason.by.displayName || reason.by.handle)) : null
        };
    },

    extractImages(embed) {
        if (!embed) return [];
        const t = embed['$type'] || '';
        let imgs = [];
        if (t.includes('app.bsky.embed.images')) imgs = embed.images || [];
        else if (embed.media && (embed.media['$type'] || '').includes('images')) imgs = embed.media.images || [];
        return imgs.map((i) => i.thumb).filter(Boolean).slice(0, 4);
    },

    renderCard(p) {
        const repost = p.repostedBy
            ? `<div style="font-size:12px; color: var(--vl-text-muted,#5E6164); margin-bottom:6px;">🔁 Reposted by ${this.escapeHtml(p.repostedBy)}</div>`
            : '';
        const avatar = p.avatar
            ? `<img src="${this.escapeAttr(p.avatar)}" alt="" width="40" height="40" loading="lazy" style="width:40px; height:40px; border-radius:50%; object-fit:cover; flex-shrink:0;">`
            : `<div style="width:40px; height:40px; border-radius:50%; background: var(--vl-accent,#0085FF); flex-shrink:0;"></div>`;

        let images = '';
        if (p.images.length) {
            const cols = p.images.length === 1 ? '1fr' : '1fr 1fr';
            images = `<div style="display:grid; grid-template-columns:${cols}; gap:6px; margin-top:10px; border-radius: var(--vl-radius-md,10px); overflow:hidden;">` +
                p.images.map((src) => `<img src="${this.escapeAttr(src)}" alt="" loading="lazy" style="width:100%; height:100%; max-height:280px; object-fit:cover; display:block;">`).join('') +
                `</div>`;
        }

        const text = p.text
            ? `<div style="margin-top:8px; white-space:pre-wrap; word-wrap:break-word; line-height: var(--vl-line-snug,1.45); color: var(--vl-text,#16181a);">${this.escapeHtml(p.text)}</div>`
            : '';

        return `
            <article class="vl-card" style="padding:16px; margin-bottom:14px;">
                ${repost}
                <div style="display:flex; gap:12px;">
                    ${avatar}
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:baseline; gap:6px; flex-wrap:wrap;">
                            <span style="font-weight: var(--vl-weight-bold,700); color: var(--vl-text,#16181a);">${this.escapeHtml(p.name)}</span>
                            <span style="font-size:13px; color: var(--vl-text-muted,#5E6164);">@${this.escapeHtml(p.handle)}</span>
                            <span style="font-size:13px; color: var(--vl-text-muted,#5E6164);">· ${this.relTime(p.ts)}</span>
                        </div>
                        ${text}
                        ${images}
                        <div style="display:flex; gap:18px; margin-top:12px; font-size:13px; color: var(--vl-text-muted,#5E6164);">
                            <span title="Replies">💬 ${this.fmt(p.replies)}</span>
                            <span title="Reposts">🔁 ${this.fmt(p.reposts)}</span>
                            <span title="Likes">♥ ${this.fmt(p.likes)}</span>
                            <a href="${this.escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer" style="margin-left:auto; color: var(--vl-accent-deep, #0085FF); text-decoration:none; font-weight:600;">Open ↗</a>
                        </div>
                    </div>
                </div>
            </article>`;
    },

    // ── helpers ───────────────────────────────────────────────────────────
    relTime(ts) {
        if (!ts) return '';
        const then = new Date(ts).getTime();
        if (isNaN(then)) return '';
        const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
        if (s < 60) return `${s}s`;
        const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
        const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
        const d = Math.floor(h / 24); if (d < 30) return `${d}d`;
        const mo = Math.floor(d / 30); if (mo < 12) return `${mo}mo`;
        return `${Math.floor(mo / 12)}y`;
    },
    fmt(n) {
        n = n || 0;
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    },
    escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },
    escapeAttr(s) { return this.escapeHtml(s); }
};
