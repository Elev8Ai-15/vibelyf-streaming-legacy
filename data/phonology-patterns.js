/**
 * Phonology Patterns - VibeLyf Knowledge Base
 * Purpose: Recognize pronunciation-based spelling variations in USER INPUT
 * 
 * These patterns help VibeLyf understand when users type how they SPEAK:
 * - "worsh" → "wash" (Appalachian intrusive r)
 * - "dis" → "this" (AAVE th-stopping)
 * - "finna" → "fixing to" (phonological reduction)
 * 
 * NOT for generating output - for UNDERSTANDING input!
 */

window.phonologyPatterns = {
    
    // ========================================
    // AFRICAN AMERICAN VERNACULAR ENGLISH (AAVE)
    // ========================================
    aave: {
        nonRhoticity: {
            feature: "Non-rhoticity (R-dropping)",
            description: "R-dropping after vowels, especially at end of words",
            linguisticContext: "Shared with some British and Northeastern US dialects",
            
            recognitionPatterns: [
                // Common r-dropping contexts
                { pattern: /\b(\w+)ah\b/i, standardForm: "$1ar", example: "cah → car" },
                { pattern: /\b(\w+)oh\b/i, standardForm: "$1or", example: "doh → door" },
                { pattern: /\b(\w+)uh\b/i, standardForm: "$1er", example: "suh → sir" }
            ],
            
            examples: [
                { written: "cah", standard: "car", context: "r-dropping after vowel" },
                { written: "doh", standard: "door", context: "r-dropping after vowel" },
                { written: "flo", standard: "floor", context: "r-dropping after vowel" },
                { written: "yeah", standard: "year", context: "r-dropping after vowel" }
            ],
            
            normalizationNote: "Low priority - most users type standard spelling even if they drop 'r' in speech"
        },
        
        thStopping: {
            feature: "Th-stopping",
            description: "'Th' becomes 'd' or 't' in pronunciation and writing",
            linguisticContext: "Common in many English dialects and second language varieties",
            
            recognitionPatterns: [
                { pattern: /\bdis\b/gi, standardForm: "this", confidence: 0.95 },
                { pattern: /\bdat\b/gi, standardForm: "that", confidence: 0.95 },
                { pattern: /\bdese\b/gi, standardForm: "these", confidence: 0.92 },
                { pattern: /\bdose\b/gi, standardForm: "those", confidence: 0.92 },
                { pattern: /\bdem\b/gi, standardForm: "them", confidence: 0.90 },
                { pattern: /\bting\b/gi, standardForm: "thing", confidence: 0.85 },
                { pattern: /\btings\b/gi, standardForm: "things", confidence: 0.85 },
                { pattern: /\bnuttin\b/gi, standardForm: "nothing", confidence: 0.88 },
                { pattern: /\bsometing\b/gi, standardForm: "something", confidence: 0.88 },
                { pattern: /\bwit\b/gi, standardForm: "with", confidence: 0.80 },
                { pattern: /\bwif\b/gi, standardForm: "with", confidence: 0.85 }
            ],
            
            examples: [
                {
                    userInput: "Build me dis app dat tracks workouts",
                    normalized: "Build me this app that tracks workouts",
                    culturalMarker: "AAVE Th-stopping"
                },
                {
                    userInput: "I need someting like dat but better",
                    normalized: "I need something like that but better",
                    culturalMarker: "AAVE Th-stopping"
                }
            ]
        },
        
        metathesis: {
            feature: "Metathesis (Sound reordering)",
            description: "Ask → aks/ax is most famous, but affects other words too",
            linguisticContext: "Historical feature, appears in Old English, widespread in AAVE",
            
            recognitionPatterns: [
                { pattern: /\baks\b/gi, standardForm: "ask", confidence: 0.98 },
                { pattern: /\baksin\b/gi, standardForm: "asking", confidence: 0.98 },
                { pattern: /\baksed\b/gi, standardForm: "asked", confidence: 0.98 }
            ],
            
            examples: [
                {
                    userInput: "I'm aksing for a budget tracker",
                    normalized: "I'm asking for a budget tracker",
                    culturalMarker: "AAVE Metathesis"
                },
                {
                    userInput: "Can I aks you to add dark mode?",
                    normalized: "Can I ask you to add dark mode?",
                    culturalMarker: "AAVE Metathesis"
                }
            ]
        },
        
        consonantClusterReduction: {
            feature: "Consonant Cluster Reduction",
            description: "Final consonant clusters simplified",
            linguisticContext: "Systematic pattern in AAVE - 'test' → 'tes', 'hand' → 'han'",
            
            recognitionPatterns: [
                { pattern: /\btes\s/gi, standardForm: "test ", confidence: 0.70 },
                { pattern: /\bpos\s/gi, standardForm: "post ", confidence: 0.65 },
                { pattern: /\bdes\s/gi, standardForm: "desk ", confidence: 0.65 },
                { pattern: /\bhan\s/gi, standardForm: "hand ", confidence: 0.60 }
            ],
            
            examples: [
                {
                    userInput: "Can you tes this feature?",
                    normalized: "Can you test this feature?",
                    culturalMarker: "AAVE Consonant Cluster Reduction"
                }
            ],
            
            normalizationNote: "Low confidence - many false positives. Use context clues."
        },
        
        gDropping: {
            feature: "G-dropping (-in for -ing)",
            description: "Progressive -ing becomes -in",
            linguisticContext: "Common across many English dialects, not just AAVE",
            
            recognitionPatterns: [
                { pattern: /(\w+)in['']?\s/gi, standardForm: "$1ing ", confidence: 0.75 }
            ],
            
            examples: [
                {
                    userInput: "I'm buildin an app right now",
                    normalized: "I'm building an app right now",
                    culturalMarker: "G-dropping"
                },
                {
                    userInput: "The app be runnin smooth",
                    normalized: "The app be running smooth",
                    culturalMarker: "G-dropping + Habitual Be"
                }
            ]
        }
    },
    
    // ========================================
    // SOUTHERN AMERICAN ENGLISH
    // ========================================
    southern: {
        vowelBreaking: {
            feature: "Vowel Breaking (Diphthongization)",
            description: "Single vowels become two-part sounds (diphthongs)",
            linguisticContext: "Part of Southern Vowel Shift - 'bed' → 'bay-ed'",
            
            examples: [
                { word: "bed", pronunciation: "bay-ed" },
                { word: "leg", pronunciation: "lay-eg" },
                { word: "ten", pronunciation: "tay-en" }
            ],
            
            normalizationNote: "Rarely reflected in writing - pronunciation feature only"
        },
        
        pinPenMerger: {
            feature: "Pin-Pen Merger",
            description: "Short 'i' and 'e' sound the same before nasal consonants",
            linguisticContext: "'pin' and 'pen' are homophones in Southern dialects",
            
            examples: [
                { pair: ["pin", "pen"], note: "Sound identical in Southern speech" },
                { pair: ["tin", "ten"], note: "Sound identical in Southern speech" },
                { pair: ["kin", "Ken"], note: "Sound identical in Southern speech" }
            ],
            
            recognitionPatterns: [
                // Context-dependent - "pen" might be spelled "pin" based on context
            ],
            
            normalizationNote: "Ambiguous - requires context to determine intended meaning"
        },
        
        monophthongization: {
            feature: "Monophthongization of /ay/",
            description: "Diphthong /ay/ becomes single vowel, especially before voiced consonants",
            linguisticContext: "'ride' sounds more like 'rahd'",
            
            examples: [
                { word: "time", pronunciation: "tahm" },
                { word: "ride", pronunciation: "rahd" },
                { word: "five", pronunciation: "fahv" }
            ],
            
            normalizationNote: "Rarely affects written input"
        }
    },
    
    // ========================================
    // APPALACHIAN ENGLISH
    // ========================================
    appalachian: {
        intrusiveR: {
            feature: "Intrusive R",
            description: "Adding 'r' where it doesn't belong in Standard English",
            linguisticContext: "Scots-Irish influence, opposite of r-dropping",
            
            recognitionPatterns: [
                { pattern: /\bw[oa]rsh\b/gi, standardForm: "wash", confidence: 0.95 },
                { pattern: /\bw[oa]rshing\b/gi, standardForm: "washing", confidence: 0.95 }
            ],
            
            examples: [
                {
                    userInput: "I need to worsh out these bugs",
                    normalized: "I need to wash out these bugs",
                    culturalMarker: "Appalachian Intrusive R"
                }
            ]
        },
        
        hit: {
            feature: "Archaic 'hit' for 'it'",
            description: "Use of archaic pronoun 'hit' for 'it'",
            linguisticContext: "Preserved from older English forms",
            
            recognitionPatterns: [
                { pattern: /\bhit['']?s\b/gi, standardForm: "it's", confidence: 0.88 },
                { pattern: /\bhit\s+was\b/gi, standardForm: "it was", confidence: 0.85 },
                { pattern: /\bhit\s+ain['']?t\b/gi, standardForm: "it isn't", confidence: 0.90 }
            ],
            
            examples: [
                {
                    userInput: "Hit's working perfect now",
                    normalized: "It's working perfect now",
                    culturalMarker: "Appalachian Archaic 'Hit'"
                }
            ]
        },
        
        inEnding: {
            feature: "-in for -ing",
            description: "G-dropping in progressive forms",
            linguisticContext: "Common across rural dialects",
            
            recognitionPatterns: [
                { pattern: /(\w+)in['']?\b/gi, standardForm: "$1ing", confidence: 0.75 }
            ],
            
            examples: [
                {
                    userInput: "I'm fixin' to start buildin' this feature",
                    normalized: "I'm fixing to start building this feature",
                    culturalMarker: "Appalachian -in ending"
                }
            ]
        },
        
        vowelMergers: {
            feature: "Various Vowel Mergers",
            description: "Distinct vowels merge in Appalachian pronunciation",
            linguisticContext: "Part of regional phonological system",
            
            examples: [
                { merger: "fill/feel", note: "May sound identical" },
                { merger: "pool/pull", note: "May sound identical" }
            ],
            
            normalizationNote: "Context-dependent, rarely affects written input"
        }
    },
    
    // ========================================
    // GENERAL PHONOLOGICAL PATTERNS
    // ========================================
    general: {
        contractionVariations: {
            feature: "Contraction Spelling Variations",
            description: "Different ways to write common contractions",
            
            recognitionPatterns: [
                { pattern: /\bgonna\b/gi, standardForm: "going to", confidence: 0.98 },
                { pattern: /\bwanna\b/gi, standardForm: "want to", confidence: 0.98 },
                { pattern: /\bgotta\b/gi, standardForm: "got to", confidence: 0.98 },
                { pattern: /\bkinda\b/gi, standardForm: "kind of", confidence: 0.98 },
                { pattern: /\bsorta\b/gi, standardForm: "sort of", confidence: 0.98 },
                { pattern: /\boutta\b/gi, standardForm: "out of", confidence: 0.90 },
                { pattern: /\blotta\b/gi, standardForm: "lot of", confidence: 0.92 },
                { pattern: /\bcoulda\b/gi, standardForm: "could have", confidence: 0.95 },
                { pattern: /\bshoulda\b/gi, standardForm: "should have", confidence: 0.95 },
                { pattern: /\bwoulda\b/gi, standardForm: "would have", confidence: 0.95 },
                { pattern: /\bmusta\b/gi, standardForm: "must have", confidence: 0.95 }
            ],
            
            examples: [
                {
                    userInput: "I wanna build an app that's gonna track my budget",
                    normalized: "I want to build an app that's going to track my budget",
                    culturalMarker: "Informal contractions"
                }
            ]
        }
    }
};

// Global availability
if (typeof window !== 'undefined') {
    window.phonologyPatterns = window.phonologyPatterns;
}

console.log('✅ Phonology Patterns loaded - VibeLyf recognizes pronunciation-based spelling variations');
