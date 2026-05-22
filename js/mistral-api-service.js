/**
 * Mistral API Service - API Integrations & Third-Party Services
 * 
 * Specializes in:
 * - Third-party API integrations (Stripe, PayPal, AWS, etc.)
 * - Authentication systems (JWT, OAuth, Auth0, Firebase)
 * - Payment processing (Stripe, PayPal, Square)
 * - Cloud storage (AWS S3, Cloudinary, Firebase Storage)
 * - Email services (SendGrid, Mailgun, AWS SES)
 * - Utility functions and helper code
 * - API client code generation
 * 
 * Model: Mistral Large (mistral-large-latest)
 * - 8,192 max tokens
 * - Fast and efficient generation
 * - Multilingual support
 * - Best balance of speed and quality
 * 
 * Supported Integrations:
 * - Authentication: JWT, OAuth 2.0, Auth0, Firebase Auth
 * - Payments: Stripe, PayPal
 * - Storage: AWS S3, Cloudinary, Firebase Storage
 * - Email: SendGrid, Mailgun
 * - And many more...
 * 
 * Extends: BaseAPIService for shared functionality
 * - Inherited: API key management, rate limiting, error handling
 * - Inherited: Usage tracking, retry logic, validation
 * 
 * @extends BaseAPIService
 * @version 2.1.0
 * @date 2025-11-19
 */

class MistralAPIService extends BaseAPIService {
    constructor() {
        super(
            'Mistral API',
            'vibecoder_mistral_api_key',
            null // No specific prefix required
        );
        this.apiEndpoint = 'https://api.mistral.ai/v1/chat/completions';
        this.model = 'mistral-large-latest';
        this.maxTokens = 8192;
        
        // Rate limiting configuration
        this.maxConcurrentRequests = 5;
        this.minRequestInterval = 500;
    }

    /**
     * Generate third-party integration code
     * 
     * Creates production-ready integration with:
     * - API client setup and configuration
     * - Authentication handling
     * - Request/response processing
     * - Error handling and retries
     * - Rate limiting strategies
     * - Environment variable configuration
     * - Usage examples
     * - Testing utilities
     * 
     * Supported Integration Types:
     * - 'auth': Authentication systems (JWT, OAuth, Auth0, Firebase)
     * - 'payment': Payment processing (Stripe, PayPal)
     * - 'storage': Cloud storage (AWS S3, Cloudinary, Firebase)
     * - 'email': Email services (SendGrid, Mailgun)
     * - 'custom': Generic API integration
     * 
     * @param {string} integrationType - Type of integration ('auth'|'payment'|'storage'|'email'|'custom')
     * @param {object} spec - Integration specification
     * @param {string} spec.provider - Service provider name (e.g., 'Stripe', 'Auth0')
     * @param {object} [spec.features] - Optional features to include
     * @param {Array} [aaveFeatures] - Detected AAVE features for context
     * @returns {Promise<object>} Generated integration code:
     *   - success: boolean
     *   - code: object with file paths and contents
     *   - model: string (model name used)
     *   - integrationType: string (integration type)
     * @throws {Error} If API key not configured or generation fails
     * @example
     * const integration = await mistral.generateIntegration('payment', {
     *   provider: 'Stripe',
     *   features: { subscriptions: true, webhooks: true }
     * });
     */
    async generateIntegration(integrationType, spec, aaveFeatures = null) {
        if (!this.hasAPIKey()) {
            throw new Error('Mistral API key not configured');
        }

        const prompt = this.buildIntegrationPrompt(integrationType, spec, aaveFeatures);
        
        return await this.queuedRequest(async () => {
            const response = await this.callMistralAPI(prompt);
            const code = this.extractCode(response);
            
            return {
                success: true,
                code: code,
                model: this.model,
                integrationType: integrationType
            };
        });
    }

    /**
     * Generate authentication integration
     * 
     * Convenience method for authentication-specific integrations.
     * Creates complete auth system with:
     * - Signup/login/logout flows
     * - Token management (JWT) or OAuth flows
     * - Password security (hashing, validation)
     * - Protected route middleware
     * - Session management
     * - User profile handling
     * 
     * Supported Providers:
     * - 'JWT': Token-based authentication
     * - 'OAuth': OAuth 2.0 flows (Google, GitHub, Facebook)
     * - 'Auth0': Auth0 integration
     * - 'Firebase Auth': Firebase authentication
     * 
     * @param {string} authProvider - Authentication provider ('JWT'|'OAuth'|'Auth0'|'Firebase Auth')
     * @param {object} [features={}] - Optional authentication features
     * @param {boolean} [features.emailVerification] - Email verification
     * @param {boolean} [features.passwordReset] - Password reset flow
     * @param {boolean} [features.twoFactor] - Two-factor authentication
     * @param {string[]} [features.socialProviders] - Social login providers
     * @returns {Promise<object>} Generated authentication code
     * @throws {Error} If API key not configured
     * @example
     * const auth = await mistral.generateAuthIntegration('JWT', {
     *   emailVerification: true,
     *   passwordReset: true
     * });
     */
    async generateAuthIntegration(authProvider, features = {}) {
        return this.generateIntegration('auth', { provider: authProvider, ...features });
    }

    /**
     * Generate payment processing integration
     * 
     * Convenience method for payment-specific integrations.
     * Creates complete payment system with:
     * - Payment intent/order creation
     * - Checkout session handling
     * - Webhook event processing
     * - Subscription management (if applicable)
     * - Refund handling
     * - Receipt generation
     * - PCI compliance considerations
     * 
     * Supported Providers:
     * - 'Stripe': Full Stripe integration
     * - 'PayPal': PayPal REST API integration
     * 
     * @param {string} paymentProvider - Payment provider ('Stripe'|'PayPal')
     * @param {object} [features={}] - Optional payment features
     * @param {boolean} [features.subscriptions] - Recurring billing
     * @param {boolean} [features.webhooks] - Webhook handling
     * @param {boolean} [features.refunds] - Refund processing
     * @param {string[]} [features.currencies] - Supported currencies
     * @returns {Promise<object>} Generated payment code
     * @throws {Error} If API key not configured
     * @example
     * const payment = await mistral.generatePaymentIntegration('Stripe', {
     *   subscriptions: true,
     *   webhooks: true,
     *   currencies: ['usd', 'eur']
     * });
     */
    async generatePaymentIntegration(paymentProvider, features = {}) {
        return this.generateIntegration('payment', { provider: paymentProvider, ...features });
    }

    /**
     * Generate cloud storage integration
     * 
     * Convenience method for storage-specific integrations.
     * Creates complete storage system with:
     * - File upload (single and multipart)
     * - File download with signed URLs
     * - File deletion
     * - Access control (public/private)
     * - CDN integration
     * - Image transformations (if applicable)
     * - Storage quota management
     * 
     * Supported Providers:
     * - 'AWS S3': Amazon S3 integration
     * - 'Cloudinary': Cloudinary media management
     * - 'Firebase Storage': Firebase cloud storage
     * 
     * @param {string} storageProvider - Storage provider ('AWS S3'|'Cloudinary'|'Firebase Storage')
     * @param {object} [features={}] - Optional storage features
     * @param {boolean} [features.multipart] - Multipart upload for large files
     * @param {boolean} [features.cdn] - CDN integration
     * @param {boolean} [features.transformations] - Image transformations
     * @param {string[]} [features.allowedTypes] - Allowed file types
     * @returns {Promise<object>} Generated storage code
     * @throws {Error} If API key not configured
     * @example
     * const storage = await mistral.generateStorageIntegration('AWS S3', {
     *   multipart: true,
     *   cdn: true,
     *   allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
     * });
     */
    async generateStorageIntegration(storageProvider, features = {}) {
        return this.generateIntegration('storage', { provider: storageProvider, ...features });
    }

    /**
     * Generate email service integration
     * 
     * Convenience method for email-specific integrations.
     * Creates complete email system with:
     * - Email sending function
     * - Template management
     * - Dynamic content injection
     * - Bulk email support
     * - Email validation
     * - Bounce/spam handling
     * - Delivery tracking
     * 
     * Supported Providers:
     * - 'SendGrid': SendGrid email API
     * - 'Mailgun': Mailgun email service
     * 
     * @param {string} emailProvider - Email provider ('SendGrid'|'Mailgun')
     * @param {object} [features={}] - Optional email features
     * @param {boolean} [features.templates] - Email templates
     * @param {boolean} [features.bulk] - Bulk email sending
     * @param {boolean} [features.tracking] - Delivery tracking
     * @param {boolean} [features.validation] - Email validation
     * @returns {Promise<object>} Generated email code
     * @throws {Error} If API key not configured
     * @example
     * const email = await mistral.generateEmailIntegration('SendGrid', {
     *   templates: true,
     *   tracking: true,
     *   validation: true
     * });
     */
    async generateEmailIntegration(emailProvider, features = {}) {
        return this.generateIntegration('email', { provider: emailProvider, ...features });
    }

    /**
     * Build integration generation prompt
     */
    buildIntegrationPrompt(integrationType, spec, aaveFeatures) {
        const { provider } = spec;
        
        let prompt = `You are VibeCoder's integration specialist. Generate production-ready integration code.

**INTEGRATION TYPE:** ${integrationType.toUpperCase()}
**PROVIDER:** ${provider || 'Best Practice'}

${aaveFeatures ? `**CONTEXT (from AAVE analysis):**
User expressed: ${aaveFeatures.map(f => f.feature).join(', ')}
Integration focus: ${this.inferIntegrationNeeds(aaveFeatures, integrationType)}` : ''}

`;

        // Add type-specific requirements
        switch (integrationType) {
            case 'auth':
                prompt += this.getAuthRequirements(provider, spec);
                break;
            case 'payment':
                prompt += this.getPaymentRequirements(provider, spec);
                break;
            case 'storage':
                prompt += this.getStorageRequirements(provider, spec);
                break;
            case 'email':
                prompt += this.getEmailRequirements(provider, spec);
                break;
            default:
                prompt += this.getGenericRequirements(spec);
        }

        prompt += `

**GENERAL REQUIREMENTS:**
1. Production-ready, secure code
2. Environment variable configuration
3. Error handling with proper logging
4. Rate limiting where appropriate
5. Input validation
6. Comprehensive comments
7. Example usage code
8. Testing utilities
9. README with setup instructions

**OUTPUT FORMAT:**
Return JSON with file structure:
\`\`\`json
{
  "integrations/${integrationType}/${provider}.js": "// Main integration code",
  "config/${integrationType}.js": "// Configuration",
  "examples/${integrationType}_usage.js": "// Usage examples",
  "tests/${integrationType}.test.js": "// Unit tests",
  ".env.example": "// Environment variables needed",
  "README.md": "// Setup and usage documentation"
}
\`\`\`

Generate efficient, well-documented integration code with best practices.`;

        return prompt;
    }

    /**
     * Get authentication integration requirements
     */
    getAuthRequirements(provider, spec) {
        const providers = {
            'JWT': `**JWT Authentication Requirements:**
- Token generation and validation
- Refresh token mechanism
- Secure token storage
- Expiration handling
- Middleware for protected routes
- Password hashing (bcrypt)
- Email verification flow
- Password reset flow`,

            'OAuth': `**OAuth Integration Requirements:**
- Provider: ${spec.oauthProvider || 'Google, GitHub, Facebook'}
- OAuth 2.0 flow implementation
- State parameter for CSRF protection
- Token exchange
- User profile fetching
- Account linking
- Logout/revoke tokens`,

            'Auth0': `**Auth0 Integration Requirements:**
- Auth0 SDK integration
- Login/logout flows
- User management
- Role-based access control (RBAC)
- Social login support
- Multi-factor authentication
- Session management`,

            'Firebase Auth': `**Firebase Authentication Requirements:**
- Firebase SDK setup
- Email/password authentication
- Social auth providers
- Phone authentication
- Anonymous auth
- User state management
- Security rules`
        };

        return providers[provider] || providers['JWT'];
    }

    /**
     * Get payment integration requirements
     */
    getPaymentRequirements(provider, spec) {
        const providers = {
            'Stripe': `**Stripe Integration Requirements:**
- Stripe SDK initialization
- Payment intent creation
- Checkout session handling
- Webhook endpoint for events
- Subscription management (if needed)
- Invoice generation
- Refund handling
- Payment method storage
- PCI compliance considerations`,

            'PayPal': `**PayPal Integration Requirements:**
- PayPal SDK setup
- Order creation and capture
- Payment verification
- Webhook handling
- Subscription billing (if needed)
- Payout handling
- Dispute management
- IPN (Instant Payment Notification)`
        };

        return providers[provider] || providers['Stripe'];
    }

    /**
     * Get storage integration requirements
     */
    getStorageRequirements(provider, spec) {
        const providers = {
            'AWS S3': `**AWS S3 Integration Requirements:**
- AWS SDK configuration
- Bucket management
- File upload (multipart for large files)
- File download with signed URLs
- File deletion
- Access control (IAM policies)
- Presigned URLs for direct upload
- CDN integration (CloudFront)`,

            'Cloudinary': `**Cloudinary Integration Requirements:**
- Cloudinary SDK setup
- Image/video upload
- Image transformations (resize, crop, optimize)
- Cloud storage management
- Delivery optimization
- Asset management
- Media library integration`,

            'Firebase Storage': `**Firebase Storage Integration Requirements:**
- Firebase Storage SDK
- File upload/download
- Security rules
- Metadata management
- Download URLs
- Storage quota management
- Integration with Firebase Auth`
        };

        return providers[provider] || providers['AWS S3'];
    }

    /**
     * Get email service requirements
     */
    getEmailRequirements(provider, spec) {
        const providers = {
            'SendGrid': `**SendGrid Integration Requirements:**
- SendGrid API key configuration
- Email template system
- Dynamic template data
- Email sending function
- Bulk email support
- Email validation
- Bounce/spam handling
- Analytics tracking`,

            'Mailgun': `**Mailgun Integration Requirements:**
- Mailgun API setup
- Email sending API
- Template management
- Mailing lists
- Email validation
- Webhook events
- Spam filter integration
- Delivery tracking`
        };

        return providers[provider] || providers['SendGrid'];
    }

    /**
     * Get generic integration requirements
     */
    getGenericRequirements(spec) {
        return `**Generic Integration Requirements:**
- API client setup
- Authentication handling
- Request/response processing
- Error handling and retries
- Rate limiting
- Caching strategy
- Logging and monitoring
- Test suite`;
    }

    /**
     * Infer integration needs from AAVE features
     */
    inferIntegrationNeeds(aaveFeatures, integrationType) {
        const features = aaveFeatures.map(f => f.feature.toLowerCase());
        
        if (integrationType === 'auth') {
            return 'user authentication with session management';
        }
        if (integrationType === 'payment') {
            return 'secure payment processing with receipts';
        }
        if (integrationType === 'storage') {
            return 'file upload/download with access control';
        }
        
        return 'reliable third-party service integration';
    }

    /**
     * Call Mistral API with rate limiting and error handling
     * 
     * Makes authenticated request to Mistral API with:
     * - System message for integration engineer role
     * - Automatic rate limiting via queue
     * - Retry logic with exponential backoff
     * - Token usage tracking
     * - Error handling with status codes
     * 
     * @param {string} prompt - Prompt to send to Mistral Large
     * @param {object} [options={}] - Optional configuration
     * @param {number} [options.maxTokens] - Override max tokens (default: 8192)
     * @param {number} [options.temperature] - Model temperature 0-1 (default: 0.7)
     * @returns {Promise<string>} Generated text response
     * @throws {Error} If API request fails after retries
     * @private
     */
    async callMistralAPI(prompt, options = {}) {
        return await this.queuedRequest(async () => {
            const requestBody = {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert integration engineer specializing in third-party service integrations, API design, and secure authentication systems.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || this.maxTokens,
                temperature: options.temperature || 0.7
            };

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
                error.status = response.status;
                error.errorData = errorData;
                throw error;
            }

            const data = await response.json();
            
            // Track token usage if available
            if (data.usage) {
                this.totalTokens += data.usage.total_tokens || 0;
            }
            
            return data.choices[0].message.content;
        });
    }

    /**
     * Extract code from Mistral response
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
        const codeFiles = {};
        const codeMatches = response.matchAll(/```(\w+)?\n([\s\S]*?)\n```/g);
        
        let index = 0;
        for (const match of codeMatches) {
            const language = match[1] || 'javascript';
            const code = match[2];
            const filename = this.guessFilename(code, language, index);
            codeFiles[filename] = code;
            index++;
        }

        return Object.keys(codeFiles).length > 0 ? codeFiles : { 'integration.js': response };
    }

    /**
     * Guess filename from code content
     */
    guessFilename(code, language, index) {
        if (code.includes('stripe.') || code.includes('Stripe')) {
            return 'integrations/payment/stripe.js';
        }
        if (code.includes('jwt.sign') || code.includes('JWT')) {
            return 'integrations/auth/jwt.js';
        }
        if (code.includes('S3') || code.includes('aws-sdk')) {
            return 'integrations/storage/s3.js';
        }
        if (code.includes('sendgrid') || code.includes('SendGrid')) {
            return 'integrations/email/sendgrid.js';
        }
        if (code.includes('firebase.') || code.includes('Firebase')) {
            return 'integrations/firebase.js';
        }
        if (code.includes('PORT=') || code.includes('API_KEY=')) {
            return '.env.example';
        }
        if (language === 'markdown') {
            return 'README.md';
        }
        
        return `integration${index}.${language}`;
    }

    /**
     * Test Mistral API key validity
     * 
     * Performs minimal API call to verify:
     * - API key is valid and active
     * - Account has access to Mistral Large model
     * - Network connectivity to Mistral servers
     * - Sufficient quota/credits available
     * 
     * @param {string} [apiKey=null] - API key to test (uses stored key if null)
     * @returns {Promise<object>} Test result:
     *   - valid: boolean (true if key works)
     *   - message: string (success message)
     *   - error: string (error message if failed)
     * @example
     * const result = await mistral.testAPIKey('...');
     * if (result.valid) {
     *   console.log('Mistral API key works!');
     * }
     */
    async testAPIKey(apiKey = null) {
        const testKey = apiKey || this.apiKey;
        
        if (!testKey) {
            return { valid: false, error: 'No API key provided' };
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${testKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'user', content: 'Respond with: "API key is valid"' }
                    ],
                    max_tokens: 50
                })
            });

            if (response.ok) {
                return { valid: true, message: 'Mistral API key is valid' };
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
     * Returns details about Mistral Large model:
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
     * const info = mistral.getModelInfo();
     * console.log(`Using ${info.name} for ${info.specialization}`);
     */
    getModelInfo() {
        return {
            name: 'Mistral Large',
            provider: 'Mistral AI',
            specialization: 'API integrations, third-party services, utility functions',
            maxTokens: this.maxTokens,
            strengths: [
                'Fast generation',
                'Third-party integrations',
                'API client code',
                'Authentication systems',
                'Efficient code'
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MistralAPIService;
}
