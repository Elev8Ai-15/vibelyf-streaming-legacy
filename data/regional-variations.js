/**
 * Regional Variations - VibeLyf Knowledge Base
 * Purpose: Understanding sub-varieties and regional differences within language varieties
 * 
 * Helps VibeLyf recognize that:
 * - Southern English in Charleston ≠ Southern English in Dallas ≠ Southern English in Appalachia
 * - AAVE varies by region, age, class
 * - These variations are SYSTEMATIC, not random
 */

window.regionalVariations = {
    
    // ========================================
    // SOUTHERN AMERICAN ENGLISH SUB-VARIETIES
    // ========================================
    southernSubVarieties: {
        coastalLowland: {
            name: "Coastal/Lowland Southern",
            regions: [
                "South Carolina coast (Charleston, Beaufort)",
                "Georgia coast (Savannah)",
                "Parts of coastal North Carolina"
            ],
            
            distinctiveFeatures: [
                "Strongest Southern Vowel Shift - most dramatic vowel breaking",
                "Non-rhoticity (r-dropping) - like British English",
                "Slower speech tempo - associated with 'Southern drawl' stereotype",
                "Gullah/Geechee influence in some coastal areas"
            ],
            
            phonologicalExamples: [
                { feature: "Vowel breaking", example: "'bed' → 'bay-ed', 'leg' → 'lay-eg'" },
                { feature: "R-dropping", example: "'car' → 'cah', 'door' → 'doh'" },
                { feature: "Monophthongization", example: "'time' → 'tahm', 'ride' → 'rahd'" }
            ],
            
            grammaticalFeatures: [
                "Multiple modals ('might could', 'might should')",
                "Y'all as second person plural",
                "'Fixin' to' for immediate future"
            ],
            
            culturalContext: "Associated with old plantation South, antebellum culture, often portrayed in media"
        },
        
        inlandMountain: {
            name: "Inland/Mountain Southern (Appalachian-influenced)",
            regions: [
                "Appalachian Mountain areas (parts of VA, WV, KY, TN, NC)",
                "Ozark Mountains (Arkansas, Missouri)",
                "Northern Georgia mountains"
            ],
            
            distinctiveFeatures: [
                "Retention of older English forms (archaic vocabulary)",
                "Scots-Irish linguistic influence",
                "Rhoticity MAINTAINED (pronounce all 'r' sounds)",
                "Intrusive 'r' in some contexts ('warsh' for 'wash')",
                "Less dramatic vowel shift than coastal Southern"
            ],
            
            phonologicalExamples: [
                { feature: "Intrusive r", example: "'wash' → 'worsh'" },
                { feature: "A-prefixing", example: "'going' → 'a-goin''" },
                { feature: "Rhoticity", example: "All 'r' sounds pronounced clearly" }
            ],
            
            grammaticalFeatures: [
                "A-prefixing on -ing verbs ('a-goin', 'a-fishin')",
                "'You'uns' or 'Yinz' as second person plural (different from 'y'all')",
                "'Like to' meaning 'almost' ('like to fell off the roof')",
                "Archaic pronouns ('hit' for 'it')"
            ],
            
            culturalContext: "Rural, mountain communities. Often stigmatized. Preservation of older English forms due to geographic isolation."
        },
        
        texasSouthwestern: {
            name: "Texas Southern/Southwestern",
            regions: [
                "Texas (especially East and Central)",
                "Parts of Oklahoma",
                "Some of Louisiana (non-Cajun areas)"
            ],
            
            distinctiveFeatures: [
                "Blend of Southern and Western American features",
                "Spanish loanwords and influences from Mexican culture",
                "Distinctive vowel pronunciation (Texas drawl)",
                "Rhoticity maintained"
            ],
            
            phonologicalExamples: [
                { feature: "Vowel shift", example: "Distinctive 'Texas twang' in vowel pronunciation" },
                { feature: "Monophthongization", example: "'ride' → 'rahd', 'buy' → 'bah'" }
            ],
            
            grammaticalFeatures: [
                "'Y'all' (universal in Texas)",
                "'All y'all' for emphatic plural",
                "'Fixin' to' for immediate future",
                "Multiple modals",
                "Spanish borrowings in everyday speech"
            ],
            
            spanishInfluence: [
                { term: "ranch", origin: "Spanish 'rancho'" },
                { term: "lasso", origin: "Spanish 'lazo'" },
                { term: "rodeo", origin: "Spanish 'rodeo'" }
            ],
            
            culturalContext: "Cowboy culture, ranching, rodeo. Mexican-American cultural exchange. Distinct Texan identity."
        },
        
        cajun: {
            name: "Cajun/Louisiana English",
            regions: [
                "Southern Louisiana (Lafayette, Acadian parishes)"
            ],
            
            distinctiveFeatures: [
                "French substrate influence from Acadian French",
                "Unique grammatical patterns from French influence",
                "Distinctive prosody (rhythm and intonation)",
                "Vocabulary borrowings from Cajun French"
            ],
            
            grammaticalFeatures: [
                "Lack of 'have' in present perfect ('I been there' vs 'I've been there')",
                "Different pronoun usage influenced by French",
                "Question formation influenced by French structure"
            ],
            
            vocabularyExamples: [
                { term: "lagniappe", meaning: "a little something extra", origin: "French/Spanish" },
                { term: "bayou", meaning: "slow-moving water body", origin: "Choctaw via French" },
                { term: "étouffée", meaning: "smothered dish", origin: "Cajun French" }
            ],
            
            culturalContext: "Distinct Acadian/Cajun culture. French linguistic heritage. Unique culinary and musical traditions."
        }
    },
    
    // ========================================
    // AAVE REGIONAL VARIATIONS
    // ========================================
    aaveRegionalVariations: {
        note: "AAVE has remarkable consistency across regions, but regional variations exist",
        
        northeastern: {
            name: "Northeastern AAVE (New York, Philadelphia, Baltimore)",
            distinctiveFeatures: [
                "Stronger influence from local regional dialects",
                "'Deadass' (NYC-specific intensifier)",
                "Philadelphia-specific features in Philly AAVE"
            ],
            
            examples: [
                { term: "deadass", meaning: "seriously", region: "NYC-specific" },
                { term: "jawn", meaning: "thing/person/place", region: "Philadelphia AAVE" }
            ]
        },
        
        southern: {
            name: "Southern AAVE",
            distinctiveFeatures: [
                "More overlap with Southern White Vernacular",
                "'Fixin' to'/'finna' very common",
                "More monophthongization",
                "Strong historical roots in rural South"
            ]
        },
        
        westCoast: {
            name: "West Coast AAVE (Los Angeles, Oakland)",
            distinctiveFeatures: [
                "Chicano English influence in some areas",
                "Hip-hop culture influence strong",
                "Some unique vocabulary from West Coast rap"
            ]
        },
        
        convergence: {
            note: "AAVE shows remarkable cross-regional consistency due to:",
            factors: [
                "Great Migration (1910s-1970s) - spread AAVE features North",
                "Hip-hop and Black popular culture - national/global spread",
                "Maintained community linguistic norms across regions",
                "Digital communication - youth AAVE features spread rapidly online"
            ]
        }
    },
    
    // ========================================
    // ASIAN AMERICAN ENGLISH VARIATIONS
    // ========================================
    asianAmericanVariations: {
        note: "Asian American English is HIGHLY diverse, varies by heritage language and generation",
        
        filipinoAmerican: {
            name: "Filipino American English",
            heritageLanguage: "Tagalog (primary), other Philippine languages",
            
            distinctiveFeatures: [
                "Substrate influence from Tagalog phonology and grammar",
                "May show different intonation patterns",
                "Code-switching with Tagalog common in Filipino American communities"
            ],
            
            examples: [
                { feature: "Tagalog particles", example: "Code-switching with 'na', 'ba', 'po'" }
            ]
        },
        
        vietnameseAmerican: {
            name: "Vietnamese American English",
            heritageLanguage: "Vietnamese (tonal language)",
            
            distinctiveFeatures: [
                "Tonal language substrate - may affect English intonation",
                "Final consonant cluster simplification",
                "L/R variation in some speakers"
            ]
        },
        
        chineseAmerican: {
            name: "Chinese American English",
            heritageLanguage: "Mandarin, Cantonese, other Chinese languages",
            
            distinctiveFeatures: [
                "Varies greatly by heritage language (Mandarin vs Cantonese)",
                "May show tonal influences on English intonation",
                "Specific phonetic patterns depending on first language"
            ]
        },
        
        generationalDifferences: {
            note: "Generation matters MORE than ethnicity for Asian American English",
            
            firstGeneration: "Heritage language dominant, English as second language",
            secondGeneration: "Often fully bilingual, code-switching common, English native-like",
            thirdGenerationPlus: "Often English monolingual, may have Asian American ethnic identity markers in speech"
        },
        
        panAsianFeatures: {
            note: "Some features appear across Asian American communities in multiethnic areas",
            examples: [
                "Specific intonation patterns in questions",
                "Discourse markers influenced by multiple Asian languages",
                "Youth slang mixing Asian cultural references"
            ]
        }
    },
    
    // ========================================
    // AGE AND GENERATIONAL VARIATIONS
    // ========================================
    generationalVariations: {
        note: "Language varies by age - youth language changes fastest",
        
        genZ: {
            generation: "Gen Z (born ~1997-2012)",
            distinctiveFeatures: [
                "Heavy influence from social media platforms (TikTok, Twitter/X, Instagram)",
                "AAVE features widespread in multiracial youth speech",
                "Internet slang integrated into everyday speech",
                "Emoji and text-speak influence on spoken language",
                "Rapid turnover of slang terms"
            ],
            
            examples: [
                { term: "no cap", meaning: "no lie", origin: "AAVE via hip-hop/internet" },
                { term: "slay", meaning: "succeed/excel", origin: "LGBTQ+/Black ballroom culture" },
                { term: "bussin", meaning: "really good", origin: "AAVE" },
                { term: "mid", meaning: "mediocre", origin: "Internet/AAVE" }
            ]
        },
        
        millennial: {
            generation: "Millennials (born ~1981-1996)",
            distinctiveFeatures: [
                "Early internet slang (LOL, OMG, etc. in speech)",
                "AAVE influence from 90s-2000s hip-hop",
                "More stable slang (less rapid turnover than Gen Z)"
            ]
        },
        
        languageChange: {
            note: "Youth language is cutting edge of language change",
            process: "Today's youth slang → Tomorrow's mainstream speech → Eventually Standard English"
        }
    },
    
    // ========================================
    // URBAN VS RURAL VARIATIONS
    // ========================================
    urbanRuralVariations: {
        urban: {
            context: "Cities - high population density, ethnic/linguistic diversity",
            features: [
                "More rapid language change",
                "More slang innovation",
                "More ethnic dialect contact and borrowing",
                "Youth multi-ethnic vernaculars emerging",
                "AAVE and other ethnolects more prominent"
            ]
        },
        
        rural: {
            context: "Rural areas - lower density, less ethnic diversity in many regions",
            features: [
                "Preservation of older features",
                "Slower language change",
                "Regional dialects stronger (Southern, Appalachian, etc.)",
                "Less ethnic dialect contact in predominantly white rural areas",
                "But: Rural Black communities maintain AAVE"
            ]
        }
    }
};

// Global availability
if (typeof window !== 'undefined') {
    window.regionalVariations = window.regionalVariations;
}

console.log('✅ Regional Variations loaded - VibeLyf understands language diversity is systematic and regional');
