/**
 * Global Error Handler - User-Friendly Error Management
 * 
 * Provides centralized error handling for the entire VibeCoder application:
 * - Catches unhandled JavaScript errors
 * - Catches unhandled promise rejections
 * - Logs errors with full context
 * - Displays user-friendly error messages
 * - Categorizes errors by severity
 * - Provides recovery suggestions
 * 
 * Key Features:
 * - Automatic global error capture (window.onerror, unhandledrejection)
 * - Error categorization (API key, network, module loading, auth, rate limit, quota)
 * - User-friendly message translation
 * - Error log storage (last 50 errors)
 * - Export functionality for debugging
 * - System health checks
 * 
 * Error Display Strategy:
 * - Critical errors: Displayed to user immediately
 * - Non-critical errors: Logged only
 * - Shows in chat interface if available
 * - Falls back to alert() if no UI
 * 
 * Usage:
 * - Auto-initializes as window.errorHandler
 * - Use errorHandler.handleError(error, context) manually
 * - Use errorHandler.wrapAsync(fn, context) for async functions
 * - Use errorHandler.safeAPICall(fn, service) for API calls
 * 
 * @version 2.1.0
 * @date 2025-11-19
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.setupGlobalHandlers();
    }

    /**
     * Setup global error handlers for the application
     * 
     * Registers listeners for:
     * - window.onerror: Catches unhandled JavaScript errors
     * - window.onunhandledrejection: Catches unhandled Promise rejections
     * 
     * This ensures all errors are caught and logged, even if
     * developers forget to add try-catch blocks.
     * 
     * Called automatically during constructor.
     * 
     * @private
     */
    setupGlobalHandlers() {
        // Catch unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error || event.message, 'JavaScript Error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });

        console.log('🛡️ Global Error Handler initialized');
    }

    /**
     * Handle and log errors with context
     * 
     * Main error handling method that:
     * - Extracts error message and stack trace
     * - Adds timestamp and context
     * - Stores in error log (max 50 errors)
     * - Logs to console
     * - Displays to user if critical
     * 
     * Error Object Structure:
     * - timestamp: ISO string
     * - context: Where error occurred
     * - message: Clean error message
     * - stack: Stack trace (if available)
     * - metadata: Additional context data
     * - userAgent: Browser information
     * 
     * @param {Error|string|object} error - Error to handle
     * @param {string} [context='Error'] - Context where error occurred (e.g., 'Gemini API', 'Studio Controller')
     * @param {object} [metadata={}] - Additional metadata (filename, line number, etc.)
     * @returns {object} Error object with full context
     * @example
     * try {
     *   await service.generate();
     * } catch (error) {
     *   errorHandler.handleError(error, 'Code Generation', { service: 'gemini' });
     * }
     */
    handleError(error, context = 'Error', metadata = {}) {
        const errorObject = {
            timestamp: new Date().toISOString(),
            context: context,
            message: this.extractErrorMessage(error),
            stack: error?.stack || null,
            metadata: metadata,
            userAgent: navigator.userAgent
        };

        // Add to error log
        this.errors.push(errorObject);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift(); // Remove oldest error
        }

        // Log to console
        console.error(`[${context}]`, error);

        // Display to user if critical
        if (this.isCriticalError(error)) {
            this.displayErrorToUser(errorObject);
        }

        return errorObject;
    }

    /**
     * Extract clean error message from various error types
     * 
     * Handles multiple error formats:
     * - Error objects (error.message)
     * - String errors (raw string)
     * - Objects with toString() (converted)
     * - Unknown types (fallback message)
     * 
     * @param {*} error - Error of any type
     * @returns {string} Clean error message
     * @private
     */
    extractErrorMessage(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (error && error.message) {
            return error.message;
        }
        if (error && error.toString) {
            return error.toString();
        }
        return 'Unknown error occurred';
    }

    /**
     * Determine if error is critical and should be shown to user
     * 
     * Critical Error Types:
     * - Module loading errors ('is not defined', 'is not a function')
     * - Property access errors ('cannot read property')
     * - API key errors ('api key', 'authentication failed')
     * - Network errors ('network error', 'failed to fetch')
     * 
     * Non-Critical Errors:
     * - Console warnings
     * - Minor validation errors
     * - Expected errors (handled gracefully)
     * 
     * @param {Error|string|object} error - Error to check
     * @returns {boolean} True if error should be displayed to user
     * @private
     */
    isCriticalError(error) {
        const message = this.extractErrorMessage(error).toLowerCase();
        
        const criticalKeywords = [
            'is not defined',
            'is not a function',
            'cannot read property',
            'api key',
            'authentication failed',
            'network error',
            'failed to fetch'
        ];

        return criticalKeywords.some(keyword => message.includes(keyword));
    }

    /**
     * Display user-friendly error message to the user
     * 
     * Display Strategy:
     * 1. Try to display in chat interface (if window.studio.addMessage exists)
     * 2. Fallback to browser alert() if no chat interface
     * 
     * Message Format:
     * - Styled error box (red background, icon)
     * - Error context (what operation failed)
     * - User-friendly explanation
     * - Recovery suggestion
     * - Console reference for developers
     * 
     * @param {object} errorObject - Error object from handleError()
     * @private
     */
    displayErrorToUser(errorObject) {
        const message = this.getUserFriendlyMessage(errorObject);
        
        // Try to display in chat if available
        if (window.studio && typeof window.studio.addMessage === 'function') {
            window.studio.addMessage('assistant', `
                <div style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
                    <strong>⚠️ ${errorObject.context}</strong><br><br>
                    ${message}<br><br>
                    <small style="color: #94a3b8;">If this persists, try refreshing the page or check the console for details.</small>
                </div>
            `);
        } else {
            // Fallback to alert
            alert(`⚠️ ${errorObject.context}\n\n${message}`);
        }
    }

    /**
     * Get user-friendly error message with actionable guidance
     * 
     * Translates technical errors into user-friendly language:
     * 
     * Translations:
     * - 'api key' → "Check your API keys in Settings"
     * - 'network', 'fetch', 'cors' → "Network connection issue"
     * - 'is not defined' → "Module failed to load, refresh page"
     * - '401', '403', 'unauthorized' → "Invalid API key"
     * - '429', 'rate limit' → "Too many requests, wait"
     * - 'quota', 'billing' → "API quota exceeded"
     * 
     * @param {object} errorObject - Error object from handleError()
     * @returns {string} HTML-formatted user-friendly message
     * @private
     */
    getUserFriendlyMessage(errorObject) {
        const message = errorObject.message.toLowerCase();

        // API Key errors
        if (message.includes('api key')) {
            return '🔑 <strong>API Key Issue</strong><br>Please check your API keys in Settings. Make sure they are valid and properly configured.';
        }

        // Network errors
        if (message.includes('network') || message.includes('fetch') || message.includes('cors')) {
            return '🌐 <strong>Network Error</strong><br>Unable to connect to the AI service. Please check your internet connection and try again.';
        }

        // Module loading errors
        if (message.includes('is not defined')) {
            const match = message.match(/(\w+)\s+is not defined/);
            const moduleName = match ? match[1] : 'Module';
            return `📦 <strong>Module Loading Error</strong><br>${moduleName} failed to load. Please refresh the page. If this persists, check the browser console.`;
        }

        // Authentication errors
        if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
            return '🔒 <strong>Authentication Error</strong><br>Your API key appears to be invalid or expired. Please update it in Settings.';
        }

        // Rate limiting
        if (message.includes('429') || message.includes('rate limit')) {
            return '⏱️ <strong>Rate Limit Exceeded</strong><br>Too many requests to the AI service. Please wait a moment and try again.';
        }

        // Quota exceeded
        if (message.includes('quota') || message.includes('billing')) {
            return '💳 <strong>Quota Exceeded</strong><br>Your API quota has been exceeded. Please check your billing settings with the AI provider.';
        }

        // Default message
        return `<strong>Something went wrong:</strong><br>${errorObject.message}`;
    }

    /**
     * Wrap async function with automatic error handling
     * 
     * Convenience wrapper that:
     * - Executes async function
     * - Catches errors automatically
     * - Logs with context
     * - Re-throws for caller handling
     * 
     * @param {Function} fn - Async function to execute
     * @param {string} [context='Operation'] - Context description
     * @returns {Promise<*>} Result from function
     * @throws {Error} Re-throws caught error after logging
     * @example
     * const result = await errorHandler.wrapAsync(
     *   async () => await api.call(),
     *   'API Call'
     * );
     */
    async wrapAsync(fn, context = 'Operation') {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error, context);
            throw error; // Re-throw so caller can handle if needed
        }
    }

    /**
     * Wrap synchronous function with automatic error handling
     * 
     * Convenience wrapper that:
     * - Executes function
     * - Catches errors automatically
     * - Logs with context
     * - Re-throws for caller handling
     * 
     * @param {Function} fn - Function to execute
     * @param {string} [context='Operation'] - Context description
     * @returns {*} Result from function
     * @throws {Error} Re-throws caught error after logging
     * @example
     * const result = errorHandler.wrap(
     *   () => processData(data),
     *   'Data Processing'
     * );
     */
    wrap(fn, context = 'Operation') {
        try {
            return fn();
        } catch (error) {
            this.handleError(error, context);
            throw error;
        }
    }

    /**
     * Safe API call wrapper with error recovery
     * 
     * Special wrapper for API calls that:
     * - Executes API call function
     * - Catches and logs errors
     * - Returns error result instead of throwing
     * - Adds service context to error
     * 
     * Unlike wrapAsync(), this does NOT re-throw errors.
     * Instead, it returns {success: false, error: ...}
     * 
     * Use this when you want graceful failure without
     * stopping execution.
     * 
     * @param {Function} apiCallFn - Async API call function
     * @param {string} [serviceName='API'] - Service name for context
     * @returns {Promise<object>} Success object or error object:
     *   - On success: result from apiCallFn
     *   - On error: {success: false, error: string, service: string}
     * @example
     * const result = await errorHandler.safeAPICall(
     *   () => gemini.generate(prompt),
     *   'Gemini API'
     * );
     * if (result.success === false) {
     *   console.log('API failed:', result.error);
     * }
     */
    async safeAPICall(apiCallFn, serviceName = 'API') {
        try {
            return await apiCallFn();
        } catch (error) {
            // Enhance error with service context
            const enhancedError = {
                service: serviceName,
                originalError: error,
                message: this.extractErrorMessage(error),
                timestamp: new Date().toISOString()
            };

            this.handleError(enhancedError, `${serviceName} API Call`);
            
            // Return error result instead of throwing
            return {
                success: false,
                error: enhancedError.message,
                service: serviceName
            };
        }
    }

    /**
     * Get complete error log
     * 
     * Returns stored error history (last 50 errors):
     * - All error objects with full context
     * - Total error count
     * - Most recent error
     * 
     * @returns {object} Error log:
     *   - errors: array of error objects
     *   - count: number of errors
     *   - lastError: most recent error or null
     * @example
     * const log = errorHandler.getErrorLog();
     * console.log(`Total errors: ${log.count}`);
     * if (log.lastError) {
     *   console.log('Last error:', log.lastError.message);
     * }
     */
    getErrorLog() {
        return {
            errors: this.errors,
            count: this.errors.length,
            lastError: this.errors[this.errors.length - 1] || null
        };
    }

    /**
     * Clear error log
     * 
     * Removes all stored errors from memory.
     * Useful for:
     * - Testing
     * - Resetting after fixing issues
     * - Clearing old errors
     * 
     * @example
     * errorHandler.clearErrors();
     * console.log('Error log cleared');
     */
    clearErrors() {
        this.errors = [];
        console.log('🧹 Error log cleared');
    }

    /**
     * Export error log as JSON file
     * 
     * Creates downloadable JSON file with all errors.
     * Useful for:
     * - Bug reporting
     * - Debugging
     * - Sending logs to support
     * 
     * File name includes timestamp: vibecoder-errors-{timestamp}.json
     * 
     * @example
     * // User clicks "Export Errors" button
     * errorHandler.exportErrorLog();
     * // Browser downloads: vibecoder-errors-1700000000000.json
     */
    exportErrorLog() {
        const log = this.getErrorLog();
        const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibecoder-errors-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Check system health and module availability
     * 
     * Performs comprehensive system check:
     * - Browser online status
     * - Cookies enabled
     * - LocalStorage available
     * - Critical modules loaded
     * - Error count
     * 
     * Critical Modules Checked:
     * - AdvancedLanguageProcessor
     * - MultiLLMOrchestrator
     * - StudioController
     * 
     * @returns {Promise<object>} Health status:
     *   - timestamp: string
     *   - browser: object (online, cookies, language)
     *   - localStorage: boolean
     *   - modules: object (module availability)
     *   - errors: number (error count)
     * @example
     * const health = await errorHandler.checkSystemHealth();
     * if (!health.localStorage) {
     *   alert('LocalStorage not available');
     * }
     */
    async checkSystemHealth() {
        const health = {
            timestamp: new Date().toISOString(),
            browser: {
                online: navigator.onLine,
                cookiesEnabled: navigator.cookieEnabled,
                language: navigator.language
            },
            localStorage: false,
            modules: {},
            errors: this.errors.length
        };

        // Check localStorage
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            health.localStorage = true;
        } catch (e) {
            health.localStorage = false;
        }

        // Check critical modules
        const criticalModules = [
            'AdvancedLanguageProcessor',
            'MultiLLMOrchestrator',
            'StudioController'
        ];

        for (const moduleName of criticalModules) {
            health.modules[moduleName] = typeof window[moduleName] !== 'undefined';
        }

        return health;
    }
}

// Export class and instance
window.ErrorHandler = ErrorHandler;
window.errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
