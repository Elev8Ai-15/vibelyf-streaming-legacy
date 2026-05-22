/**
 * Grammatical Rules - VibeLyf Knowledge Base
 * Purpose: Pattern recognition for cultural grammar features in USER INPUT
 * 
 * These patterns help VibeLyf UNDERSTAND user commands like:
 * - "Build me an app that be tracking workouts" (Habitual 'Be')
 * - "I need something that my sister gonna use" (Zero Copula context)
 * - "Make an app that might could help people budget" (Multiple Modals)
 * 
 * NOT for generating output - for UNDERSTANDING input!
 */

window.grammaticalRules = {
    
    // ========================================
    // AFRICAN AMERICAN VERNACULAR ENGLISH (AAVE)
    // ========================================
    aave: {
        zeroCopula: {
            feature: "Zero Copula",
            description: "Omission of the verb 'to be' in present tense",
            linguisticContext: "Systematic grammatical rule - copula is deleted in specific contexts where Standard English allows contraction",
            
            // Pattern recognition for INPUT understanding
            inputPatterns: [
                /\b(\w+)\s+(my|your|his|her|our|their)\s+(\w+)\b/i,  // "that my app"
                /\b(\w+)\s+(at|on|in)\s+(\w+)\b/i,                    // "that at home"
                /\b(\w+)\s+(good|bad|ready|done|cool|fire)\b/i,       // "that good"
                /\b(\w+)\s+(a|an)\s+(\w+)\b/i                          // "she a developer"
            ],
            
            normalizationRules: [
                {
                    // "that my app" → "that is my app"
                    pattern: /\b(that|this|it|he|she|they)\s+(my|your|his|her|our|their)\b/gi,
                    replacement: "$1 is $2",
                    confidence: 0.85
                },
                {
                    // "he at work" → "he is at work"
                    pattern: /\b(I|you|he|she|it|we|they)\s+(at|on|in)\s+/gi,
                    replacement: "$1 am/is/are $2 ",
                    confidence: 0.90,
                    note: "Requires number agreement logic"
                }
            ],
            
            examples: [
                {
                    userInput: "Build me an app that my sister tool",
                    normalized: "Build me an app that is my sister's tool",
                    culturalMarker: "AAVE Zero Copula"
                },
                {
                    userInput: "Create something that at the top of the screen",
                    normalized: "Create something that is at the top of the screen",
                    culturalMarker: "AAVE Zero Copula"
                }
            ]
        },
        
        habitualBe: {
            feature: "Habitual 'Be'",
            description: "Uninflected 'be' indicates recurring or habitual action/state",
            linguisticContext: "Expresses aspectual distinction not available in Standard English - marks habitual aspect",
            
            // Pattern recognition
            inputPatterns: [
                /\b(I|you|he|she|it|we|they|that|which)\s+be\s+(\w+ing|\w+)\b/i
            ],
            
            normalizationRules: [
                {
                    // "that be tracking" → "that tracks" / "that habitually tracks"
                    pattern: /\b(\w+)\s+be\s+(\w+ing)\b/gi,
                    replacement: "$1 habitually $2",
                    confidence: 0.95,
                    note: "Consider context - may need 'tracks' vs 'is tracking'"
                }
            ],
            
            examples: [
                {
                    userInput: "Make an app that be tracking my workouts",
                    normalized: "Make an app that tracks my workouts",
                    culturalMarker: "AAVE Habitual Be",
                    semanticNote: "User wants REGULAR/ONGOING tracking functionality"
                },
                {
                    userInput: "I need a button that be showing notifications",
                    normalized: "I need a button that shows notifications",
                    culturalMarker: "AAVE Habitual Be",
                    semanticNote: "User wants PERSISTENT notification display"
                }
            ]
        },
        
        uninflectedVerbs: {
            feature: "Uninflected Verbs",
            description: "Third person singular verbs lack -s ending",
            linguisticContext: "Systematic pattern in AAVE - not random omission",
            
            inputPatterns: [
                /\b(he|she|it|that|which)\s+(\w+)\s+/i
            ],
            
            normalizationRules: [
                {
                    // "she work" → "she works"
                    pattern: /\b(he|she|it|that|which)\s+(\w+[^s])\s+(hard|fast|good|well|every)\b/gi,
                    replacement: "$1 $2s $3",
                    confidence: 0.80,
                    note: "Requires verb detection - don't add 's' to nouns"
                }
            ],
            
            examples: [
                {
                    userInput: "Build an app that track expenses",
                    normalized: "Build an app that tracks expenses",
                    culturalMarker: "AAVE Uninflected Verb"
                }
            ]
        },
        
        perfectiveDone: {
            feature: "Perfective 'Done'",
            description: "Auxiliary 'done' indicates completed action",
            linguisticContext: "Marks perfective aspect - action is completed/finished",
            
            inputPatterns: [
                /\b(\w+)\s+done\s+(\w+ed|\w+)\b/i
            ],
            
            normalizationRules: [
                {
                    // "I done built" → "I already built" / "I have built"
                    pattern: /\b(\w+)\s+done\s+(\w+ed|\w+)\b/gi,
                    replacement: "$1 already $2",
                    confidence: 0.92
                }
            ],
            
            examples: [
                {
                    userInput: "I done created three apps with this",
                    normalized: "I already created three apps with this",
                    culturalMarker: "AAVE Perfective Done"
                }
            ]
        },
        
        remotePastBeen: {
            feature: "Remote Past 'Been'",
            description: "Stressed 'BEEN' indicates action in distant past, still relevant",
            linguisticContext: "Marks remote past with current relevance",
            
            inputPatterns: [
                /\bBEEN\s+(\w+ing|\w+ed|\w+)\b/
            ],
            
            normalizationRules: [
                {
                    // "I BEEN wanting" → "I have wanted for a long time"
                    pattern: /\bBEEN\s+(\w+ing)\b/gi,
                    replacement: "have been $1 for a long time",
                    confidence: 0.88
                }
            ],
            
            examples: [
                {
                    userInput: "I BEEN needing an app like this",
                    normalized: "I have needed an app like this for a long time",
                    culturalMarker: "AAVE Remote Past BEEN"
                }
            ]
        },
        
        negativeInversion: {
            feature: "Negative Inversion",
            description: "\"Can't nobody\" constructions for emphasis",
            linguisticContext: "Emphatic negation pattern",
            
            inputPatterns: [
                /\bain['']?t\s+nobody|can['']?t\s+nobody|don['']?t\s+nobody/i
            ],
            
            normalizationRules: [
                {
                    pattern: /\b(ain['']?t|can['']?t|don['']?t)\s+nobody\b/gi,
                    replacement: "nobody can/could",
                    confidence: 0.85
                }
            ],
            
            examples: [
                {
                    userInput: "Can't nobody build apps faster than this",
                    normalized: "Nobody can build apps faster than this",
                    culturalMarker: "AAVE Negative Inversion"
                }
            ]
        }
    },
    
    // ========================================
    // SOUTHERN AMERICAN ENGLISH
    // ========================================
    southern: {
        multipleModals: {
            feature: "Multiple Modals",
            description: "Two modal verbs used together",
            linguisticContext: "Grammatically systematic in Southern dialects - expresses nuanced meanings",
            
            inputPatterns: [
                /\b(might|may|should|would|could)\s+(could|should|ought\s+to|can)\b/i
            ],
            
            normalizationRules: [
                {
                    // "might could" → "might be able to"
                    pattern: /\bmight\s+could\b/gi,
                    replacement: "might be able to",
                    confidence: 0.90
                },
                {
                    // "might should" → "probably should"
                    pattern: /\bmight\s+should\b/gi,
                    replacement: "probably should",
                    confidence: 0.92
                }
            ],
            
            examples: [
                {
                    userInput: "I might could build that feature",
                    normalized: "I might be able to build that feature",
                    culturalMarker: "Southern Multiple Modals"
                },
                {
                    userInput: "You might should add authentication",
                    normalized: "You probably should add authentication",
                    culturalMarker: "Southern Multiple Modals"
                }
            ]
        },
        
        auxiliaryDone: {
            feature: "Auxiliary 'Done'",
            description: "'Done' indicates completed recent action",
            linguisticContext: "Marks perfective aspect in Southern dialects",
            
            inputPatterns: [
                /\b(\w+)\s+done\s+(\w+ed|\w+)\b/i
            ],
            
            normalizationRules: [
                {
                    pattern: /\b(\w+)\s+done\s+(\w+)\b/gi,
                    replacement: "$1 already $2",
                    confidence: 0.88
                }
            ],
            
            examples: [
                {
                    userInput: "I done told you I need that feature",
                    normalized: "I already told you I need that feature",
                    culturalMarker: "Southern Auxiliary Done"
                }
            ]
        },
        
        fixinTo: {
            feature: "'Fixin' to'",
            description: "Immediate future intention - about to do something",
            linguisticContext: "Near-future marker unique to Southern dialects",
            
            inputPatterns: [
                /\bfixin['']?\s+to\b/i,
                /\bfinna\b/i  // AAVE variant
            ],
            
            normalizationRules: [
                {
                    pattern: /\bfixin['']?\s+to\b/gi,
                    replacement: "about to",
                    confidence: 0.95
                }
            ],
            
            examples: [
                {
                    userInput: "I'm fixin' to build a dashboard",
                    normalized: "I'm about to build a dashboard",
                    culturalMarker: "Southern Fixin' To"
                }
            ]
        },
        
        yall: {
            feature: "Y'all",
            description: "Second person plural pronoun",
            linguisticContext: "Fills gap in Standard English pronoun system",
            
            inputPatterns: [
                /\by['']?all\b/i
            ],
            
            normalizationRules: [
                {
                    pattern: /\by['']?all\b/gi,
                    replacement: "you all",
                    confidence: 0.98
                }
            ],
            
            examples: [
                {
                    userInput: "Can y'all add user roles to this app?",
                    normalized: "Can you all add user roles to this app?",
                    culturalMarker: "Southern Y'all"
                }
            ]
        }
    },
    
    // ========================================
    // APPALACHIAN ENGLISH
    // ========================================
    appalachian: {
        aPrefixing: {
            feature: "A-prefixing",
            description: "Prefix 'a-' on -ing verbs",
            linguisticContext: "Archaic English feature preserved in Appalachian dialects",
            
            inputPatterns: [
                /\ba-(\w+in['']?)\b/gi
            ],
            
            normalizationRules: [
                {
                    pattern: /\ba-(\w+in['']?)\b/gi,
                    replacement: "$1g",
                    confidence: 0.90
                }
            ],
            
            examples: [
                {
                    userInput: "I was a-building this feature all day",
                    normalized: "I was building this feature all day",
                    culturalMarker: "Appalachian A-prefixing"
                }
            ]
        },
        
        youUns: {
            feature: "You'uns / Yinz",
            description: "Second person plural pronoun",
            linguisticContext: "Regional plural 'you' in Appalachian/Pittsburgh dialects",
            
            inputPatterns: [
                /\byou['']?uns\b/i,
                /\byinz\b/i
            ],
            
            normalizationRules: [
                {
                    pattern: /\b(you['']?uns|yinz)\b/gi,
                    replacement: "you all",
                    confidence: 0.92
                }
            ],
            
            examples: [
                {
                    userInput: "You'uns need to test this feature",
                    normalized: "You all need to test this feature",
                    culturalMarker: "Appalachian You'uns"
                }
            ]
        },
        
        likeTo: {
            feature: "'Like to' (Nearly/Almost)",
            description: "Expression meaning 'nearly' or 'almost'",
            linguisticContext: "Appalachian intensifier",
            
            inputPatterns: [
                /\blike\s+to\s+(died|fell|broke|crashed)\b/i
            ],
            
            normalizationRules: [
                {
                    pattern: /\blike\s+to\s+(\w+ed|\w+)\b/gi,
                    replacement: "almost $1",
                    confidence: 0.85
                }
            ],
            
            examples: [
                {
                    userInput: "This bug like to broke my whole app",
                    normalized: "This bug almost broke my whole app",
                    culturalMarker: "Appalachian 'Like To'"
                }
            ]
        }
    }
};

// Global availability
if (typeof window !== 'undefined') {
    window.grammaticalRules = window.grammaticalRules;
}

console.log('✅ Grammatical Rules loaded - VibeLyf understands cultural grammar patterns');
