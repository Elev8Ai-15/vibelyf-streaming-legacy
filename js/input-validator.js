/**
 * Input Validator - Form Validation and Sanitization
 * 
 * Prevents bad user input from reaching the AI systems.
 * Provides user-friendly validation messages.
 * 
 * @version 1.0.0
 * @date 2025-11-19
 */

class InputValidator {
    constructor() {
        this.rules = {
            appDescription: {
                minLength: 10,
                maxLength: 5000,
                required: true,
                pattern: /^[\s\S]+$/,  // Any characters including newlines
                errorMessages: {
                    required: 'Please describe what app you want to build',
                    minLength: 'Description must be at least 10 characters',
                    maxLength: 'Description is too long (max 5000 characters)',
                    pattern: 'Invalid characters in description'
                }
            },
            slangTerm: {
                minLength: 2,
                maxLength: 100,
                required: true,
                pattern: /^[a-zA-Z0-9\s'-]+$/,
                errorMessages: {
                    required: 'Please enter a slang term',
                    minLength: 'Term must be at least 2 characters',
                    maxLength: 'Term is too long (max 100 characters)',
                    pattern: 'Term can only contain letters, numbers, spaces, hyphens and apostrophes'
                }
            },
            slangDescription: {
                minLength: 5,
                maxLength: 500,
                required: true,
                errorMessages: {
                    required: 'Please describe what this term means',
                    minLength: 'Description must be at least 5 characters',
                    maxLength: 'Description is too long (max 500 characters)'
                }
            },
            translationCorrection: {
                minLength: 5,
                maxLength: 1000,
                required: true,
                errorMessages: {
                    required: 'Please enter the correct translation',
                    minLength: 'Translation must be at least 5 characters',
                    maxLength: 'Translation is too long (max 1000 characters)'
                }
            },
            username: {
                minLength: 3,
                maxLength: 30,
                required: true,
                pattern: /^[a-zA-Z0-9_]+$/,
                errorMessages: {
                    required: 'Username is required',
                    minLength: 'Username must be at least 3 characters',
                    maxLength: 'Username is too long (max 30 characters)',
                    pattern: 'Username can only contain letters, numbers and underscores'
                }
            }
        };
    }
    
    /**
     * Validate a single input field
     */
    validate(value, ruleName) {
        const rule = this.rules[ruleName];
        if (!rule) {
            console.warn(`No validation rule found for: ${ruleName}`);
            return { valid: true };
        }
        
        const errors = [];
        
        // Required check
        if (rule.required && (!value || value.trim() === '')) {
            return {
                valid: false,
                errors: [rule.errorMessages.required]
            };
        }
        
        // If value is empty and not required, skip other validations
        if (!value || value.trim() === '') {
            return { valid: true };
        }
        
        const trimmedValue = value.trim();
        
        // Min length check
        if (rule.minLength && trimmedValue.length < rule.minLength) {
            errors.push(rule.errorMessages.minLength);
        }
        
        // Max length check
        if (rule.maxLength && trimmedValue.length > rule.maxLength) {
            errors.push(rule.errorMessages.maxLength);
        }
        
        // Pattern check
        if (rule.pattern && !rule.pattern.test(trimmedValue)) {
            errors.push(rule.errorMessages.pattern);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Sanitize input to prevent XSS and injection attacks
     */
    sanitize(value) {
        if (typeof value !== 'string') return value;
        
        return value
            .trim()
            // Remove null bytes
            .replace(/\0/g, '')
            // Limit consecutive whitespace
            .replace(/\s{10,}/g, ' ')
            // Remove invisible Unicode characters (except common ones)
            .replace(/[\u200B-\u200D\uFEFF]/g, '');
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHTML(value) {
        if (typeof value !== 'string') return value;
        
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }
    
    /**
     * Validate and sanitize together
     */
    validateAndSanitize(value, ruleName) {
        // First sanitize
        const sanitized = this.sanitize(value);
        
        // Then validate
        const validation = this.validate(sanitized, ruleName);
        
        return {
            ...validation,
            sanitized: sanitized
        };
    }
    
    /**
     * Validate form with multiple fields
     */
    validateForm(formData) {
        const results = {};
        let isValid = true;
        
        for (const [fieldName, value] of Object.entries(formData)) {
            const result = this.validateAndSanitize(value, fieldName);
            results[fieldName] = result;
            
            if (!result.valid) {
                isValid = false;
            }
        }
        
        return {
            valid: isValid,
            fields: results
        };
    }
    
    /**
     * Show validation error on a specific input element
     */
    showError(inputElement, errorMessage) {
        if (!inputElement) return;
        
        // Add error class to input
        inputElement.classList.add('input-error');
        inputElement.setAttribute('aria-invalid', 'true');
        
        // Remove existing error message if any
        const existingError = inputElement.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 14px;
            margin-top: 4px;
            animation: slideDown 0.2s ease;
        `;
        
        // Insert after input
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
        
        // Shake animation
        inputElement.style.animation = 'shake 0.4s';
        setTimeout(() => {
            inputElement.style.animation = '';
        }, 400);
    }
    
    /**
     * Clear validation error from input element
     */
    clearError(inputElement) {
        if (!inputElement) return;
        
        inputElement.classList.remove('input-error');
        inputElement.removeAttribute('aria-invalid');
        
        const errorDiv = inputElement.parentNode.querySelector('.validation-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    /**
     * Setup real-time validation on an input
     */
    setupRealtimeValidation(inputElement, ruleName) {
        if (!inputElement) return;
        
        // Validate on blur
        inputElement.addEventListener('blur', () => {
            const result = this.validate(inputElement.value, ruleName);
            
            if (!result.valid) {
                this.showError(inputElement, result.errors[0]);
            } else {
                this.clearError(inputElement);
            }
        });
        
        // Clear error on input (user is fixing it)
        inputElement.addEventListener('input', () => {
            if (inputElement.classList.contains('input-error')) {
                this.clearError(inputElement);
            }
        });
    }
    
    /**
     * Validate app description specifically
     */
    validateAppDescription(description) {
        const result = this.validateAndSanitize(description, 'appDescription');
        
        // Additional checks specific to app descriptions
        if (result.valid) {
            // Check for suspicious patterns
            const suspiciousPatterns = [
                /<script/i,
                /javascript:/i,
                /onerror=/i,
                /onclick=/i
            ];
            
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(description)) {
                    return {
                        valid: false,
                        errors: ['Description contains potentially unsafe content'],
                        sanitized: result.sanitized
                    };
                }
            }
        }
        
        return result;
    }
    
    /**
     * Check if input looks like spam or abuse
     */
    checkForSpam(text) {
        if (!text || typeof text !== 'string') return false;
        
        const spamIndicators = [
            // All caps (more than 70% uppercase)
            (text.match(/[A-Z]/g) || []).length / text.length > 0.7,
            
            // Excessive repetition
            /(.)\1{10,}/.test(text),
            
            // Too many URLs
            (text.match(/https?:\/\//g) || []).length > 5,
            
            // Common spam phrases
            /buy now|click here|limited time|act now|free money/i.test(text)
        ];
        
        return spamIndicators.filter(Boolean).length >= 2;
    }
    
    /**
     * Add validation styles to page
     */
    injectStyles() {
        if (document.getElementById('validationStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'validationStyles';
        style.textContent = `
            .input-error {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }
            
            .validation-error {
                color: #ef4444;
                font-size: 14px;
                margin-top: 4px;
                animation: slideDown 0.2s ease;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.InputValidator = InputValidator;
    window.inputValidator = new InputValidator();
    window.inputValidator.injectStyles();
}

console.log('✅ Input Validator loaded');
