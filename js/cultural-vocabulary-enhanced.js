/**
 * Vibenicity Cultural Vocabulary Knowledge Base
 * Purpose: Authentic slang and cultural terms from Hispanic/Latino and Digital/Gen Z communities
 * Schema Version: 4.1 (Enhanced w/ Origins)
 * Integrated: 2025-11-20
 */

(function initializeVocabulary() {
    console.log("🌍 Vibenicity: Initializing Cultural Vocabulary Knowledge Base...");

    // Define Global Vocabulary Object
    window.culturalVocabulary = {
        hispanic: [],
        digital: [],
        aave: [],
        southern: [],
        appalachian: []
    };

    // ========================================
    // HISPANIC/LATINO LEXICON
    // ========================================
    window.culturalVocabulary.hispanic = [
        {
            term: 'troca',
            meaning: 'truck',
            origin: "Spanglish adaptation of English 'truck'",
            etymology: "English 'truck' + Spanish phonology/ending",
            category: 'loanword',
            confidence: 0.98,
            context: 'Common in Chicano and border communities for pickup trucks',
            examples: ["Hop in the troca", "Park the troca outside"],
            relatedTerms: ["camioneta", "truck"],
            sociolinguisticMarker: 'ethnolect',
            covertPrestige: true
        },
        {
            term: 'vaina',
            meaning: 'thing, stuff, situation, or problem',
            origin: "Dominican Spanish/Dominican York",
            etymology: "From Latin 'vagina' (sheath/pod), evolved to generic placeholder",
            category: 'general_noun',
            confidence: 0.95,
            context: 'Highly versatile placeholder similar to "jawn" in Philly or "da kine" in Hawaii',
            examples: ["Pass me that vaina", "What is this vaina?"],
            relatedTerms: ["thing", "stuff", "jawn"],
            sociolinguisticMarker: 'regional dialect',
            covertPrestige: true
        },
        {
            term: 'güey',
            meaning: 'dude, guy, or fool (depending on tone)',
            origin: "Mexican Spanish / Chicano Caló",
            etymology: "Derived from Nahuatl 'huey' (great/big), originally 'buey' (ox)",
            category: 'social_address',
            confidence: 0.99,
            context: 'Ubiquitous vocative in Mexican-American speech',
            examples: ["No way, güey!", "What's up güey?"],
            relatedTerms: ["dude", "bro", "homie"],
            sociolinguisticMarker: 'ethnolect',
            covertPrestige: true
        },
        {
            term: 'te llamo back',
            meaning: 'I will call you back',
            origin: "Intrasentential Code-Switching",
            etymology: "Spanish 'te llamo' (I call you) + English 'back'",
            category: 'phrase',
            confidence: 0.92,
            context: 'Classic Spanglish grammar structure preserving English syntax',
            examples: ["I'm busy, te llamo back", "Te llamo back later"],
            relatedTerms: ["call you back"],
            sociolinguisticMarker: 'bilingual_contact',
            covertPrestige: true
        },
        {
            term: 'parquear',
            meaning: 'to park (a vehicle)',
            origin: "Spanglish verb from English 'park'",
            etymology: "English 'park' + Spanish verb suffix '-ear'",
            category: 'verb',
            confidence: 0.96,
            context: 'Common in bilingual communities instead of standard Spanish "estacionar"',
            examples: ["Voy a parquear aquí", "Parqueé en la calle"],
            relatedTerms: ["estacionar", "park"],
            sociolinguisticMarker: 'code-switching',
            covertPrestige: true
        },
        {
            term: 'lonche',
            meaning: 'lunch',
            origin: "Spanglish from English 'lunch'",
            etymology: "English 'lunch' adapted to Spanish phonology",
            category: 'noun',
            confidence: 0.94,
            context: 'Widespread in Chicano and border Spanish',
            examples: ["Vamos por el lonche", "Traje mi lonche"],
            relatedTerms: ["almuerzo", "lunch"],
            sociolinguisticMarker: 'loanword',
            covertPrestige: true
        }
    ];

    // ========================================
    // DIGITAL/GEN Z LEXICON
    // ========================================
    window.culturalVocabulary.digital = [
        {
            term: 'fanum tax',
            meaning: 'the act of stealing a portion of a friend\'s food',
            origin: "Twitch Streamer Kai Cenat & Fanum",
            etymology: "Coined during streams where Fanum would 'tax' Cenat's food",
            category: 'humor',
            confidence: 0.90,
            context: 'Gen Alpha/Z slang often used jokingly at meal times',
            examples: ["You gotta pay the Fanum tax", "He took a fry, that's Fanum tax"],
            relatedTerms: ["mooching", "sharing"],
            sociolinguisticMarker: 'internet_subculture',
            covertPrestige: true
        },
        {
            term: 'rizz',
            meaning: 'charisma, ability to flirt or attract',
            origin: "African American Vernacular English roots, expanded online",
            etymology: "Middle syllable of 'cha-rizz-ma'",
            category: 'trait',
            confidence: 0.97,
            context: 'Globalized youth slang for social appeal',
            examples: ["He has unspoken rizz", "Rizzing her up"],
            relatedTerms: ["game", "charm", "sauce"],
            sociolinguisticMarker: 'generation_marker',
            covertPrestige: true
        },
        {
            term: 'no cap',
            meaning: 'no lie, for real, seriously',
            origin: "Hip-hop culture / AAVE",
            etymology: "'Cap' means lie or exaggeration; 'No cap' is the negation",
            category: 'assertion',
            confidence: 0.99,
            context: 'Used to emphasize truthfulness',
            examples: ["That was the best movie, no cap", "I'm actually tired, no cap"],
            relatedTerms: ["for real", "seriously", "on god"],
            sociolinguisticMarker: 'ethnolect_crossover',
            covertPrestige: true
        },
        {
            term: 'sus',
            meaning: 'suspicious or suspect',
            origin: "Gaming (Among Us)",
            etymology: "Abbreviation of 'suspicious'",
            category: 'adjective',
            confidence: 0.96,
            context: 'Originated in social deduction games, now general slang for anything shady',
            examples: ["That acting is sus", "Why are you being so sus?"],
            relatedTerms: ["shady", "sketchy"],
            sociolinguisticMarker: 'internet_subculture',
            covertPrestige: false // Mainstreamed
        },
        {
            term: 'bussin',
            meaning: 'extremely good, delicious, or impressive',
            origin: "AAVE, popularized on TikTok",
            etymology: "Derived from 'busting' (bursting with flavor)",
            category: 'adjective',
            confidence: 0.95,
            context: 'Often used to describe food but can apply to anything excellent',
            examples: ["This food is bussin", "That song was bussin"],
            relatedTerms: ["fire", "slaps", "hits different"],
            sociolinguisticMarker: 'generation_marker',
            covertPrestige: true
        },
        {
            term: 'slaps',
            meaning: 'is really good (especially music)',
            origin: "Bay Area hip-hop slang",
            etymology: "From 'slap' meaning hit hard, metaphorically hits you with quality",
            category: 'verb',
            confidence: 0.93,
            context: 'Music appreciation term, now broader',
            examples: ["This track slaps", "That new album slaps"],
            relatedTerms: ["bangs", "bumps", "goes hard"],
            sociolinguisticMarker: 'regional_to_global',
            covertPrestige: true
        },
        {
            term: 'bet',
            meaning: 'okay, sounds good, agreement',
            origin: "AAVE",
            etymology: "Short for 'you bet' meaning affirmation",
            category: 'interjection',
            confidence: 0.98,
            context: 'Universal agreement term among youth',
            examples: ["Wanna grab food? - Bet", "See you at 8? - Bet"],
            relatedTerms: ["okay", "sure", "cool"],
            sociolinguisticMarker: 'ethnolect_crossover',
            covertPrestige: false // Fully mainstreamed
        },
        {
            term: 'fr',
            meaning: 'for real',
            origin: "Text/internet abbreviation",
            etymology: "Initialism of 'for real'",
            category: 'abbreviation',
            confidence: 0.99,
            context: 'Universal text/speech abbreviation',
            examples: ["That's crazy fr", "Fr though"],
            relatedTerms: ["for real", "no cap", "seriously"],
            sociolinguisticMarker: 'digital_shorthand',
            covertPrestige: false
        }
    ];

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    /**
     * Search vocabulary by term
     * @param {string} searchTerm - The term to search for
     * @param {string} category - Optional category filter (hispanic, digital, etc.)
     * @returns {Array} Matching vocabulary entries
     */
    window.searchVocabulary = function(searchTerm, category = null) {
        const term = searchTerm.toLowerCase().trim();
        let results = [];

        const categoriesToSearch = category ? [category] : Object.keys(window.culturalVocabulary);

        categoriesToSearch.forEach(cat => {
            if (window.culturalVocabulary[cat]) {
                const matches = window.culturalVocabulary[cat].filter(entry => 
                    entry.term.toLowerCase().includes(term) ||
                    entry.meaning.toLowerCase().includes(term) ||
                    entry.examples.some(ex => ex.toLowerCase().includes(term))
                );
                results = results.concat(matches);
            }
        });

        return results;
    };

    /**
     * Get random term for display
     * @param {string} category - Optional category filter
     * @returns {Object} Random vocabulary entry
     */
    window.getRandomTerm = function(category = null) {
        const categoriesToUse = category ? [category] : Object.keys(window.culturalVocabulary);
        const randomCategory = categoriesToUse[Math.floor(Math.random() * categoriesToUse.length)];
        const terms = window.culturalVocabulary[randomCategory];
        
        if (terms && terms.length > 0) {
            return terms[Math.floor(Math.random() * terms.length)];
        }
        return null;
    };

    /**
     * Get all terms by confidence level
     * @param {number} minConfidence - Minimum confidence score (0-1)
     * @returns {Array} All terms meeting confidence threshold
     */
    window.getTermsByConfidence = function(minConfidence = 0.9) {
        let results = [];
        Object.keys(window.culturalVocabulary).forEach(category => {
            const filtered = window.culturalVocabulary[category].filter(
                entry => entry.confidence >= minConfidence
            );
            results = results.concat(filtered);
        });
        return results;
    };

    /**
     * Get vocabulary statistics
     * @returns {Object} Stats about the vocabulary database
     */
    window.getVocabularyStats = function() {
        const stats = {
            totalTerms: 0,
            byCategory: {},
            averageConfidence: 0,
            covertPrestigeCount: 0
        };

        let totalConfidence = 0;

        Object.keys(window.culturalVocabulary).forEach(category => {
            const terms = window.culturalVocabulary[category];
            stats.byCategory[category] = terms.length;
            stats.totalTerms += terms.length;
            
            terms.forEach(term => {
                totalConfidence += term.confidence;
                if (term.covertPrestige) stats.covertPrestigeCount++;
            });
        });

        stats.averageConfidence = (totalConfidence / stats.totalTerms).toFixed(3);

        return stats;
    };

    // ========================================
    // INITIALIZATION LOG
    // ========================================
    const stats = window.getVocabularyStats();
    console.log(`✅ Cultural Vocabulary Loaded:`);
    console.log(`   📊 Total Terms: ${stats.totalTerms}`);
    console.log(`   📱 Hispanic/Latino: ${stats.byCategory.hispanic || 0}`);
    console.log(`   💻 Digital/Gen Z: ${stats.byCategory.digital || 0}`);
    console.log(`   📈 Average Confidence: ${stats.averageConfidence}`);
    console.log(`   🌟 Covert Prestige Terms: ${stats.covertPrestigeCount}`);
    console.log("💾 Vocabulary Knowledge Base Ready!");

})();
