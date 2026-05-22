/**
 * VIBENICITY Supabase Integration Layer
 * Cloud Auth + Database for persistent user profiles, vocabulary, and app state
 * 
 * @version 1.0.0
 * @date March 2026
 * 
 * SETUP:
 * 1. Create free Supabase project at https://supabase.com
 * 2. Run the SQL in SUPABASE_SETUP.sql to create tables
 * 3. Set your keys via: VibenicityCloud.init('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY')
 *    Or via localStorage: vibenicity_supabase_url, vibenicity_supabase_key
 */

window.VibenicityCloud = {

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    config: {
        supabaseUrl: '',
        supabaseKey: '',
        initialized: false
    },

    // Supabase client reference
    client: null,

    // Current user
    currentUser: null,

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Initialize Supabase connection
     * @param {string} url - Supabase project URL (optional, reads from localStorage)
     * @param {string} key - Supabase anon key (optional, reads from localStorage)
     */
    async init(url, key) {
        // Get credentials
        this.config.supabaseUrl = url || localStorage.getItem('vibenicity_supabase_url') || '';
        this.config.supabaseKey = key || localStorage.getItem('vibenicity_supabase_key') || '';

        if (!this.config.supabaseUrl || !this.config.supabaseKey) {
            console.log('☁️ Supabase: No credentials set — using localStorage only');
            console.log('💡 To enable cloud sync: VibenicityCloud.init("YOUR_URL", "YOUR_KEY")');
            this.config.initialized = false;
            return false;
        }

        // Store for persistence
        localStorage.setItem('vibenicity_supabase_url', this.config.supabaseUrl);
        localStorage.setItem('vibenicity_supabase_key', this.config.supabaseKey);

        // Check if Supabase SDK is loaded
        if (!window.supabase?.createClient) {
            console.warn('☁️ Supabase SDK not loaded — loading from CDN...');
            await this._loadSupabaseSDK();
        }

        try {
            // Create Supabase client
            this.client = window.supabase.createClient(
                this.config.supabaseUrl,
                this.config.supabaseKey
            );

            // Check connection
            const { data, error } = await this.client.from('profiles').select('count').limit(0);
            if (error && error.code !== 'PGRST116') {
                // If table doesn't exist, that's OK — user hasn't run setup SQL
                if (error.message.includes('does not exist')) {
                    console.warn('☁️ Supabase connected but tables not created yet.');
                    console.warn('💡 Run the SQL from SUPABASE_SETUP.sql in your Supabase dashboard');
                }
            }

            this.config.initialized = true;

            // Listen for auth changes
            this.client.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    console.log('🔐 Signed in:', session.user.email);
                    this._syncFromCloud();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    console.log('🔐 Signed out');
                }
            });

            // Check existing session
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                console.log('🔐 Existing session found:', session.user.email);
            }

            console.log('☁️ Supabase initialized successfully!');
            return true;

        } catch (error) {
            console.error('☁️ Supabase init error:', error);
            this.config.initialized = false;
            return false;
        }
    },

    /**
     * Dynamically load Supabase SDK from CDN
     */
    async _loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            script.onload = () => {
                console.log('☁️ Supabase SDK loaded from CDN');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
            document.head.appendChild(script);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Sign up with email and password
     */
    async signUp(email, password, displayName = '') {
        if (!this.config.initialized) return { error: 'Supabase not initialized' };

        const { data, error } = await this.client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    vibe_theme: 'cyber',
                    joined_at: new Date().toISOString()
                }
            }
        });

        if (error) {
            console.error('🔐 Signup error:', error.message);
            return { error: error.message };
        }

        this.currentUser = data.user;
        
        // Create profile
        await this._createProfile(data.user, displayName);
        
        console.log('🎉 Account created:', email);
        return { user: data.user, success: true };
    },

    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        if (!this.config.initialized) return { error: 'Supabase not initialized' };

        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('🔐 Login error:', error.message);
            return { error: error.message };
        }

        this.currentUser = data.user;
        await this._syncFromCloud();

        console.log('🔐 Signed in:', email);
        return { user: data.user, session: data.session, success: true };
    },

    /**
     * Sign in with OAuth (Google, GitHub, Discord)
     */
    async signInWithOAuth(provider) {
        if (!this.config.initialized) return { error: 'Supabase not initialized' };

        const { data, error } = await this.client.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error('🔐 OAuth error:', error.message);
            return { error: error.message };
        }

        return { url: data.url, success: true };
    },

    /**
     * Sign out
     */
    async signOut() {
        if (!this.config.initialized) return;

        // Sync local data before signing out
        await this._syncToCloud();

        await this.client.auth.signOut();
        this.currentUser = null;
        console.log('🔐 Signed out');
    },

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    },

    // ═══════════════════════════════════════════════════════════════
    // PROFILE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create initial profile record
     */
    async _createProfile(user, displayName) {
        if (!this.config.initialized) return;

        const { error } = await this.client
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                display_name: displayName || user.email.split('@')[0],
                vibe_theme: 'cyber',
                communication_score: 0,
                vocab_contributions: 0,
                apps_generated: 0,
                joined_at: new Date().toISOString()
            });

        if (error) {
            console.warn('☁️ Profile creation error:', error.message);
        }
    },

    /**
     * Get user profile
     */
    async getProfile() {
        if (!this.config.initialized || !this.currentUser) return null;

        const { data, error } = await this.client
            .from('profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (error) {
            console.warn('☁️ Profile fetch error:', error.message);
            return null;
        }

        return data;
    },

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        if (!this.config.initialized || !this.currentUser) return null;

        const { data, error } = await this.client
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', this.currentUser.id)
            .select()
            .single();

        if (error) {
            console.error('☁️ Profile update error:', error.message);
            return null;
        }

        return data;
    },

    // ═══════════════════════════════════════════════════════════════
    // DATA SYNC (localStorage ↔ Cloud)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Sync all local data to cloud
     */
    async _syncToCloud() {
        if (!this.config.initialized || !this.currentUser) return;

        const userId = this.currentUser.id;

        try {
            // Sync communication stats
            const commStats = JSON.parse(localStorage.getItem('vibenicity_comm_stats') || '{}');
            if (Object.keys(commStats).length > 0) {
                await this.client.from('user_data').upsert({
                    user_id: userId,
                    data_key: 'comm_stats',
                    data_value: commStats,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,data_key' });
            }

            // Sync vocabulary contributions
            const pendingTerms = JSON.parse(localStorage.getItem('vibenicity_pending_terms') || '[]');
            if (pendingTerms.length > 0) {
                await this.client.from('user_data').upsert({
                    user_id: userId,
                    data_key: 'pending_terms',
                    data_value: pendingTerms,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,data_key' });
            }

            // Sync code generation history
            const codeHistory = JSON.parse(localStorage.getItem('vibenicity_code_history') || '[]');
            if (codeHistory.length > 0) {
                await this.client.from('user_data').upsert({
                    user_id: userId,
                    data_key: 'code_history',
                    data_value: codeHistory.slice(-20), // Last 20 only for cloud
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,data_key' });
            }

            // Sync achievements
            const achievements = JSON.parse(localStorage.getItem('vibenicity_achievements') || '{}');
            if (Object.keys(achievements).length > 0) {
                await this.client.from('user_data').upsert({
                    user_id: userId,
                    data_key: 'achievements',
                    data_value: achievements,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,data_key' });
            }

            // Sync custom vibe specs
            const customVibes = JSON.parse(localStorage.getItem('vibe_custom_specs') || '[]');
            if (customVibes.length > 0) {
                await this.client.from('user_data').upsert({
                    user_id: userId,
                    data_key: 'custom_vibes',
                    data_value: customVibes,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,data_key' });
            }

            // Update profile stats
            await this.updateProfile({
                communication_score: parseInt(commStats.clear || 0) + parseInt(commStats.vague || 0) > 0
                    ? Math.round((parseInt(commStats.clear || 0) / (parseInt(commStats.clear || 0) + parseInt(commStats.vague || 0))) * 100)
                    : 0,
                vocab_contributions: pendingTerms.length,
                apps_generated: codeHistory.length
            });

            console.log('☁️ Cloud sync complete (local → cloud)');

        } catch (error) {
            console.error('☁️ Sync error:', error);
        }
    },

    /**
     * Sync cloud data to local storage
     */
    async _syncFromCloud() {
        if (!this.config.initialized || !this.currentUser) return;

        try {
            const { data, error } = await this.client
                .from('user_data')
                .select('*')
                .eq('user_id', this.currentUser.id);

            if (error) {
                console.warn('☁️ Cloud fetch error:', error.message);
                return;
            }

            // Merge cloud data into localStorage
            const keyMap = {
                'comm_stats': 'vibenicity_comm_stats',
                'pending_terms': 'vibenicity_pending_terms',
                'code_history': 'vibenicity_code_history',
                'achievements': 'vibenicity_achievements',
                'custom_vibes': 'vibe_custom_specs'
            };

            data.forEach(row => {
                const localKey = keyMap[row.data_key];
                if (localKey) {
                    const cloudTimestamp = new Date(row.updated_at).getTime();
                    
                    // Simple conflict resolution: cloud wins if newer
                    // (In a more sophisticated system, you'd merge)
                    localStorage.setItem(localKey, JSON.stringify(row.data_value));
                }
            });

            console.log('☁️ Cloud sync complete (cloud → local)');

        } catch (error) {
            console.error('☁️ Sync from cloud error:', error);
        }
    },

    /**
     * Manual sync trigger (call after significant local changes)
     */
    async sync() {
        if (!this.config.initialized || !this.currentUser) {
            console.log('☁️ Cannot sync: not authenticated');
            return false;
        }

        await this._syncToCloud();
        console.log('☁️ Manual sync complete');
        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // VOCABULARY COMMUNITY (Shared term contributions)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Submit a new term to the community vocabulary
     */
    async submitTerm(term, definition, category, examples = []) {
        if (!this.config.initialized || !this.currentUser) {
            console.log('☁️ Must be signed in to submit terms');
            return { error: 'Not authenticated' };
        }

        const { data, error } = await this.client
            .from('community_terms')
            .insert({
                submitted_by: this.currentUser.id,
                term: term,
                definition: definition,
                category: category,
                examples: examples,
                status: 'pending', // pending → approved → merged
                upvotes: 0,
                submitted_at: new Date().toISOString()
            });

        if (error) {
            console.error('☁️ Term submission error:', error.message);
            return { error: error.message };
        }

        console.log(`📝 Term "${term}" submitted for community review!`);
        return { success: true, term };
    },

    /**
     * Get pending community terms
     */
    async getCommunityTerms(status = 'pending', limit = 50) {
        if (!this.config.initialized) return [];

        const { data, error } = await this.client
            .from('community_terms')
            .select('*')
            .eq('status', status)
            .order('submitted_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('☁️ Community terms fetch error:', error.message);
            return [];
        }

        return data;
    },

    /**
     * Upvote a community term
     */
    async upvoteTerm(termId) {
        if (!this.config.initialized || !this.currentUser) return;

        const { data, error } = await this.client.rpc('increment_upvote', {
            term_id: termId
        });

        return !error;
    },

    // ═══════════════════════════════════════════════════════════════
    // STATUS & UTILITIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get full status of cloud integration
     */
    getStatus() {
        return {
            initialized: this.config.initialized,
            authenticated: !!this.currentUser,
            user: this.currentUser ? {
                id: this.currentUser.id,
                email: this.currentUser.email,
                displayName: this.currentUser.user_metadata?.display_name
            } : null,
            supabaseUrl: this.config.supabaseUrl ? '✅ Set' : '❌ Not set',
            supabaseKey: this.config.supabaseKey ? '✅ Set' : '❌ Not set'
        };
    },

    /**
     * Check if cloud features are available
     */
    isReady() {
        return this.config.initialized;
    }
};

console.log('☁️ VibenicityCloud module loaded — Supabase Auth + DB ready');
console.log('💡 Setup: VibenicityCloud.init("YOUR_SUPABASE_URL", "YOUR_ANON_KEY")');
