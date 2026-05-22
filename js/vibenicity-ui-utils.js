/**
 * Vibenicity UI Utilities
 * 
 * Enhanced UI components and utilities for better UX
 * Including loading states, toast notifications, error handling, and animations
 * 
 * @version 1.0.0
 * @date 2025-11-19
 * @author Culture Coders Team
 */

class VibenicityUI {
    constructor() {
        this.toasts = [];
        this.loadingElements = new Map();
        this.init();
    }
    
    /**
     * Initialize UI utilities
     */
    init() {
        // Add toast container to body
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
        // Add keyboard shortcuts
        this.initKeyboardShortcuts();
        
        // Add global loading styles
        this.addGlobalStyles();
        
        console.log('✨ Vibenicity UI utilities initialized');
    }
    
    /**
     * Show loading indicator
     * @param {string} elementId - Element to show loading in
     * @param {string} message - Loading message
     */
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Store original content
        this.loadingElements.set(elementId, element.innerHTML);
        
        // Show loading state
        element.innerHTML = `
            <div class="vibenicity-loading">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        element.classList.add('is-loading');
    }
    
    /**
     * Hide loading indicator
     * @param {string} elementId - Element to hide loading from
     */
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Restore original content
        const originalContent = this.loadingElements.get(elementId);
        if (originalContent) {
            element.innerHTML = originalContent;
            this.loadingElements.delete(elementId);
        }
        
        element.classList.remove('is-loading');
    }
    
    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info, warning)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        const toastId = `toast-${Date.now()}`;
        toast.id = toastId;
        toast.className = `vibenicity-toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="vibenicityUI.closeToast('${toastId}')">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => this.closeToast(toastId), duration);
        }
        
        this.toasts.push(toastId);
    }
    
    /**
     * Close toast notification
     * @param {string} toastId - Toast ID to close
     */
    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;
        
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
        
        this.toasts = this.toasts.filter(id => id !== toastId);
    }
    
    /**
     * Show user-friendly error message
     * @param {Error|string} error - Error object or message
     * @param {string} context - Context of the error
     */
    showError(error, context = '') {
        const errorMessages = {
            'NetworkError': "Can't connect right now. Check your internet and try again 🌐",
            'AuthError': "Please log in to do that! 🔐",
            'ValidationError': "Looks like something's missing. Fill out all required fields ✍️",
            'DuplicateError': "That term already exists! Vote on it instead 🗳️",
            'PermissionError': "You don't have permission to do that 🚫",
            'RateLimitError': "Slow down! Try again in a few seconds ⏱️",
            'NotFoundError': "Couldn't find that. It might have been removed 🔍"
        };
        
        let message = typeof error === 'string' ? error : error.message;
        const errorType = error.name || 'Error';
        
        // Use friendly message if available
        if (errorMessages[errorType]) {
            message = errorMessages[errorType];
        }
        
        // Add context if provided
        if (context) {
            message = `${context}: ${message}`;
        }
        
        this.showToast(message, 'error', 5000);
        console.error('Error:', error);
    }
    
    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.showToast(message, 'success', 3000);
    }
    
    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Callback when cancelled
     */
    showConfirm(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'vibenicity-confirm-modal';
        modal.innerHTML = `
            <div class="confirm-overlay"></div>
            <div class="confirm-dialog">
                <div class="confirm-message">${message}</div>
                <div class="confirm-buttons">
                    <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
                    <button class="btn btn-primary" id="confirmOk">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle buttons
        document.getElementById('confirmOk').onclick = () => {
            modal.remove();
            if (onConfirm) onConfirm();
        };
        
        document.getElementById('confirmCancel').onclick = () => {
            modal.remove();
            if (onCancel) onCancel();
        };
        
        // Close on overlay click
        modal.querySelector('.confirm-overlay').onclick = () => {
            modal.remove();
            if (onCancel) onCancel();
        };
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K = Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
                if (searchInput) {
                    searchInput.focus();
                    this.showToast('Press Escape to close', 'info', 1000);
                }
            }
            
            // Ctrl/Cmd + N = New submission (if on VibeTribe)
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (typeof showAddSlangModal === 'function') {
                    showAddSlangModal();
                }
            }
            
            // Escape = Close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active, [class*="modal"][style*="flex"]');
                modals.forEach(modal => {
                    if (typeof closeModal === 'function') {
                        closeModal(modal.id);
                    } else {
                        modal.style.display = 'none';
                        modal.classList.remove('active');
                    }
                });
            }
            
            // ? = Show keyboard shortcuts help
            if (e.key === '?' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }
    
    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcuts = `
            <strong>Keyboard Shortcuts:</strong><br>
            <code>Ctrl/Cmd + K</code> - Focus search<br>
            <code>Ctrl/Cmd + N</code> - New submission<br>
            <code>Escape</code> - Close modals<br>
            <code>?</code> - Show this help<br>
        `;
        
        this.showToast(shortcuts, 'info', 5000);
    }
    
    /**
     * Add animation to element
     * @param {string|HTMLElement} element - Element or ID
     * @param {string} animation - Animation name
     * @param {Function} callback - Callback when animation completes
     */
    animate(element, animation, callback) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;
        
        el.classList.add('animated', animation);
        
        const handleAnimationEnd = () => {
            el.classList.remove('animated', animation);
            el.removeEventListener('animationend', handleAnimationEnd);
            if (callback) callback();
        };
        
        el.addEventListener('animationend', handleAnimationEnd);
    }
    
    /**
     * Celebrate animation (for achievements, approvals, etc.)
     * @param {string|HTMLElement} element - Element to animate
     */
    celebrate(element) {
        this.animate(element, 'celebrate');
        
        // Show confetti effect
        this.showConfetti();
    }
    
    /**
     * Show confetti effect
     */
    showConfetti() {
        // Simple confetti effect
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        confettiContainer.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]};
                left: ${Math.random() * 100}%;
                top: -20px;
                animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            confettiContainer.appendChild(confetti);
        }
        
        document.body.appendChild(confettiContainer);
        
        // Remove after animation
        setTimeout(() => confettiContainer.remove(), 4000);
    }
    
    /**
     * Add global styles
     */
    addGlobalStyles() {
        if (document.getElementById('vibenicity-ui-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'vibenicity-ui-styles';
        styles.textContent = `
            /* Loading Spinner */
            .vibenicity-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                min-height: 200px;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(139, 92, 246, 0.1);
                border-left-color: #8b5cf6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-message {
                margin-top: 1rem;
                color: var(--text-secondary, #94a3b8);
                font-weight: 500;
            }
            
            /* Toast Notifications */
            .vibenicity-toast {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 1.25rem;
                background: var(--bg-panel, #1e293b);
                border: 1px solid var(--border-color, #334155);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                min-width: 300px;
                max-width: 500px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .vibenicity-toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .toast-success { border-left: 4px solid #10b981; }
            .toast-error { border-left: 4px solid #ef4444; }
            .toast-info { border-left: 4px solid #06b6d4; }
            .toast-warning { border-left: 4px solid #f59e0b; }
            
            .toast-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                color: var(--text-primary, #f1f5f9);
                font-size: 0.875rem;
                line-height: 1.5;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: var(--text-secondary, #94a3b8);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .toast-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary, #f1f5f9);
            }
            
            /* Animations */
            @keyframes celebrate {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.2) rotate(-5deg); }
                50% { transform: scale(1.1) rotate(5deg); }
                75% { transform: scale(1.2) rotate(-3deg); }
            }
            
            @keyframes confetti-fall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
            
            .animated {
                animation-duration: 0.6s;
                animation-fill-mode: both;
            }
            
            .animated.celebrate {
                animation-name: celebrate;
            }
            
            /* Confirmation Modal */
            .vibenicity-confirm-modal {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .confirm-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            
            .confirm-dialog {
                position: relative;
                background: var(--bg-panel, #1e293b);
                border: 1px solid var(--border-color, #334155);
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .confirm-message {
                color: var(--text-primary, #f1f5f9);
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            
            .confirm-buttons {
                display: flex;
                gap: 0.75rem;
                justify-content: flex-end;
            }
            
            /* Skeleton Loading */
            .skeleton {
                background: linear-gradient(
                    90deg,
                    var(--bg-card, #334155) 25%,
                    var(--bg-hover, #475569) 50%,
                    var(--bg-card, #334155) 75%
                );
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }
            
            .skeleton-text.short {
                width: 60%;
            }
            
            .skeleton-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                #toast-container {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                }
                
                .vibenicity-toast {
                    min-width: auto;
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance
const vibenicityUI = new VibenicityUI();
window.vibenicityUI = vibenicityUI;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibenicityUI;
}
