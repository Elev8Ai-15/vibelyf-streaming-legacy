/**
 * 🐘 VIBELYF — MASTODON NATIVE FEED
 *
 * Phase 2.B (sibling of the Bluesky feed). Renders a NATIVE, VibeLyf-styled
 * Mastodon feed inside the cockpit (#main-content) — not an iframe. Mastodon's
 * REST API is public for public posts: NO auth, NO key.
 *   - GET https://{instance}/api/v1/accounts/lookup?acct={user}   (resolve handle → id)
 *   - GET https://{instance}/api/v1/accounts/{id}/statuses        (public posts)
 * Instances send `access-control-allow-origin: *`, so the browser can fetch directly.
 *
 * Handles are federated: `user@instance` (e.g. Gargron@mastodon.social). We hit the
 * account's home instance. Boosts (reblogs) nest the real post in `status.reblog`.
 * `content` is server-sanitized HTML — we still strip it to plain text + re-escape.
 */

window.MastodonIntegration = {
    STORAGE_KEY: 'vibelyf_mastodon_handles',
    // Verified-active FOSS / dev / maker accounts (checked 2026-06-04). Edit freely.
    DEFAULT_SEEDS: [
        'Gargron@mastodon.social',     // Eugen Rochko — Mastodon founder
        'nixCraft@mastodon.social',    // nixCraft — Linux / sysadmin / dev
        'kde@floss.social',            // KDE — FOSS desktop project
        'glynmoody@mastodon.social',   // Glyn Moody — open-source journalist
        'thunderbird@mastodon.online'  // Thunderbird — FOSS email app
    ],
    POSTS_PER_ACTOR: 8,
    state: { loading: false },

    // ── handle persistence ───────────────────────────────────────────────
    getHandles() {
        try {
            const s = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            if (Array.isArray(s) && s.length) return s;
        } catch (e) {}
        return this.DEFAULT_SEEDS.slice();
    },
    saveHandles(arr) { try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr)); } catch (e) {} },
    resetHandles() { try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {} this.open(); },

    // ── entry point (🐘 right-rail widget) ────────────────────────────────
    async open() {
        const main = document.getElementById('main-content');
        if (!main) return;
        document.querySelectorAll('#left-nav .nav-item').forEach((n) => n.classList.remove('active'));
        main.style.padding = '0';
        main.style.display = 'block';
        main.style.overflowY = 'auto';
        main.style.background = 'var(--vl-bg, #F2F2F2)';
        main.innerHTML = this.shellHtml();
        const input = document.getElementById('vlMastoHandleInput');
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.addHandle(); });
        this.renderHandleChips();
        this.loadFeed();
    },

    shellHtml() {
        return `
            <div style="max-width: 720px; margin: 0 auto; padding: var(--vl-space-5, 24px) var(--vl-space-4, 16px) 64px;">
                <header style="display:flex; align-items:center; gap:12px; margin-bottom: 18px;">
                    <div style="font-size: 30px; line-height:1;">🐘</div>
                    <div style="flex:1;">
                        <h2 style="margin:0; font-family: var(--vl-font-display, sans-serif); font-size: var(--vl-text-2xl, 1.6rem); color: var(--vl-text, #16181a);">Mastodon</h2>
                        <div style="font-size: var(--vl-text-xs, 12px); color: var(--vl-text-muted, #5E6164);">Native feed · open fediverse · no login required</div>
                    </div>
                    <button onclick="MastodonIntegration.loadFeed()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Refresh">↻</button>
                    <button onclick="VibeLyfApp.returnToHome()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Close">✕</button>
                </header>
                <div style="display:flex; gap:8px; margin-bottom:12px;">
                    <input id="vlMastoHandleInput" type="text" placeholder="Add a handle (e.g. Gargron@mastodon.social)"
                        style="flex:1; padding:9px 12px; border:1px solid var(--vl-surface-border,#d4d4d4); border-radius: var(--vl-radius-md,10px); background: var(--vl-bg-elevated,#fff); color: var(--vl-text,#16181a); font-size:14px;">
                    <button onclick="MastodonIntegration.addHandle()" class="vl-btn vl-btn-primary vl-btn-sm">Add</button>
                </div>
                <div id="vlMastoChips" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px;"></div>
                <div id="vlMastoFeed"></div>
            </div>`;
    },

    renderHandleChips() {
        const wrap = document.getElementById('vlMastoChips');
        if (!wrap) return;
        wrap.innerHTML = this.getHandles().map((h) => `
            <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 6px 3px 10px; background: var(--vl-bg-elevated,#fff); border:1px solid var(--vl-surface-border,#d4d4d4); border-radius: var(--vl-radius-pill,999px); font-size:12px; color: var(--vl-text,#16181a);">
                @${this.escapeHtml(h)}
                <button onclick="MastodonIntegration.removeHandle('${this.escapeAttr(h)}')" title="Remove" style="border:none; background:transparent; cursor:pointer; color: var(--vl-text-muted,#5E6164); font-size:14px; line-height:1; padding:0 2px;">×</button>
            </span>`).join('') +
            `<button onclick="MastodonIntegration.resetHandles()" style="border:none; background:transparent; cursor:pointer; color: var(--vl-text-muted,#5E6164); font-size:12px; text-decoration:underline;">reset</button>`;
    },

    // ── handle parsing / validation ───────────────────────────────────────
    parseHandle(raw) {
        const h = (raw || '').trim().replace(/^@/, '');
        const at = h.lastIndexOf('@');
        if (at < 1) return null; // need user@instance
        const user = h.slice(0, at);
        const instance = h.slice(at + 1).toLowerCase();
        if (!user || !instance.includes('.')) return null;
        return { user, instance, full: `${user}@${instance}` };
    },

    async addHandle() {
        const input = document.getElementById('vlMastoHandleInput');
        if (!input) return;
        const parsed = this.parseHandle(input.value);
        if (!parsed) {
            input.style.borderColor = 'var(--vl-danger,#d9534f)';
            input.value = ''; input.placeholder = 'Use the form user@instance (e.g. Gargron@mastodon.social)';
            setTimeout(() => { input.style.borderColor = ''; }, 2200);
            return;
        }
        const handles = this.getHandles();
        if (handles.some((h) => h.toLowerCase() === parsed.full.toLowerCase())) { input.value = ''; return; }
        input.disabled = true;
        const ok = await this.lookupId(parsed);
        input.disabled = false;
        if (!ok) {
            input.style.borderColor = 'var(--vl-danger,#d9534f)';
            input.value = ''; input.placeholder = `Couldn't find @${parsed.full} — try again`;
            setTimeout(() => { input.style.borderColor = ''; }, 2200);
            return;
        }
        handles.push(parsed.full);
        this.saveHandles(handles);
        input.value = '';
        this.renderHandleChips();
        this.loadFeed();
    },

    removeHandle(handle) {
        this.saveHandles(this.getHandles().filter((h) => h !== handle));
        this.renderHandleChips();
        this.loadFeed();
    },

    async lookupId(parsed) {
        try {
            const resp = await fetch(`https://${parsed.instance}/api/v1/accounts/lookup?acct=${encodeURIComponent(parsed.user)}`);
            if (!resp.ok) return null;
            const j = await resp.json();
            return j && j.id ? j.id : null;
        } catch (e) { return null; }
    },

    // ── feed load + render ────────────────────────────────────────────────
    async loadFeed() {
        const feedEl = document.getElementById('vlMastoFeed');
        if (!feedEl) return;
        this.state.loading = true;
        feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">🐘 Loading the feed…</div>`;

        const results = await Promise.allSettled(this.getHandles().map((h) => this.fetchAccountFeed(h)));
        let posts = [];
        results.forEach((r) => { if (r.status === 'fulfilled' && Array.isArray(r.value)) posts.push(...r.value); });

        const seen = new Set();
        posts = posts.filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
        posts.sort((a, b) => new Date(b.ts) - new Date(a.ts));

        this.state.loading = false;
        if (!posts.length) {
            feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">No posts found. Add a handle above to build your feed.</div>`;
            return;
        }
        feedEl.innerHTML = posts.map((p) => this.renderCard(p)).join('');
    },

    async fetchAccountFeed(handle) {
        const parsed = this.parseHandle(handle);
        if (!parsed) return [];
        try {
            const id = await this.lookupId(parsed);
            if (!id) return [];
            const url = `https://${parsed.instance}/api/v1/accounts/${id}/statuses?limit=${this.POSTS_PER_ACTOR}&exclude_replies=true`;
            const resp = await fetch(url);
            if (!resp.ok) return [];
            const arr = await resp.json();
            return (Array.isArray(arr) ? arr : []).map((s) => this.normalize(s)).filter(Boolean);
        } catch (e) { return []; }
    },

    normalize(status) {
        if (!status) return null;
        const booster = status.reblog ? status.account : null;   // who boosted
        const s = status.reblog || status;                        // the real post
        const a = s.account || {};
        return {
            id: status.id,
            handle: a.acct || '',
            name: a.display_name || a.acct || 'unknown',
            avatar: a.avatar || '',
            text: this.htmlToText(s.content || ''),
            ts: s.created_at || status.created_at || '',
            reblogs: s.reblogs_count || 0,
            favs: s.favourites_count || 0,
            replies: s.replies_count || 0,
            images: (s.media_attachments || []).filter((m) => m.type === 'image' || m.type === 'gifv').map((m) => m.preview_url || m.url).filter(Boolean).slice(0, 4),
            url: s.url || s.uri || '#',
            boostedBy: booster ? (booster.display_name || booster.acct) : null
        };
    },

    renderCard(p) {
        const boost = p.boostedBy
            ? `<div style="font-size:12px; color: var(--vl-text-muted,#5E6164); margin-bottom:6px;">🔁 Boosted by ${this.escapeHtml(p.boostedBy)}</div>`
            : '';
        const avatar = p.avatar
            ? `<img src="${this.escapeAttr(p.avatar)}" alt="" width="40" height="40" loading="lazy" style="width:40px; height:40px; border-radius:50%; object-fit:cover; flex-shrink:0;">`
            : `<div style="width:40px; height:40px; border-radius:50%; background: #6364FF; flex-shrink:0;"></div>`;
        let images = '';
        if (p.images.length) {
            const cols = p.images.length === 1 ? '1fr' : '1fr 1fr';
            images = `<div style="display:grid; grid-template-columns:${cols}; gap:6px; margin-top:10px; border-radius: var(--vl-radius-md,10px); overflow:hidden;">` +
                p.images.map((src) => `<img src="${this.escapeAttr(src)}" alt="" loading="lazy" style="width:100%; height:100%; max-height:280px; object-fit:cover; display:block;">`).join('') + `</div>`;
        }
        const text = p.text
            ? `<div style="margin-top:8px; white-space:pre-wrap; word-wrap:break-word; line-height: var(--vl-line-snug,1.45); color: var(--vl-text,#16181a);">${this.escapeHtml(p.text)}</div>`
            : '';
        return `
            <article class="vl-card" style="padding:16px; margin-bottom:14px;">
                ${boost}
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
                            <span title="Boosts">🔁 ${this.fmt(p.reblogs)}</span>
                            <span title="Favourites">★ ${this.fmt(p.favs)}</span>
                            <a href="${this.escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer" style="margin-left:auto; color: #6364FF; text-decoration:none; font-weight:600;">Open ↗</a>
                        </div>
                    </div>
                </div>
            </article>`;
    },

    // ── helpers ───────────────────────────────────────────────────────────
    htmlToText(html) {
        return String(html || '')
            .replace(/<\/(p|div|h[1-6])>/gi, '\n\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')                 // strip remaining tags FIRST (kills <script>/<img>)
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
            .replace(/\n{3,}/g, '\n\n').trim();
    },
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
