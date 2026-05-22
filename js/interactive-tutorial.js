/**
 * Interactive Tutorial System - First-Time User Guide
 * Shows step-by-step bubble instructions for new users
 * 
 * @version 1.0.0
 * @date 2025-11-19
 */

class InteractiveTutorial {
    constructor() {
        this.steps = [
            {
                id: 'welcome',
                target: null, // No specific target, centered
                title: '👋 Welcome to Vibenicity!',
                message: 'Let me show you around! This quick tour will get you building apps in no time. Ready?',
                position: 'center',
                buttons: ['Start Tour', 'Skip']
            },
            {
                id: 'open-studio',
                target: '.nav-links a[href="studio.html"]',
                fallbackTarget: '.btn-primary',
                title: '🚀 Start Here: Open Studio',
                message: 'Click here to open the Studio - this is where the magic happens! You\'ll describe your app and watch AI build it.',
                position: 'bottom',
                highlight: true,
                buttons: ['Next', 'Skip']
            },
            {
                id: 'description-input',
                target: '#appDescription',
                fallbackTarget: 'textarea',
                title: '✍️ Describe Your App',
                message: 'Type in YOUR language! AAVE, slang, Southern, Spanglish - we understand it all. Example: "Build me an app that be tracking my workouts"',
                position: 'top',
                highlight: true,
                buttons: ['Next', 'Skip']
            },
            {
                id: 'cultrvibe-profile',
                target: '#cultrvibeButton',
                fallbackTarget: '.cultrvibe-button',
                title: '🌍 Choose Your Culture',
                message: 'Select your cultural profile here! African American, Latino, Southern, Asian American, or Universal - your choice shapes how we understand you.',
                position: 'bottom',
                highlight: true,
                buttons: ['Next', 'Skip']
            },
            {
                id: 'generate-button',
                target: '#generateBtn',
                fallbackTarget: 'button.generate-button',
                title: '🔥 Generate Your App',
                message: 'Hit this button and watch AI build your complete app! Frontend, backend, database - everything. Takes 30-60 seconds.',
                position: 'top',
                highlight: true,
                buttons: ['Next', 'Skip']
            },
            {
                id: 'music-panel',
                target: '.music-toggle',
                fallbackTarget: '#musicPanel',
                title: '🎵 Vibe While You Build',
                message: 'Toggle music here! Spotify or Pandora - code to your favorite beats. Optional but recommended for the full vibe.',
                position: 'left',
                highlight: true,
                buttons: ['Next', 'Skip']
            },
            {
                id: 'first-prompt',
                target: '#appDescription',
                fallbackTarget: 'textarea',
                title: '💪 Try Your First Prompt',
                message: 'Ready to build? Type something like: "Make me a todo list app that be helping me stay organized" then hit Generate!',
                position: 'top',
                highlight: true,
                buttons: ['Got It!', 'Skip']
            }
        ];
        
        this.currentStep = 0;
        this.isActive = false;
        this.bubble = null;
        this.overlay = null;
        this.highlightElement = null;
        
        // Check if user has seen tutorial
        this.hasSeenTutorial = localStorage.getItem('vibenicity_tutorial_completed') === 'true';
    }
    
    /**
     * Initialize and start tutorial
     */
    start() {
        if (this.hasSeenTutorial) {
            console.log('Tutorial already completed');
            return;
        }
        
        this.isActive = true;
        this.currentStep = 0;
        this.createElements();
        this.showStep(0);
    }
    
    /**
     * Create tutorial UI elements
     */
    createElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.overlay);
        
        // Create bubble
        this.bubble = document.createElement('div');
        this.bubble.className = 'tutorial-bubble';
        this.bubble.style.cssText = `
            position: fixed;
            max-width: 400px;
            background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
            color: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
            z-index: 9999;
            animation: bubbleFadeIn 0.3s ease;
        `;
        document.body.appendChild(this.bubble);
        
        // Create highlight element
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'tutorial-highlight';
        this.highlightElement.style.cssText = `
            position: fixed;
            border: 3px solid #8b5cf6;
            border-radius: 8px;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3),
                        0 0 0 9999px rgba(0, 0, 0, 0.7);
            z-index: 9997;
            pointer-events: none;
            transition: all 0.3s ease;
            animation: highlightPulse 2s ease infinite;
        `;
        document.body.appendChild(this.highlightElement);
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bubbleFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes highlightPulse {
                0%, 100% {
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.3),
                                0 0 0 9999px rgba(0, 0, 0, 0.7);
                }
                50% {
                    box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.5),
                                0 0 0 9999px rgba(0, 0, 0, 0.7);
                }
            }
            
            .tutorial-exit-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
                transition: background 0.2s;
            }
            
            .tutorial-exit-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .tutorial-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }
            
            .tutorial-btn {
                flex: 1;
                padding: 10px 20px;
                border: 2px solid white;
                background: transparent;
                color: white;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .tutorial-btn:hover {
                background: white;
                color: #8b5cf6;
            }
            
            .tutorial-btn.primary {
                background: white;
                color: #8b5cf6;
            }
            
            .tutorial-btn.primary:hover {
                background: rgba(255, 255, 255, 0.9);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Show specific tutorial step
     */
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            this.complete();
            return;
        }
        
        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        
        // Find target element
        let target = null;
        if (step.target) {
            target = document.querySelector(step.target);
            if (!target && step.fallbackTarget) {
                target = document.querySelector(step.fallbackTarget);
            }
        }
        
        // Update bubble content
        this.bubble.innerHTML = `
            <button class="tutorial-exit-btn" onclick="window.tutorial.skip()">×</button>
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">
                ${step.title}
            </div>
            <div style="font-size: 16px; line-height: 1.6; opacity: 0.95;">
                ${step.message}
            </div>
            <div style="font-size: 14px; margin-top: 12px; opacity: 0.8;">
                Step ${stepIndex + 1} of ${this.steps.length}
            </div>
            <div class="tutorial-buttons">
                ${step.buttons.map((btn, i) => {
                    const isPrimary = i === 0;
                    const action = btn === 'Skip' ? 'skip()' : 'next()';
                    return `<button class="tutorial-btn ${isPrimary ? 'primary' : ''}" 
                                    onclick="window.tutorial.${action}">${btn}</button>`;
                }).join('')}
            </div>
        `;
        
        // Position bubble and highlight
        if (target && step.position !== 'center') {
            this.positionBubble(target, step.position);
            if (step.highlight) {
                this.highlightTarget(target);
            }
        } else {
            this.positionCenter();
            this.highlightElement.style.display = 'none';
        }
    }
    
    /**
     * Position bubble relative to target
     */
    positionBubble(target, position) {
        const rect = target.getBoundingClientRect();
        const bubbleWidth = 400;
        const bubbleHeight = this.bubble.offsetHeight || 200;
        const gap = 20;
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - bubbleHeight - gap;
                left = rect.left + (rect.width / 2) - (bubbleWidth / 2);
                break;
            case 'bottom':
                top = rect.bottom + gap;
                left = rect.left + (rect.width / 2) - (bubbleWidth / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (bubbleHeight / 2);
                left = rect.left - bubbleWidth - gap;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (bubbleHeight / 2);
                left = rect.right + gap;
                break;
        }
        
        // Keep bubble on screen
        top = Math.max(20, Math.min(top, window.innerHeight - bubbleHeight - 20));
        left = Math.max(20, Math.min(left, window.innerWidth - bubbleWidth - 20));
        
        this.bubble.style.top = top + 'px';
        this.bubble.style.left = left + 'px';
    }
    
    /**
     * Position bubble in center
     */
    positionCenter() {
        this.bubble.style.top = '50%';
        this.bubble.style.left = '50%';
        this.bubble.style.transform = 'translate(-50%, -50%)';
    }
    
    /**
     * Highlight target element
     */
    highlightTarget(target) {
        const rect = target.getBoundingClientRect();
        this.highlightElement.style.display = 'block';
        this.highlightElement.style.top = (rect.top - 5) + 'px';
        this.highlightElement.style.left = (rect.left - 5) + 'px';
        this.highlightElement.style.width = (rect.width + 10) + 'px';
        this.highlightElement.style.height = (rect.height + 10) + 'px';
    }
    
    /**
     * Go to next step
     */
    next() {
        this.showStep(this.currentStep + 1);
    }
    
    /**
     * Skip tutorial
     */
    skip() {
        if (confirm('Are you sure you want to skip the tutorial? You can restart it anytime from Settings.')) {
            this.complete();
        }
    }
    
    /**
     * Complete tutorial
     */
    complete() {
        this.isActive = false;
        localStorage.setItem('vibenicity_tutorial_completed', 'true');
        
        // Remove elements
        if (this.bubble) this.bubble.remove();
        if (this.overlay) this.overlay.remove();
        if (this.highlightElement) this.highlightElement.remove();
        
        console.log('✅ Tutorial completed!');
    }
    
    /**
     * Reset tutorial (for testing)
     */
    reset() {
        localStorage.removeItem('vibenicity_tutorial_completed');
        this.hasSeenTutorial = false;
        console.log('Tutorial reset - will show on next page load');
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    window.InteractiveTutorial = InteractiveTutorial;
    
    // Auto-start tutorial on studio page if first time
    if (window.location.pathname.includes('studio.html')) {
        window.addEventListener('DOMContentLoaded', () => {
            window.tutorial = new InteractiveTutorial();
            
            // Wait a bit for page to fully load
            setTimeout(() => {
                if (!window.tutorial.hasSeenTutorial) {
                    window.tutorial.start();
                }
            }, 1000);
        });
    }
}

console.log('✅ Interactive Tutorial System loaded');
