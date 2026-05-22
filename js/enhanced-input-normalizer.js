/**
 * Enhanced Input Normalizer - Vibenicity Knowledge Base Integration
 * Purpose: Normalize USER INPUT from cultural language to Standard English for code generation
 * 
 * THIS IS FOR INPUT PROCESSING ONLY - NOT FOR GENERATING OUTPUT!
 * 
 * Flow:
 * 1. User types: "Build me an app that be tracking my workouts"
 * 2. This normalizer understands: Habitual 'Be' = ongoing action
 * 3. Normalizes to: "Build me an app that tracks my workouts"
 * 4. MultiLLMOrchestrator generates code based on normalized input
 * 
 * @version 2.0.0 - Wikipedia Sociolinguistic Knowledge Base Integration
 * @date 2025-11-19
 */

class EnhancedInputNormalizer {
    constructor() {
        // Load all knowledge base files
        this.foundations = window.sociolinguisticFoundations || {};
        this.grammaticalRules = window.grammaticalRules || {};
        this.phonologyPatterns = window.phonologyPatterns || {};
        this.regionalVariations = window.regionalVariations || {};
        this.culturalVocabulary = this.loadCulturalVocabulary();
        
        // Track active CultrVibe profile
        this.activeProfile = null;
        this.loadActiveProfile();
        
        console.log('✅ EnhancedInputNormalizer initialized', {
            grammaticalRules: Object.keys(this.grammaticalRules).length,
            phonologyPatterns: Object.keys(this.phonologyPatterns).length,
            vocabularyTerms: this.culturalVocabulary.length,
            activeProfile: this.activeProfile
        });
    }
    
    /**
     * Load cultural vocabulary from existing comprehensive database
     */
    loadCulturalVocabulary() {
        const vocab = [];
        
        if (window.aaveSlang) vocab.push(...window.aaveSlang);
        if (window.southernSlang) vocab.push(...window.southernSlang);
        if (window.latinoSlang) vocab.push(...window.latinoSlang);
        if (window.asianSlang) vocab.push(...window.asianSlang);
        if (window.elitistLanguage) vocab.push(...window.elitistLanguage);
        if (window.internetSlang) vocab.push(...window.internetSlang);
        
        return vocab;
    }
    
    /**
     * Load active CultrVibe profile
     */
    loadActiveProfile() {
        try {
            if (window.cultrVibeSystem) {
                this.activeProfile = window.cultrVibeSystem.activeProfile || 'universal';
            } else {
                this.activeProfile = 'universal';
            }
        } catch (error) {
            console.warn('Could not load CultrVibe profile, defaulting to universal');
            this.activeProfile = 'universal';
        }
    }
    
    /**
     * Main method: Normalize user input from cultural language to Standard English
     * @param {string} userInput - Raw input from user (may contain AAVE, Southern, etc.)
     * @returns {object} - Normalized text + metadata about what was recognized
     */
    normalizeInput(userInput) {
        const startTime = performance.now();
        
        // Step 1: Recognize phonology patterns (spelling variations)
        const phonologyResult = this.recognizePhonology(userInput);
        
        // Step 2: Recognize grammatical patterns (Zero Copula, Habitual Be, etc.)
        const grammarResult = this.recognizeGrammar(phonologyResult.normalized);
        
        // Step 3: Normalize vocabulary (slang → Standard English)
        const vocabularyResult = this.normalizeVocabulary(grammarResult.normalized);
        
        // Step 4: Final cleanup
        const finalNormalized = this.finalCleanup(vocabularyResult.normalized);
        
        const endTime = performance.now();
        
        return {
            original: userInput,
            normalized: finalNormalized,
            
            // Recognition metadata
            phonologyFeatures: phonologyResult.features,
            grammaticalFeatures: grammarResult.features,
            vocabularyTranslations: vocabularyResult.translations,
            
            // Cultural markers identified
            culturalMarkers: this.extractCulturalMarkers(
                phonologyResult.features,
                grammarResult.features,
                vocabularyResult.translations
            ),
            
            // Processing stats
            processingTime: endTime - startTime,
            confidence: this.calculateConfidence(grammarResult, vocabularyResult)
        };
    }
    
    /**
     * Step 1: Recognize and normalize phonology patterns
     * Handles: "worsh" → "wash", "dis" → "this", "aks" → "ask"
     */
    recognizePhonology(text) {
        let normalized = text;
        const features = [];
        
        // Get relevant phonology patterns based on active profile
        const relevantLanguages = this.getRelevantLanguages();
        
        for (const lang of relevantLanguages) {
            const patterns = this.phonologyPatterns[lang];
            if (!patterns) continue;
            
            // Process each phonology feature
            for (const [featureName, feature] of Object.entries(patterns)) {
                if (!feature.recognitionPatterns) continue;
                
                for (const rule of feature.recognitionPatterns) {
                    const matches = text.match(rule.pattern);
                    if (matches) {
                        // Apply normalization
                        normalized = normalized.replace(rule.pattern, rule.standardForm);
                        
                        features.push({
                            feature: feature.feature,
                            language: lang,
                            matches: matches,
                            normalized: rule.standardForm
                        });
                    }
                }
            }
        }
        
        return { normalized, features };
    }
    
    /**
     * Step 2: Recognize and normalize grammatical patterns
     * Handles: Habitual 'Be', Zero Copula, Multiple Modals, etc.
     */
    recognizeGrammar(text) {
        let normalized = text;
        const features = [];
        
        // Get relevant grammatical rules based on active profile
        const relevantLanguages = this.getRelevantLanguages();
        
        for (const lang of relevantLanguages) {
            const rules = this.grammaticalRules[lang];
            if (!rules) continue;
            
            // Process each grammatical feature
            for (const [ruleName, rule] of Object.entries(rules)) {
                if (!rule.normalizationRules) continue;
                
                for (const normRule of rule.normalizationRules) {
                    const matches = text.match(normRule.pattern);
                    if (matches) {
                        // Apply normalization
                        normalized = normalized.replace(normRule.pattern, normRule.replacement);
                        
                        features.push({
                            feature: rule.feature,
                            language: lang,
                            pattern: matches[0],
                            normalized: normRule.replacement,
                            confidence: normRule.confidence,
                            linguisticContext: rule.linguisticContext
                        });
                    }
                }
            }
        }
        
        return { normalized, features };
    }
    
    /**
     * Step 3: Normalize vocabulary (slang → Standard English)
     * Handles: "finna" → "going to", "lit" → "exciting", etc.
     */
    normalizeVocabulary(text) {
        let normalized = text;
        const translations = [];
        
        // Filter vocabulary by active profile if needed
        const relevantVocab = this.filterVocabularyByProfile(this.culturalVocabulary);
        
        for (const entry of relevantVocab) {
            // Create regex pattern for whole word matching
            const pattern = new RegExp(`\\b${entry.term}\\b`, 'gi');
            const matches = text.match(pattern);
            
            if (matches) {
                // Replace slang with meaning
                normalized = normalized.replace(pattern, entry.meaning);
                
                translations.push({
                    term: entry.term,
                    meaning: entry.meaning,
                    language: entry.language,
                    category: entry.category,
                    confidence: entry.confidence,
                    context: entry.context
                });
            }
        }
        
        return { normalized, translations };
    }
    
    /**
     * Step 4: Final cleanup - whitespace, capitalization, etc.
     */
    finalCleanup(text) {
        return text
            .replace(/\s+/g, ' ')           // Multiple spaces → single space
            .replace(/\s+([.,!?])/g, '$1')  // Space before punctuation
            .trim();                         // Trim edges
    }
    
    /**
     * Get relevant languages based on active CultrVibe profile
     */
    getRelevantLanguages() {
        if (!window.cultrVibeSystem || this.activeProfile === 'universal') {
            // Universal profile - check ALL languages
            return ['aave', 'southern', 'appalachian', 'latino', 'asian'];
        }
        
        // Get profile-specific languages
        const profile = window.cultrVibeSystem.profiles[this.activeProfile];
        if (profile && profile.languages) {
            return profile.languages;
        }
        
        // Fallback
        return ['aave', 'southern', 'latino', 'asian'];
    }
    
    /**
     * Filter vocabulary based on active profile
     */
    filterVocabularyByProfile(vocabulary) {
        if (!window.cultrVibeSystem || this.activeProfile === 'universal') {
            return vocabulary; // Return all
        }
        
        const relevantLanguages = this.getRelevantLanguages();
        return vocabulary.filter(entry => 
            relevantLanguages.includes(entry.language) || 
            entry.language === 'internet' // Internet slang always available
        );
    }
    
    /**
     * Extract cultural markers from recognized features
     */
    extractCulturalMarkers(phonologyFeatures, grammaticalFeatures, vocabularyTranslations) {
        const markers = new Set();
        
        phonologyFeatures.forEach(f => markers.add(f.language));
        grammaticalFeatures.forEach(f => markers.add(f.language));
        vocabularyTranslations.forEach(v => markers.add(v.language));
        
        return Array.from(markers);
    }
    
    /**
     * Calculate overall confidence in normalization
     */
    calculateConfidence(grammarResult, vocabularyResult) {
        if (grammarResult.features.length === 0 && vocabularyResult.translations.length === 0) {
            return 1.0; // No changes needed - probably already Standard English
        }
        
        // Average confidence of all recognized features
        const allConfidences = [
            ...grammarResult.features.map(f => f.confidence || 0.85),
            ...vocabularyResult.translations.map(v => v.confidence || 0.90)
        ];
        
        return allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;
    }
    
    /**
     * Explain what was recognized (for educational/debugging purposes)
     */
    explainNormalization(normalizationResult) {
        const explanations = [];
        
        // Explain phonology
        for (const feature of normalizationResult.phonologyFeatures) {
            explanations.push({
                type: 'phonology',
                feature: feature.feature,
                explanation: `Recognized pronunciation variation: "${feature.matches[0]}" is how "${feature.normalized}" sounds in ${feature.language}`
            });
        }
        
        // Explain grammar
        for (const feature of normalizationResult.grammaticalFeatures) {
            explanations.push({
                type: 'grammar',
                feature: feature.feature,
                explanation: feature.linguisticContext,
                pattern: feature.pattern,
                normalized: feature.normalized
            });
        }
        
        // Explain vocabulary
        for (const translation of normalizationResult.vocabularyTranslations) {
            explanations.push({
                type: 'vocabulary',
                term: translation.term,
                meaning: translation.meaning,
                explanation: translation.context
            });
        }
        
        return explanations;
    }
}

// Global availability
if (typeof window !== 'undefined') {
    window.EnhancedInputNormalizer = EnhancedInputNormalizer;
}

console.log('✅ EnhancedInputNormalizer loaded - Ready to normalize cultural input for code generation');
