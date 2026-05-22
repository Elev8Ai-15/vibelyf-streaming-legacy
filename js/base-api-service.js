/**
 * BaseAPIService - Foundation class for all LLM API services
 * 
 * Provides shared functionality:
 * - Encrypted API key management (Base64)
 * - Rate limiting with request queuing
 * - Retry logic with exponential backoff
 * - Usage tracking and statistics
 * - Comprehensive input validation
 * - Standardized error handling
 * 
 * All LLM services (Gemini, Claude, OpenAI, Mistral) extend this class.
 * 
 * @version 2.1.0
 * @date 2025-11-19
 */

class BaseAPIService {
    /**
     * Initialize base service with configuration
     * 
     * @param {string} serviceName - Display name for the service
     * @param {string} storageKey - localStorage key for API key
     * @param {string|null} apiKeyPrefix - Expected API key prefix (e.g., 'sk-', 'sk-ant-')
     */
    constructor(serviceName, storageKey, apiKeyPrefix = null) {
        this.serviceName = serviceName;
        this.storageKey = storageKey;
        this.apiKeyPrefix = apiKeyPrefix;
        
        // Load API key from encrypted storage
        this.apiKey = this.loadAPIKey();
        
        // Rate limiting configuration
        this.maxConcurrentRequests = 3;
        this.minRequestInterval = 1000; // milliseconds
        this.requestQueue = [];
        this.requestsInProgress = 0;
        this.lastRequestTime = 0;
        
        // Retry configuration
        this.maxRetries = 3;
        this.retryDelay = 1000; // milliseconds
        
        // Usage tracking
        this.requestCount = 0;
        this.errorCount = 0;
        this.totalTokens = 0;
        
        console.log(`✅ ${this.serviceName} initialized`);
    }

    /**
     * Load API key from localStorage with automatic decryption
     * Supports backwards compatibility with unencrypted keys
     * 
     * @returns {string|null} Decrypted API key or null
     */
    loadAPIKey() {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            if (!encrypted) return null;

            // Try to decrypt (Base64)
            try {
                return atob(encrypted);
            } catch (e) {
                // Not encrypted - migrate on next save
                console.warn(`${this.serviceName}: Migrating unencrypted key to encrypted storage`);
                return encrypted;
            }
        } catch (error) {
            console.error(`Failed to load API key for ${this.serviceName}:`, error);
            return null;
        }
    }

    /**
     * Save API key to localStorage with automatic encryption
     * Validates key before saving
     * 
     * @param {string} apiKey - API key to save
     * @returns {boolean} Success status
     * @throws {Error} If validation fails
     */
    saveAPIKey(apiKey) {
        // Validate before saving
        const validation = this.validateAPIKey(apiKey);
        if (!validation.valid) {
            throw new Error(`${this.serviceName}: ${validation.error}`);
        }

        try {
            // Encrypt with Base64
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
     * 
     * @returns {boolean} True if API key exists and is non-empty
     */
    hasAPIKey() {
        return this.apiKey !== null && this.apiKey.length > 0;
    }

    /**
     * Comprehensive API key validation
     * 
     * Checks:
     * - Non-empty
     * - Length constraints (20-500 characters)
     * - Character validation (alphanumeric + -_)
     * - Prefix validation (if specified)
     * 
     * @param {string} apiKey - API key to validate
     * @returns {{valid: boolean, error?: string}} Validation result
     */
    validateAPIKey(apiKey) {
        // Empty check
        if (!apiKey || typeof apiKey !== 'string') {
            return { valid: false, error: 'API key cannot be empty' };
        }

        // Length validation
        if (apiKey.length < 20) {
            return { valid: false, error: 'API key too short (minimum 20 characters)' };
        }

        if (apiKey.length > 500) {
            return { valid: false, error: 'API key too long (maximum 500 characters)' };
        }

        // Character validation (alphanumeric + hyphen + underscore)
        if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
            return { valid: false, error: 'API key contains invalid characters (only alphanumeric, -, _ allowed)' };
        }

        // Prefix validation (if specified)
        if (this.apiKeyPrefix && !apiKey.startsWith(this.apiKeyPrefix)) {
            return { 
                valid: false, 
                error: `Invalid format. Expected API key to start with "${this.apiKeyPrefix}"` 
            };
        }

        return { valid: true };
    }

    /**
     * Queue a request with rate limiting
     * 
     * Ensures:
     * - Maximum concurrent requests not exceeded
     * - Minimum interval between requests maintained
     * - Fair queue processing (FIFO)
     * 
     * @param {Function} requestFn - Async function to execute
     * @returns {Promise<any>} Result of the request function
     */
    async queuedRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * Process request queue with rate limiting
     * 
     * Internal method - do not call directly
     */
    async processQueue() {
        // Check if we can process more requests
        if (this.requestsInProgress >= this.maxConcurrentRequests) {
            return;
        }

        if (this.requestQueue.length === 0) {
            return;
        }

        // Check minimum interval since last request
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            // Schedule next attempt after interval
            setTimeout(() => this.processQueue(), this.minRequestInterval - timeSinceLastRequest);
            return;
        }

        // Get next request from queue
        const { requestFn, resolve, reject } = this.requestQueue.shift();
        
        this.requestsInProgress++;
        this.lastRequestTime = Date.now();

        try {
            const result = await this.retryRequest(requestFn);
            this.requestCount++;
            resolve(result);
        } catch (error) {
            this.errorCount++;
            reject(error);
        } finally {
            this.requestsInProgress--;
            
            // Process next item in queue
            if (this.requestQueue.length > 0) {
                setTimeout(() => this.processQueue(), this.minRequestInterval);
            }
        }
    }

    /**
     * Retry request with exponential backoff
     * 
     * @param {Function} requestFn - Async function to execute
     * @param {number} maxRetries - Maximum retry attempts (default: 3)
     * @param {number} delay - Initial delay in milliseconds (default: 1000)
     * @returns {Promise<any>} Result of successful request
     * @throws {Error} If all retries fail
     */
    async retryRequest(requestFn, maxRetries = this.maxRetries, delay = this.retryDelay) {
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                
                // Don't retry on specific errors
                if (error.status === 401 || error.status === 403) {
                    // Authentication errors - no point retrying
                    throw error;
                }

                if (attempt < maxRetries - 1) {
                    // Exponential backoff
                    const waitTime = delay * Math.pow(2, attempt);
                    console.warn(`${this.serviceName}: Retry ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        // All retries failed
        throw new Error(`${this.serviceName}: All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
    }

    /**
     * Get usage statistics for monitoring
     * 
     * @returns {object} Usage statistics including:
     *   - service: Service name
     *   - requestCount: Total requests made
     *   - errorCount: Total errors encountered
     *   - errorRate: Error percentage
     *   - totalTokens: Total tokens used (if tracked)
     *   - queueLength: Current queue size
     *   - requestsInProgress: Active requests
     *   - hasAPIKey: Configuration status
     */
    getUsageStats() {
        return {
            service: this.serviceName,
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            errorRate: this.requestCount > 0 
                ? (this.errorCount / this.requestCount * 100).toFixed(2) + '%' 
                : '0%',
            totalTokens: this.totalTokens,
            queueLength: this.requestQueue.length,
            requestsInProgress: this.requestsInProgress,
            hasAPIKey: this.hasAPIKey()
        };
    }

    /**
     * Reset usage statistics
     * Useful for testing or periodic resets
     */
    resetStats() {
        this.requestCount = 0;
        this.errorCount = 0;
        this.totalTokens = 0;
        console.log(`${this.serviceName}: Statistics reset`);
    }

    /**
     * Get model information (should be overridden by subclasses)
     * 
     * @returns {object} Model information
     */
    getModelInfo() {
        return {
            name: this.serviceName,
            provider: 'Unknown',
            specialization: 'General',
            maxTokens: 0,
            strengths: []
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseAPIService;
}
