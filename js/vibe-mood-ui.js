/**
 * Vibe Mood UI Components
 * Beautiful, interactive interface for selecting and customizing moods
 * 
 * @author VibeTribe Team
 * @version 1.0.0
 */

class VibeMoodUI {
    constructor() {
        this.moodSystem = window.vibeMoodSystem;
        this.isOpen = false;
        this.currentView = 'selector'; // selector, settings
        
        this.init();
    }

    /**
     * Initialize the UI
     */
    init() {
        this.createFloatingButton();
        this.createMoodPanel();
        this.attachEventListeners();
        
        // Listen for mood changes
        window.addEventListener('moodChanged', (e) => {
            this.onMoodChanged(e.detail);
        });
        
        window.addEventListener('moodReset', () => {
            this.onMoodReset();
        });
    }

    /**
     * Create floating mood button
     */
    createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'vibe-mood-button';
        button.className = 'vibe-mood-floating-btn';
        button.innerHTML = `
            <span class="mood-btn-icon">🎭</span>
            <span class="mood-btn-label">Vibe</span>
        `;
        button.setAttribute('aria-label', 'Open Vibe Mood Selector');
        button.title = 'Choose your vibe mood';
        
        document.body.appendChild(button);
    }

    /**
     * Create mood selection panel
     */
    createMoodPanel() {
        const panel = document.createElement('div');
        panel.id = 'vibe-mood-panel';
        panel.className = 'vibe-mood-panel';
        panel.innerHTML = `
            <div class="mood-panel-overlay"></div>
            <div class="mood-panel-content">
                <div class="mood-panel-header">
                    <h2 class="mood-panel-title">
                        <span class="mood-icon">✨</span>
                        Choose Your Vibe
                    </h2>
                    <button class="mood-panel-close" aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="mood-panel-body">
                    <!-- Current Mood Display -->
                    <div class="current-mood-display">
                        <div class="current-mood-icon">🎭</div>
                        <div class="current-mood-info">
                            <div class="current-mood-label">Current Vibe</div>
                            <div class="current-mood-name">Not Set</div>
                        </div>
                        <button class="reset-mood-btn" style="display: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                <path d="M21 3v5h-5"></path>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                <path d="M3 21v-5h5"></path>
                            </svg>
                            Reset
                        </button>
                    </div>

                    <!-- Aesthetic Selector -->
                    <div class="aesthetic-selector">
                        <label class="aesthetic-label">Visual Style:</label>
                        <div class="aesthetic-options">
                            <button class="aesthetic-option active" data-aesthetic="male">
                                <span class="aesthetic-icon">👨</span>
                                <span class="aesthetic-name">Male</span>
                            </button>
                            <button class="aesthetic-option" data-aesthetic="female">
                                <span class="aesthetic-icon">👩</span>
                                <span class="aesthetic-name">Female</span>
                            </button>
                        </div>
                    </div>

                    <!-- Mood Grid -->
                    <div class="mood-grid-container">
                        <div class="mood-category-section">
                            <h3 class="mood-category-title">
                                <span class="category-icon">😊</span>
                                Positive Vibes
                            </h3>
                            <div class="mood-grid" data-category="positive"></div>
                        </div>

                        <div class="mood-category-section">
                            <h3 class="mood-category-title">
                                <span class="category-icon">😌</span>
                                Neutral Vibes
                            </h3>
                            <div class="mood-grid" data-category="neutral"></div>
                        </div>

                        <div class="mood-category-section">
                            <h3 class="mood-category-title">
                                <span class="category-icon">😔</span>
                                Processing Vibes
                            </h3>
                            <div class="mood-grid" data-category="negative"></div>
                        </div>
                    </div>

                    <!-- Settings Toggle -->
                    <div class="mood-settings-toggle">
                        <button class="toggle-particles-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span class="toggle-label">Particles: On</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Populate mood grids
        this.populateMoodGrids();
    }

    /**
     * Populate mood grids with mood cards
     */
    populateMoodGrids() {
        const moodsByCategory = this.moodSystem.getMoodsByCategory();
        
        Object.entries(moodsByCategory).forEach(([category, moods]) => {
            const grid = document.querySelector(`.mood-grid[data-category="${category}"]`);
            
            moods.forEach(mood => {
                const card = this.createMoodCard(mood);
                grid.appendChild(card);
            });
        });
    }

    /**
     * Create individual mood card
     * @param {Object} mood - Mood data
     * @returns {HTMLElement} Mood card element
     */
    createMoodCard(mood) {
        const card = document.createElement('button');
        card.className = 'mood-card';
        card.setAttribute('data-mood', mood.key);
        card.setAttribute('data-category', mood.category);
        
        // Get preview colors
        const previewColors = this.getPreviewColors(mood);
        
        card.innerHTML = `
            <div class="mood-card-preview" style="background: ${previewColors.gradient}">
                <div class="mood-card-particles">
                    ${this.getPreviewParticles(mood.effects.particles)}
                </div>
            </div>
            <div class="mood-card-info">
                <h4 class="mood-card-name">${mood.name}</h4>
                <p class="mood-card-description">${mood.description}</p>
            </div>
            <div class="mood-card-selected-indicator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
        `;
        
        return card;
    }

    /**
     * Get preview colors for mood card
     * @param {Object} mood - Mood data
     * @returns {Object} Colors object
     */
    getPreviewColors(mood) {
        return {
            gradient: mood.effects.background,
            primary: mood.colors.primary,
            secondary: mood.colors.secondary
        };
    }

    /**
     * Get preview particles HTML
     * @param {Array} particles - Particle types
     * @returns {string} HTML for particles
     */
    getPreviewParticles(particles) {
        // Show first 3 particle types as preview
        return particles.slice(0, 3).map((particle, index) => {
            const icons = {
                'butterfly': '🦋',
                'flower': '🌸',
                'bird': '🐦',
                'sun-ray': '☀️',
                'spark': '✨',
                'lightning': '⚡',
                'confetti': '🎉',
                'star': '⭐',
                'cloud': '☁️',
                'leaf': '🍃',
                'feather': '🪶',
                'bubble': '🫧',
                'raindrop': '💧',
                'mist': '🌫️',
                'heart': '💕',
                'rose-petal': '🌸',
                'crown': '👑',
                'diamond': '💎',
                'flame': '🔥',
                'wave': '🌊',
                'default': '✨'
            };
            
            const icon = icons[particle] || icons['default'];
            const delay = index * 0.5;
            
            return `<span class="preview-particle" style="animation-delay: ${delay}s">${icon}</span>`;
        }).join('');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Open button
        const openBtn = document.getElementById('vibe-mood-button');
        openBtn.addEventListener('click', () => this.togglePanel());
        
        // Close button
        const closeBtn = document.querySelector('.mood-panel-close');
        closeBtn.addEventListener('click', () => this.closePanel());
        
        // Overlay click
        const overlay = document.querySelector('.mood-panel-overlay');
        overlay.addEventListener('click', () => this.closePanel());
        
        // Aesthetic options
        document.querySelectorAll('.aesthetic-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const aesthetic = e.currentTarget.getAttribute('data-aesthetic');
                this.selectAesthetic(aesthetic);
            });
        });
        
        // Mood cards
        document.querySelectorAll('.mood-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const moodKey = e.currentTarget.getAttribute('data-mood');
                this.selectMood(moodKey);
            });
        });
        
        // Reset button
        const resetBtn = document.querySelector('.reset-mood-btn');
        resetBtn.addEventListener('click', () => this.resetMood());
        
        // Particles toggle
        const particlesBtn = document.querySelector('.toggle-particles-btn');
        particlesBtn.addEventListener('click', () => this.toggleParticles());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });
    }

    /**
     * Toggle panel open/close
     */
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    /**
     * Open the panel
     */
    openPanel() {
        const panel = document.getElementById('vibe-mood-panel');
        panel.classList.add('active');
        this.isOpen = true;
        
        // Update current mood display
        this.updateCurrentMoodDisplay();
        
        // Update selected aesthetic
        this.updateAestheticSelection();
        
        // Update selected mood card
        this.updateMoodSelection();
        
        // Animate in
        setTimeout(() => {
            panel.querySelector('.mood-panel-content').classList.add('visible');
        }, 10);
        
        // Accessibility
        document.body.style.overflow = 'hidden';
        panel.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close the panel
     */
    closePanel() {
        const panel = document.getElementById('vibe-mood-panel');
        panel.querySelector('.mood-panel-content').classList.remove('visible');
        
        setTimeout(() => {
            panel.classList.remove('active');
            this.isOpen = false;
            
            // Accessibility
            document.body.style.overflow = '';
            panel.setAttribute('aria-hidden', 'true');
        }, 300);
    }

    /**
     * Select aesthetic
     * @param {string} aesthetic - Aesthetic type
     */
    selectAesthetic(aesthetic) {
        this.moodSystem.setAesthetic(aesthetic);
        this.updateAestheticSelection();
        
        // Show feedback
        this.showNotification(`Visual style changed to ${this.getAestheticLabel(aesthetic)}`);
    }

    /**
     * Get aesthetic label
     * @param {string} aesthetic - Aesthetic type
     * @returns {string} Label
     */
    getAestheticLabel(aesthetic) {
        const labels = {
            'male': 'Male',
            'female': 'Female'
        };
        return labels[aesthetic] || aesthetic;
    }

    /**
     * Update aesthetic selection UI
     */
    updateAestheticSelection() {
        const currentAesthetic = this.moodSystem.aesthetic;
        
        document.querySelectorAll('.aesthetic-option').forEach(btn => {
            const aesthetic = btn.getAttribute('data-aesthetic');
            btn.classList.toggle('active', aesthetic === currentAesthetic);
        });
    }

    /**
     * Select mood
     * @param {string} moodKey - Mood key
     */
    selectMood(moodKey) {
        // Apply mood
        this.moodSystem.applyMood(moodKey);
        
        // Update UI
        this.updateMoodSelection();
        this.updateCurrentMoodDisplay();
        
        // Show celebration animation
        this.celebrateMoodChange();
        
        // Close panel after short delay
        setTimeout(() => {
            this.closePanel();
        }, 1500);
    }

    /**
     * Update mood selection UI
     */
    updateMoodSelection() {
        const currentMood = this.moodSystem.currentMood;
        
        document.querySelectorAll('.mood-card').forEach(card => {
            const moodKey = card.getAttribute('data-mood');
            card.classList.toggle('selected', moodKey === currentMood);
        });
    }

    /**
     * Update current mood display
     */
    updateCurrentMoodDisplay() {
        const currentMood = this.moodSystem.getCurrentMood();
        const display = document.querySelector('.current-mood-display');
        const icon = display.querySelector('.current-mood-icon');
        const name = display.querySelector('.current-mood-name');
        const resetBtn = display.querySelector('.reset-mood-btn');
        
        if (currentMood) {
            const aestheticSettings = currentMood.aesthetics[this.moodSystem.aesthetic];
            const previewIcon = this.moodSystem.getParticleIcon(aestheticSettings.elements[0]);
            
            icon.textContent = previewIcon;
            name.textContent = currentMood.name;
            resetBtn.style.display = 'flex';
            
            display.style.background = currentMood.effects.background;
            display.classList.add('has-mood');
        } else {
            icon.textContent = '🎭';
            name.textContent = 'Not Set';
            resetBtn.style.display = 'none';
            
            display.style.background = '';
            display.classList.remove('has-mood');
        }
    }

    /**
     * Reset mood
     */
    resetMood() {
        this.moodSystem.resetMood();
        this.updateMoodSelection();
        this.updateCurrentMoodDisplay();
        this.showNotification('Mood reset to default');
    }

    /**
     * Toggle particles
     */
    toggleParticles() {
        this.moodSystem.toggleParticles();
        
        const btn = document.querySelector('.toggle-particles-btn');
        const label = btn.querySelector('.toggle-label');
        
        label.textContent = this.moodSystem.particlesEnabled ? 'Particles: On' : 'Particles: Off';
        btn.classList.toggle('disabled', !this.moodSystem.particlesEnabled);
        
        this.showNotification(
            this.moodSystem.particlesEnabled ? 'Particles enabled' : 'Particles disabled'
        );
    }

    /**
     * Show celebration animation when mood changes
     */
    celebrateMoodChange() {
        const celebration = document.createElement('div');
        celebration.className = 'mood-change-celebration';
        celebration.innerHTML = `
            <div class="celebration-burst">
                <span>✨</span><span>🎉</span><span>⭐</span>
                <span>💫</span><span>🌟</span><span>✨</span>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.classList.add('active');
        }, 10);
        
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'vibe-mood-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }

    /**
     * Handle mood changed event
     * @param {Object} detail - Event detail
     */
    onMoodChanged(detail) {
        // Update floating button
        const button = document.getElementById('vibe-mood-button');
        const icon = button.querySelector('.mood-btn-icon');
        
        const aestheticSettings = detail.moodData.aesthetics[detail.aesthetic];
        const previewIcon = this.moodSystem.getParticleIcon(aestheticSettings.elements[0]);
        
        icon.textContent = previewIcon;
        button.classList.add('mood-active');
        
        // Update button tooltip
        button.title = `Current vibe: ${detail.moodData.name}`;
    }

    /**
     * Handle mood reset event
     */
    onMoodReset() {
        const button = document.getElementById('vibe-mood-button');
        const icon = button.querySelector('.mood-btn-icon');
        
        icon.textContent = '🎭';
        button.classList.remove('mood-active');
        button.title = 'Choose your vibe mood';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.vibeMoodUI = new VibeMoodUI();
    });
} else {
    window.vibeMoodUI = new VibeMoodUI();
}

console.log('✨ Vibe Mood UI loaded successfully');
