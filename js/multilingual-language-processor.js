/**
 * Multilingual Language Processor - Global Slang & Language Support
 * 
 * Extends AdvancedLanguageProcessor to support multiple languages and slang systems:
 * - AAVE (African American Vernacular English) - already supported
 * - Asian slang (Chinese, Japanese, Korean)
 * - Hispanic slang and Spanglish
 * - Country/Southern US slang
 * - British/UK slang
 * - Caribbean/Patois
 * - General internet slang
 * 
 * Features:
 * - Automatic language detection
 * - Multi-database routing
 * - Cultural context preservation
 * - Code-switching support
 * - Bilingual processing
 * 
 * @extends AdvancedLanguageProcessor
 * @version 1.0.0
 * @date 2025-11-19
 * @author VibeCoder Team
 */

class MultilingualLanguageProcessor extends AdvancedLanguageProcessor {
    /**
     * Initialize multilingual processor
     */
    constructor() {
        super();
        
        // Language detection patterns
        this.languagePatterns = this.initLanguagePatterns();
        
        // Load multilingual slang databases
        this.slangDatabases = {
            aave: this.loadAAVESlang(),
            southern: this.loadSouthernSlang(),
            latino: this.loadLatinoSlang(),
            asian: this.loadAsianSlang(),
            elitist: this.loadElitistLanguage(),
            internet: this.loadInternetSlang()
        };
        
        // Language-specific feature extractors
        this.featureExtractors = this.initFeatureExtractors();
        
        // Current detected languages
        this.detectedLanguages = [];
        
        // Language preference (user can override detection)
        this.preferredLanguage = this.loadPreference('language', 'auto');
        
        console.log('🌍 MultilingualLanguageProcessor initialized', {
            databases: Object.keys(this.slangDatabases).length,
            languages: Object.keys(this.languagePatterns).length
        });
    }
    
    /**
     * Initialize language detection patterns
     */
    initLanguagePatterns() {
        return {
            // AAVE markers
            aave: {
                markers: [
                    /\b(finna|gonna|wanna|gotta)\b/i,
                    /\b(lowkey|highkey|deadass|cap|no cap)\b/i,
                    /\b(yo|ayo|bruh|fam|homie)\b/i,
                    /\b(be\s+\w+ing)\b/i, // habitual be
                    /\b(ain't|don't\s+be|didn't\s+be)\b/i
                ],
                weight: 2.0,
                name: 'African American Vernacular English'
            },
            
            // Asian slang markers (Chinese/Japanese/Korean loanwords)
            asian: {
                markers: [
                    /\b(kawaii|sugoi|nani|baka|senpai|waifu|weeb)\b/i,
                    /\b(daebak|oppa|unnie|aegyo|chaebol)\b/i,
                    /\b(lah|lor|wah|sia|alamak)\b/i, // Singlish
                    /\b(aiyah|ganbatte|itadakimasu)\b/i
                ],
                weight: 1.5,
                name: 'Asian Slang & Loanwords'
            },
            
            // Latino/Chicano markers
            latino: {
                markers: [
                    /\b(vato|ese|güey|chingón|chido)\b/i,
                    /\b(dale|qué onda|buena onda|ándale|orale)\b/i,
                    /\b(no mames|pinche|cabrón)\b/i,
                    /\b(papi|mami|mi amor|mi vida)\b/i,
                    /[¿¡]/g // Spanish punctuation
                ],
                weight: 2.0,
                name: 'Latino/Chicano Slang & Spanglish'
            },
            
            // Southern US
            southern: {
                markers: [
                    /\b(y'all|ain't|fixin' to|reckon)\b/i,
                    /\b(howdy|yonder|holler|tarnation)\b/i,
                    /\b(bless your heart|might could|used to could)\b/i,
                    /\b(dadgum|dagnabbit|catawampus|doohickey)\b/i
                ],
                weight: 1.5,
                name: 'Southern/Country US'
            },
            
            // Elitist language
            elitist: {
                markers: [
                    /\b(highbrow|snob|parvenu|bourgeois|plebeian)\b/i,
                    /\b(sophisticated|refined|cultured|aristocratic)\b/i,
                    /\b(pretentious|affected|grandiose)\b/i
                ],
                weight: 1.2,
                name: 'Social Elitist Language'
            },
            
            // General internet slang
            internet: {
                markers: [
                    /\b(lol|lmao|rofl|smh|omg|wtf|ngl)\b/i,
                    /\b(tbh|imo|imho|afaik|tl;dr)\b/i,
                    /\b(sus|simp|stan|yeet|vibe)\b/i,
                    /\b(ghosting|sliding|flexing|clout)\b/i
                ],
                weight: 1.0,
                name: 'Internet Slang'
            }
        };
    }
    
    /**
     * Detect languages/slang systems in input text
     * 
     * @param {string} text - Input text to analyze
     * @returns {Array} Array of detected languages with confidence scores
     */
    detectLanguages(text) {
        const lowerText = text.toLowerCase();
        const detected = [];
        
        // Get active profile languages (if CultrVibe is enabled)
        let allowedLanguages = null;
        if (typeof window.cultrVibeSystem !== 'undefined' && window.cultrVibeSystem) {
            const profile = window.cultrVibeSystem.profiles[window.cultrVibeSystem.activeProfile];
            if (profile && profile.id !== 'universal') {
                allowedLanguages = profile.languages;
                console.log(`🌍 CultrVibe filtering: ${profile.name}, languages:`, allowedLanguages);
            }
        }
        
        // Check each language pattern
        for (const [lang, config] of Object.entries(this.languagePatterns)) {
            // Skip if profile filtering is active and this language isn't allowed
            if (allowedLanguages && !allowedLanguages.includes(lang)) {
                continue;
            }
            
            let score = 0;
            let matchCount = 0;
            
            // Count marker matches
            for (const pattern of config.markers) {
                const matches = lowerText.match(pattern);
                if (matches) {
                    matchCount += matches.length;
                    score += matches.length * config.weight;
                }
            }
            
            // If any matches found, add to detected list
            if (matchCount > 0) {
                detected.push({
                    language: lang,
                    name: config.name,
                    score: score,
                    matchCount: matchCount,
                    confidence: Math.min(score / 10, 1.0) // Normalize to 0-1
                });
            }
        }
        
        // Sort by score (highest first)
        detected.sort((a, b) => b.score - a.score);
        
        return detected;
    }
    
    /**
     * Process input with multilingual support
     * Overrides parent processInput method
     * 
     * @param {string} text - Input text
     * @param {object} audioData - Optional audio data
     * @param {object} options - Processing options
     * @returns {object} Processed result with language detection
     */
    processInput(text, audioData = null, options = {}) {
        // Detect languages first
        this.detectedLanguages = this.detectLanguages(text);
        
        console.log('🌍 Detected languages:', this.detectedLanguages.map(l => 
            `${l.name} (${(l.confidence * 100).toFixed(0)}%)`
        ).join(', '));
        
        // Call parent processInput for AAVE processing
        const baseResult = super.processInput(text, audioData, options);
        
        // Add multilingual processing
        const multilingualResult = this.processMultilingual(text, options);
        
        // Merge results
        return {
            ...baseResult,
            detectedLanguages: this.detectedLanguages,
            primaryLanguage: this.detectedLanguages[0] || null,
            multilingualFeatures: multilingualResult.features,
            normalizedMultilingual: multilingualResult.normalized,
            culturalContext: multilingualResult.context
        };
    }
    
    /**
     * Process text through appropriate multilingual databases
     * 
     * @param {string} text - Input text
     * @param {object} options - Processing options
     * @returns {object} Multilingual processing result
     */
    processMultilingual(text, options = {}) {
        let normalizedText = text;
        const features = [];
        const context = [];
        
        // Process through each detected language database
        for (const detected of this.detectedLanguages) {
            const database = this.slangDatabases[detected.language];
            if (!database || database.length === 0) {
                continue; // Skip if database not loaded
            }
            
            // Apply language-specific normalization
            const result = this.normalizeWithDatabase(normalizedText, database, detected.language);
            normalizedText = result.text;
            features.push(...result.features);
            context.push(...result.context);
        }
        
        return {
            normalized: normalizedText,
            features: features,
            context: context
        };
    }
    
    /**
     * Normalize text using specific slang database
     * 
     * @param {string} text - Input text
     * @param {Array} database - Slang database
     * @param {string} languageName - Language identifier
     * @returns {object} Normalization result
     */
    normalizeWithDatabase(text, database, languageName) {
        let normalizedText = text;
        const features = [];
        const context = [];
        
        // Process each entry in the database
        for (const entry of database) {
            const pattern = new RegExp(`\\b${entry.term}\\b`, 'gi');
            const matches = text.match(pattern);
            
            if (matches) {
                // Replace with standard meaning
                normalizedText = normalizedText.replace(pattern, entry.meaning);
                
                // Record feature
                features.push({
                    term: entry.term,
                    meaning: entry.meaning,
                    language: languageName,
                    confidence: entry.confidence || 0.8,
                    category: entry.category || 'general'
                });
                
                // Add cultural context if available
                if (entry.context) {
                    context.push({
                        term: entry.term,
                        context: entry.context,
                        language: languageName
                    });
                }
            }
        }
        
        return {
            text: normalizedText,
            features: features,
            context: context
        };
    }
    
    /**
     * Initialize feature extractors for different languages
     */
    initFeatureExtractors() {
        return {
            asian: (text) => this.extractAsianFeatures(text),
            hispanic: (text) => this.extractHispanicFeatures(text),
            country: (text) => this.extractCountryFeatures(text),
            british: (text) => this.extractBritishFeatures(text),
            caribbean: (text) => this.extractCaribbeanFeatures(text)
        };
    }
    
    /**
     * Extract Asian language features
     */
    extractAsianFeatures(text) {
        return {
            honorifics: this.detectHonorifics(text),
            romanization: this.detectRomanization(text),
            loanwords: this.detectLoanwords(text, 'asian')
        };
    }
    
    /**
     * Extract Hispanic/Spanglish features
     */
    extractHispanicFeatures(text) {
        return {
            code_switching: this.detectCodeSwitching(text, 'spanish'),
            regionalisms: this.detectRegionalisms(text, 'hispanic'),
            spanglish_blends: this.detectSpanglishBlends(text)
        };
    }
    
    /**
     * Extract Country/Southern features
     */
    extractCountryFeatures(text) {
        return {
            southern_grammar: this.detectSouthernGrammar(text),
            colloquialisms: this.detectColloquialisms(text, 'southern'),
            euphemisms: this.detectEuphemisms(text)
        };
    }
    
    /**
     * Extract British features
     */
    extractBritishFeatures(text) {
        return {
            spelling_variants: this.detectBritishSpelling(text),
            cockney_rhyming: this.detectCockneyRhyming(text),
            british_slang: this.detectSlang(text, 'british')
        };
    }
    
    /**
     * Extract Caribbean features
     */
    extractCaribbeanFeatures(text) {
        return {
            patois_grammar: this.detectPatoisGrammar(text),
            creole_features: this.detectCreoleFeatures(text),
            jamaican_influence: this.detectJamaicanInfluence(text)
        };
    }
    
    // Placeholder methods for feature detection (to be implemented when user provides data)
    detectHonorifics(text) { return []; }
    detectRomanization(text) { return []; }
    detectLoanwords(text, type) { return []; }
    detectCodeSwitching(text, language) { return []; }
    detectRegionalisms(text, region) { return []; }
    detectSpanglishBlends(text) { return []; }
    detectSouthernGrammar(text) { return []; }
    detectColloquialisms(text, region) { return []; }
    detectEuphemisms(text) { return []; }
    detectBritishSpelling(text) { return []; }
    detectCockneyRhyming(text) { return []; }
    detectSlang(text, type) { return []; }
    detectPatoisGrammar(text) { return []; }
    detectCreoleFeatures(text) { return []; }
    detectJamaicanInfluence(text) { return []; }
    
    /**
     * Load AAVE slang database from comprehensive file
     */
    loadAAVESlang() {
        if (typeof window.aaveSlang !== 'undefined' && window.aaveSlang.length > 0) {
            console.log(`✅ Loaded ${window.aaveSlang.length} AAVE terms from comprehensive database`);
            return window.aaveSlang;
        }
        return [];
    }
    
    /**
     * Load Southern slang database from comprehensive file
     */
    loadSouthernSlang() {
        if (typeof window.southernSlang !== 'undefined' && window.southernSlang.length > 0) {
            console.log(`✅ Loaded ${window.southernSlang.length} Southern US terms from comprehensive database`);
            return window.southernSlang;
        }
        return [];
    }
    
    /**
     * Load Latino slang database from comprehensive file
     */
    loadLatinoSlang() {
        if (typeof window.latinoSlang !== 'undefined' && window.latinoSlang.length > 0) {
            console.log(`✅ Loaded ${window.latinoSlang.length} Latino/Chicano terms from comprehensive database`);
            return window.latinoSlang;
        }
        return [];
    }
    
    /**
     * Load Asian American slang database from comprehensive file
     */
    loadAsianSlang() {
        if (typeof window.asianSlang !== 'undefined' && window.asianSlang.length > 0) {
            console.log(`✅ Loaded ${window.asianSlang.length} Asian American terms from comprehensive database`);
            return window.asianSlang;
        }
        return [];
    }
    
    /**
     * Load Elitist language database from comprehensive file
     */
    loadElitistLanguage() {
        if (typeof window.elitistLanguage !== 'undefined' && window.elitistLanguage.length > 0) {
            console.log(`✅ Loaded ${window.elitistLanguage.length} elitist terms from comprehensive database`);
            return window.elitistLanguage;
        }
        return [];
    }
    
    /**
     * Load Internet slang database from comprehensive file
     */
    loadInternetSlang() {
        if (typeof window.internetSlang !== 'undefined' && window.internetSlang.length > 0) {
            console.log(`✅ Loaded ${window.internetSlang.length} internet slang terms from comprehensive database`);
            return window.internetSlang;
        }
        return [];
    }
    
    /**
     * Set language preference
     */
    setLanguagePreference(language) {
        this.preferredLanguage = language;
        this.savePreference('language', language);
        console.log('🌍 Language preference set to:', language);
    }
    
    /**
     * Get current state for debugging
     */
    getState() {
        return {
            preferredLanguage: this.preferredLanguage,
            detectedLanguages: this.detectedLanguages,
            loadedDatabases: Object.keys(this.slangDatabases).filter(
                key => this.slangDatabases[key].length > 0
            ),
            databaseSizes: Object.fromEntries(
                Object.entries(this.slangDatabases).map(([key, db]) => [key, db.length])
            )
        };
    }
    
    /**
     * Save preference to localStorage
     */
    savePreference(key, value) {
        try {
            localStorage.setItem(`vibecoder_multilingual_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save multilingual preference:', error);
        }
    }
    
    /**
     * Load preference from localStorage
     */
    loadPreference(key, defaultValue) {
        try {
            const stored = localStorage.getItem(`vibecoder_multilingual_${key}`);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('Failed to load multilingual preference:', error);
            return defaultValue;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultilingualLanguageProcessor;
}
