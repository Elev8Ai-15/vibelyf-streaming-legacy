/**
 * 🪿 VIBELYF LEARNING LOOP - THE GOLDEN GOOSE
 * 
 * This is the self-learning language system that:
 * 1. Detects unknown slang terms
 * 2. Asks users to clarify (teaching them clear communication)
 * 3. Learns from their explanations (growing the database)
 * 4. Uses new terms immediately (both sides get smarter)
 * 
 * THE REVOLUTION STARTS HERE.
 */

const VibeLyfLearningLoop = {
    // Storage for pending terms (to be reviewed/approved)
    pendingTerms: [],
    
    // Temporary vocabulary for this session (learned from user)
    sessionVocabulary: {},
    
    // Current state
    state: {
        waitingForDefinition: false,
        currentUnknownTerm: null,
        originalMessage: null,
        conversationContext: []
    },

    /**
     * Initialize the learning loop
     */
    init() {
        console.log('🪿 Learning Loop initialized - The Golden Goose is alive!');
        this.loadPendingTerms();
        this.loadSessionVocabulary();
    },

    /**
     * Load pending terms from localStorage
     */
    loadPendingTerms() {
        try {
            const saved = localStorage.getItem('vibelyf_pending_terms');
            if (saved) {
                this.pendingTerms = JSON.parse(saved);
                console.log(`📚 Loaded ${this.pendingTerms.length} pending terms`);
            }
        } catch (error) {
            console.error('Error loading pending terms:', error);
        }
    },

    /**
     * Save pending terms to localStorage
     */
    savePendingTerms() {
        try {
            localStorage.setItem('vibelyf_pending_terms', JSON.stringify(this.pendingTerms));
            console.log(`💾 Saved ${this.pendingTerms.length} pending terms`);
        } catch (error) {
            console.error('Error saving pending terms:', error);
        }
    },

    /**
     * Load session vocabulary from localStorage
     */
    loadSessionVocabulary() {
        try {
            const saved = localStorage.getItem('vibelyf_session_vocab');
            if (saved) {
                this.sessionVocabulary = JSON.parse(saved);
                console.log(`🧠 Loaded ${Object.keys(this.sessionVocabulary).length} session terms`);
            }
        } catch (error) {
            console.error('Error loading session vocabulary:', error);
        }
    },

    /**
     * Save session vocabulary to localStorage
     */
    saveSessionVocabulary() {
        try {
            localStorage.setItem('vibelyf_session_vocab', JSON.stringify(this.sessionVocabulary));
        } catch (error) {
            console.error('Error saving session vocabulary:', error);
        }
    },

    /**
     * Detect slang in message - checks BOTH master database AND session vocabulary
     * @param {string} message - User's message
     * @returns {Array} Array of detected slang terms with details
     */
    detectSlang(message) {
        const detected = [];
        const lowerMessage = message.toLowerCase();

        // First, check the master 453-term database
        if (window.culturalVocabularyMaster && window.culturalVocabularyMaster.categories) {
            const categories = window.culturalVocabularyMaster.categories;
            
            for (const categoryName in categories) {
                const category = categories[categoryName];
                if (category.terms && Array.isArray(category.terms)) {
                    category.terms.forEach(term => {
                        if (lowerMessage.includes(term.term.toLowerCase())) {
                            detected.push({
                                ...term,
                                category: categoryName,
                                source: 'master-database'
                            });
                        }
                    });
                }
            }
        }

        // Then, check session vocabulary (learned this session)
        for (const term in this.sessionVocabulary) {
            if (lowerMessage.includes(term.toLowerCase())) {
                detected.push({
                    ...this.sessionVocabulary[term],
                    source: 'session-learned'
                });
            }
        }

        return detected;
    },

    /**
     * Find unknown terms - words that seem like slang but aren't in our database
     * @param {string} message - User's message
     * @param {Array} detectedSlang - Already detected slang terms
     * @returns {Array} Array of potentially unknown terms
     */
    findUnknownTerms(message, detectedSlang) {
        const unknown = [];
        const words = message.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(w => w.length > 2); // Only words longer than 2 chars

        // Slang indicators (patterns that suggest informal language)
        const slangIndicators = [
            'finna', 'gonna', 'wanna', 'tryna', 'gotta', 'aint',
            'yo', 'aye', 'bruh', 'nah', 'yeet', 'lowkey', 'highkey',
            'bussin', 'slaps', 'fire', 'lit', 'cap', 'drip', 'vibe',
            'sus', 'salty', 'shade', 'tea', 'flex', 'ghost', 'stan'
        ];

        // Common words to ignore (not slang)
        const commonWords = [
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
            'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
            'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
            'its', 'let', 'put', 'say', 'she', 'too', 'use', 'make', 'want', 'like',
            'app', 'code', 'build', 'create', 'help', 'need', 'please', 'thanks'
        ];

        words.forEach(word => {
            // Skip if already detected
            if (detectedSlang.some(s => s.term.toLowerCase() === word)) {
                return;
            }

            // Skip common words
            if (commonWords.includes(word)) {
                return;
            }

            // Check if it matches slang patterns
            const hasSlangPattern = (
                slangIndicators.includes(word) ||
                word.includes('in') || // finna, gonna, etc.
                word.endsWith('in') ||
                word.includes('uh') || // bruh, etc.
                (word.length <= 4 && /[aeiouy]{2}/.test(word)) // Double vowels in short words
            );

            if (hasSlangPattern) {
                // Check if we already know it
                const knownInMaster = window.culturalVocabularyMaster?.categories && 
                    Object.values(window.culturalVocabularyMaster.categories).some(cat => 
                        cat.terms && cat.terms.some(t => t.term.toLowerCase() === word)
                    );

                const knownInSession = this.sessionVocabulary.hasOwnProperty(word);

                if (!knownInMaster && !knownInSession) {
                    unknown.push({
                        term: word,
                        context: message
                    });
                }
            }
        });

        return unknown;
    },

    /**
     * Ask user to define an unknown term
     * @param {string} term - The unknown term
     * @param {string} originalMessage - The original message containing the term
     * @returns {string} HTML response asking for definition
     */
    requestDefinition(term, originalMessage) {
        this.state.waitingForDefinition = true;
        this.state.currentUnknownTerm = term;
        this.state.originalMessage = originalMessage;

        return `
            <div style="
                background: linear-gradient(135deg, rgba(var(--primary-glow), 0.1), rgba(var(--secondary-glow), 0.1));
                border: 2px solid rgba(var(--secondary-glow), 0.3);
                border-radius: 16px;
                padding: 24px;
                margin: 16px 0;
            ">
                <div style="font-size: 24px; margin-bottom: 12px;">🤔 HELP ME LEARN</div>
                
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    I noticed you used <strong style="color: rgba(var(--secondary-glow), 1);">"${term}"</strong> 
                    but I don't have a definition for it in my database yet.
                </p>

                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    border-left: 4px solid rgba(var(--primary-glow), 1);
                    padding: 16px;
                    margin: 16px 0;
                    border-radius: 8px;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">📚 Current Database:</div>
                    <div style="opacity: 0.9;">
                        ${window.culturalVocabularyMaster ? 
                            `${window.culturalVocabularyMaster.metadata.totalTerms} terms across 11 cultural categories` :
                            '453 terms (database loading...)'
                        }
                    </div>
                    <div style="margin-top: 8px; opacity: 0.9;">
                        + ${Object.keys(this.sessionVocabulary).length} terms learned this session
                    </div>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    <strong>Could you help me understand what "${term}" means?</strong>
                    
                    Please explain it as clearly and precisely as you can:
                </p>

                <ul style="
                    list-style: none;
                    padding: 0;
                    margin: 16px 0;
                    font-size: 15px;
                    line-height: 1.8;
                ">
                    <li style="margin-bottom: 8px;">
                        ✅ What does it mean in your own words?
                    </li>
                    <li style="margin-bottom: 8px;">
                        ✅ Can you give an example of how it's used?
                    </li>
                    <li style="margin-bottom: 8px;">
                        ✅ Is it positive, negative, or neutral?
                    </li>
                </ul>

                <div style="
                    background: linear-gradient(135deg, rgba(var(--primary-glow), 0.15), rgba(var(--secondary-glow), 0.15));
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 20px;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">💡 WHY THIS HELPS:</div>
                    <p style="font-size: 14px; line-height: 1.6; margin: 0; opacity: 0.95;">
                        When you explain unclear terms clearly, you're:
                    </p>
                    <ul style="
                        font-size: 14px;
                        line-height: 1.8;
                        margin: 12px 0 0 0;
                        padding-left: 20px;
                        opacity: 0.95;
                    ">
                        <li><strong>Teaching me</strong> to understand you better</li>
                        <li><strong>Training yourself</strong> to communicate clearly</li>
                        <li><strong>Improving your AI prompting skills</strong> (works everywhere: ChatGPT, Claude, etc.)</li>
                        <li><strong>Getting better at coding</strong> (clear communication = better code)</li>
                    </ul>
                </div>

                <div style="
                    margin-top: 20px;
                    padding: 16px;
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    border-radius: 8px;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">🪿 THE LEARNING LOOP:</div>
                    <p style="font-size: 14px; margin: 0; opacity: 0.9;">
                        You teach me → I teach you → We both get smarter → The database grows → 
                        Future users benefit → The cycle continues → Everyone wins! 🎉
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Process user's definition of unknown term
     * @param {string} definition - User's explanation of the term
     * @returns {Object} Learning confirmation response
     */
    learnFromUser(definition) {
        if (!this.state.waitingForDefinition || !this.state.currentUnknownTerm) {
            return {
                success: false,
                message: "Not currently waiting for a definition."
            };
        }

        const term = this.state.currentUnknownTerm;
        const originalMessage = this.state.originalMessage;

        // Create new term entry
        const newTerm = {
            term: term,
            definition: definition,
            meaning: definition,
            userProvided: true,
            learnedFrom: 'user-explanation',
            context: originalMessage,
            examples: [originalMessage],
            timestamp: Date.now(),
            dateAdded: new Date().toISOString(),
            needsReview: true,
            category: 'user-submitted',
            confidence: 0.70, // Lower confidence (user-provided, not academically validated)
            source: 'VIBELYF User Contribution'
        };

        // Add to session vocabulary (immediate use)
        this.sessionVocabulary[term] = newTerm;
        this.saveSessionVocabulary();

        // Add to pending terms (for review/approval)
        this.pendingTerms.push(newTerm);
        this.savePendingTerms();

        // Reset state
        this.state.waitingForDefinition = false;
        const learnedTerm = this.state.currentUnknownTerm;
        this.state.currentUnknownTerm = null;
        this.state.originalMessage = null;

        console.log(`✅ Learned new term: "${learnedTerm}" = "${definition}"`);

        return {
            success: true,
            term: learnedTerm,
            definition: definition,
            message: this.generateLearningConfirmation(learnedTerm, definition)
        };
    },

    /**
     * Generate confirmation message after learning
     * @param {string} term - The learned term
     * @param {string} definition - User's definition
     * @returns {string} HTML confirmation message
     */
    generateLearningConfirmation(term, definition) {
        const totalTerms = window.culturalVocabularyMaster?.metadata?.totalTerms || 453;
        const sessionTerms = Object.keys(this.sessionVocabulary).length;
        const pendingTerms = this.pendingTerms.length;

        return `
            <div style="
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 229, 255, 0.1));
                border: 2px solid rgba(0, 255, 136, 0.4);
                border-radius: 16px;
                padding: 24px;
                margin: 16px 0;
            ">
                <div style="font-size: 28px; margin-bottom: 12px;">✅ GOT IT! I LEARNED SOMETHING NEW</div>
                
                <div style="
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12px;
                    padding: 20px;
                    margin: 16px 0;
                ">
                    <div style="font-weight: 600; margin-bottom: 12px; font-size: 18px; color: rgba(var(--secondary-glow), 1);">
                        NEW TERM LEARNED:
                    </div>
                    <div style="font-size: 20px; margin-bottom: 8px;">
                        <strong>"${term}"</strong>
                    </div>
                    <div style="font-size: 16px; line-height: 1.6; opacity: 0.95;">
                        <strong>Your Definition:</strong> ${definition}
                    </div>
                    <div style="margin-top: 12px; font-size: 14px; opacity: 0.8;">
                        <strong>Category:</strong> User-submitted<br>
                        <strong>Added:</strong> ${new Date().toLocaleString()}<br>
                        <strong>Status:</strong> Available for immediate use (pending review)
                    </div>
                </div>

                <div style="
                    background: linear-gradient(135deg, rgba(var(--primary-glow), 0.15), rgba(var(--secondary-glow), 0.15));
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                ">
                    <div style="font-weight: 600; margin-bottom: 12px; font-size: 18px;">
                        🎉 WHAT JUST HAPPENED:
                    </div>
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>You taught me</strong> a new word I didn't know
                        </li>
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>I can now understand</strong> "${term}" in future messages
                        </li>
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>You practiced clear communication</strong> (transferable skill!)
                        </li>
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>The database grew</strong> from your contribution
                        </li>
                        <li>
                            ✅ <strong>Future users benefit</strong> from what you taught me
                        </li>
                    </ul>
                </div>

                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    border-left: 4px solid rgba(var(--primary-glow), 1);
                    padding: 16px;
                    margin: 20px 0;
                    border-radius: 8px;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">📊 DATABASE GROWTH:</div>
                    <div style="font-size: 15px; line-height: 1.8; opacity: 0.95;">
                        <div>🗂️ Master Database: <strong>${totalTerms} terms</strong></div>
                        <div>🧠 Learned This Session: <strong>${sessionTerms} terms</strong></div>
                        <div>⏳ Pending Review: <strong>${pendingTerms} terms</strong></div>
                        <div style="margin-top: 8px; color: rgba(0, 255, 136, 1);">
                            📈 <strong>Total Growth: +${((sessionTerms / totalTerms) * 100).toFixed(1)}%</strong>
                        </div>
                    </div>
                </div>

                <div style="
                    background: linear-gradient(135deg, rgba(var(--secondary-glow), 0.2), rgba(var(--primary-glow), 0.2));
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                ">
                    <div style="font-weight: 600; margin-bottom: 12px; font-size: 18px;">
                        🚀 YOU JUST GOT BETTER AT:
                    </div>
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        <li style="margin-bottom: 8px;">
                            💬 <strong>AI Prompting</strong> - Clear explanations get better results everywhere (ChatGPT, Claude, Copilot)
                        </li>
                        <li style="margin-bottom: 8px;">
                            📝 <strong>Code Documentation</strong> - Explaining concepts clearly is essential for developers
                        </li>
                        <li style="margin-bottom: 8px;">
                            👥 <strong>Team Collaboration</strong> - Clear communication prevents bugs and misunderstandings
                        </li>
                        <li>
                            🎓 <strong>Technical Writing</strong> - This exact skill makes you valuable in any tech role
                        </li>
                    </ul>
                </div>

                <div style="
                    text-align: center;
                    padding: 20px;
                    background: rgba(0, 255, 136, 0.08);
                    border-radius: 12px;
                    margin-top: 20px;
                ">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                        🪿 THE GOLDEN GOOSE IN ACTION
                    </div>
                    <p style="font-size: 15px; margin: 0; opacity: 0.95; line-height: 1.6;">
                        You just experienced the learning loop: I didn't understand → You explained clearly → 
                        We both got smarter → The system improved → Everyone wins! This is how VIBELYF 
                        evolves from 453 terms to 500,000+ terms. <strong>Thank you for making it better!</strong> 🎉
                    </p>
                </div>

                <div style="
                    margin-top: 24px;
                    padding: 16px;
                    background: rgba(var(--primary-glow), 0.1);
                    border: 1px dashed rgba(var(--primary-glow), 0.4);
                    border-radius: 8px;
                    text-align: center;
                ">
                    <p style="font-size: 15px; margin: 0; font-weight: 600;">
                        Now, let's get back to your original message. What did you want to build? 💪
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Export pending terms for review (to be added to main database)
     * @returns {Array} Array of pending terms
     */
    exportPendingTerms() {
        return this.pendingTerms;
    },

    /**
     * Clear all pending terms (after they've been reviewed/approved)
     */
    clearPendingTerms() {
        this.pendingTerms = [];
        this.savePendingTerms();
        console.log('🗑️ Cleared all pending terms');
    },

    /**
     * Get statistics about the learning loop
     * @returns {Object} Statistics object
     */
    getStats() {
        const masterTerms = window.culturalVocabularyMaster?.metadata?.totalTerms || 453;
        const sessionTerms = Object.keys(this.sessionVocabulary).length;
        const pendingTerms = this.pendingTerms.length;

        return {
            masterDatabase: masterTerms,
            sessionLearned: sessionTerms,
            pendingReview: pendingTerms,
            totalAvailable: masterTerms + sessionTerms,
            growthPercentage: ((sessionTerms / masterTerms) * 100).toFixed(2)
        };
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.VibeLyfLearningLoop = VibeLyfLearningLoop;
    console.log('🪿 VIBELYF Learning Loop loaded - Ready to learn and grow!');
}
