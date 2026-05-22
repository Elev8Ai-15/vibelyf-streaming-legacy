/**
 * VIBENICITY MULTI-ENGINE ORCHESTRATOR
 * Routes build requests to the appropriate engine
 * - Image Forge: For builds with images or advanced UI
 * - Code Generator: For standard app generation
 * - API Generator: For backend/API generation
 */

window.VibenicityOrchestrator = {
    
    /**
     * Determine which engine should handle the request
     */
    selectEngine(message, options = {}) {
        const {
            hasImages = false,
            detectedSlang = [],
            files = []
        } = options;
        
        const lowerMsg = message.toLowerCase();
        
        console.log(`🎯 Orchestrator analyzing: "${message}"`);
        console.log(`   Has images: ${hasImages}, Files: ${files.length}`);
        
        // 1. API Generator (Claude) - for backend/API requests
        const isAPI = this.isAPIRequest(lowerMsg);
        console.log(`   Is API request: ${isAPI}`);
        if (isAPI) {
            return {
                engine: 'claude-api',
                reason: 'API generation request detected',
                confidence: 'high'
            };
        }
        
        // 2. Image Forge (Gemini Flash) - for builds with images
        if (hasImages || files.length > 0) {
            console.log(`   ✅ Selected: Image Forge (images provided)`);
            return {
                engine: 'image-forge',
                reason: 'Images provided - using Image Forge for visual integration',
                confidence: 'high'
            };
        }
        
        // 3. Image Forge - for UI-heavy requests
        const isUIHeavy = this.isUIHeavyRequest(lowerMsg);
        console.log(`   Is UI-heavy: ${isUIHeavy}`);
        if (isUIHeavy) {
            console.log(`   ✅ Selected: Image Forge (UI-focused)`);
            return {
                engine: 'image-forge',
                reason: 'UI-focused request - Image Forge has better visual generation',
                confidence: 'medium'
            };
        }
        
        // 4. Default: Standard Code Generator (Gemini)
        console.log(`   ✅ Selected: Code Generator (default)`);
        return {
            engine: 'code-generator',
            reason: 'Standard app generation request',
            confidence: 'high'
        };
    },
    
    /**
     * Check if this is an API generation request
     */
    isAPIRequest(lowerMsg) {
        // Must explicitly mention API/backend keywords WITHOUT frontend keywords
        const apiKeywords = ['api', 'backend', 'rest', 'endpoint', 'server', 'database api', 'rest api', 'backend api'];
        const frontendKeywords = ['app', 'website', 'page', 'site', 'ui', 'interface', 'form', 'calculator', 'todo', 'tracker', 'spending'];
        
        // Check if message has API keywords
        const hasAPIKeyword = apiKeywords.some(keyword => lowerMsg.includes(keyword));
        
        // Check if message has frontend keywords (which should NOT use API generator)
        const hasFrontendKeyword = frontendKeywords.some(keyword => lowerMsg.includes(keyword));
        
        // Only route to API generator if:
        // 1. Has explicit API keywords
        // 2. Does NOT have frontend keywords (or API keyword is more specific)
        if (hasAPIKeyword) {
            // If message has both API and frontend keywords, check which is more specific
            if (hasFrontendKeyword) {
                // Check for very explicit API requests
                const explicitAPI = ['rest api', 'backend api', 'api for', 'generate api', 'create api', 'build api'];
                return explicitAPI.some(phrase => lowerMsg.includes(phrase));
            }
            // Has API keyword and no frontend keyword - route to API generator
            return true;
        }
        
        return false;
    },
    
    /**
     * Check if this is a UI-heavy request
     */
    isUIHeavyRequest(lowerMsg) {
        const uiKeywords = [
            'landing page', 'portfolio', 'gallery', 'showcase',
            'photography', 'visual', 'design', 'ui', 'interface',
            'beautiful', 'stunning', 'modern design', 'sleek',
            'photo', 'image', 'picture', 'graphic'
        ];
        
        return uiKeywords.some(keyword => lowerMsg.includes(keyword));
    },
    
    /**
     * Generate with the appropriate engine
     */
    async generate(message, options = {}) {
        const selection = this.selectEngine(message, options);
        
        console.log(`🎯 Engine Selection:`, selection);
        
        switch (selection.engine) {
            case 'claude-api':
                return await this.generateWithClaudeAPI(message, options);
                
            case 'image-forge':
                return await this.generateWithImageForge(message, options);
                
            case 'code-generator':
            default:
                return await this.generateWithCodeGenerator(message, options);
        }
    },
    
    /**
     * Generate with Claude API Generator
     */
    async generateWithClaudeAPI(message, options) {
        if (!window.ClaudeAPIGenerator) {
            throw new Error('Claude API Generator not loaded');
        }
        
        console.log('🔌 Using Claude API Generator');
        
        const culturalContext = options.detectedSlang || [];
        const result = await window.ClaudeAPIGenerator.generate(message, culturalContext);
        
        return {
            engine: 'claude-api',
            success: result.success,
            result: result
        };
    },
    
    /**
     * Generate with Image Forge
     */
    async generateWithImageForge(message, options) {
        if (!window.VibenicityImageForge) {
            throw new Error('Image Forge not loaded');
        }
        
        console.log('🎨 Using Image Forge Engine');
        
        // Initialize if needed
        const geminiKey = localStorage.getItem('gemini_api_key') || '';
        if (geminiKey && !window.VibenicityImageForge.isReady()) {
            window.VibenicityImageForge.init(geminiKey);
        }
        
        // Check if ready
        if (!window.VibenicityImageForge.isReady()) {
            throw new Error('Image Forge not initialized. Please set your Gemini API key.');
        }
        
        // Translate message using linguistics if available
        let translatedMessage = message;
        if (window.culturalVocabularyMaster && window.culturalVocabularyMaster.translate) {
            translatedMessage = window.culturalVocabularyMaster.translate(message);
        }
        
        // Generate with retry
        const files = options.files || [];
        const result = await window.VibenicityImageForge.generateWithRetry(translatedMessage, files);
        
        // Inject images if provided
        let finalCode = result.code;
        if (files.length > 0) {
            const blobUrls = window.VibenicityImageForge.createBlobUrls(files);
            finalCode = window.VibenicityImageForge.injectImages(finalCode, blobUrls);
        }
        
        return {
            engine: 'image-forge',
            success: true,
            code: finalCode,
            model: result.successModel,
            result: result
        };
    },
    
    /**
     * Generate with standard Code Generator
     */
    async generateWithCodeGenerator(message, options) {
        if (!window.VibenicityCodeGenerator) {
            throw new Error('Code Generator not loaded');
        }
        
        console.log('🚀 Using Standard Code Generator');
        
        const interpretedMessage = options.interpretedMessage || message;
        const detectedSlang = options.detectedSlang || [];
        
        const result = await window.VibenicityCodeGenerator.generateCode(
            message,
            interpretedMessage,
            detectedSlang
        );
        
        return {
            engine: 'code-generator',
            success: result.success,
            code: result.code,
            message: result.message,
            result: result
        };
    },
    
    /**
     * Get status of all engines
     */
    getStatus() {
        return {
            'claude-api': {
                loaded: !!window.ClaudeAPIGenerator,
                ready: window.ClaudeAPIGenerator ? window.ClaudeAPIGenerator.isInitialized?.() : false
            },
            'image-forge': {
                loaded: !!window.VibenicityImageForge,
                ready: window.VibenicityImageForge ? window.VibenicityImageForge.isReady() : false
            },
            'code-generator': {
                loaded: !!window.VibenicityCodeGenerator,
                ready: window.VibenicityCodeGenerator ? !!window.VibenicityCodeGenerator.apiKey : false
            }
        };
    }
};

// Export for debugging
console.log('✅ VibenicityOrchestrator loaded');
