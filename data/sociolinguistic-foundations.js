/**
 * Sociolinguistic Foundations - VibeLyf Knowledge Base
 * Purpose: Foundational concepts for understanding cultural language varieties
 * 
 * This data helps VibeLyf understand that cultural language features are
 * SYSTEMATIC and GRAMMATICALLY VALID, not errors to be "fixed"
 */

window.sociolinguisticFoundations = {
    // Core Concepts
    concepts: {
        dialect: {
            definition: "A variety of language distinguished by grammar, vocabulary, and pronunciation",
            keyPoint: "Dialects are systematic language systems, not 'broken' versions of Standard English",
            examples: ["Southern American English", "AAVE", "Appalachian English", "New York English"],
            sociolinguisticContext: "Dialects carry social meaning and identity markers. They are rule-governed systems.",
            culturalRelevance: "Understanding dialects helps VibeLyf recognize valid linguistic patterns in user input"
        },
        
        vernacular: {
            definition: "Informal spoken form of language, often with less prestige in formal contexts",
            keyPoint: "Vernaculars are natural, acquired language varieties used in everyday communication",
            examples: ["AAVE", "Chicano English", "Appalachian English", "Working-class speech"],
            sociolinguisticContext: "Vernaculars have 'covert prestige' - valued within their communities even if stigmatized outside",
            culturalRelevance: "Most VibeLyf users will input commands in vernacular forms - we must recognize them as valid"
        },
        
        sociolect: {
            definition: "Dialect associated with particular social class, group, or profession",
            keyPoint: "Language varies by social identity, not just geography",
            examples: ["Working-class speech patterns", "Academic language", "Youth slang", "Corporate jargon"],
            sociolinguisticContext: "Sociolects mark social group membership and identity",
            culturalRelevance: "Different CultrVibe profiles represent different sociolects"
        },
        
        ethnolect: {
            definition: "Dialect associated with an ethnic group",
            keyPoint: "Ethnolects are linguistic expressions of ethnic identity and cultural heritage",
            examples: ["AAVE (African American)", "Chicano English (Latino)", "Asian American English"],
            sociolinguisticContext: "Ethnolects carry ethnic identity and often arise from contact between heritage languages and English",
            culturalRelevance: "Core to VibeLyf's mission - respecting ethnic linguistic identity in coding"
        },
        
        covertPrestige: {
            definition: "Value and prestige within a community, even if stigmatized by mainstream society",
            keyPoint: "Non-standard features can signal in-group membership, solidarity, and authenticity",
            examples: [
                "AAVE features valued within Black communities",
                "Southern accent valued in Southern communities",
                "Street slang valued in urban youth culture"
            ],
            sociolinguisticContext: "Speakers may intentionally use stigmatized features to signal identity and belonging",
            culturalRelevance: "VibeLyf celebrates covert prestige - we don't 'fix' language, we understand it"
        },
        
        standardLanguage: {
            definition: "Variety with overt prestige, typically used in formal/official contexts",
            keyPoint: "Standard English is ONE variety among many - not inherently 'better' or 'more correct'",
            examples: ["Standard American English", "Standard British English", "Academic English"],
            sociolinguisticContext: "Standards are socially constructed and maintained by institutional power",
            culturalRelevance: "VibeLyf normalizes TO Standard English for code generation, but respects non-standard input"
        },
        
        codeSwitching: {
            definition: "Alternating between languages or language varieties in a single conversation",
            keyPoint: "Code-switching is a sophisticated linguistic skill, not confusion or inability",
            examples: [
                "Switching between AAVE and Standard English based on context",
                "Mixing Spanish and English (Spanglish)",
                "Professional language at work, slang with friends"
            ],
            sociolinguisticContext: "Bilingual and bidialectal speakers code-switch based on audience, topic, and setting",
            culturalRelevance: "VibeLyf users may code-switch within their input - we must recognize both varieties"
        },
        
        linguisticJustice: {
            definition: "The principle that all language varieties have equal validity and deserve respect",
            keyPoint: "Fighting language discrimination is fighting social discrimination",
            examples: [
                "Recognizing AAVE as grammatically systematic",
                "Valuing Southern dialects in professional settings",
                "Respecting code-switching and multilingualism"
            ],
            sociolinguisticContext: "Language attitudes reflect and reinforce social inequalities",
            culturalRelevance: "VibeLyf's ENTIRE MISSION - 'Where Culture Codes the Future' - is about linguistic justice"
        }
    },
    
    // Why This Matters for VibeLyf
    applicationToVibeLyf: {
        inputUnderstanding: "These concepts help VibeLyf RECOGNIZE valid cultural language patterns in user commands",
        
        normalizationStrategy: "We normalize TO Standard English for code generation, but we UNDERSTAND cultural input as valid",
        
        culturalRespect: "By understanding sociolinguistic concepts, VibeLyf treats cultural language with respect, not as errors",
        
        accurateProcessing: "Recognizing grammatical patterns (like Habitual 'Be' or Zero Copula) prevents misinterpretation",
        
        communityAlignment: "Understanding covert prestige helps us serve communities who use stigmatized features proudly",
        
        missionCritical: "VibeLyf = 'Vibe + Ethnicity' - sociolinguistics is our CORE, not an add-on"
    },
    
    // Educational Context (for future UI features)
    educationalNotes: {
        forDevelopers: "Understanding these concepts makes you a better developer who builds inclusive technology",
        
        forUsers: "Your language is valid. Your dialect is systematic. VibeLyf gets it.",
        
        forCritics: "This isn't 'dumbing down' - it's recognizing linguistic diversity as sophisticated and rule-governed",
        
        researchBased: "These concepts come from decades of peer-reviewed sociolinguistic research"
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.sociolinguisticFoundations = window.sociolinguisticFoundations;
}

console.log('✅ Sociolinguistic Foundations loaded - VibeLyf understands cultural language is SYSTEMATIC');
