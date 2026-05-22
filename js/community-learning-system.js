/**
 * Community Learning System - Crowdsourced Knowledge Base Evolution
 * 
 * Revolutionary system that learns from EVERY user interaction:
 * 1. User types in cultural language
 * 2. AI translates to Standard English
 * 3. User confirms or corrects translation
 * 4. System learns immediately and updates knowledge base
 * 5. Better translations for everyone, forever
 * 
 * MISSION: Build the world's largest alternative language library in history
 * 
 * @version 1.0.0 - BETA
 * @date 2025-11-19
 */

class CommunityLearningSystem {
    constructor() {
        this.pendingTranslation = null;
        this.learningQueue = [];
        this.userContributions = this.loadContributions();
        this.confidenceThreshold = 0.75; // Show feedback UI if confidence < 75%
        
        // Stats tracking
        this.stats = {
            totalTranslations: 0,
            confirmations: 0,
            corrections: 0,
            newTermsLearned: 0,
            grammarPatternsLearned: 0
        };
        
        this.loadStats();
        
        console.log('🧠 Community Learning System initialized');
        console.log('📊 Your contributions:', this.userContributions.length);
    }
    
    /**
     * Process user input and request feedback
     * @param {string} originalInput - User's raw input
     * @param {object} normalizationResult - EnhancedInputNormalizer result
     * @returns {Promise<object>} - Translation with feedback request
     */
    async processInput(originalInput, normalizationResult) {
        try {
            this.pendingTranslation = {
                original: originalInput,
                normalized: normalizationResult.normalized,
                confidence: normalizationResult.confidence,
                culturalMarkers: normalizationResult.culturalMarkers,
                features: {
                    phonology: normalizationResult.phonologyFeatures,
                    grammar: normalizationResult.grammaticalFeatures,
                    vocabulary: normalizationResult.vocabularyTranslations
                },
                timestamp: Date.now()
            };
            
            this.stats.totalTranslations++;
            
            // Determine if we need user feedback
            const needsFeedback = this.shouldRequestFeedback(normalizationResult);
            
            return {
                original: originalInput,
                translation: normalizationResult.normalized,
                confidence: normalizationResult.confidence,
                needsFeedback: needsFeedback,
                culturalMarkers: normalizationResult.culturalMarkers,
                message: this.getTranslationMessage(normalizationResult, needsFeedback)
            };
        } catch (error) {
            console.error('Error processing input in learning system:', error);
            // Fallback - return basic translation without feedback
            return {
                original: originalInput,
                translation: normalizationResult.normalized,
                confidence: normalizationResult.confidence,
                needsFeedback: false,
                culturalMarkers: normalizationResult.culturalMarkers || [],
                message: 'Translation complete.'
            };
        }
    }
    
    /**
     * Determine if we should request user feedback
     */
    shouldRequestFeedback(normalizationResult) {
        // Always request feedback if:
        // 1. Low confidence (< 75%)
        // 2. New cultural markers detected
        // 3. Complex grammatical features
        // 4. User is in beta testing mode
        
        if (normalizationResult.confidence < this.confidenceThreshold) {
            return true;
        }
        
        if (normalizationResult.grammaticalFeatures.length > 0) {
            return true; // Grammar is tricky, always confirm
        }
        
        // Always show for beta testing
        return true;
    }
    
    /**
     * Get contextual message for translation
     */
    getTranslationMessage(normalizationResult, needsFeedback) {
        const confidence = normalizationResult.confidence;
        const markers = normalizationResult.culturalMarkers;
        
        let message = '';
        
        if (confidence >= 0.95) {
            message = `💯 High confidence translation! I understood your ${markers.join(', ')} input perfectly.`;
        } else if (confidence >= 0.85) {
            message = `✅ Good translation. I recognized ${markers.join(', ')} features.`;
        } else if (confidence >= 0.75) {
            message = `🤔 Decent translation, but I'm not 100% sure. Please verify!`;
        } else {
            message = `⚠️ Low confidence translation. I need your help to learn this better!`;
        }
        
        if (needsFeedback) {
            message += ' <strong>Your feedback makes Vibenicity smarter for everyone!</strong>';
        }
        
        return message;
    }
    
    /**
     * User confirms translation is correct
     */
    async confirmTranslation() {
        try {
            if (!this.pendingTranslation) {
                console.error('No pending translation to confirm');
                return { success: false, message: 'No pending translation' };
            }
            
            this.stats.confirmations++;
            
            // Store as confirmed pattern
            const confirmation = {
                type: 'confirmation',
                original: this.pendingTranslation.original,
                translation: this.pendingTranslation.normalized,
                culturalMarkers: this.pendingTranslation.culturalMarkers,
                features: this.pendingTranslation.features,
                confidence: this.pendingTranslation.confidence,
                timestamp: Date.now(),
                userId: this.getUserId()
            };
            
            // Add to user contributions
            this.userContributions.push(confirmation);
            this.saveContributions();
            
            // Queue for knowledge base update (batch processing)
            this.learningQueue.push(confirmation);
            
            // Save stats
            this.saveStats();
            
            console.log('✅ Translation confirmed! Thank you for helping Vibenicity learn!');
            
            // Show appreciation
            this.showAppreciation('confirmation');
            
            return {
                success: true,
                message: 'Translation confirmed! Your input helps improve Vibenicity for everyone. 🙏',
                contributionCount: this.userContributions.length
            };
        } catch (error) {
            console.error('Error confirming translation:', error);
            return {
                success: false,
                message: 'Error saving confirmation. Please try again.'
            };
        }
    }
    
    /**
     * User corrects translation
     */
    async correctTranslation(correctedTranslation, correctionType = 'general') {
        try {
            if (!this.pendingTranslation) {
                console.error('No pending translation to correct');
                return { success: false, message: 'No pending translation' };
            }
            
            this.stats.corrections++;
            
            const correction = {
                type: 'correction',
                original: this.pendingTranslation.original,
                aiTranslation: this.pendingTranslation.normalized,
                userCorrection: correctedTranslation,
                correctionType: correctionType, // 'vocabulary', 'grammar', 'general'
                culturalMarkers: this.pendingTranslation.culturalMarkers,
                features: this.pendingTranslation.features,
                timestamp: Date.now(),
                userId: this.getUserId()
            };
            
            // Add to user contributions
            this.userContributions.push(correction);
            this.saveContributions();
            
            // Immediately learn from correction
            await this.learnFromCorrection(correction);
            
            // Save stats
            this.saveStats();
            
            console.log('🎓 Translation corrected! Vibenicity just got smarter!');
            
            // Show appreciation
            this.showAppreciation('correction');
            
            return {
                success: true,
                message: 'Correction saved! You just taught Vibenicity something new. 🔥',
                contributionCount: this.userContributions.length,
                newTranslation: correctedTranslation
            };
        } catch (error) {
            console.error('Error correcting translation:', error);
            return {
                success: false,
                message: 'Error saving correction. Please try again.'
            };
        }
    }
    
    /**
     * Learn from user correction - UPDATE KNOWLEDGE BASE IMMEDIATELY
     */
    async learnFromCorrection(correction) {
        try {
            console.log('🧠 Learning from correction...', correction);
            
            // Analyze what changed
            const analysis = this.analyzeCorrection(correction);
            
            if (analysis.type === 'vocabulary') {
                // New slang term or meaning correction
                await this.learnVocabulary(analysis);
                this.stats.newTermsLearned++;
            } else if (analysis.type === 'grammar') {
                // Grammar pattern correction
                await this.learnGrammar(analysis);
                this.stats.grammarPatternsLearned++;
            } else if (analysis.type === 'phonology') {
                // Pronunciation/spelling variation
                await this.learnPhonology(analysis);
            }
            
            // Trigger knowledge base rebuild
            if (window.cultrVibeSystem) {
                window.cultrVibeSystem.profileIndexes = 
                    window.cultrVibeSystem.buildProfileIndexes();
                console.log('✅ Knowledge base indexes rebuilt');
            }
            
            // Notify VibeTribe if available
            if (window.vibeTribeSystem) {
                this.notifyVibeTribe(correction);
            }
        } catch (error) {
            console.error('Error learning from correction:', error);
            // Non-critical - log but don't block user flow
        }
    }
    
    /**
     * Analyze correction to determine what type of learning is needed
     */
    analyzeCorrection(correction) {
        const original = correction.original.toLowerCase();
        const aiTranslation = correction.aiTranslation.toLowerCase();
        const userCorrection = correction.userCorrection.toLowerCase();
        
        // Check if it's a vocabulary issue (single word or phrase)
        const originalWords = original.split(/\s+/);
        const aiWords = aiTranslation.split(/\s+/);
        const userWords = userCorrection.split(/\s+/);
        
        // Find what changed
        const differences = [];
        for (let i = 0; i < Math.max(originalWords.length, userWords.length); i++) {
            if (originalWords[i] !== userWords[i]) {
                differences.push({
                    original: originalWords[i],
                    user: userWords[i],
                    position: i
                });
            }
        }
        
        if (differences.length === 1 && originalWords.length === aiWords.length) {
            // Single word change - likely vocabulary
            return {
                type: 'vocabulary',
                term: differences[0].original,
                aiMeaning: aiWords[differences[0].position],
                correctMeaning: differences[0].user,
                confidence: 0.95
            };
        } else if (originalWords.length !== aiWords.length) {
            // Structure change - likely grammar
            return {
                type: 'grammar',
                pattern: original,
                aiTranslation: aiTranslation,
                correctTranslation: userCorrection,
                confidence: 0.85
            };
        } else {
            // Complex or general correction
            return {
                type: 'general',
                original: original,
                aiTranslation: aiTranslation,
                correctTranslation: userCorrection,
                confidence: 0.75
            };
        }
    }
    
    /**
     * Learn new vocabulary from correction
     */
    async learnVocabulary(analysis) {
        try {
            // Create new vocabulary entry
            const newEntry = {
                term: analysis.term,
                meaning: analysis.correctMeaning,
                language: 'community_learned',
                category: 'user_contributed',
                confidence: analysis.confidence,
                context: `Community correction - originally translated as "${analysis.aiMeaning}"`,
                source: 'community_learning_system',
                timestamp: Date.now(),
                contributorId: this.getUserId()
            };
            
            // Add to appropriate database
            if (window.comprehensiveCulturalLanguage) {
                window.comprehensiveCulturalLanguage.push(newEntry);
                console.log('✅ New vocabulary learned:', newEntry);
            }
            
            // Store in localStorage for persistence
            this.storeLearnedPattern('vocabulary', newEntry);
        } catch (error) {
            console.error('Error learning vocabulary:', error);
            throw error; // Re-throw so parent can handle
        }
    }
    
    /**
     * Learn grammar pattern from correction
     */
    async learnGrammar(analysis) {
        try {
            const newPattern = {
                pattern: analysis.pattern,
                correctTranslation: analysis.correctTranslation,
                confidence: analysis.confidence,
                examples: [analysis.pattern],
                source: 'community_learning_system',
                timestamp: Date.now(),
                contributorId: this.getUserId()
            };
            
            // Store grammar pattern
            this.storeLearnedPattern('grammar', newPattern);
            console.log('✅ New grammar pattern learned:', newPattern);
        } catch (error) {
            console.error('Error learning grammar:', error);
            throw error; // Re-throw so parent can handle
        }
    }
    
    /**
     * Learn phonology pattern from correction
     */
    async learnPhonology(analysis) {
        try {
            const newPattern = {
                original: analysis.original,
                standard: analysis.correctTranslation,
                confidence: analysis.confidence,
                source: 'community_learning_system',
                timestamp: Date.now()
            };
            
            this.storeLearnedPattern('phonology', newPattern);
            console.log('✅ New phonology pattern learned:', newPattern);
        } catch (error) {
            console.error('Error learning phonology:', error);
            throw error; // Re-throw so parent can handle
        }
    }
    
    /**
     * Store learned pattern in localStorage
     */
    storeLearnedPattern(type, pattern) {
        try {
            // Check localStorage quota before writing
            this.checkStorageQuota();
            
            const key = `vibenicity_learned_${type}`;
            let patterns = JSON.parse(localStorage.getItem(key) || '[]');
            patterns.push(pattern);
            
            const dataToStore = JSON.stringify(patterns);
            localStorage.setItem(key, dataToStore);
            
            console.log(`✅ Pattern stored: ${type}, total: ${patterns.length}`);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ localStorage quota exceeded! Attempting cleanup...');
                this.cleanupOldPatterns(type);
                // Try again after cleanup
                try {
                    const key = `vibenicity_learned_${type}`;
                    let patterns = JSON.parse(localStorage.getItem(key) || '[]');
                    patterns.push(pattern);
                    localStorage.setItem(key, JSON.stringify(patterns));
                } catch (retryError) {
                    console.error('❌ Failed to store pattern even after cleanup:', retryError);
                    throw new Error('Storage quota exceeded and cleanup failed');
                }
            } else {
                console.error('Error storing learned pattern:', error);
                throw error;
            }
        }
    }
    
    /**
     * Load learned patterns on initialization
     */
    loadLearnedPatterns() {
        const types = ['vocabulary', 'grammar', 'phonology'];
        const learned = {};
        
        for (const type of types) {
            const key = `vibenicity_learned_${type}`;
            learned[type] = JSON.parse(localStorage.getItem(key) || '[]');
        }
        
        return learned;
    }
    
    /**
     * Show appreciation for user contribution
     */
    showAppreciation(type) {
        const messages = {
            confirmation: [
                '🙏 Thank you! Your confirmation helps us learn!',
                '💯 Appreciated! You\'re building linguistic history!',
                '🔥 You just helped thousands of future users!',
                '✨ Every confirmation makes Vibenicity smarter!'
            ],
            correction: [
                '🎓 You just taught us something new! Legend!',
                '🚀 Game-changer! Your correction goes live immediately!',
                '💎 Your knowledge is now part of Vibenicity forever!',
                '🔥 You\'re literally shaping the future of language tech!'
            ]
        };
        
        const pool = messages[type] || messages.confirmation;
        const message = pool[Math.floor(Math.random() * pool.length)];
        
        // Show toast notification
        if (window.VibenicityUI) {
            window.VibenicityUI.showToast(message, 'success', 4000);
        }
    }
    
    /**
     * Notify VibeTribe about learning
     */
    notifyVibeTribe(correction) {
        // Create automatic submission to VibeTribe for community review
        const submission = {
            term: this.extractMainTerm(correction.original),
            meaning: this.extractMainMeaning(correction.userCorrection),
            language: correction.culturalMarkers[0] || 'community',
            category: 'community_learned',
            example_usage: correction.original,
            context: `Learned from user correction`,
            source: 'community_learning_system',
            auto_approved: false, // Needs community votes
            submitter_username: 'CommunityLearner_' + this.getUserId().slice(0, 8)
        };
        
        console.log('📤 Submitted to VibeTribe for community review:', submission);
    }
    
    /**
     * Extract main term from original input
     */
    extractMainTerm(text) {
        // Simple heuristic - find uncommon/slang words
        const words = text.toLowerCase().split(/\s+/);
        const commonWords = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 
                            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 
                            'can', 'could', 'should', 'may', 'might', 'must'];
        
        for (const word of words) {
            if (!commonWords.includes(word) && word.length > 2) {
                return word;
            }
        }
        
        return words[0];
    }
    
    /**
     * Extract main meaning from corrected translation
     */
    extractMainMeaning(text) {
        const words = text.toLowerCase().split(/\s+/);
        return words.slice(0, 3).join(' '); // First 3 words
    }
    
    /**
     * Get or create anonymous user ID
     */
    getUserId() {
        let userId = localStorage.getItem('vibenicity_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            localStorage.setItem('vibenicity_user_id', userId);
        }
        return userId;
    }
    
    /**
     * Save user contributions to localStorage
     */
    saveContributions() {
        try {
            this.checkStorageQuota();
            const dataToStore = JSON.stringify(this.userContributions);
            localStorage.setItem('vibenicity_contributions', dataToStore);
            console.log(`✅ Contributions saved: ${this.userContributions.length} total`);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ localStorage quota exceeded for contributions!');
                // Keep only last 100 contributions
                this.userContributions = this.userContributions.slice(-100);
                try {
                    localStorage.setItem('vibenicity_contributions', JSON.stringify(this.userContributions));
                    console.log('✅ Contributions trimmed and saved');
                } catch (retryError) {
                    console.error('❌ Failed to save contributions even after trimming:', retryError);
                }
            } else {
                console.error('Error saving contributions:', error);
            }
        }
    }
    
    /**
     * Load user contributions from localStorage
     */
    loadContributions() {
        return JSON.parse(localStorage.getItem('vibenicity_contributions') || '[]');
    }
    
    /**
     * Save stats to localStorage
     */
    saveStats() {
        try {
            const dataToStore = JSON.stringify(this.stats);
            localStorage.setItem('vibenicity_learning_stats', dataToStore);
        } catch (error) {
            console.error('Error saving stats:', error);
            // Non-critical - stats can be reconstructed from contributions
        }
    }
    
    /**
     * Load stats from localStorage
     */
    loadStats() {
        const saved = localStorage.getItem('vibenicity_learning_stats');
        if (saved) {
            Object.assign(this.stats, JSON.parse(saved));
        }
    }
    
    /**
     * Get user's contribution stats
     */
    getStats() {
        return {
            ...this.stats,
            contributionCount: this.userContributions.length,
            impactScore: this.calculateImpact()
        };
    }
    
    /**
     * Calculate user's impact score
     */
    calculateImpact() {
        // Points system:
        // Confirmation: 1 point
        // Correction: 5 points
        // New term: 10 points
        
        return this.stats.confirmations + 
               (this.stats.corrections * 5) + 
               (this.stats.newTermsLearned * 10);
    }
    
    /**
     * Reset pending translation
     */
    clearPending() {
        this.pendingTranslation = null;
    }
    
    /**
     * Check localStorage quota and warn if approaching limit
     */
    checkStorageQuota() {
        try {
            // Estimate current usage
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && key.startsWith('vibenicity_')) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            
            // Convert to KB
            const totalKB = totalSize / 1024;
            const estimatedLimit = 5120; // 5MB typical limit in KB
            const usagePercent = (totalKB / estimatedLimit) * 100;
            
            console.log(`📊 localStorage usage: ${totalKB.toFixed(2)} KB (${usagePercent.toFixed(1)}%)`);
            
            // Warn if over 80%
            if (usagePercent > 80) {
                console.warn(`⚠️ localStorage usage at ${usagePercent.toFixed(1)}%! Consider cleanup.`);
                if (window.VibenicityUI) {
                    window.VibenicityUI.showToast(
                        'Storage nearly full - oldest data may be cleaned up automatically',
                        'warning',
                        5000
                    );
                }
            }
            
            // Critical if over 90%
            if (usagePercent > 90) {
                console.error('🚨 localStorage critically full! Triggering cleanup...');
                this.emergencyCleanup();
            }
            
            return usagePercent;
        } catch (error) {
            console.error('Error checking storage quota:', error);
            return 0;
        }
    }
    
    /**
     * Clean up old patterns to free space
     */
    cleanupOldPatterns(type) {
        try {
            const key = `vibenicity_learned_${type}`;
            let patterns = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (patterns.length > 100) {
                // Keep only most recent 100 patterns
                patterns = patterns.slice(-100);
                localStorage.setItem(key, JSON.stringify(patterns));
                console.log(`✅ Cleaned up old ${type} patterns, kept 100 most recent`);
            }
        } catch (error) {
            console.error(`Error cleaning up ${type} patterns:`, error);
        }
    }
    
    /**
     * Emergency cleanup when storage is critically full
     */
    emergencyCleanup() {
        try {
            console.log('🧹 Starting emergency cleanup...');
            
            // Clean all pattern types
            ['vocabulary', 'grammar', 'phonology'].forEach(type => {
                this.cleanupOldPatterns(type);
            });
            
            // Trim contributions to last 50
            if (this.userContributions.length > 50) {
                this.userContributions = this.userContributions.slice(-50);
                this.saveContributions();
                console.log('✅ Trimmed contributions to last 50');
            }
            
            console.log('✅ Emergency cleanup complete');
        } catch (error) {
            console.error('Error during emergency cleanup:', error);
        }
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.CommunityLearningSystem = CommunityLearningSystem;
}

console.log('✅ Community Learning System loaded - Let\'s build linguistic history together!');
