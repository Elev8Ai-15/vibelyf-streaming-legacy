/**
 * Hybrid Generation Service
 * 
 * Provides flexible code generation with multiple strategies:
 * 1. GenSpark (primary) - Multi-model intelligence
 * 2. Gemini (fallback) - User's API key
 * 3. Configurable priority
 * 
 * Benefits:
 * - Simplicity of GenSpark when available
 * - Fallback to user's Gemini API key
 * - No vendor lock-in
 * - User controls costs
 * 
 * @class HybridGenerationService
 * @version 1.0.0
 * @date 2025-11-19
 */

class HybridGenerationService {
    constructor() {
        this.serviceName = 'Hybrid Generation';
        this.version = '1.0.0';
        
        // Initialize available services
        this.services = {
            genspark: null,  // Will initialize if available
            gemini: null     // Will initialize if API key present
        };
        
        // Configuration
        this.config = {
            primaryMode: 'gemini',  // 'genspark' or 'gemini'
            autoFallback: true,      // Automatically fallback on failure
            geminiModels: [
                'gemini-2.0-flash-exp',
                'gemini-1.5-pro-latest',
                'gemini-1.5-flash-latest',
                'gemini-1.0-pro'
            ]
        };
        
        // Metrics
        this.metrics = {
            totalRequests: 0,
            gensparkRequests: 0,
            geminiRequests: 0,
            gensparkFallbacks: 0,
            successRate: 0
        };
        
        this.initialize();
    }
    
    /**
     * Initialize available services
     */
    initialize() {
        console.log('🔄 Initializing Hybrid Generation Service...');
        
        // Try to initialize GenSpark
        if (typeof GenSparkService !== 'undefined') {
            try {
                this.services.genspark = new GenSparkService();
                console.log('✅ GenSpark service available');
            } catch (error) {
                console.warn('⚠️ GenSpark initialization failed:', error);
            }
        }
        
        // Try to initialize Gemini
        if (typeof GeminiAPIService !== 'undefined') {
            try {
                this.services.gemini = new GeminiAPIService();
                if (this.services.gemini.hasAPIKey()) {
                    console.log('✅ Gemini service available (user API key configured)');
                } else {
                    console.log('⚠️ Gemini service available but no API key configured');
                }
            } catch (error) {
                console.warn('⚠️ Gemini initialization failed:', error);
            }
        }
        
        // Load user preferences
        this.loadPreferences();
        
        console.log(`✅ Hybrid service initialized (Primary: ${this.config.primaryMode})`);
    }
    
    /**
     * Load user preferences from storage
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('hybridGenerationConfig');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.config = { ...this.config, ...prefs };
            }
        } catch (error) {
            console.warn('⚠️ Failed to load preferences:', error);
        }
    }
    
    /**
     * Save user preferences to storage
     */
    savePreferences() {
        try {
            localStorage.setItem('hybridGenerationConfig', JSON.stringify(this.config));
        } catch (error) {
            console.warn('⚠️ Failed to save preferences:', error);
        }
    }
    
    /**
     * Generate full-stack application using hybrid strategy
     * 
     * @param {string} userInput - User's description in cultural language
     * @param {object} options - Generation options with cultural context
     * @returns {Promise<object>} Generated project
     */
    async generateFullStack(userInput, options = {}) {
        console.log('🚀 Hybrid Generation Service starting...');
        console.log(`📝 Primary mode: ${this.config.primaryMode}`);
        
        this.metrics.totalRequests++;
        
        const startTime = Date.now();
        
        try {
            // Try primary mode first
            const primaryService = this.services[this.config.primaryMode];
            
            if (primaryService && await this.isServiceAvailable(this.config.primaryMode)) {
                console.log(`🎯 Using primary service: ${this.config.primaryMode}`);
                
                try {
                    const result = await this.generateWithService(
                        this.config.primaryMode,
                        userInput,
                        options
                    );
                    
                    const duration = Date.now() - startTime;
                    console.log(`✅ Generation complete with ${this.config.primaryMode} (${duration}ms)`);
                    
                    return result;
                    
                } catch (primaryError) {
                    console.warn(`⚠️ Primary service (${this.config.primaryMode}) failed:`, primaryError);
                    
                    if (this.config.autoFallback) {
                        return await this.attemptFallback(userInput, options, primaryError);
                    }
                    
                    throw primaryError;
                }
            } else {
                console.log(`⚠️ Primary service (${this.config.primaryMode}) unavailable`);
                
                if (this.config.autoFallback) {
                    return await this.attemptFallback(userInput, options, new Error('Primary service unavailable'));
                }
                
                throw new Error(`Primary service (${this.config.primaryMode}) is not available`);
            }
            
        } catch (error) {
            console.error('❌ All generation methods failed:', error);
            throw new Error(`Generation failed: ${error.message}`);
        }
    }
    
    /**
     * Attempt fallback to alternate service
     */
    async attemptFallback(userInput, options, primaryError) {
        const fallbackMode = this.config.primaryMode === 'genspark' ? 'gemini' : 'genspark';
        
        console.log(`🔄 Attempting fallback to ${fallbackMode}...`);
        
        if (this.config.primaryMode === 'genspark') {
            this.metrics.gensparkFallbacks++;
        }
        
        const fallbackService = this.services[fallbackMode];
        
        if (fallbackService && await this.isServiceAvailable(fallbackMode)) {
            try {
                const result = await this.generateWithService(
                    fallbackMode,
                    userInput,
                    options
                );
                
                console.log(`✅ Fallback to ${fallbackMode} successful`);
                return result;
                
            } catch (fallbackError) {
                console.error(`❌ Fallback to ${fallbackMode} also failed:`, fallbackError);
                throw new Error(`Both primary (${this.config.primaryMode}) and fallback (${fallbackMode}) failed`);
            }
        } else {
            throw new Error(`Fallback service (${fallbackMode}) is not available`);
        }
    }
    
    /**
     * Generate with specific service
     */
    async generateWithService(serviceName, userInput, options) {
        const service = this.services[serviceName];
        
        if (serviceName === 'genspark') {
            this.metrics.gensparkRequests++;
            return await service.generateFullStack(userInput, options);
            
        } else if (serviceName === 'gemini') {
            this.metrics.geminiRequests++;
            
            // Use Gemini's generateApp method
            const aaveFeatures = options.detectedPatterns || [];
            const stylePreference = options.stylePreference || 'modern';
            
            // Build enhanced description with context
            let enhancedDescription = userInput;
            
            if (options.normalized && options.normalized !== userInput) {
                enhancedDescription = `${options.normalized}\n\nCultural Context: The user described this using ${options.culturalContext?.variety || 'cultural language'} patterns.`;
            }
            
            const result = await service.generateApp(
                enhancedDescription,
                aaveFeatures,
                stylePreference
            );
            
            // Format result to match expected structure
            return this.formatGeminiResult(result, options);
        }
        
        throw new Error(`Unknown service: ${serviceName}`);
    }
    
    /**
     * Format Gemini result to match expected project structure
     */
    formatGeminiResult(geminiResult, options) {
        // Gemini might return different format, normalize it
        return {
            projectName: geminiResult.projectName || 'vibelyf-app',
            description: geminiResult.description || 'Generated by VibeLyf',
            files: geminiResult.files || this.extractFilesFromGemini(geminiResult),
            features: geminiResult.features || ['Generated from cultural language input'],
            techStack: geminiResult.techStack || ['HTML5', 'CSS3', 'JavaScript'],
            culturalContext: options.culturalContext,
            detectedPatterns: options.detectedPatterns
        };
    }
    
    /**
     * Extract files from Gemini response (legacy format compatibility)
     */
    extractFilesFromGemini(result) {
        const files = [];
        
        // Check for different response formats
        if (result.html) {
            files.push({ path: 'index.html', content: result.html, type: 'html' });
        }
        if (result.css) {
            files.push({ path: 'css/style.css', content: result.css, type: 'css' });
        }
        if (result.javascript) {
            files.push({ path: 'js/script.js', content: result.javascript, type: 'javascript' });
        }
        
        return files;
    }
    
    /**
     * Check if service is available
     */
    async isServiceAvailable(serviceName) {
        const service = this.services[serviceName];
        
        if (!service) {
            return false;
        }
        
        if (serviceName === 'genspark') {
            // Check GenSpark health
            try {
                const health = await service.healthCheck();
                return health.healthy;
            } catch (error) {
                return false;
            }
        }
        
        if (serviceName === 'gemini') {
            // Check if API key is configured
            return service.hasAPIKey && service.hasAPIKey();
        }
        
        return false;
    }
    
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * Update configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.savePreferences();
        console.log('✅ Configuration updated:', this.config);
    }
    
    /**
     * Set primary mode
     */
    setPrimaryMode(mode) {
        if (mode === 'genspark' || mode === 'gemini') {
            this.config.primaryMode = mode;
            this.savePreferences();
            console.log(`✅ Primary mode set to: ${mode}`);
        } else {
            throw new Error(`Invalid mode: ${mode}`);
        }
    }
    
    /**
     * Get service metrics
     */
    getMetrics() {
        const total = this.metrics.totalRequests;
        const successful = this.metrics.gensparkRequests + this.metrics.geminiRequests;
        
        return {
            ...this.metrics,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            gensparkPercentage: total > 0 ? (this.metrics.gensparkRequests / total) * 100 : 0,
            geminiPercentage: total > 0 ? (this.metrics.geminiRequests / total) * 100 : 0,
            fallbackRate: this.metrics.gensparkRequests > 0 
                ? (this.metrics.gensparkFallbacks / this.metrics.gensparkRequests) * 100 
                : 0
        };
    }
    
    /**
     * Get service status
     */
    async getStatus() {
        const gensparkAvailable = await this.isServiceAvailable('genspark');
        const geminiAvailable = await this.isServiceAvailable('gemini');
        
        return {
            genspark: {
                available: gensparkAvailable,
                active: this.config.primaryMode === 'genspark'
            },
            gemini: {
                available: geminiAvailable,
                active: this.config.primaryMode === 'gemini',
                hasAPIKey: this.services.gemini?.hasAPIKey() || false
            },
            primaryMode: this.config.primaryMode,
            autoFallback: this.config.autoFallback
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HybridGenerationService;
}

// Make available globally
window.HybridGenerationService = HybridGenerationService;

console.log('✅ HybridGenerationService loaded successfully');
