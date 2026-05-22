/**
 * CultrVibe Profile System
 * 
 * Allows users to select their cultural/linguistic profile for optimized
 * language processing, translation, and culturally-aligned responses.
 * 
 * Features:
 * - Profile selection at startup
 * - Categorized knowledge base by culture
 * - Fast profile-specific searches
 * - Culturally-aligned translations
 * - Profile switching without reload
 * 
 * Profiles:
 * - African American (AAVE/Ebonics)
 * - Latin American (Chicano/Spanglish)
 * - Asian American (ABG/FOB/Hybrid)
 * - Southern (Country/Rural)
 * - Internet (Digital Native)
 * - Universal (All profiles)
 * 
 * @version 1.0.0
 * @date 2025-11-19
 * @author VibeCoder Team
 */

class CultrVibeProfileSystem {
    constructor() {
        // Profile definitions with cultural metadata
        this.profiles = {
            african_american: {
                id: 'african_american',
                name: 'African American',
                displayName: '🎤 African American',
                culturalContext: 'AAVE/Ebonics',
                description: 'African American Vernacular English - Urban, expressive, grammatically rich',
                languages: ['aave'],
                primaryDatabase: 'aave',
                voicePersonality: 'street',
                musicPreference: 'hiphop',
                emoji: '🎤',
                color: '#8b5cf6',
                keywords: ['yo', 'finna', 'lit', 'cap', 'bussin', 'snatched', 'woke', 'shade']
            },
            latin_american: {
                id: 'latin_american',
                name: 'Latin American',
                displayName: '🌮 Latin American',
                culturalContext: 'Chicano/Spanglish',
                description: 'Latino/Chicano English - Code-switching, hybrid identity, vibrant',
                languages: ['latino', 'chicano'],
                primaryDatabase: 'latino',
                voicePersonality: 'excited',
                musicPreference: 'latin',
                emoji: '🌮',
                color: '#ec4899',
                keywords: ['vato', 'orale', 'chido', 'güey', 'ese', 'dale', 'no mames']
            },
            asian_american: {
                id: 'asian_american',
                name: 'Asian American',
                displayName: '🎋 Asian American',
                culturalContext: 'ABG/FOB/Hybrid',
                description: 'Asian American identity - Navigating heritage and American culture',
                languages: ['asian'],
                primaryDatabase: 'asian',
                voicePersonality: 'professional',
                musicPreference: 'electronic',
                emoji: '🎋',
                color: '#06b6d4',
                keywords: ['ABG', 'FOB', 'boba', 'banana', 'whitewashed']
            },
            southern: {
                id: 'southern',
                name: 'Southern',
                displayName: '🤠 Southern',
                culturalContext: 'Country/Rural',
                description: 'Southern American English - Warm, expressive, rural traditions',
                languages: ['southern', 'country'],
                primaryDatabase: 'southern',
                voicePersonality: 'encouraging',
                musicPreference: 'country',
                emoji: '🤠',
                color: '#f59e0b',
                keywords: ["y'all", "fixin' to", 'bless your heart', 'reckon', 'howdy']
            },
            internet: {
                id: 'internet',
                name: 'Internet',
                displayName: '💻 Internet',
                culturalContext: 'Digital Native',
                description: 'Internet slang - Gaming, social media, meme culture',
                languages: ['internet'],
                primaryDatabase: 'internet',
                voicePersonality: 'excited',
                musicPreference: 'electronic',
                emoji: '💻',
                color: '#10b981',
                keywords: ['sus', 'simp', 'stan', 'yeet', 'vibe', 'ghosting', 'flexing']
            },
            universal: {
                id: 'universal',
                name: 'Universal',
                displayName: '🌍 Universal',
                culturalContext: 'All Cultures',
                description: 'All cultural contexts - Maximum understanding across all dialects',
                languages: ['aave', 'latino', 'asian', 'southern', 'internet', 'elitist'],
                primaryDatabase: null, // Uses all databases
                voicePersonality: 'professional',
                musicPreference: 'focus',
                emoji: '🌍',
                color: '#64748b',
                keywords: [] // Uses all keywords
            }
        };
        
        // Current active profile
        this.activeProfile = this.loadProfile() || 'universal';
        
        // Profile-specific knowledge base indexes
        this.profileIndexes = this.buildProfileIndexes();
        
        // Search cache for performance
        this.searchCache = new Map();
        
        // First-time user flag
        this.isFirstTime = !localStorage.getItem('cultrvibe_profile_selected');
        
        console.log('🎯 CultrVibe Profile System initialized', {
            activeProfile: this.activeProfile,
            isFirstTime: this.isFirstTime,
            profiles: Object.keys(this.profiles).length
        });
    }
    
    /**
     * Build optimized indexes for each profile
     * Enables fast profile-specific searches
     */
    buildProfileIndexes() {
        const indexes = {};
        
        Object.entries(this.profiles).forEach(([profileId, profile]) => {
            indexes[profileId] = {
                terms: new Map(),
                categories: new Map(),
                keywords: new Set(profile.keywords)
            };
            
            // Index terms from profile's databases
            if (profile.primaryDatabase) {
                const dbName = profile.primaryDatabase + 'Slang';
                const database = window[dbName] || [];
                
                database.forEach(entry => {
                    // Index by term
                    indexes[profileId].terms.set(entry.term.toLowerCase(), entry);
                    
                    // Index by category
                    if (!indexes[profileId].categories.has(entry.category)) {
                        indexes[profileId].categories.set(entry.category, []);
                    }
                    indexes[profileId].categories.get(entry.category).push(entry);
                });
            } else if (profileId === 'universal') {
                // Universal indexes all databases
                const allDatabases = [
                    'aaveSlang', 'southernSlang', 'latinoSlang', 
                    'asianSlang', 'elitistLanguage', 'internetSlang'
                ];
                
                allDatabases.forEach(dbName => {
                    const database = window[dbName] || [];
                    database.forEach(entry => {
                        indexes[profileId].terms.set(entry.term.toLowerCase(), entry);
                        if (!indexes[profileId].categories.has(entry.category)) {
                            indexes[profileId].categories.set(entry.category, []);
                        }
                        indexes[profileId].categories.get(entry.category).push(entry);
                    });
                });
            }
        });
        
        console.log('📊 Profile indexes built:', {
            profiles: Object.keys(indexes).length,
            totalTerms: Array.from(Object.values(indexes)).reduce((sum, idx) => sum + idx.terms.size, 0)
        });
        
        return indexes;
    }
    
    /**
     * Get list of available profiles
     */
    getProfiles() {
        return Object.values(this.profiles);
    }
    
    /**
     * Get current active profile
     */
    getActiveProfile() {
        return this.profiles[this.activeProfile];
    }
    
    /**
     * Set active profile
     */
    setProfile(profileId) {
        if (!this.profiles[profileId]) {
            console.error('Invalid profile ID:', profileId);
            return false;
        }
        
        this.activeProfile = profileId;
        this.saveProfile(profileId);
        
        // Clear search cache when profile changes
        this.searchCache.clear();
        
        // Apply profile preferences
        this.applyProfilePreferences();
        
        console.log('✅ Profile changed to:', this.profiles[profileId].name);
        
        // Dispatch event for UI updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cultrvibe:profile-changed', {
                detail: { profile: this.profiles[profileId] }
            }));
        }
        
        return true;
    }
    
    /**
     * Apply profile-specific preferences to other systems
     */
    applyProfilePreferences() {
        const profile = this.getActiveProfile();
        
        // Apply voice personality
        if (window.voiceService && profile.voicePersonality) {
            try {
                window.voiceService.setVoicePersonality(profile.voicePersonality);
            } catch (error) {
                console.warn('Could not set voice personality:', error);
            }
        }
        
        // Apply music preference
        if (window.musicPlayer && profile.musicPreference) {
            try {
                window.musicPlayer.changePlaylist(profile.musicPreference);
            } catch (error) {
                console.warn('Could not set music playlist:', error);
            }
        }
    }
    
    /**
     * Fast profile-specific term lookup
     */
    lookupTerm(term) {
        const lowerTerm = term.toLowerCase();
        const index = this.profileIndexes[this.activeProfile];
        
        if (!index) return null;
        
        return index.terms.get(lowerTerm) || null;
    }
    
    /**
     * Search terms in active profile
     */
    searchTerms(query, options = {}) {
        const cacheKey = `${this.activeProfile}:${query}:${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }
        
        const index = this.profileIndexes[this.activeProfile];
        if (!index) return [];
        
        const lowerQuery = query.toLowerCase();
        const results = [];
        
        // Search terms
        index.terms.forEach((entry, term) => {
            if (term.includes(lowerQuery) || 
                entry.meaning.toLowerCase().includes(lowerQuery) ||
                (entry.context && entry.context.toLowerCase().includes(lowerQuery))) {
                results.push({
                    ...entry,
                    matchType: term.includes(lowerQuery) ? 'term' : 'meaning'
                });
            }
        });
        
        // Sort by relevance
        results.sort((a, b) => {
            if (a.matchType === 'term' && b.matchType !== 'term') return -1;
            if (a.matchType !== 'term' && b.matchType === 'term') return 1;
            return b.confidence - a.confidence;
        });
        
        // Limit results if specified
        const limited = options.limit ? results.slice(0, options.limit) : results;
        
        // Cache results
        this.searchCache.set(cacheKey, limited);
        
        return limited;
    }
    
    /**
     * Get terms by category in active profile
     */
    getTermsByCategory(category) {
        const index = this.profileIndexes[this.activeProfile];
        if (!index) return [];
        
        return index.categories.get(category) || [];
    }
    
    /**
     * Get all categories in active profile
     */
    getCategories() {
        const index = this.profileIndexes[this.activeProfile];
        if (!index) return [];
        
        return Array.from(index.categories.keys());
    }
    
    /**
     * Translate text using active profile
     */
    translateText(text) {
        const words = text.split(/\s+/);
        const translations = [];
        
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w\s'-]/g, '');
            const entry = this.lookupTerm(cleanWord);
            
            if (entry) {
                translations.push({
                    original: word,
                    translation: entry.meaning,
                    confidence: entry.confidence,
                    context: entry.context
                });
            }
        });
        
        return translations;
    }
    
    /**
     * Get profile statistics
     */
    getProfileStats() {
        const profile = this.getActiveProfile();
        const index = this.profileIndexes[this.activeProfile];
        
        if (!index) return null;
        
        return {
            profile: profile.name,
            totalTerms: index.terms.size,
            categories: index.categories.size,
            keywords: index.keywords.size,
            averageConfidence: this.calculateAverageConfidence(index)
        };
    }
    
    /**
     * Calculate average confidence across profile's terms
     */
    calculateAverageConfidence(index) {
        let sum = 0;
        let count = 0;
        
        index.terms.forEach(entry => {
            sum += entry.confidence;
            count++;
        });
        
        return count > 0 ? sum / count : 0;
    }
    
    /**
     * Check if user is first-time
     */
    isFirstTimeUser() {
        return this.isFirstTime;
    }
    
    /**
     * Mark profile as selected (no longer first-time)
     */
    markProfileSelected() {
        localStorage.setItem('cultrvibe_profile_selected', 'true');
        this.isFirstTime = false;
    }
    
    /**
     * Save profile to localStorage
     */
    saveProfile(profileId) {
        try {
            localStorage.setItem('cultrvibe_active_profile', profileId);
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    }
    
    /**
     * Load profile from localStorage
     */
    loadProfile() {
        try {
            return localStorage.getItem('cultrvibe_active_profile');
        } catch (error) {
            console.error('Failed to load profile:', error);
            return null;
        }
    }
    
    /**
     * Reset to first-time state
     */
    resetProfile() {
        localStorage.removeItem('cultrvibe_profile_selected');
        localStorage.removeItem('cultrvibe_active_profile');
        this.activeProfile = 'universal';
        this.isFirstTime = true;
        console.log('🔄 Profile reset to first-time state');
    }
    
    /**
     * Get profile recommendations based on input
     */
    recommendProfile(text) {
        const scores = {};
        
        Object.entries(this.profiles).forEach(([profileId, profile]) => {
            if (profileId === 'universal') return; // Skip universal
            
            let score = 0;
            profile.keywords.forEach(keyword => {
                if (text.toLowerCase().includes(keyword)) {
                    score += 1;
                }
            });
            
            if (score > 0) {
                scores[profileId] = {
                    profile: profile,
                    score: score,
                    matches: profile.keywords.filter(kw => text.toLowerCase().includes(kw))
                };
            }
        });
        
        // Sort by score
        const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
        
        return sorted.length > 0 ? sorted[0].profile : null;
    }
    
    /**
     * Get current state for debugging
     */
    getState() {
        return {
            activeProfile: this.activeProfile,
            profileName: this.getActiveProfile().name,
            isFirstTime: this.isFirstTime,
            totalProfiles: Object.keys(this.profiles).length,
            stats: this.getProfileStats()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CultrVibeProfileSystem;
}
