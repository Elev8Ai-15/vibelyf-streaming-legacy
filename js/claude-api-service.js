/**
 * Claude API Service - Backend Logic & Security Generation
 * 
 * Specializes in:
 * - Backend API generation (Node.js/Express)
 * - Authentication middleware (JWT, OAuth, session-based)
 * - Security-focused code generation
 * - Complex reasoning and logic
 * - API middleware (CORS, validation, error handling)
 * 
 * Model: Claude 3 Haiku (claude-3-haiku-20240307)
 * - Free tier compatible
 * - 8,192 max tokens
 * - Best for backend logic and security
 * 
 * Extends: BaseAPIService for shared functionality
 * - Inherited: API key management, rate limiting, error handling
 * - Inherited: Usage tracking, retry logic, validation
 * 
 * @extends BaseAPIService
 * @version 2.1.0
 * @date 2025-11-19
 */

class ClaudeAPIService extends BaseAPIService {
    constructor() {
        super(
            'Claude API',
            'vibecoder_claude_api_key',
            'sk-ant-'
        );
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-haiku-20240307';
        this.maxTokens = 8192;
        
        // Rate limiting configuration
        this.maxConcurrentRequests = 3;
        this.minRequestInterval = 1000;
    }

    /**
     * Generate complete backend code (Node.js/Express API)
     * 
     * Creates production-ready backend with:
     * - Server setup with proper configuration
     * - RESTful API routes (GET, POST, PUT, DELETE)
     * - Middleware (CORS, body-parser, error handling)
     * - Database connection setup
     * - Environment variable configuration
     * - Security best practices
     * 
     * @param {object} spec - Technical specification object
     * @param {string} spec.appType - Type of application
     * @param {object} spec.backend - Backend requirements
     * @param {string} spec.backend.language - Backend language (e.g., 'Node.js')
     * @param {string} spec.backend.framework - Framework to use (e.g., 'Express')
     * @param {string[]} spec.backend.endpoints - Required API endpoints
     * @param {string[]} spec.backend.middleware - Required middleware
     * @param {object} spec.database - Database configuration
     * @param {string} spec.database.type - Database type (e.g., 'PostgreSQL')
     * @param {object} [spec.integrations] - Third-party integrations
     * @param {Array} [aaveFeatures] - Detected AAVE features for context
     * @returns {Promise<object>} Generated backend code with structure:
     *   - success: boolean
     *   - code: object with file paths and contents
     *   - model: string (model name used)
     *   - language: string (backend language)
     * @throws {Error} If API key not configured or generation fails
     * @example
     * const spec = {
     *   appType: 'todo',
     *   backend: {
     *     language: 'Node.js',
     *     framework: 'Express',
     *     endpoints: ['GET /tasks', 'POST /tasks'],
     *     middleware: ['cors', 'errorHandler']
     *   },
     *   database: { type: 'PostgreSQL' }
     * };
     * const result = await claude.generateBackend(spec);
     */
    async generateBackend(spec, aaveFeatures = null) {
        if (!this.hasAPIKey()) {
            throw new Error('Claude API key not configured');
        }

        const prompt = this.buildBackendPrompt(spec, aaveFeatures);
        
        return await this.queuedRequest(async () => {
            const response = await this.callClaudeAPI(prompt);
            const code = this.extractCode(response);
            
            return {
                success: true,
                code: code,
                model: this.model,
                language: spec.backend?.language || 'Node.js'
            };
        });
    }

    /**
     * Generate authentication middleware
     * 
     * Creates authentication system with:
     * - Signup/login/logout flows
     * - Token generation and validation (JWT)
     * - Password hashing (bcrypt)
     * - Protected route middleware
     * - Email verification (optional)
     * - Password reset (optional)
     * 
     * @param {string} authType - Authentication type ('JWT', 'OAuth', 'Session', 'Auth0', 'Firebase Auth')
     * @param {object} [features={}] - Optional authentication features
     * @param {boolean} [features.emailVerification] - Enable email verification
     * @param {boolean} [features.passwordReset] - Enable password reset
     * @param {boolean} [features.twoFactor] - Enable 2FA
     * @param {string} [features.oauthProvider] - OAuth provider (for OAuth type)
     * @returns {Promise<string>} Generated authentication code
     * @throws {Error} If API key not configured
     * @example
     * const auth = await claude.generateAuth('JWT', {
     *   emailVerification: true,
     *   passwordReset: true
     * });
     */
    async generateAuth(authType, features = {}) {
        const prompt = this.buildAuthPrompt(authType, features);
        const response = await this.callClaudeAPI(prompt);
        return this.extractCode(response);
    }

    /**
     * Generate API middleware (CORS, validation, error handling)
     * 
     * Creates middleware for:
     * - CORS configuration (cross-origin requests)
     * - Request validation (input sanitization)
     * - Error handling (centralized error management)
     * - Rate limiting (API throttling)
     * - Logging (request/response logging)
     * - Security headers (helmet)
     * 
     * @param {object} requirements - Middleware requirements
     * @param {boolean} [requirements.cors] - Enable CORS
     * @param {boolean} [requirements.validation] - Enable request validation
     * @param {boolean} [requirements.errorHandling] - Enable error handling
     * @param {boolean} [requirements.rateLimiting] - Enable rate limiting
     * @param {boolean} [requirements.logging] - Enable logging
     * @param {boolean} [requirements.security] - Enable security headers
     * @returns {Promise<string>} Generated middleware code
     * @throws {Error} If API key not configured
     * @example
     * const middleware = await claude.generateMiddleware({
     *   cors: true,
     *   validation: true,
     *   errorHandling: true,
     *   rateLimiting: true
     * });
     */
    async generateMiddleware(requirements) {
        const prompt = this.buildMiddlewarePrompt(requirements);
        const response = await this.callClaudeAPI(prompt);
        return this.extractCode(response);
    }

    /**
     * Build comprehensive backend generation prompt
     */
    buildBackendPrompt(spec, aaveFeatures) {
        const { appType, backend, database, integrations } = spec;
        
        let prompt = `You are VibeCoder's backend specialist. Generate a complete, production-ready backend API.

**PROJECT SPECIFICATION:**
App Type: ${appType}
Backend: ${backend.language} with ${backend.framework}
Database: ${database.type}
Endpoints Required: ${backend.endpoints.join(', ')}
Middleware Needed: ${backend.middleware.join(', ')}

${integrations ? `**INTEGRATIONS:**
${integrations.auth ? `- Authentication: ${integrations.auth}` : ''}
${integrations.payments ? `- Payments: ${integrations.payments}` : ''}
${integrations.storage ? `- Storage: ${integrations.storage}` : ''}` : ''}

${aaveFeatures ? `**CONTEXT (from AAVE analysis):**
User expressed: ${aaveFeatures.map(f => f.feature).join(', ')}
This suggests emphasis on: ${this.inferBackendFocus(aaveFeatures)}` : ''}

**REQUIREMENTS:**
1. Generate complete Node.js/Express backend with proper project structure
2. Include all necessary routes with REST conventions (GET, POST, PUT, DELETE)
3. Implement middleware: CORS, body-parser, error handling, request validation
4. Add authentication middleware if required
5. Include proper error handling and logging
6. Use environment variables for configuration
7. Add comments explaining key sections
8. Follow security best practices (input validation, SQL injection prevention, XSS protection)
9. Include database connection setup
10. Generate separate files for: server.js, routes/, middleware/, models/, config/

**OUTPUT FORMAT:**
Return a JSON object with this structure:
\`\`\`json
{
  "server.js": "// Main server file code here",
  "routes/api.js": "// API routes code here",
  "middleware/auth.js": "// Auth middleware code here",
  "middleware/errorHandler.js": "// Error handling middleware",
  "config/database.js": "// Database configuration",
  "models/User.js": "// User model if needed",
  ".env.example": "// Environment variables template",
  "package.json": "// NPM dependencies"
}
\`\`\`

Generate production-ready, secure, well-documented backend code.`;

        return prompt;
    }

    /**
     * Build authentication generation prompt
     */
    buildAuthPrompt(authType, features) {
        return `Generate ${authType} authentication middleware for Express.js.

**Requirements:**
- Type: ${authType} (JWT, OAuth, Session-based)
- Features: ${JSON.stringify(features)}
- Include: signup, login, logout, token refresh (if JWT)
- Security: bcrypt password hashing, rate limiting
- Error handling: proper HTTP status codes
- Middleware: protect routes, verify tokens

Return complete, production-ready authentication code with all necessary files.`;
    }

    /**
     * Build middleware generation prompt
     */
    buildMiddlewarePrompt(requirements) {
        return `Generate Express.js middleware for the following requirements:

${JSON.stringify(requirements, null, 2)}

Include:
- CORS configuration
- Request validation
- Error handling
- Rate limiting (if needed)
- Logging
- Security headers (helmet)

Return modular, reusable middleware code.`;
    }

    /**
     * Infer backend focus from AAVE features
     */
    inferBackendFocus(aaveFeatures) {
        const features = aaveFeatures.map(f => f.feature.toLowerCase());
        
        if (features.includes('habitual_be')) {
            return 'recurring/scheduled operations, automated tasks';
        }
        if (features.includes('perfective_done')) {
            return 'completion status tracking, task management';
        }
        if (features.includes('remote_past_been')) {
            return 'historical data tracking, long-term storage';
        }
        
        return 'standard CRUD operations with robust error handling';
    }

    /**
     * Call Claude API with rate limiting and error handling
     * 
     * Makes authenticated request to Claude API with:
     * - Automatic rate limiting via queue
     * - Retry logic with exponential backoff
     * - Token usage tracking
     * - Error handling with status codes
     * 
     * @param {string} prompt - Prompt to send to Claude
     * @param {object} [options={}] - Optional configuration
     * @param {number} [options.maxTokens] - Override max tokens (default: 8192)
     * @param {number} [options.temperature] - Model temperature 0-1 (default: 0.7)
     * @returns {Promise<string>} Generated text response
     * @throws {Error} If API request fails after retries
     * @private
     */
    async callClaudeAPI(prompt, options = {}) {
        return await this.queuedRequest(async () => {
            const requestBody = {
                model: this.model,
                max_tokens: options.maxTokens || this.maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: options.temperature || 0.7
            };

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
                error.status = response.status;
                error.errorData = errorData;
                throw error;
            }

            const data = await response.json();
            
            // Track token usage if available
            if (data.usage) {
                this.totalTokens += (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0);
            }
            
            return data.content[0].text;
        });
    }

    /**
     * Extract code from Claude response
     */
    extractCode(response) {
        // Try to extract JSON with file structure
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (e) {
                console.warn('Failed to parse JSON structure, extracting code blocks');
            }
        }

        // Fallback: extract all code blocks
        const codeBlocks = {};
        const codeMatches = response.matchAll(/```(\w+)?\n([\s\S]*?)\n```/g);
        
        let index = 0;
        for (const match of codeMatches) {
            const language = match[1] || 'javascript';
            const code = match[2];
            const filename = this.guessFilename(code, language, index);
            codeBlocks[filename] = code;
            index++;
        }

        return Object.keys(codeBlocks).length > 0 ? codeBlocks : { 'server.js': response };
    }

    /**
     * Guess filename from code content
     */
    guessFilename(code, language, index) {
        if (code.includes('const express = require') || code.includes('app.listen')) {
            return 'server.js';
        }
        if (code.includes('router.get') || code.includes('router.post')) {
            return 'routes/api.js';
        }
        if (code.includes('jwt.sign') || code.includes('bcrypt.hash')) {
            return 'middleware/auth.js';
        }
        if (code.includes('mongoose.connect') || code.includes('Pool') || code.includes('createConnection')) {
            return 'config/database.js';
        }
        if (code.includes('package.json') || code.includes('"dependencies"')) {
            return 'package.json';
        }
        if (code.includes('PORT=') || code.includes('DATABASE_URL=')) {
            return '.env.example';
        }
        
        return `file${index}.${language}`;
    }

    /**
     * Test API key validity
     * 
     * Performs minimal API call to verify:
     * - API key is valid and active
     * - Account has access to Claude 3 Haiku model
     * - Network connectivity to Anthropic servers
     * 
     * @param {string} [apiKey=null] - API key to test (uses stored key if null)
     * @returns {Promise<object>} Test result:
     *   - valid: boolean (true if key works)
     *   - message: string (success message)
     *   - error: string (error message if failed)
     * @example
     * const result = await claude.testAPIKey('sk-ant-...');
     * if (result.valid) {
     *   console.log('API key works!');
     * }
     */
    async testAPIKey(apiKey = null) {
        const testKey = apiKey || this.apiKey;
        
        if (!testKey) {
            return { valid: false, error: 'No API key provided' };
        }

        try {
            const testPrompt = 'Respond with: "API key is valid"';
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': testKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 50,
                    messages: [{ role: 'user', content: testPrompt }]
                })
            });

            if (response.ok) {
                return { valid: true, message: 'Claude API key is valid' };
            } else {
                const errorData = await response.json();
                return { valid: false, error: errorData.error?.message || 'Invalid API key' };
            }
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get model information and capabilities
     * 
     * Returns details about Claude 3 Haiku model:
     * - Model name and provider
     * - Specialization areas
     * - Token limits
     * - Key strengths
     * 
     * @returns {object} Model information:
     *   - name: string (model display name)
     *   - provider: string (API provider)
     *   - specialization: string (what it's best at)
     *   - maxTokens: number (maximum output tokens)
     *   - strengths: string[] (key capabilities)
     * @example
     * const info = claude.getModelInfo();
     * console.log(`Using ${info.name} for ${info.specialization}`);
     */
    getModelInfo() {
        return {
            name: 'Claude 3.5 Sonnet',
            provider: 'Anthropic',
            specialization: 'Backend logic, security, complex reasoning',
            maxTokens: this.maxTokens,
            strengths: [
                'Backend API generation',
                'Security-focused code',
                'Complex logic and reasoning',
                'Detailed error handling',
                'Middleware architecture'
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClaudeAPIService;
}
