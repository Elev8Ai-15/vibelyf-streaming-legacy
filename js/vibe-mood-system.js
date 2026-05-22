/**
 * Vibe Mood Customization System
 * Allows users to customize their experience based on their current emotional state
 * Features male and female aesthetic options with dynamic animated backgrounds
 * 
 * @author VibeTribe Team
 * @version 1.0.0
 */

class VibeMoodSystem {
    constructor() {
        // Mood definitions with visual themes
        this.moods = {
            // Happy/Joyful moods
            happy: {
                name: 'Happy & Joyful',
                category: 'positive',
                description: 'Sunshine, birds, flowers blooming',
                colors: {
                    primary: '#FFD700',
                    secondary: '#87CEEB',
                    accent: '#FF69B4',
                    text: '#2C3E50'
                },
                effects: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    particles: ['butterfly', 'flower', 'sun-ray', 'bird'],
                    animation: 'gentle-float',
                    sound: 'birds-chirping' // Optional
                },
                aesthetics: {
                    male: {
                        palette: ['#4A90E2', '#F39C12', '#2ECC71'],
                        elements: ['sun', 'mountain', 'eagle', 'oak-leaves']
                    },
                    female: {
                        palette: ['#FF69B4', '#FFB6C1', '#DDA0DD'],
                        elements: ['butterfly', 'rose', 'lily', 'hummingbird']
                    }
                }
            },
            
            excited: {
                name: 'Excited & Energized',
                category: 'positive',
                description: 'Electric energy, vibrant colors, fast movement',
                colors: {
                    primary: '#FF6B35',
                    secondary: '#F7931E',
                    accent: '#FDC830',
                    text: '#1A1A1A'
                },
                effects: {
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    particles: ['spark', 'lightning', 'confetti', 'star'],
                    animation: 'energetic-bounce',
                    sound: 'upbeat-energy'
                },
                aesthetics: {
                    male: {
                        palette: ['#FF6B35', '#F7931E', '#FDC830'],
                        elements: ['lightning', 'spark', 'firework', 'comet']
                    },
                    female: {
                        palette: ['#FF1493', '#FF69B4', '#FFB6C1'],
                        elements: ['sparkle', 'confetti', 'star', 'gem']
                    }
                }
            },
            
            peaceful: {
                name: 'Peaceful & Calm',
                category: 'neutral',
                description: 'Gentle breeze, soft clouds, tranquil waters',
                colors: {
                    primary: '#B2D8D8',
                    secondary: '#C1E1C1',
                    accent: '#E6E6FA',
                    text: '#4A5568'
                },
                effects: {
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    particles: ['cloud', 'leaf', 'feather', 'bubble'],
                    animation: 'slow-drift',
                    sound: 'gentle-waves'
                },
                aesthetics: {
                    male: {
                        palette: ['#B2D8D8', '#C1E1C1', '#E6E6FA'],
                        elements: ['cloud', 'water', 'lotus', 'dove']
                    },
                    female: {
                        palette: ['#E0BBE4', '#D4A5A5', '#C1B2D8'],
                        elements: ['lotus', 'lavender', 'swan', 'cloud']
                    }
                }
            },
            
            sad: {
                name: 'Sad & Reflective',
                category: 'negative',
                description: 'Rainy clouds, soft drizzle, misty atmosphere',
                colors: {
                    primary: '#607D8B',
                    secondary: '#78909C',
                    accent: '#90A4AE',
                    text: '#ECEFF1'
                },
                effects: {
                    background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
                    particles: ['raindrop', 'cloud', 'mist', 'puddle'],
                    animation: 'rain-fall',
                    sound: 'rain-ambiance'
                },
                aesthetics: {
                    male: {
                        palette: ['#607D8B', '#78909C', '#90A4AE'],
                        elements: ['rain', 'cloud', 'puddle', 'fog']
                    },
                    female: {
                        palette: ['#9FA8DA', '#B39DDB', '#CE93D8'],
                        elements: ['rain', 'willow', 'tear-drop', 'soft-cloud']
                    }
                }
            },
            
            moody: {
                name: 'Moody & Introspective',
                category: 'neutral',
                description: 'Twilight sky, deep shadows, mysterious atmosphere',
                colors: {
                    primary: '#6A5ACD',
                    secondary: '#483D8B',
                    accent: '#9370DB',
                    text: '#E8E8E8'
                },
                effects: {
                    background: 'linear-gradient(135deg, #2d3561 0%, #c05c7e 100%)',
                    particles: ['shadow', 'fog', 'ember', 'moon-phase'],
                    animation: 'slow-pulse',
                    sound: 'ambient-mystery'
                },
                aesthetics: {
                    male: {
                        palette: ['#6A5ACD', '#483D8B', '#9370DB'],
                        elements: ['twilight', 'fog', 'silhouette', 'moon']
                    },
                    female: {
                        palette: ['#8E44AD', '#9B59B6', '#BB8FCE'],
                        elements: ['twilight', 'orchid', 'night-sky', 'mystic-fog']
                    }
                }
            },
            
            angry: {
                name: 'Angry & Fierce',
                category: 'negative',
                description: 'Stormy skies, lightning, intense energy',
                colors: {
                    primary: '#C0392B',
                    secondary: '#E74C3C',
                    accent: '#EC7063',
                    text: '#F8F9F9'
                },
                effects: {
                    background: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)',
                    particles: ['lightning', 'thunder-cloud', 'flame', 'spark'],
                    animation: 'intense-shake',
                    sound: 'thunder-storm'
                },
                aesthetics: {
                    male: {
                        palette: ['#C0392B', '#E74C3C', '#EC7063'],
                        elements: ['lightning', 'storm', 'fire', 'thunder']
                    },
                    female: {
                        palette: ['#E74C3C', '#EC7063', '#F1948A'],
                        elements: ['fire-flower', 'phoenix', 'flame', 'ember']
                    }
                }
            },
            
            romantic: {
                name: 'Romantic & Dreamy',
                category: 'positive',
                description: 'Soft sunset, floating petals, warm glow',
                colors: {
                    primary: '#FF6B9D',
                    secondary: '#FFC371',
                    accent: '#FF85A1',
                    text: '#4A4A4A'
                },
                effects: {
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    particles: ['heart', 'rose-petal', 'soft-glow', 'star'],
                    animation: 'romantic-float',
                    sound: 'soft-piano'
                },
                aesthetics: {
                    male: {
                        palette: ['#FF6B9D', '#FFC371', '#FF85A1'],
                        elements: ['sunset', 'heart', 'rose', 'candlelight']
                    },
                    female: {
                        palette: ['#FF1493', '#FF69B4', '#FFB6C1'],
                        elements: ['rose-petal', 'heart', 'butterfly', 'pink-blossom']
                    }
                }
            },
            
            confident: {
                name: 'Confident & Powerful',
                category: 'positive',
                description: 'Bold colors, strong lines, commanding presence',
                colors: {
                    primary: '#2C3E50',
                    secondary: '#E67E22',
                    accent: '#F39C12',
                    text: '#ECF0F1'
                },
                effects: {
                    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                    particles: ['crown', 'diamond', 'gold-spark', 'beam'],
                    animation: 'power-pulse',
                    sound: 'epic-orchestral'
                },
                aesthetics: {
                    male: {
                        palette: ['#2C3E50', '#E67E22', '#F39C12'],
                        elements: ['mountain-peak', 'crown', 'eagle', 'gold']
                    },
                    female: {
                        palette: ['#8E44AD', '#9B59B6', '#C39BD3'],
                        elements: ['crown', 'gem', 'lioness', 'scepter']
                    }
                }
            },
            
            anxious: {
                name: 'Anxious & Overwhelmed',
                category: 'negative',
                description: 'Swirling patterns, rapid movement, uncertain colors',
                colors: {
                    primary: '#7F8C8D',
                    secondary: '#95A5A6',
                    accent: '#BDC3C7',
                    text: '#2C3E50'
                },
                effects: {
                    background: 'linear-gradient(135deg, #868f96 0%, #596164 100%)',
                    particles: ['swirl', 'static', 'blur', 'fog'],
                    animation: 'nervous-jitter',
                    sound: 'ambient-tension'
                },
                aesthetics: {
                    male: {
                        palette: ['#7F8C8D', '#95A5A6', '#BDC3C7'],
                        elements: ['fog', 'maze', 'spiral', 'haze']
                    },
                    female: {
                        palette: ['#A9A9A9', '#C0C0C0', '#D3D3D3'],
                        elements: ['tangled-vine', 'mist', 'wisp', 'soft-chaos']
                    }
                }
            },
            
            chill: {
                name: 'Chill & Relaxed',
                category: 'neutral',
                description: 'Laid-back vibes, cool tones, easy movement',
                colors: {
                    primary: '#3498DB',
                    secondary: '#5DADE2',
                    accent: '#85C1E9',
                    text: '#2C3E50'
                },
                effects: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    particles: ['wave', 'palm-leaf', 'vinyl-record', 'cool-breeze'],
                    animation: 'chill-sway',
                    sound: 'lofi-beats'
                },
                aesthetics: {
                    male: {
                        palette: ['#3498DB', '#5DADE2', '#85C1E9'],
                        elements: ['wave', 'palm', 'hammock', 'sunset-beach']
                    },
                    female: {
                        palette: ['#AED6F1', '#D6EAF8', '#EBF5FB'],
                        elements: ['seashell', 'beach-flower', 'pastel-wave', 'soft-sand']
                    }
                }
            }
        };

        // User preferences
        this.currentMood = null;
        this.aesthetic = 'male'; // male, female
        this.particlesEnabled = true;
        this.soundEnabled = false;
        
        this.init();
    }

    /**
     * Initialize the mood system
     */
    init() {
        // Load saved preferences
        this.loadPreferences();
        
        // Apply saved mood if exists
        if (this.currentMood) {
            this.applyMood(this.currentMood);
        }
    }

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        const saved = localStorage.getItem('vibe-mood-preferences');
        if (saved) {
            const prefs = JSON.parse(saved);
            this.currentMood = prefs.currentMood || null;
            this.aesthetic = prefs.aesthetic || 'male';
            this.particlesEnabled = prefs.particlesEnabled !== false;
            this.soundEnabled = prefs.soundEnabled || false;
        }
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        const prefs = {
            currentMood: this.currentMood,
            aesthetic: this.aesthetic,
            particlesEnabled: this.particlesEnabled,
            soundEnabled: this.soundEnabled,
            lastUpdated: Date.now()
        };
        localStorage.setItem('vibe-mood-preferences', JSON.stringify(prefs));
    }

    /**
     * Set the aesthetic preference
     * @param {string} aesthetic - 'male' or 'female'
     */
    setAesthetic(aesthetic) {
        if (['male', 'female'].includes(aesthetic)) {
            this.aesthetic = aesthetic;
            this.savePreferences();
            
            // Re-apply current mood with new aesthetic
            if (this.currentMood) {
                this.applyMood(this.currentMood);
            }
        }
    }

    /**
     * Apply a mood to the interface
     * @param {string} moodKey - Key of the mood to apply
     */
    applyMood(moodKey) {
        if (!this.moods[moodKey]) {
            console.error(`Mood "${moodKey}" not found`);
            return;
        }

        const mood = this.moods[moodKey];
        this.currentMood = moodKey;
        
        // Get aesthetic-specific settings
        const aestheticSettings = mood.aesthetics[this.aesthetic];
        
        // Apply to body
        const body = document.body;
        
        // Set data attributes for CSS targeting
        body.setAttribute('data-mood', moodKey);
        body.setAttribute('data-aesthetic', this.aesthetic);
        body.setAttribute('data-mood-category', mood.category);
        
        // Apply background
        body.style.background = mood.effects.background;
        
        // Clear existing particles
        this.clearParticles();
        
        // Add new particles if enabled
        if (this.particlesEnabled) {
            this.createParticles(mood.effects.particles, aestheticSettings.elements);
        }
        
        // Apply color scheme to CSS variables
        this.applyColorScheme(aestheticSettings.palette);
        
        // Trigger animation
        body.classList.add('mood-transition');
        setTimeout(() => body.classList.remove('mood-transition'), 1000);
        
        // Save preferences
        this.savePreferences();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('moodChanged', {
            detail: {
                mood: moodKey,
                moodData: mood,
                aesthetic: this.aesthetic
            }
        }));
        
        console.log(`✨ Mood applied: ${mood.name} (${this.aesthetic})`);
    }

    /**
     * Apply color scheme to CSS custom properties
     * @param {Array} palette - Array of color hex codes
     */
    applyColorScheme(palette) {
        const root = document.documentElement;
        palette.forEach((color, index) => {
            root.style.setProperty(`--mood-color-${index + 1}`, color);
        });
    }

    /**
     * Create animated particles based on mood
     * @param {Array} particleTypes - Types of particles to create
     * @param {Array} elements - Specific elements for the aesthetic
     */
    createParticles(particleTypes, elements) {
        const container = document.getElementById('mood-particles-container') || this.createParticleContainer();
        
        // Create 15-25 particles
        const particleCount = Math.floor(Math.random() * 10) + 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            const element = elements[Math.floor(Math.random() * elements.length)];
            
            this.createParticle(container, particleType, element);
        }
    }

    /**
     * Create particle container if it doesn't exist
     */
    createParticleContainer() {
        const container = document.createElement('div');
        container.id = 'mood-particles-container';
        container.className = 'mood-particles-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Create individual particle
     * @param {HTMLElement} container - Container element
     * @param {string} type - Particle type
     * @param {string} element - Specific element name
     */
    createParticle(container, type, element) {
        const particle = document.createElement('div');
        particle.className = `mood-particle mood-particle-${type}`;
        particle.setAttribute('data-element', element);
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        // Random size variation
        const scale = 0.7 + Math.random() * 0.6;
        particle.style.transform = `scale(${scale})`;
        
        // Add icon or emoji based on element
        particle.innerHTML = this.getParticleIcon(element);
        
        container.appendChild(particle);
    }

    /**
     * Get icon/emoji for particle element
     * @param {string} element - Element name
     * @returns {string} HTML for particle content
     */
    getParticleIcon(element) {
        const icons = {
            // Happy elements
            'sun': '☀️',
            'butterfly': '🦋',
            'flower': '🌸',
            'bird': '🐦',
            'rainbow': '🌈',
            'clouds': '☁️',
            
            // Excited elements
            'spark': '✨',
            'lightning': '⚡',
            'confetti': '🎉',
            'star': '⭐',
            'firework': '🎆',
            'rocket': '🚀',
            
            // Peaceful elements
            'cloud': '☁️',
            'leaf': '🍃',
            'feather': '🪶',
            'bubble': '🫧',
            'dove': '🕊️',
            'lotus': '🪷',
            
            // Sad elements
            'raindrop': '💧',
            'puddle': '💧',
            'mist': '🌫️',
            'willow': '🌿',
            
            // Moody elements
            'moon': '🌙',
            'shadow': '🌑',
            'fog': '🌫️',
            'twilight': '🌆',
            
            // Romantic elements
            'heart': '💕',
            'rose': '🌹',
            'rose-petal': '🌸',
            'candlelight': '🕯️',
            
            // Confident elements
            'crown': '👑',
            'diamond': '💎',
            'eagle': '🦅',
            'mountain-peak': '⛰️',
            
            // Nature elements
            'mountain': '⛰️',
            'river': '🏞️',
            'pine': '🌲',
            'oak-leaves': '🍂',
            
            // Default
            'default': '✨'
        };
        
        return icons[element] || icons['default'];
    }

    /**
     * Clear all particles
     */
    clearParticles() {
        const container = document.getElementById('mood-particles-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Toggle particles on/off
     */
    toggleParticles() {
        this.particlesEnabled = !this.particlesEnabled;
        
        if (this.particlesEnabled && this.currentMood) {
            const mood = this.moods[this.currentMood];
            const aestheticSettings = mood.aesthetics[this.aesthetic];
            this.createParticles(mood.effects.particles, aestheticSettings.elements);
        } else {
            this.clearParticles();
        }
        
        this.savePreferences();
    }

    /**
     * Get all moods grouped by category
     * @returns {Object} Moods grouped by category
     */
    getMoodsByCategory() {
        const grouped = {
            positive: [],
            neutral: [],
            negative: []
        };
        
        Object.entries(this.moods).forEach(([key, mood]) => {
            grouped[mood.category].push({
                key,
                ...mood
            });
        });
        
        return grouped;
    }

    /**
     * Get current mood info
     * @returns {Object|null} Current mood data
     */
    getCurrentMood() {
        if (!this.currentMood) return null;
        
        return {
            key: this.currentMood,
            ...this.moods[this.currentMood],
            aesthetic: this.aesthetic
        };
    }

    /**
     * Reset to default (no mood)
     */
    resetMood() {
        this.currentMood = null;
        this.clearParticles();
        
        const body = document.body;
        body.removeAttribute('data-mood');
        body.removeAttribute('data-aesthetic');
        body.removeAttribute('data-mood-category');
        body.style.background = '';
        
        this.savePreferences();
        
        window.dispatchEvent(new CustomEvent('moodReset'));
    }
}

// Initialize global instance
window.vibeMoodSystem = new VibeMoodSystem();

console.log('✨ Vibe Mood System loaded successfully');
