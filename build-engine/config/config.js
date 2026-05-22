/**
 * VIBELYF BUILD ENGINE - CONFIGURATION
 * Central configuration for all Build Engine components
 */

require('dotenv').config();

const config = {
    // API Keys
    apis: {
        genius: {
            apiKey: process.env.GENIUS_API_KEY,
            baseUrl: 'https://api.genius.com',
            rateLimitPerDay: 1000,
            timeout: 10000
        },
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4-turbo-preview',
            maxTokens: 1000,
            temperature: 0.3,
            timeout: 30000
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY || 'AIzaSyB9jQaRGkfj4Tyq5y5j45RiYAeb_H2e-2g',
            model: 'gemini-2.5-flash',
            maxTokens: 2000,
            temperature: 0.7
        },
        spotify: {
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            baseUrl: 'https://api.spotify.com/v1'
        }
    },

    // Scanning Configuration
    scanning: {
        genres: ['hip-hop', 'rap', 'reggaeton', 'latin', 'k-pop', 'r&b'],
        songsPerGenre: 10,
        totalSongsPerScan: 50,
        scanFrequency: process.env.SCAN_FREQUENCY || 'daily',
        maxTermsPerScan: parseInt(process.env.MAX_TERMS_PER_SCAN) || 20,
        minLyricsLength: 100 // Minimum characters for valid lyrics
    },

    // Validation Settings
    validation: {
        minConfidenceScore: parseInt(process.env.MIN_CONFIDENCE_SCORE) || 60,
        autoApproveThreshold: parseInt(process.env.AUTO_APPROVE_THRESHOLD) || 90,
        minSources: 2,
        minExamples: 2,
        requiredFields: [
            'term',
            'meaning',
            'definition',
            'origin',
            'etymology',
            'category',
            'confidence',
            'context',
            'examples',
            'sources'
        ],
        validCategories: [
            'aave',
            'prison',
            'southern',
            'hispanic',
            'digital',
            'appalachian',
            'british',
            'asian_american',
            'elitist',
            'gang',
            'internet'
        ]
    },

    // File Paths
    paths: {
        vocabularyDatabase: process.env.VOCABULARY_DATABASE_PATH || '../js/cultural-vocabulary-master.js',
        pendingTerms: process.env.PENDING_TERMS_PATH || './data/pending_terms.json',
        processedTerms: process.env.PROCESSED_TERMS_PATH || './data/processed_terms.json',
        scanResults: './data/scan_results.json',
        logs: './logs',
        backups: './data/backups',
        lyricsCache: './data/lyrics_cache'
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        saveToFile: true,
        logDirectory: './logs'
    },

    // Rate Limiting (to avoid API throttling)
    rateLimits: {
        geniusRequestsPerMinute: 10,
        openaiRequestsPerMinute: 3,
        geminiRequestsPerMinute: 10,
        delayBetweenRequests: 1000 // milliseconds
    },

    // Database
    database: {
        currentVersion: '2.0',
        metadataFields: {
            totalTerms: 453,
            lastUpdated: new Date().toISOString().split('T')[0],
            categories: 11
        }
    },

    // Admin Dashboard
    dashboard: {
        port: parseInt(process.env.PORT) || 3000,
        title: 'VIBELYF Build Engine Dashboard',
        autoRefreshInterval: 30000 // 30 seconds
    },

    // Environment
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
};

// Validation: Check required API keys
function validateConfig() {
    const errors = [];

    if (!config.apis.genius.apiKey) {
        errors.push('Missing GENIUS_API_KEY');
    }
    if (!config.apis.openai.apiKey) {
        errors.push('Missing OPENAI_API_KEY');
    }
    if (!config.apis.gemini.apiKey) {
        errors.push('Missing GEMINI_API_KEY');
    }

    if (errors.length > 0 && config.isProduction) {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }

    if (errors.length > 0 && config.isDevelopment) {
        console.warn('⚠️  Warning: Missing API keys:', errors.join(', '));
    }
}

// Validate on load
validateConfig();

module.exports = config;
