/**
 * Translation Feedback UI - Interactive Learning Interface
 * 
 * Beautiful, intuitive UI for users to confirm or correct translations
 * Makes contributing feel rewarding and fun!
 * 
 * @version 1.0.0
 * @date 2025-11-19
 */

class TranslationFeedbackUI {
    constructor() {
        this.container = null;
        this.isVisible = false;
        this.currentTranslation = null;
        this.learningSystem = null;
        
        this.createStyles();
        console.log('✅ Translation Feedback UI initialized');
    }
    
    /**
     * Set learning system reference
     */
    setLearningSystem(system) {
        this.learningSystem = system;
    }
    
    /**
     * Create CSS styles for feedback UI
     */
    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .translation-feedback-container {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                animation: feedbackSlideIn 0.4s ease;
            }
            
            @keyframes feedbackSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .translation-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .translation-icon {
                font-size: 32px;
                animation: iconBounce 1s ease infinite;
            }
            
            @keyframes iconBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            .translation-title {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary, #f1f5f9);
                flex: 1;
            }
            
            .confidence-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .confidence-high {
                background: rgba(16, 185, 129, 0.2);
                color: #10b981;
                border: 1px solid #10b981;
            }
            
            .confidence-medium {
                background: rgba(245, 158, 11, 0.2);
                color: #f59e0b;
                border: 1px solid #f59e0b;
            }
            
            .confidence-low {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
                border: 1px solid #ef4444;
            }
            
            .translation-boxes {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
                margin-bottom: 16px;
            }
            
            .translation-box {
                background: var(--bg-panel, #1e293b);
                border: 2px solid var(--border-color, #334155);
                border-radius: 8px;
                padding: 16px;
            }
            
            .translation-box.original {
                border-color: rgba(236, 72, 153, 0.5);
            }
            
            .translation-box.ai {
                border-color: rgba(139, 92, 246, 0.5);
            }
            
            .box-label {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 8px;
                opacity: 0.7;
            }
            
            .box-text {
                font-size: 16px;
                line-height: 1.6;
                color: var(--text-primary, #f1f5f9);
            }
            
            .cultural-markers {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            
            .cultural-marker {
                display: inline-block;
                padding: 4px 10px;
                background: rgba(139, 92, 246, 0.2);
                border: 1px solid rgba(139, 92, 246, 0.4);
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                color: #8b5cf6;
            }
            
            .feedback-message {
                background: rgba(6, 182, 212, 0.1);
                border-left: 4px solid #06b6d4;
                padding: 12px 16px;
                border-radius: 6px;
                margin-bottom: 16px;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .feedback-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .feedback-btn {
                flex: 1;
                min-width: 140px;
                padding: 14px 24px;
                border: 2px solid;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .feedback-btn.confirm {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-color: #10b981;
                color: white;
            }
            
            .feedback-btn.confirm:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
            }
            
            .feedback-btn.correct {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                border-color: #f59e0b;
                color: white;
            }
            
            .feedback-btn.correct:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
            }
            
            .correction-panel {
                background: var(--bg-panel, #1e293b);
                border: 2px solid var(--border-color, #334155);
                border-radius: 8px;
                padding: 16px;
                margin-top: 12px;
                animation: panelSlideDown 0.3s ease;
            }
            
            @keyframes panelSlideDown {
                from {
                    opacity: 0;
                    max-height: 0;
                    padding: 0;
                }
                to {
                    opacity: 1;
                    max-height: 500px;
                    padding: 16px;
                }
            }
            
            .correction-input {
                width: 100%;
                padding: 12px;
                background: var(--bg-dark, #0f172a);
                border: 2px solid var(--border-color, #334155);
                border-radius: 6px;
                color: var(--text-primary, #f1f5f9);
                font-size: 16px;
                font-family: inherit;
                margin-bottom: 12px;
                resize: vertical;
                min-height: 80px;
            }
            
            .correction-input:focus {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
            }
            
            .correction-actions {
                display: flex;
                gap: 12px;
            }
            
            .correction-submit {
                flex: 1;
                padding: 12px 24px;
                background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .correction-submit:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
            }
            
            .correction-cancel {
                padding: 12px 24px;
                background: transparent;
                border: 2px solid var(--border-color, #334155);
                border-radius: 8px;
                color: var(--text-secondary, #94a3b8);
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .correction-cancel:hover {
                border-color: var(--text-secondary);
                background: rgba(148, 163, 184, 0.1);
            }
            
            .impact-stats {
                display: flex;
                gap: 20px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid rgba(139, 92, 246, 0.2);
            }
            
            .impact-stat {
                flex: 1;
                text-align: center;
            }
            
            .impact-value {
                font-size: 24px;
                font-weight: 700;
                color: #8b5cf6;
                display: block;
            }
            
            .impact-label {
                font-size: 12px;
                opacity: 0.7;
                margin-top: 4px;
            }
            
            /* Loading Spinner Styles */
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.2s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .loading-container {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                animation: scaleIn 0.3s ease;
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .loading-spinner {
                width: 60px;
                height: 60px;
                margin: 0 auto 20px;
                border: 4px solid rgba(139, 92, 246, 0.2);
                border-top-color: #8b5cf6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-title {
                font-size: 20px;
                font-weight: 700;
                color: #f1f5f9;
                margin-bottom: 8px;
            }
            
            .loading-message {
                font-size: 14px;
                color: #94a3b8;
                line-height: 1.6;
            }
            
            .loading-progress {
                margin-top: 20px;
            }
            
            .progress-bar {
                width: 100%;
                height: 6px;
                background: rgba(139, 92, 246, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%);
                border-radius: 3px;
                transition: width 0.3s ease;
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
            
            .progress-steps {
                text-align: left;
                font-size: 13px;
                color: #94a3b8;
            }
            
            .progress-step {
                padding: 6px 0;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .progress-step.completed {
                color: #10b981;
            }
            
            .progress-step.active {
                color: #f1f5f9;
                font-weight: 600;
            }
            
            .step-icon {
                font-size: 16px;
            }
            
            .btn-disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Show feedback UI with translation
     */
    show(translationData) {
        this.currentTranslation = translationData;
        this.isVisible = true;
        
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'translation-feedback-container';
            this.container.id = 'translationFeedback';
        }
        
        // Build UI
        this.container.innerHTML = this.buildFeedbackHTML(translationData);
        
        // Insert before generate button if in studio
        const generateBtn = document.getElementById('generateBtn');
        const appDescription = document.getElementById('appDescription');
        
        if (generateBtn && generateBtn.parentNode) {
            generateBtn.parentNode.insertBefore(this.container, generateBtn);
        } else if (appDescription && appDescription.parentNode) {
            appDescription.parentNode.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    /**
     * Build feedback HTML
     */
    buildFeedbackHTML(data) {
        const confidenceClass = data.confidence >= 0.85 ? 'high' : 
                               data.confidence >= 0.75 ? 'medium' : 'low';
        const confidenceIcon = data.confidence >= 0.85 ? '💯' : 
                              data.confidence >= 0.75 ? '✅' : '🤔';
        
        return `
            <div class="translation-header">
                <div class="translation-icon">🧠</div>
                <div class="translation-title">AI Translation Check</div>
                <div class="confidence-badge confidence-${confidenceClass}">
                    ${confidenceIcon} ${(data.confidence * 100).toFixed(0)}% Confidence
                </div>
            </div>
            
            <div class="translation-boxes">
                <div class="translation-box original">
                    <div class="box-label">📝 Your Input</div>
                    <div class="box-text">${data.original}</div>
                    ${data.culturalMarkers && data.culturalMarkers.length > 0 ? `
                        <div class="cultural-markers">
                            ${data.culturalMarkers.map(m => `<span class="cultural-marker">${m}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="translation-box ai">
                    <div class="box-label">🤖 AI Translation</div>
                    <div class="box-text">${data.translation}</div>
                </div>
            </div>
            
            <div class="feedback-message">
                ${data.message}
            </div>
            
            <div class="feedback-actions">
                <button class="feedback-btn confirm" onclick="window.feedbackUI.handleConfirm()">
                    <span>👍</span>
                    <span>Perfect!</span>
                </button>
                <button class="feedback-btn correct" onclick="window.feedbackUI.handleCorrect()">
                    <span>✏️</span>
                    <span>Let me fix it</span>
                </button>
            </div>
            
            <div id="correctionPanel" style="display: none;"></div>
            
            ${this.buildImpactStats()}
        `;
    }
    
    /**
     * Build impact stats section
     */
    buildImpactStats() {
        if (!this.learningSystem) return '';
        
        const stats = this.learningSystem.getStats();
        
        return `
            <div class="impact-stats">
                <div class="impact-stat">
                    <span class="impact-value">${stats.contributionCount}</span>
                    <span class="impact-label">Your Contributions</span>
                </div>
                <div class="impact-stat">
                    <span class="impact-value">${stats.impactScore}</span>
                    <span class="impact-label">Impact Score</span>
                </div>
                <div class="impact-stat">
                    <span class="impact-value">${stats.newTermsLearned}</span>
                    <span class="impact-label">Terms Taught</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Handle confirmation
     */
    async handleConfirm() {
        if (!this.learningSystem) {
            console.error('Learning system not initialized');
            return;
        }
        
        const result = await this.learningSystem.confirmTranslation();
        
        if (result.success) {
            this.showSuccess('Translation confirmed! 🎉');
            this.hide();
        }
    }
    
    /**
     * Handle correction request
     */
    handleCorrect() {
        const panel = document.getElementById('correctionPanel');
        if (!panel) return;
        
        panel.style.display = 'block';
        panel.innerHTML = `
            <div class="correction-panel">
                <div class="box-label">✏️ Enter the correct translation:</div>
                <textarea 
                    id="correctionInput" 
                    class="correction-input"
                    placeholder="Type the correct Standard English translation..."
                    autofocus
                >${this.currentTranslation.translation}</textarea>
                
                <div class="correction-actions">
                    <button class="correction-submit" onclick="window.feedbackUI.submitCorrection()">
                        💾 Save Correction
                    </button>
                    <button class="correction-cancel" onclick="window.feedbackUI.cancelCorrection()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Focus input
        setTimeout(() => {
            document.getElementById('correctionInput')?.focus();
        }, 100);
    }
    
    /**
     * Submit correction
     */
    async submitCorrection() {
        const input = document.getElementById('correctionInput');
        if (!input || !input.value.trim()) {
            alert('Please enter a correction!');
            return;
        }
        
        const correction = input.value.trim();
        
        if (!this.learningSystem) {
            console.error('Learning system not initialized');
            return;
        }
        
        const result = await this.learningSystem.correctTranslation(correction);
        
        if (result.success) {
            this.showSuccess('Correction saved! Vibenicity just learned from you! 🔥');
            
            // Update the translation in UI
            if (this.currentTranslation) {
                this.currentTranslation.translation = correction;
            }
            
            this.hide();
        }
    }
    
    /**
     * Cancel correction
     */
    cancelCorrection() {
        const panel = document.getElementById('correctionPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        if (window.VibenicityUI) {
            window.VibenicityUI.showToast(message, 'success', 4000);
        } else {
            alert(message);
        }
    }
    
    /**
     * Hide feedback UI
     */
    hide() {
        this.isVisible = false;
        if (this.container && this.container.parentNode) {
            this.container.style.animation = 'feedbackSlideOut 0.3s ease';
            setTimeout(() => {
                this.container.remove();
                this.container = null;
            }, 300);
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleConfirm();
            } else if (e.key === 'Escape') {
                this.hide();
            }
        });
    }
    
    /**
     * Show loading spinner with message
     */
    showLoading(title = '🧠 Processing...', message = 'Please wait while we analyze your input') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        
        overlay.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-title">${title}</div>
                <div class="loading-message">${message}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    /**
     * Show loading with progress steps
     */
    showLoadingWithProgress(title, steps = []) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        
        overlay.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-title">${title}</div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                    <div class="progress-steps" id="progressSteps">
                        ${steps.map((step, i) => `
                            <div class="progress-step" data-step="${i}">
                                <span class="step-icon">⏳</span>
                                <span>${step}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    /**
     * Update progress step
     */
    updateProgress(stepIndex, completed = false) {
        const steps = document.querySelectorAll('.progress-step');
        const progressFill = document.getElementById('progressFill');
        
        if (!steps.length) return;
        
        // Update step status
        steps.forEach((step, i) => {
            step.classList.remove('active', 'completed');
            if (i < stepIndex) {
                step.classList.add('completed');
                step.querySelector('.step-icon').textContent = '✓';
            } else if (i === stepIndex) {
                step.classList.add(completed ? 'completed' : 'active');
                step.querySelector('.step-icon').textContent = completed ? '✓' : '⏳';
            }
        });
        
        // Update progress bar
        if (progressFill) {
            const percent = ((stepIndex + (completed ? 1 : 0)) / steps.length) * 100;
            progressFill.style.width = percent + '%';
        }
    }
    
    /**
     * Hide loading spinner
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                overlay.remove();
            }, 200);
        }
    }
    
    /**
     * Show loading during async operation
     */
    async withLoading(asyncFn, title, message) {
        this.showLoading(title, message);
        try {
            const result = await asyncFn();
            return result;
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Disable button with loading state
     */
    setButtonLoading(buttonElement, loading = true) {
        if (loading) {
            buttonElement.dataset.originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<span class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px; display: inline-block; margin-right: 8px;"></span> Processing...';
            buttonElement.classList.add('btn-disabled');
        } else {
            buttonElement.innerHTML = buttonElement.dataset.originalText || buttonElement.innerHTML;
            buttonElement.classList.remove('btn-disabled');
            delete buttonElement.dataset.originalText;
        }
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.TranslationFeedbackUI = TranslationFeedbackUI;
    window.feedbackUI = new TranslationFeedbackUI();
}

console.log('✅ Translation Feedback UI loaded');
