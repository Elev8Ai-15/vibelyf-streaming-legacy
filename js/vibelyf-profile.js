/**
 * VIBELYF User Profile System
 * Visual profile panel with vibe customization, stats, and cloud sync
 * 
 * Works in two modes:
 * - Offline: localStorage-based guest profile
 * - Cloud: Supabase-backed persistent profile (when VibeLyfCloud is connected)
 * 
 * @version 1.0.0
 * @date March 2026
 */

window.VibeLyfProfile = {

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    profile: {
        displayName: 'Vibe Creator',
        email: '',
        avatarEmoji: '🎨',
        bio: '',
        vibeTheme: 'cyber',
        level: 1,
        xp: 0,
        joinedAt: null,
        stats: {
            appsGenerated: 0,
            termsLearned: 0,
            vocabContributions: 0,
            communicationScore: 0,
            voiceMessages: 0,
            daysActive: 1
        }
    },

    panelVisible: false,
    STORAGE_KEY: 'vibelyf_profile',

    // Available vibe themes with preview colors
    vibeThemes: {
        cyber:    { name: 'Cyber', emoji: '🌐', primary: '#00e5ff', secondary: '#7c4dff', bg: '#0a0a1a' },
        fire:     { name: 'Fire', emoji: '🔥', primary: '#ff6b35', secondary: '#ff0000', bg: '#1a0a0a' },
        ice:      { name: 'Ice', emoji: '❄️', primary: '#00bcd4', secondary: '#e0f7fa', bg: '#0a1a1e' },
        neon:     { name: 'Neon', emoji: '💜', primary: '#e040fb', secondary: '#00e676', bg: '#0d0d1a' },
        luxury:   { name: 'Luxury', emoji: '✨', primary: '#ffd700', secondary: '#c0c0c0', bg: '#1a1a0a' },
        kawaii:   { name: 'Kawaii', emoji: '🌸', primary: '#ff69b4', secondary: '#ffb6c1', bg: '#1a0a14' },
        matrix:   { name: 'Matrix', emoji: '💚', primary: '#00ff41', secondary: '#003300', bg: '#0a0a0a' },
        ocean:    { name: 'Ocean', emoji: '🌊', primary: '#0277bd', secondary: '#4dd0e1', bg: '#0a0f1a' },
        sunset:   { name: 'Sunset', emoji: '🌅', primary: '#ff7043', secondary: '#ffc107', bg: '#1a0f0a' },
        aurora:   { name: 'Aurora', emoji: '🌌', primary: '#7c4dff', secondary: '#00e5ff', bg: '#0a0a1a' },
        brutalist:{ name: 'Brutalist', emoji: '🏗️', primary: '#ffffff', secondary: '#ff0000', bg: '#000000' },
        minimal:  { name: 'Minimal', emoji: '⚪', primary: '#546e7a', secondary: '#eceff1', bg: '#fafafa' }
    },

    // XP Levels
    levelThresholds: [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000],

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    init() {
        this.loadProfile();
        this.createProfileButton();
        this.createProfilePanel();
        this.refreshStats();
        console.log('👤 Profile System initialized:', this.profile.displayName);
    },

    /**
     * Load profile from localStorage or cloud
     */
    loadProfile() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.profile = { ...this.profile, ...parsed };
            } else {
                // First visit — set defaults
                this.profile.joinedAt = new Date().toISOString();
                this.saveProfile();
            }
        } catch (e) {
            console.warn('👤 Profile load error:', e);
        }
    },

    /**
     * Save profile to localStorage
     */
    saveProfile() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
        } catch (e) {
            console.warn('👤 Profile save error:', e);
        }
    },

    /**
     * Refresh stats from other systems
     */
    refreshStats() {
        // Communication score
        if (window.VibeLyfCommunicationScore) {
            this.profile.stats.communicationScore = window.VibeLyfCommunicationScore.getScore();
        }

        // Code history
        try {
            const history = JSON.parse(localStorage.getItem('vibelyf_code_history') || '[]');
            this.profile.stats.appsGenerated = history.length;
        } catch (e) {}

        // Vocabulary
        try {
            const pending = JSON.parse(localStorage.getItem('vibelyf_pending_terms') || '[]');
            const session = JSON.parse(localStorage.getItem('vibelyf_session_vocab') || '{}');
            this.profile.stats.termsLearned = Object.keys(session).length;
            this.profile.stats.vocabContributions = pending.length;
        } catch (e) {}

        // Voice
        try {
            const voice = JSON.parse(localStorage.getItem('vibelyf_voice_stats') || '{}');
            this.profile.stats.voiceMessages = voice.totalMessages || 0;
        } catch (e) {}

        // Days active
        if (this.profile.joinedAt) {
            const daysSinceJoin = Math.max(1, Math.ceil((Date.now() - new Date(this.profile.joinedAt).getTime()) / 86400000));
            this.profile.stats.daysActive = daysSinceJoin;
        }

        // Calculate XP and level
        this.calculateXP();
        this.saveProfile();
    },

    /**
     * Calculate XP from stats
     */
    calculateXP() {
        const s = this.profile.stats;
        this.profile.xp = 
            (s.appsGenerated * 25) +
            (s.termsLearned * 10) +
            (s.vocabContributions * 15) +
            (s.voiceMessages * 5) +
            (s.daysActive * 3) +
            (s.communicationScore * 2);

        // Calculate level
        this.profile.level = 1;
        for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
            if (this.profile.xp >= this.levelThresholds[i]) {
                this.profile.level = i + 1;
                break;
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UI: PROFILE BUTTON (Persistent in top-right)
    // ═══════════════════════════════════════════════════════════════

    createProfileButton() {
        if (document.getElementById('vibeProfileBtn')) return;

        const btn = document.createElement('div');
        btn.id = 'vibeProfileBtn';
        btn.innerHTML = `
            <div style="
                position: fixed;
                top: 14px;
                right: 14px;
                z-index: 999;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(139,92,246,0.8), rgba(0,229,255,0.8));
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 22px;
                box-shadow: 0 0 20px rgba(139,92,246,0.4);
                transition: all 0.3s ease;
                border: 2px solid rgba(255,255,255,0.15);
            " onclick="VibeLyfProfile.togglePanel()" 
               onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 0 30px rgba(139,92,246,0.6)'" 
               onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 0 20px rgba(139,92,246,0.4)'">
                ${this.profile.avatarEmoji}
            </div>
        `;
        document.body.appendChild(btn);
    },

    // ═══════════════════════════════════════════════════════════════
    // UI: PROFILE PANEL (Slide-out)
    // ═══════════════════════════════════════════════════════════════

    createProfilePanel() {
        if (document.getElementById('vibeProfilePanel')) return;

        const panel = document.createElement('div');
        panel.id = 'vibeProfilePanel';
        panel.style.cssText = `
            position: fixed;
            top: 0;
            right: -380px;
            width: 370px;
            height: 100vh;
            background: rgba(10, 10, 26, 0.97);
            backdrop-filter: blur(20px);
            border-left: 1px solid rgba(139, 92, 246, 0.3);
            z-index: 1000;
            transition: right 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            overflow-y: auto;
            font-family: 'Inter', sans-serif;
            color: white;
        `;
        panel.innerHTML = this._buildPanelHTML();
        document.body.appendChild(panel);

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'vibeProfileBackdrop';
        backdrop.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 999;
            display: none; backdrop-filter: blur(3px);
        `;
        backdrop.onclick = () => this.togglePanel();
        document.body.appendChild(backdrop);
    },

    _buildPanelHTML() {
        const p = this.profile;
        const theme = this.vibeThemes[p.vibeTheme] || this.vibeThemes.cyber;
        const nextLevelXP = this.levelThresholds[p.level] || this.levelThresholds[this.levelThresholds.length - 1];
        const prevLevelXP = this.levelThresholds[p.level - 1] || 0;
        const xpProgress = Math.min(100, ((p.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100);
        const cloudUser = window.VibeLyfCloud?.getUser();

        return `
            <div style="padding: 24px;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        MY VIBE PROFILE
                    </h2>
                    <button onclick="VibeLyfProfile.togglePanel()" style="
                        background: rgba(255,255,255,0.1); border: none; color: white;
                        width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
                        font-size: 16px; transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">&times;</button>
                </div>
                
                <!-- Avatar & Name -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="
                        width: 80px; height: 80px; border-radius: 50%;
                        background: linear-gradient(135deg, ${theme.primary}33, ${theme.secondary}33);
                        border: 3px solid ${theme.primary}; margin: 0 auto 12px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 40px; cursor: pointer;
                    " onclick="VibeLyfProfile.changeAvatar()" title="Click to change avatar">
                        ${p.avatarEmoji}
                    </div>
                    <div contenteditable="true" id="profileDisplayName" style="
                        font-size: 20px; font-weight: 700; outline: none;
                        border-bottom: 2px solid transparent; padding: 4px;
                        transition: border-color 0.2s;
                    " onfocus="this.style.borderBottomColor='${theme.primary}'" 
                       onblur="this.style.borderBottomColor='transparent'; VibeLyfProfile.updateName(this.textContent)"
                    >${p.displayName}</div>
                    <div style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 4px;">
                        ${cloudUser ? `🔐 ${cloudUser.email}` : '⚪ Guest — /login to sync'}
                    </div>
                </div>
                
                <!-- Level & XP -->
                <div style="
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px; padding: 16px; margin-bottom: 20px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600;">Level ${p.level}</span>
                        <span style="font-size: 12px; color: rgba(255,255,255,0.5);">${p.xp} / ${nextLevelXP} XP</span>
                    </div>
                    <div style="
                        width: 100%; height: 8px; border-radius: 4px;
                        background: rgba(255,255,255,0.08);
                    ">
                        <div style="
                            width: ${xpProgress}%; height: 100%; border-radius: 4px;
                            background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
                            transition: width 0.5s ease;
                        "></div>
                    </div>
                </div>
                
                <!-- Stats Grid -->
                <div style="
                    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
                    margin-bottom: 20px;
                ">
                    ${this._statCard('🚀', 'Apps Built', p.stats.appsGenerated)}
                    ${this._statCard('📊', 'Comm Score', p.stats.communicationScore + '%')}
                    ${this._statCard('🗣️', 'Terms Learned', p.stats.termsLearned)}
                    ${this._statCard('📝', 'Contributions', p.stats.vocabContributions)}
                    ${this._statCard('🎤', 'Voice Msgs', p.stats.voiceMessages)}
                    ${this._statCard('📅', 'Days Active', p.stats.daysActive)}
                </div>
                
                <!-- Vibe Theme Picker -->
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: rgba(255,255,255,0.7);">
                        🎨 VIBE THEME
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                        ${Object.entries(this.vibeThemes).map(([key, t]) => `
                            <div onclick="VibeLyfProfile.setTheme('${key}')" style="
                                padding: 8px 4px; border-radius: 8px; text-align: center; cursor: pointer;
                                background: ${p.vibeTheme === key ? `linear-gradient(135deg, ${t.primary}22, ${t.secondary}22)` : 'rgba(255,255,255,0.03)'};
                                border: 1px solid ${p.vibeTheme === key ? t.primary : 'rgba(255,255,255,0.06)'};
                                transition: all 0.2s;
                            " onmouseover="this.style.borderColor='${t.primary}'" 
                               onmouseout="this.style.borderColor='${p.vibeTheme === key ? t.primary : 'rgba(255,255,255,0.06)'}'"
                            >
                                <div style="font-size: 18px;">${t.emoji}</div>
                                <div style="font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 2px;">${t.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Bio -->
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: rgba(255,255,255,0.7);">📝 BIO</h3>
                    <textarea id="profileBio" placeholder="Tell the world your vibe..." style="
                        width: 100%; min-height: 60px; padding: 10px; border-radius: 8px;
                        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                        color: white; font-family: 'Inter', sans-serif; font-size: 13px;
                        resize: vertical; outline: none;
                    " onblur="VibeLyfProfile.updateBio(this.value)">${p.bio}</textarea>
                </div>
                
                <!-- Actions -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${cloudUser ? `
                        <button onclick="VibeLyfCloud.sync().then(() => VibeLyfProfile.refreshAndRender())" style="
                            padding: 10px; border-radius: 8px; background: rgba(139,92,246,0.2);
                            border: 1px solid rgba(139,92,246,0.3); color: #a78bfa;
                            font-weight: 600; cursor: pointer; transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(139,92,246,0.3)'" onmouseout="this.style.background='rgba(139,92,246,0.2)'">
                            ☁️ Sync to Cloud
                        </button>
                        <button onclick="VibeLyfCloud.signOut().then(() => VibeLyfProfile.refreshAndRender())" style="
                            padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.05);
                            border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);
                            cursor: pointer; transition: all 0.2s;
                        ">🔓 Sign Out</button>
                    ` : `
                        <button onclick="document.getElementById('chatInput').value='/cloud'; document.getElementById('chatInput').focus(); VibeLyfProfile.togglePanel();" style="
                            padding: 10px; border-radius: 8px; background: rgba(139,92,246,0.2);
                            border: 1px solid rgba(139,92,246,0.3); color: #a78bfa;
                            font-weight: 600; cursor: pointer; transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(139,92,246,0.3)'" onmouseout="this.style.background='rgba(139,92,246,0.2)'">
                            ☁️ Connect Cloud Account
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    _statCard(emoji, label, value) {
        return `
            <div style="
                padding: 12px; border-radius: 10px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
                text-align: center;
            ">
                <div style="font-size: 20px;">${emoji}</div>
                <div style="font-size: 18px; font-weight: 700; margin: 4px 0;">${value}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.5);">${label}</div>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════

    togglePanel() {
        this.panelVisible = !this.panelVisible;
        const panel = document.getElementById('vibeProfilePanel');
        const backdrop = document.getElementById('vibeProfileBackdrop');

        if (this.panelVisible) {
            this.refreshStats();
            panel.innerHTML = this._buildPanelHTML();
            panel.style.right = '0';
            backdrop.style.display = 'block';
        } else {
            panel.style.right = '-380px';
            backdrop.style.display = 'none';
        }
    },

    refreshAndRender() {
        this.refreshStats();
        const panel = document.getElementById('vibeProfilePanel');
        if (panel && this.panelVisible) {
            panel.innerHTML = this._buildPanelHTML();
        }
    },

    updateName(name) {
        if (name && name.trim()) {
            this.profile.displayName = name.trim().substring(0, 30);
            this.saveProfile();
        }
    },

    updateBio(bio) {
        this.profile.bio = (bio || '').substring(0, 200);
        this.saveProfile();
    },

    setTheme(themeKey) {
        if (this.vibeThemes[themeKey]) {
            this.profile.vibeTheme = themeKey;
            this.saveProfile();

            // Apply theme to CSS custom properties
            const theme = this.vibeThemes[themeKey];
            const r = document.documentElement;
            r.style.setProperty('--profile-primary', theme.primary);
            r.style.setProperty('--profile-secondary', theme.secondary);

            // Re-render panel
            this.refreshAndRender();
            console.log(`🎨 Vibe theme set to: ${theme.name} ${theme.emoji}`);
        }
    },

    changeAvatar() {
        const emojis = ['🎨', '🚀', '💎', '🔥', '❄️', '🌊', '🌸', '💜', '🌟', '⚡', '🎮', '🎵', '👑', '🦄', '🐉', '🌈', '🍀', '🎯', '🧠', '💫'];
        const current = emojis.indexOf(this.profile.avatarEmoji);
        this.profile.avatarEmoji = emojis[(current + 1) % emojis.length];
        this.saveProfile();

        // Update button
        const btn = document.querySelector('#vibeProfileBtn div');
        if (btn) btn.textContent = this.profile.avatarEmoji;

        // Re-render panel
        this.refreshAndRender();
    },

    /**
     * Add XP for an action
     */
    addXP(amount, reason = '') {
        this.profile.xp += amount;
        this.calculateXP();
        this.saveProfile();
        if (reason) {
            console.log(`⭐ +${amount} XP: ${reason}`);
        }
    },

    /**
     * Get profile data (for external use)
     */
    getProfile() {
        return { ...this.profile };
    }
};

console.log('👤 VibeLyfProfile module loaded');
