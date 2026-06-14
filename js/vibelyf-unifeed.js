/**
 * 🌐 VIBELYF — UNIFIED FEED ("All Feeds")
 *
 * The cockpit moment: ONE merged, time-sorted stream of native cards from every
 * open social network (Bluesky 🦋 + Mastodon 🐘 + Lemmy 🐭), with the walled-
 * garden launcher grid below it. Reuses each integration's fetch + renderCard —
 * this module only fans out, merges, de-dupes, sorts, and badges.
 *
 * Per-platform toggles persist in localStorage. Sources honor whatever handles/
 * communities the user has configured in the individual feeds.
 */

window.VibeLyfUniFeed = {
    STORAGE_KEY: 'vibelyf_unifeed_platforms',
    MAX_ITEMS: 60,

    PLATFORMS: [
        { id: 'bluesky',  icon: '🦋', label: 'Bluesky',  color: '#0085FF' },
        { id: 'mastodon', icon: '🐘', label: 'Mastodon', color: '#6364FF' },
        { id: 'lemmy',    icon: '🐭', label: 'Lemmy',    color: '#14854F' }
    ],

    getEnabled() {
        try {
            const s = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
            if (s && typeof s === 'object') return { bluesky: true, mastodon: true, lemmy: true, ...s };
        } catch (e) {}
        return { bluesky: true, mastodon: true, lemmy: true };
    },
    setEnabled(id, on) {
        const e = this.getEnabled();
        e[id] = on;
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(e)); } catch (err) {}
    },
    toggle(id) {
        const e = this.getEnabled();
        this.setEnabled(id, !e[id]);
        this.renderToggles();
        this.loadFeed();
    },

    open() {
        const main = document.getElementById('main-content');
        if (!main) return;
        document.querySelectorAll('#left-nav .nav-item').forEach((n) => n.classList.remove('active'));
        document.querySelector('.nav-feeds')?.classList.add('active');

        main.style.padding = '0';
        main.style.display = 'block';
        main.style.overflowY = 'auto';
        main.style.background = 'var(--vl-bg, #F2F2F2)';
        main.innerHTML = this.shellHtml();
        this.renderToggles();
        this.loadFeed();
    },

    shellHtml() {
        return `
            <div style="max-width: 720px; margin: 0 auto; padding: var(--vl-space-5, 24px) var(--vl-space-4, 16px) 64px;">
                <header style="display:flex; align-items:center; gap:12px; margin-bottom: 14px;">
                    <div style="font-size: 30px; line-height:1;">🌐</div>
                    <div style="flex:1;">
                        <h2 style="margin:0; font-family: var(--vl-font-display, sans-serif); font-size: var(--vl-text-2xl, 1.6rem); color: var(--vl-text, #16181a);">All Feeds</h2>
                        <div style="font-size: var(--vl-text-xs, 12px); color: var(--vl-text-muted, #5E6164);">Every open network in one stream · no login required</div>
                    </div>
                    <button onclick="VibeLyfUniFeed.loadFeed()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Refresh">↻</button>
                    <button onclick="VibeLyfApp.returnToHome()" class="vl-btn vl-btn-ghost vl-btn-sm" title="Close">✕</button>
                </header>

                <div id="vlUniToggles" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;"></div>
                <div id="vlUniStatus" style="font-size:12px; color: var(--vl-text-muted,#5E6164); margin-bottom:14px;"></div>
                <div id="vlUniFeed"></div>

                <h3 style="margin:28px 0 10px; font-size: var(--vl-text-lg, 1.1rem); color: var(--vl-text, #16181a);">More platforms</h3>
                <div style="font-size:12px; color: var(--vl-text-muted,#5E6164); margin-bottom:10px;">These networks don't offer open feeds — they open as embeds or in a new tab.</div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap:10px;">
                    ${['instagram','youtube','spotify','twitter','tiktok','soundcloud','facebook','snapchat','linkedin','reddit','pinterest','discord'].map((p) => `
                        <div onclick="VibeLyfApp.openApp('${p}')" class="vl-card vl-card-interactive" style="padding:14px 8px; text-align:center; cursor:pointer;">
                            <div style="font-size:26px; margin-bottom:6px;">${(window.VibeLyfApp && VibeLyfApp.getPlatformIcon) ? VibeLyfApp.getPlatformIcon(p) : '📱'}</div>
                            <div style="font-size:11px; font-weight:600; text-transform:capitalize; color: var(--vl-text,#16181a);">${p.replace(/-/g, ' ')}</div>
                        </div>`).join('')}
                </div>
            </div>`;
    },

    renderToggles() {
        const wrap = document.getElementById('vlUniToggles');
        if (!wrap) return;
        const enabled = this.getEnabled();
        wrap.innerHTML = this.PLATFORMS.map((p) => {
            const on = !!enabled[p.id];
            return `<button onclick="VibeLyfUniFeed.toggle('${p.id}')"
                style="display:inline-flex; align-items:center; gap:6px; padding:5px 12px; cursor:pointer;
                       border-radius: var(--vl-radius-pill,999px); font-size:13px; font-weight:600;
                       border: 1.5px solid ${on ? p.color : 'var(--vl-surface-border,#d4d4d4)'};
                       background: ${on ? p.color + '1f' : 'transparent'};
                       color: ${on ? 'var(--vl-text,#16181a)' : 'var(--vl-text-muted,#5E6164)'};
                       opacity: ${on ? '1' : '0.6'};">
                ${p.icon} ${p.label}${on ? '' : ' (off)'}
            </button>`;
        }).join('');
    },

    async loadFeed() {
        const feedEl = document.getElementById('vlUniFeed');
        const statusEl = document.getElementById('vlUniStatus');
        if (!feedEl) return;
        feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">🌐 Pulling all networks…</div>`;

        const enabled = this.getEnabled();
        const tasks = [];

        // Each source fans out over its handles/communities with allSettled, so one
        // bad actor never sinks the platform, and returns lightweight tagged items
        // (platform + dedup key + ts + the raw post). Rendering happens AFTER
        // dedup/sort/cap, so we never build cards we'll throw away.
        const fanOut = async (promises) => {
            const settled = await Promise.allSettled(promises);
            return settled.flatMap((s) => (s.status === 'fulfilled' && Array.isArray(s.value) ? s.value : []));
        };

        if (enabled.bluesky && window.BlueskyIntegration) {
            tasks.push(
                fanOut(BlueskyIntegration.getHandles().map((h) => BlueskyIntegration.fetchAuthorFeed(h)))
                    .then((posts) => posts.map((p) => ({ platform: 'bluesky', key: 'b:' + p.uri, ts: p.ts, post: p })))
                    .catch(() => [])
            );
        }
        if (enabled.mastodon && window.MastodonIntegration) {
            tasks.push(
                fanOut(MastodonIntegration.getHandles().map((h) => MastodonIntegration.fetchAccountFeed(h)))
                    .then((posts) => posts.map((p) => ({ platform: 'mastodon', key: 'm:' + p.id, ts: p.ts, post: p })))
                    .catch(() => [])
            );
        }
        if (enabled.lemmy && window.LemmyIntegration) {
            tasks.push(
                fanOut(LemmyIntegration.getCommunities().map((c) => LemmyIntegration.fetchCommunity(c)))
                    .then((posts) => posts.map((p) => ({ platform: 'lemmy', key: 'l:' + p.uid, ts: p.ts, post: p })))
                    .catch(() => [])
            );
        }

        const settled = await Promise.allSettled(tasks);
        let items = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value : []));

        // De-dupe + newest first + cap
        const seen = new Set();
        items = items
            .filter((i) => (seen.has(i.key) ? false : seen.add(i.key)))
            .sort((a, b) => new Date(b.ts) - new Date(a.ts))
            .slice(0, this.MAX_ITEMS);

        // Count AFTER dedup/cap so the status line reflects what's actually shown.
        const renderers = {
            bluesky: (p) => BlueskyIntegration.renderCard(p),
            mastodon: (p) => MastodonIntegration.renderCard(p),
            lemmy: (p) => LemmyIntegration.renderCard(p)
        };
        const counts = {};
        items.forEach((i) => { counts[i.platform] = (counts[i.platform] || 0) + 1; });

        if (statusEl) {
            const parts = this.PLATFORMS
                .filter((p) => enabled[p.id] && counts[p.id])
                .map((p) => `${p.icon} ${counts[p.id]}`);
            statusEl.textContent = items.length
                ? `${items.length} posts · ${parts.join(' · ')}`
                : '';
        }

        if (!items.length) {
            feedEl.innerHTML = `<div style="text-align:center; padding:48px; color: var(--vl-text-muted,#5E6164);">No posts loaded. Toggle a network on, or add handles in the 🦋 🐘 🐭 feeds.</div>`;
            return;
        }
        feedEl.innerHTML = items.map((i) => this.badge(i.platform, renderers[i.platform](i.post))).join('');
    },

    /** Wrap a platform card with a top-right network badge. */
    badge(platformId, cardHtml) {
        const p = this.PLATFORMS.find((x) => x.id === platformId);
        if (!p) return cardHtml;
        return `
            <div style="position:relative;">
                <span style="position:absolute; top:10px; right:12px; z-index:2; display:inline-flex; align-items:center; gap:4px;
                             font-size:11px; font-weight:700; color:${p.color};
                             background: var(--vl-bg-elevated,#fff); border:1px solid ${p.color}55;
                             border-radius: var(--vl-radius-pill,999px); padding:1px 8px;"
                      title="${p.label}">${p.icon} ${p.label}</span>
                ${cardHtml}
            </div>`;
    }
};
