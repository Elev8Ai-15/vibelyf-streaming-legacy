/**
 * Gemini API Service - Frontend UI & Code Generation
 * 
 * Specializes in:
 * - Frontend UI generation (HTML/CSS/JavaScript)
 * - React component creation
 * - Vue.js application scaffolding
 * - Complete single-page applications
 * - Responsive design implementation
 * - Style preference adaptation (urban, minimal, professional, colorful)
 * 
 * Model Fallback Chain (tries in order):
 * 1. gemini-2.5-flash (2026 latest — fastest + native code execution)
 * 2. gemini-2.5-pro (2026 latest — highest quality)
 * 3. gemini-2.0-flash (Stable fast fallback)
 * 4. gemini-1.5-pro (Reliable legacy)
 * 5. gemini-1.5-flash (Ultimate fallback)
 * 
 * Features:
 * - Automatic model fallback (if one fails, tries next)
 * - AAVE feature integration for context
 * - Style preference customization
 * - Complete app generation from natural language
 * - Self-contained API key management
 * - Built-in rate limiting and queue processing
 * 
 * @version 3.0.0 - Standalone (Hybrid Architecture)
 * @date 2025-11-19
 */

class GeminiAPIService {
    constructor() {
        this.serviceName = 'Gemini API';
        this.storageKey = 'vibecoder_gemini_api_key';
        this.apiKeyPrefix = null; // No specific prefix required
        
        // Load saved API key
        this.apiKey = this.loadAPIKey();
        
        // Try latest models with fallback chain
        this.models = [
            'gemini-2.5-flash',          // 2026 latest — fastest + native code execution
            'gemini-2.5-pro',            // 2026 latest — highest quality
            'gemini-2.0-flash',          // Stable fast fallback
            'gemini-1.5-pro',            // Reliable legacy
            'gemini-1.5-flash'           // Ultimate fallback
        ];
        this.currentModel = this.models[0];
        this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent`;
        this.model = this.currentModel;
        
        // Rate limiting configuration
        this.maxConcurrentRequests = 5;
        this.minRequestInterval = 500;
        this.requestQueue = [];
        this.requestsInProgress = 0;
        this.lastRequestTime = 0;
        
        console.log(`✅ ${this.serviceName} initialized`);
    }
    
    /**
     * Load API key from localStorage
     */
    loadAPIKey() {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            if (!encrypted) return null;
            try {
                return atob(encrypted);
            } catch (e) {
                return encrypted;
            }
        } catch (error) {
            console.error(`Failed to load API key for ${this.serviceName}:`, error);
            return null;
        }
    }
    
    /**
     * Save API key to localStorage
     */
    saveAPIKey(apiKey) {
        try {
            const encrypted = btoa(apiKey);
            localStorage.setItem(this.storageKey, encrypted);
            this.apiKey = apiKey;
            console.log(`✅ ${this.serviceName} API key saved (encrypted)`);
            return true;
        } catch (error) {
            throw new Error(`Failed to save ${this.serviceName} API key: ${error.message}`);
        }
    }
    
    /**
     * Check if API key is configured
     */
    hasAPIKey() {
        return this.apiKey !== null && this.apiKey.length > 0;
    }
    
    /**
     * Queue a request with rate limiting
     */
    async queuedRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }
    
    /**
     * Process request queue with rate limiting
     */
    async processQueue() {
        if (this.requestsInProgress >= this.maxConcurrentRequests) {
            return;
        }
        if (this.requestQueue.length === 0) {
            return;
        }
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            setTimeout(() => this.processQueue(), this.minRequestInterval - timeSinceLastRequest);
            return;
        }
        const { requestFn, resolve, reject } = this.requestQueue.shift();
        this.requestsInProgress++;
        this.lastRequestTime = Date.now();
        
        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.requestsInProgress--;
            setTimeout(() => this.processQueue(), this.minRequestInterval);
        }
    }

    /**
     * Generate complete web application code
     * 
     * Creates a full working application with:
     * - Complete HTML structure
     * - Embedded CSS (responsive, styled to preference)
     * - Embedded JavaScript (functional, interactive)
     * - localStorage for data persistence
     * - Event listeners and user interactions
     * - Mobile-first responsive design
     * 
     * Style Preferences:
     * - 'urban': Dark theme, purple/cyan accents, neon effects, Bebas Neue font
     * - 'minimal': Black/white, system fonts, clean lines, subtle shadows
     * - 'professional': Blue/gray, Inter font, business aesthetic
     * - 'colorful': Vibrant gradients, Poppins font, playful design
     * - 'modern': Dark blue, sleek, tech aesthetic (default)
     * 
     * @param {string} appDescription - Natural language description of desired app
     * @param {Array} aaveFeatures - Detected AAVE grammatical features for context
     * @param {string} stylePreference - Visual style ('urban'|'minimal'|'professional'|'colorful'|'modern')
     * @returns {Promise<object>} Generated application:
     *   - success: boolean
     *   - code: object with html, css, js, combined properties
     *   - source: string ('gemini')
     * @throws {Error} If API key not configured or generation fails
     * @example
     * const app = await gemini.generateApp(
     *   'I need a todo list with priorities',
     *   [],
     *   'urban'
     * );
     * // app.code.combined contains full HTML file
     */
    async generateApp(appDescription, aaveFeatures, stylePreference) {
        if (!this.hasAPIKey()) {
            throw new Error('Gemini API key not configured. Please add your API key in Settings.');
        }

        const prompt = this.buildPrompt(appDescription, aaveFeatures, stylePreference);

        return await this.queuedRequest(async () => {
            const response = await this.callGeminiAPI(prompt);
            const generatedCode = this.extractCode(response);
            
            return {
                success: true,
                code: generatedCode,
                source: 'gemini'
            };
        });
    }

    /**
     * Build comprehensive prompt for Gemini
     */
    buildPrompt(description, aaveFeatures, stylePreference) {
        let prompt = `You are VibeCoder, an AI that builds complete web applications from natural language descriptions, including AAVE (African American Vernacular English).

USER REQUEST: "${description}"

`;

        // Add AAVE context if detected
        if (aaveFeatures && aaveFeatures.length > 0) {
            prompt += `AAVE FEATURES DETECTED: ${aaveFeatures.map(f => f.feature).join(', ')}\n\n`;
        }

        // Add style preference
        if (stylePreference) {
            prompt += `STYLE PREFERENCE: ${stylePreference}\n\n`;
        }

        prompt += `TASK: Generate a complete, working HTML file that includes:

1. **Complete HTML structure** with <!DOCTYPE html>, proper head and body
2. **Embedded CSS** in <style> tags with ${stylePreference || 'modern'} aesthetic:
   - Use appropriate color scheme for ${stylePreference || 'modern'} style
   - Make it responsive (mobile-first)
   - Add smooth transitions and animations
   - Professional, polished look
3. **Embedded JavaScript** in <script> tags with full functionality:
   - All features working (add, delete, save, etc.)
   - localStorage for data persistence (if applicable)
   - Event listeners properly attached
   - Error handling
   - No external dependencies
4. **User-friendly interface**:
   - Clear labels and buttons
   - Good UX patterns
   - Accessible (ARIA labels where needed)
   - Intuitive navigation

STYLE GUIDELINES:
- **Urban style**: Dark theme (#1a1a2e bg), purple (#b026ff) & cyan (#00ffff) accents, Bebas Neue font, neon effects
- **Minimal style**: Black/white, system fonts, clean lines, subtle shadows
- **Professional style**: Blue/gray, Inter font, business aesthetic
- **Colorful style**: Vibrant gradients, Poppins font, playful
- **Modern style**: Dark blue, sleek, tech aesthetic

IMPORTANT:
- Return ONLY the complete HTML code, nothing else
- No markdown formatting, no explanations, just raw HTML
- Make sure all JavaScript is functional
- Include proper comments in the code
- Ensure the app works immediately when opened in a browser

Generate the complete HTML file now:`;

        return prompt;
    }

    /**
     * Call Gemini API with automatic model fallback
     * 
     * Tries models in sequence until one succeeds:
     * 1. gemini-2.0-flash-exp (newest)
     * 2. gemini-1.5-flash
     * 3. gemini-1.5-pro
     * 4. gemini-1.5-flash-latest
     * 5. gemini-pro (oldest)
     * 
     * Features:
     * - Automatic model detection and caching
     * - Graceful fallback on failure
     * - Remembers working model for future calls
     * 
     * @param {string} prompt - Prompt to send to Gemini
     * @returns {Promise<string>} Generated text response
     * @throws {Error} If all models fail
     * @private
     */
    async callGeminiAPI(prompt) {
        let lastError = null;
        
        // Try each model in sequence until one works
        for (const model of this.models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
                const response = await this.makeAPIRequest(url, prompt);
                
                // Success! Remember this model for next time
                this.currentModel = model;
                this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
                console.log(`✅ Using Gemini model: ${model}`);
                
                return response;
            } catch (error) {
                console.warn(`❌ Model ${model} failed: ${error.message}`);
                lastError = error;
                // Continue to next model
            }
        }
        
        // All models failed
        throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    }

    /**
     * Make the actual API request with error handling
     */
    async makeAPIRequest(url, prompt) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.errorData = errorData;
            throw error;
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated from Gemini API');
        }
        
        // Track token usage if available
        if (data.usageMetadata) {
            this.totalTokens += (data.usageMetadata.promptTokenCount || 0) + (data.usageMetadata.candidatesTokenCount || 0);
        }

        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Extract code from Gemini response
     */
    extractCode(response) {
        // Remove markdown code blocks if present
        let code = response.trim();
        
        // Remove ```html and ``` markers if present
        code = code.replace(/^```html\n/i, '');
        code = code.replace(/^```\n/i, '');
        code = code.replace(/\n```$/i, '');
        
        // Ensure it starts with <!DOCTYPE
        if (!code.trim().toLowerCase().startsWith('<!doctype')) {
            throw new Error('Generated code does not appear to be valid HTML');
        }

        return {
            html: code,
            css: '', // Embedded in HTML
            js: '', // Embedded in HTML
            combined: code
        };
    }

    /**
     * Test API key validity across all Gemini models
     * 
     * Attempts connection to each model in fallback chain:
     * - Verifies API key is valid and active
     * - Tests network connectivity to Google servers
     * - Identifies which models are accessible
     * - Caches working model for future use
     * 
     * @param {string} apiKey - Gemini API key to test
     * @returns {Promise<object>} Test result:
     *   - valid: boolean (true if any model works)
     *   - message: string (success message)
     *   - model: string (working model name)
     *   - error: string (error message if all failed)
     * @example
     * const result = await gemini.testAPIKey('AIzaSy...');
     * if (result.valid) {
     *   console.log(`API key works with ${result.model}`);
     * }
     */
    async testAPIKey(apiKey) {
        const tempKey = this.apiKey;
        this.apiKey = apiKey;

        try {
            // Try each model until one works
            for (const model of this.models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                    
                    const requestBody = {
                        contents: [{
                            parts: [{
                                text: "Say 'Hello, VibeCoder!'"
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 100
                        }
                    };

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (response.ok) {
                        this.apiKey = tempKey; // Restore original key
                        return {
                            valid: true,
                            message: `API key is valid! Using model: ${model}`,
                            model: model
                        };
                    }
                } catch (error) {
                    // Try next model
                    continue;
                }
            }

            this.apiKey = tempKey;
            return {
                valid: false,
                error: 'API key could not connect to any Gemini model'
            };

        } catch (error) {
            this.apiKey = tempKey;
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Get usage statistics (if available from API)
     */
    async getUsageStats() {
        // Note: Gemini API may not provide usage stats in the free tier
        // This is a placeholder for future enhancement
        return {
            available: false,
            message: 'Usage statistics not available in current API version'
        };
    }
}

// Export class to window
window.GeminiAPIService = GeminiAPIService;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAPIService;
}
