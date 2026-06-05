/**
 * 🐭 VIBELYF — LEMMY NATIVE FEED
 *
 * Phase 2.B (sibling of Bluesky + Mastodon). Lemmy is the open-source, federated
 * "Reddit" — and unlike Reddit (whose free API is now closed / 403s), Lemmy's API
 * is public for public content: NO auth, NO key, and instances send permissive CORS.
 *   - GET https://{instance}/api/v3/post/list?community_name={name}&sort=Hot&limit=N
 *
 * Lemmy is community-centric (not account-centric), so the feed is seeded with
 * communities in `name@instance` form. Each community is fetched from its home
 * instance. Titles are plain text; bodies are Markdown — both are escaped on render.
 */

window.LemmyIntegration = {
    STORAGE_KEY: 'vibelyf_lemmy_communities',
    // Active dev/tech/maker communities (verified 2026-06-05). Edit freely.
    DEFAULT_SEEDS: [
        'technology@lemmy.world',
        'programming@programming.dev',
        'selfhosted@lemmy.world',
        'python@programming.dev',
        'linux@lemmy.ml'
    ],
    POSTS_PER_COMMUNITY: 8,
    state: { loading: false },

    // ── persistence ───────────────────────────────────────────────────────
    getCommunities() {
        try {
            const s = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            if (Array.isArray(s) && s.length) return s;
        } catch (e) {}
        return this.DEFAULT_SEEDS.slice();
    },
    saveCommunities(arr) { try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr)); } catch (e) {} },
    resetCommunities() { try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {} this.open(); },

    // ── entry point (🐭 right-rail widget) ────────────────────────────────
    async open() {
        const main = document.getElementById('main-content');
        if (!main) return;
        document.querySelectorAll('#left-nav .nav-item').forEach((n) => n.classList.remove('active'));
        main.style.padding = '0';
        main.style.display = 'block';
        main.style.overflowY = 'auto';
        main.style.background = 'var(--vl-bg, #F2F2F2)';
        main.innerHTML = this.shellHtml();
        const input = document.getElementById('vlLemmyInput');
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.addCommunity(); });
        this.renderChips();
        this.loadFeed();
    },

    shellHtml() {
        return `
            <div style="max-width: 720px; margin: 0 auto; padding: var(--vl-space-5, 24px) var(--vl-space-4, 16px) 64px;">
                <header style="display:flex; align-items:center; gap:12px; margin-bottom: 18px;">
                    <div style="font-size: 30px; line-height:1;">🐭</div>
                    <div style="flex:1;">
                        <h2 style="margin:0; font-family: var(--vl-font-display, sans-serif); font-size: var(--vl-text-2xl, 1.6rem); color: var(--vl-text, #16181a);">Lemmy</h2>
                        <div style="font-size: var(--vl-text-xs, 12px); color: var(--vl-text-muted, #5E6164);">Native feed · open communities (the fediverse Reddit) · no login required</div>
                    </div>
                    <button onclick="LemmyIntegration.loadFeed()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Refresh">↻</button>
                    <button onclick="VibeLyfApp.returnToHome()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Close">✕</button>
                </header>
                <div style="display:flex; gap:8px; margin-bottom:12px;">
                    <input id="vlLemmyInput" type="text" placeholder="Add a community (e.g. technology@lemmy.world)"
                        style="flex:1; padding:9px 12px; border:1px solid var(--vl-surface-border,#d4d4d4); border-radius: var(--vl-radius-md,10px); background: var(--vl-bg-elevated,#fff); color: var(--vl-text,#16181a); font-size:14px;">
                    <button onclick="LemmyIntegration.addCommunity()" class="vl-btn vl-btn-primary vl-btn-sm">Add</button>
                </div>
                <div id="vlLemmyChips" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px;"></div>
                <div id="vlLemmyFeed"></div>
            </div>`;
    },

    renderChips() {
        const wrap = document.getElementById('vlLemmyChips');
        if (!wrap) return;
        wrap.innerHTML = this.getCommunities().map((c) => `
            <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 6px 3px 10px; background: var(--vl-bg-elevated,#fff); border:1px solid var(--vl-surface-border,#d4d4d4); border-radius: var(--vl-radius-pill,999px); font-size:12px; color: var(--vl-text,#16181a);">
                !${this.escapeHtml(c)}
                <button onclick="LemmyIntegration.removeCommunity('${this.escapeAttr(c)}')" title="Remove" style="border:none; background:transparent; cursor:pointer; color: var(--vl-text-muted,#5E6164); font-size:14px; line-height:1; padding:0 2px;">×</button>
            </span>`).join('') +
            `<button onclick="LemmyIntegration.resetCommunities()" style="border:none; background:transparent; cursor:pointer; color: var(--vl-text-muted,#5E6164); font-size:12px; text-decoration:underline;">reset</button>`;
    },

    parseCommunity(raw) {
        const c = (raw || '').trim().replace(/^[!@]/, '');
        const at = c.indexOf('@');
        if (at < 1) return null;
        const name = c.slice(0, at);
        const instance = c.slice(at + 1).toLowerCase();
        if (!name || !instance.includes('.')) return null;
        return { name, instance, full: `${name}@${instance}` };
    },

    async addCommunity() {
        const input = document.getElementById('vlLemmyInput');
        if (!input) return;
        const parsed = this.parseCommunity(input.value);
        if (!parsed) {
            input.style.borderColor = 'var(--vl-danger,#d9534f)';
            input.value = ''; input.placeholder = 'Use community@instance (e.g. technology@lemmy.world)';
            setTimeout(() => { input.style.borderColor = ''; }, 2200);
            return;
        }
        const list = this.getCommunities();
        if (list.some((c) => c.toLowerCase() === parsed.full.toLowerCase())) { input.value = ''; return; }
        input.disabled = true;
        const ok = await this.validateCommunity(parsed);
        input.disabled = false;
        if (!ok) {
            input.style.borderColor = 'var(--vl-danger,#d9534f)';
            input.value = ''; input.placeholder = `Couldn't find !${parsed.full} — try again`;
            setTimeout(() => { input.style.borderColor = ''; }, 2200);
            return;
        }
        list.push(parsed.full);
        this.saveCommunities(list);
        input.value = '';
        this.renderChips();
        this.loadFeed();
    },

    removeCommunity(full) {
        this.saveCommunities(this.getCommunities().filter((c) => c !== full));
        this.renderChips();
        this.loadFeed();
    },

    async validateCommunity(parsed) {
        try {
            const resp = await fetch(`https://${parsed.instance}/api/v3/post/list?community_name=${encodeURIComponent(parsed.name)}&limit=1&sort=Hot`);
            if (!resp.ok) return false;
            const j = await resp.json();
            return Array.isArray(j.posts);
        } catch (e) { return false; }
    },

    // ── feed load + render ────────────────────────────────────────────────
    async loadFeed() {
        const feedEl = document.getElementById('vlLemmyFeed');
        if (!feedEl) return;
        this.state.loading = true;
        feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">🐭 Loading communities…</div>`;

        const results = await Promise.allSettled(this.getCommunities().map((c) => this.fetchCommunity(c)));
        let posts = [];
        results.forEach((r) => { if (r.status === 'fulfilled' && Array.isArray(r.value)) posts.push(...r.value); });

        const seen = new Set();
        posts = posts.filter((p) => (seen.has(p.uid) ? false : seen.add(p.uid)));
        posts.sort((a, b) => new Date(b.ts) - new Date(a.ts));

        this.state.loading = false;
        if (!posts.length) {
            feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">No posts found. Add a community above to build your feed.</div>`;
            return;
        }
        feedEl.innerHTML = posts.map((p) => this.renderCard(p)).join('');
    },

    async fetchCommunity(full) {
        const parsed = this.parseCommunity(full);
        if (!parsed) return [];
        try {
            const url = `https://${parsed.instance}/api/v3/post/list?community_name=${encodeURIComponent(parsed.name)}&sort=Hot&limit=${this.POSTS_PER_COMMUNITY}`;
            const resp = await fetch(url);
            if (!resp.ok) return [];
            const j = await resp.json();
            return (j.posts || []).map((row) => this.normalize(row, parsed)).filter(Boolean);
        } catch (e) { return []; }
    },

    normalize(row, parsed) {
        const p = row.post || {};
        const creator = row.creator || {};
        const community = row.community || {};
        const counts = row.counts || {};
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(p.url || '');
        return {
            uid: p.ap_id || `${parsed.instance}/${p.id}`,
            title: p.name || '',
            body: p.body || '',
            link: p.url || '',
            image: p.thumbnail_url || (isImage ? p.url : ''),
            community: community.name ? `${community.name}@${parsed.instance}` : parsed.full,
            communityTitle: community.title || community.name || parsed.name,
            communityIcon: community.icon || '',
            author: creator.display_name || creator.name || 'unknown',
            ts: p.published || '',
            score: counts.score || 0,
            comments: counts.comments || 0,
            postUrl: `https://${parsed.instance}/post/${p.id}`
        };
    },

    renderCard(p) {
        const cIcon = p.communityIcon
            ? `<img src="${this.escapeAttr(p.communityIcon)}" alt="" width="20" height="20" loading="lazy" style="width:20px;height:20px;border-radius:5px;object-fit:cover;">`
            : `<span style="width:20px;height:20px;border-radius:5px;background:#14854F;display:inline-block;"></span>`;
        const thumb = p.image
            ? `<img src="${this.escapeAttr(p.image)}" alt="" loading="lazy" style="width:100%;max-height:300px;object-fit:cover;border-radius:var(--vl-radius-md,10px);margin-top:10px;display:block;">`
            : '';
        const bodySnippet = p.body
            ? `<div style="margin-top:6px; color: var(--vl-text-muted,#5E6164); font-size:14px; line-height:1.5; white-space:pre-wrap; word-wrap:break-word; max-height:6.5em; overflow:hidden;">${this.escapeHtml(p.body.slice(0, 320))}${p.body.length > 320 ? '…' : ''}</div>`
            : '';
        const extLink = p.link && p.link !== p.postUrl
            ? `<div style="font-size:12px; margin-top:6px; color: var(--vl-accent-deep,#0085FF); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">🔗 ${this.escapeHtml(this.hostOf(p.link))}</div>`
            : '';
        return `
            <article class="vl-card" style="padding:16px; margin-bottom:14px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:12px; color: var(--vl-text-muted,#5E6164);">
                    ${cIcon}
                    <span style="font-weight: var(--vl-weight-semi,600); color: var(--vl-text,#16181a);">!${this.escapeHtml(p.community)}</span>
                    <span>· ${this.relTime(p.ts)}</span>
                    <span>· by ${this.escapeHtml(p.author)}</span>
                </div>
                <a href="${this.escapeAttr(p.postUrl)}" target="_blank" rel="noopener noreferrer" style="font-weight: var(--vl-weight-bold,700); font-size:16px; color: var(--vl-text,#16181a); text-decoration:none; line-height:1.35; display:block;">${this.escapeHtml(p.title)}</a>
                ${extLink}
                ${bodySnippet}
                ${thumb}
                <div style="display:flex; gap:18px; margin-top:12px; font-size:13px; color: var(--vl-text-muted,#5E6164);">
                    <span title="Score">▲ ${this.fmt(p.score)}</span>
                    <span title="Comments">💬 ${this.fmt(p.comments)}</span>
                    <a href="${this.escapeAttr(p.postUrl)}" target="_blank" rel="noopener noreferrer" style="margin-left:auto; color: #14854F; text-decoration:none; font-weight:600;">Open ↗</a>
                </div>
            </article>`;
    },

    // ── helpers ───────────────────────────────────────────────────────────
    hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url.slice(0, 40); } },
    relTime(ts) {
        if (!ts) return '';
        const t = new Date(ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z').getTime();
        if (isNaN(t)) return '';
        const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
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
