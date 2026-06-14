/**
 * 👤 VIBELYF ACCOUNT — optional free account to SAVE YOUR HUB across devices.
 *
 * No account is ever required: VibeLyf works fully from localStorage for guests.
 * Signing up just persists your hub (feeds, handles, communities, layout) to your
 * account so it follows you to any device. Backed by VibeLyfCloud (Supabase, RLS).
 *
 * Renders a single modal (reusing the .vl-overlay/.vl-modal styles) and is opened
 * from the left-nav "Account" item. Auth is email + password (works out of the box);
 * Google sign-in appears only if OAuth is configured server-side.
 */

window.VibeLyfAccount = {
    _mounted: false,

    open() {
        this._mount();
        this.render();
        const ov = document.getElementById('vlAccountOverlay');
        if (ov) ov.hidden = false;
    },

    close() {
        const ov = document.getElementById('vlAccountOverlay');
        if (ov) ov.hidden = true;
    },

    _mount() {
        if (this._mounted) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = `
            <div class="vl-overlay" id="vlAccountOverlay" hidden role="dialog" aria-modal="true" aria-labelledby="vlAccountTitle">
                <div class="vl-modal" style="max-width: 420px;">
                    <div class="vl-modal-header">
                        <h2 class="vl-modal-title" id="vlAccountTitle">Your VibeLyf</h2>
                        <button class="vl-modal-close" id="vlAccountClose" aria-label="Close">✕</button>
                    </div>
                    <div id="vlAccountBody"></div>
                </div>
            </div>`;
        document.body.appendChild(wrap.firstElementChild);
        document.getElementById('vlAccountClose').addEventListener('click', () => this.close());
        const ov = document.getElementById('vlAccountOverlay');
        ov.addEventListener('click', (e) => { if (e.target === ov) this.close(); });
        this._mounted = true;
    },

    render() {
        const body = document.getElementById('vlAccountBody');
        if (!body) return;
        const cloud = window.VibeLyfCloud;

        if (cloud && cloud.isAuthenticated && cloud.isAuthenticated()) {
            const u = cloud.getUser();
            const name = (u && (u.user_metadata?.display_name || u.email)) || 'you';
            body.innerHTML = `
                <p style="margin:0 0 1rem;">Signed in as <strong>${this.esc(name)}</strong>.</p>
                <p class="vl-text-muted" style="margin:0 0 1.25rem; font-size:14px;">
                    Your hub — feeds, handles, communities, and layout — is saved to your account and
                    syncs to any device you sign in on.
                </p>
                <div style="display:flex; gap:8px; justify-content:flex-end;">
                    <button class="vl-btn vl-btn-ghost" id="vlAccSyncNow">Save hub now</button>
                    <button class="vl-btn vl-btn-secondary" id="vlAccSignOut">Sign out</button>
                </div>
                <div id="vlAccountMsg" style="margin-top:0.75rem; font-size:13px;"></div>`;
            document.getElementById('vlAccSignOut').addEventListener('click', () => this._signOut());
            document.getElementById('vlAccSyncNow').addEventListener('click', () => this._syncNow());
            return;
        }

        const mode = this._mode || 'signup';
        const isSignup = mode === 'signup';
        body.innerHTML = `
            <p class="vl-text-muted" style="margin:0 0 1rem; font-size:14px;">
                VibeLyf is free and needs no account to use. Create one only if you want your hub —
                feeds, handles, and layout — to follow you across devices.
            </p>
            <div style="display:flex; gap:6px; margin-bottom:1rem;">
                <button class="vl-btn ${isSignup ? 'vl-btn-primary' : 'vl-btn-ghost'} vl-btn-sm" id="vlAccTabSignup" style="flex:1;">Create account</button>
                <button class="vl-btn ${isSignup ? 'vl-btn-ghost' : 'vl-btn-primary'} vl-btn-sm" id="vlAccTabSignin" style="flex:1;">Sign in</button>
            </div>
            <label style="display:block; font-size:13px; margin-bottom:4px; color:var(--vl-text-muted,#5E6164);">Email</label>
            <input id="vlAccEmail" type="email" autocomplete="email" placeholder="you@example.com"
                style="width:100%; box-sizing:border-box; padding:10px 12px; margin-bottom:12px; border:1px solid var(--vl-surface-border,#d4d4d4); border-radius:var(--vl-radius-md,10px); background:var(--vl-bg-elevated,#fff); color:var(--vl-text,#16181a); font-size:14px;">
            <label style="display:block; font-size:13px; margin-bottom:4px; color:var(--vl-text-muted,#5E6164);">Password</label>
            <input id="vlAccPass" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" placeholder="At least 6 characters"
                style="width:100%; box-sizing:border-box; padding:10px 12px; margin-bottom:16px; border:1px solid var(--vl-surface-border,#d4d4d4); border-radius:var(--vl-radius-md,10px); background:var(--vl-bg-elevated,#fff); color:var(--vl-text,#16181a); font-size:14px;">
            <button class="vl-btn vl-btn-primary" id="vlAccSubmit" style="width:100%;">${isSignup ? 'Create free account' : 'Sign in'}</button>
            <div id="vlAccountMsg" style="margin-top:0.75rem; font-size:13px; min-height:1.2em;"></div>
            <p class="vl-text-muted" style="margin:1rem 0 0; font-size:12px; text-align:center;">
                We never sell your data. See <a href="/privacy" target="_blank" rel="noopener">Privacy</a>.
            </p>`;

        document.getElementById('vlAccTabSignup').addEventListener('click', () => { this._mode = 'signup'; this.render(); });
        document.getElementById('vlAccTabSignin').addEventListener('click', () => { this._mode = 'signin'; this.render(); });
        document.getElementById('vlAccSubmit').addEventListener('click', () => this._submit(isSignup));
        document.getElementById('vlAccPass').addEventListener('keydown', (e) => { if (e.key === 'Enter') this._submit(isSignup); });
    },

    msg(text, kind) {
        const el = document.getElementById('vlAccountMsg');
        if (!el) return;
        const color = kind === 'error' ? 'var(--vl-danger,#d9534f)' : (kind === 'ok' ? 'var(--vl-accent-deep,#1a8a5a)' : 'var(--vl-text-muted,#5E6164)');
        el.style.color = color;
        el.textContent = text;
    },

    async _submit(isSignup) {
        const cloud = window.VibeLyfCloud;
        if (!cloud || !cloud.isReady()) { this.msg('Accounts are temporarily unavailable — try again shortly.', 'error'); return; }
        const email = (document.getElementById('vlAccEmail').value || '').trim();
        const pass = document.getElementById('vlAccPass').value || '';
        if (!email || !pass) { this.msg('Enter your email and a password.', 'error'); return; }
        if (pass.length < 6) { this.msg('Password must be at least 6 characters.', 'error'); return; }

        const btn = document.getElementById('vlAccSubmit');
        btn.disabled = true;
        this.msg(isSignup ? 'Creating your account…' : 'Signing in…');

        try {
            if (isSignup) {
                const res = await cloud.signUp(email, pass);
                if (res.error) { this.msg(res.error, 'error'); btn.disabled = false; return; }
                // Email-confirmation projects return a user but no active session.
                if (cloud.isAuthenticated()) {
                    await cloud.sync();              // push the guest hub up immediately
                    this.msg('Account created — your hub is now saved. 🎉', 'ok');
                    setTimeout(() => { this.render(); }, 1200);
                } else {
                    this.msg('Account created! Check your email to confirm, then sign in.', 'ok');
                }
            } else {
                const res = await cloud.signIn(email, pass);
                if (res.error) { this.msg(res.error, 'error'); btn.disabled = false; return; }
                this.msg('Signed in — your hub is synced. ✓', 'ok');
                setTimeout(() => { this.render(); }, 1000);
            }
        } catch (e) {
            this.msg(e.message || 'Something went wrong — please try again.', 'error');
            btn.disabled = false;
        }
    },

    async _signOut() {
        try { await window.VibeLyfCloud.signOut(); } catch (e) {}
        this._mode = 'signin';
        this.render();
    },

    async _syncNow() {
        this.msg('Saving…');
        try { await window.VibeLyfCloud.sync(); this.msg('Hub saved to your account. ✓', 'ok'); }
        catch (e) { this.msg('Save failed — try again.', 'error'); }
    },

    esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
};
