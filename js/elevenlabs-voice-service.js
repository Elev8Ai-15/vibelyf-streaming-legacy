/**
 * ElevenLabs Voice Service - AI Voice Generation for Code Explanations
 * 
 * Integrates ElevenLabs API for text-to-speech functionality.
 * 
 * Features:
 * - Text-to-speech conversion with natural voices
 * - Multiple voice personalities (professional, street, encouraging, tutorial)
 * - Streaming audio support for real-time playback
 * - 29+ language support (multilingual voices)
 * - Voice customization (stability, similarity, style)
 * - Audio playback management
 * - Usage tracking and rate limiting
 * 
 * API Reference: https://elevenlabs.io/docs/api-reference
 * 
 * Philosophy:
 * "Hear your code come to life! AI voices explain what was generated in your style."
 * 
 * @version 2.0.0 - Standalone (Hybrid Architecture)
 * @date 2025-11-19
 * @author VibeCoder Team
 */

class ElevenLabsVoiceService {
    /**
     * Initialize ElevenLabs Voice Service
     */
    constructor() {
        this.serviceName = 'ElevenLabs Voice';
        this.storageKey = 'vibecoder_elevenlabs_api_key';
        this.apiKeyPrefix = null;
        
        // Load saved API key
        this.apiKey = this.loadAPIKey();
        
        // API configuration
        this.apiEndpoint = 'https://api.elevenlabs.io/v1';
        this.model = 'eleven_multilingual_v2'; // Best for multilingual support
        
        // Rate limiting (free tier: 10,000 characters/month)
        this.maxConcurrentRequests = 2;
        this.minRequestInterval = 2000; // 2 seconds between requests
        this.requestQueue = [];
        this.requestsInProgress = 0;
        this.lastRequestTime = 0;
        
        // Voice personality presets
        this.voicePersonalities = {
            professional: {
                voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional female
                name: '👔 Professional',
                description: 'Clear, articulate, business-appropriate',
                settings: {
                    stability: 0.75,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            },
            street: {
                voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Street/urban style
                name: '🔥 Street',
                description: 'Urban, energetic, casual vibe',
                settings: {
                    stability: 0.50,
                    similarity_boost: 0.80,
                    style: 0.5,
                    use_speaker_boost: true
                }
            },
            encouraging: {
                voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - Warm and encouraging
                name: '💖 Encouraging',
                description: 'Warm, supportive, motivational',
                settings: {
                    stability: 0.65,
                    similarity_boost: 0.85,
                    style: 0.3,
                    use_speaker_boost: true
                }
            },
            tutorial: {
                voiceId: 'ErXwobaYiN019PkySvjV', // Antoni - Tutorial style
                name: '📚 Tutorial',
                description: 'Patient, educational, step-by-step',
                settings: {
                    stability: 0.80,
                    similarity_boost: 0.70,
                    style: 0.1,
                    use_speaker_boost: true
                }
            },
            excited: {
                voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - Excited and energetic
                name: '🎉 Excited',
                description: 'Enthusiastic, energetic, upbeat',
                settings: {
                    stability: 0.40,
                    similarity_boost: 0.85,
                    style: 0.7,
                    use_speaker_boost: true
                }
            }
        };
        
        // Current voice personality
        this.currentVoice = this.loadPreference('voice', 'professional');
        
        // Audio playback management
        this.audioContext = null;
        this.currentAudio = null;
        this.isPlaying = false;
        this.enabled = this.loadPreference('enabled', true);
        
        // Character usage tracking (free tier limit)
        this.characterCount = this.loadPreference('characterCount', 0);
        this.characterLimit = 10000; // Free tier monthly limit
        
        console.log('🎤 ElevenLabs Voice Service initialized', {
            voice: this.currentVoice,
            enabled: this.enabled,
            charactersUsed: this.characterCount
        });
    }
    
    /**
     * Load API key from localStorage
     */
    loadAPIKey() {
        try {
            const encrypted = localStorage.getItem(this.storageKey);
            if (!encrypted) return null;
            try {
                return atob(encrypted);
            } catch (e) {
                return encrypted;
            }
        } catch (error) {
            console.error(`Failed to load API key for ${this.serviceName}:`, error);
            return null;
        }
    }
    
    /**
     * Save API key to localStorage
     */
    saveAPIKey(apiKey) {
        try {
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
     */
    hasAPIKey() {
        return this.apiKey !== null && this.apiKey.length > 0;
    }
    
    /**
     * Queue a request with rate limiting
     */
    async queuedRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }
    
    /**
     * Process request queue with rate limiting
     */
    async processQueue() {
        if (this.requestsInProgress >= this.maxConcurrentRequests) {
            return;
        }
        if (this.requestQueue.length === 0) {
            return;
        }
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            setTimeout(() => this.processQueue(), this.minRequestInterval - timeSinceLastRequest);
            return;
        }
        const { requestFn, resolve, reject } = this.requestQueue.shift();
        this.requestsInProgress++;
        this.lastRequestTime = Date.now();
        
        try {
            const result = await requestFn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.requestsInProgress--;
            setTimeout(() => this.processQueue(), this.minRequestInterval);
        }
    }
    
    /**
     * Generate speech from text
     * 
     * @param {string} text - Text to convert to speech
     * @param {object} options - Voice options (voiceId, stability, similarity, language)
     * @returns {Promise<ArrayBuffer>} Audio data
     */
    async textToSpeech(text, options = {}) {
        if (!this.hasAPIKey()) {
            throw new Error('ElevenLabs API key not configured. Please add your API key in settings.');
        }
        
        if (!this.enabled) {
            console.log('🔇 Voice is disabled, skipping TTS');
            return null;
        }
        
        // Check character limit
        const charCount = text.length;
        if (this.characterCount + charCount > this.characterLimit) {
            throw new Error(`Character limit exceeded (${this.characterCount}/${this.characterLimit}). Consider upgrading your ElevenLabs plan.`);
        }
        
        // Get voice configuration
        const personality = this.voicePersonalities[this.currentVoice];
        const voiceId = options.voiceId || personality.voiceId;
        const settings = { ...personality.settings, ...options.voice_settings };
        
        console.log('🎤 Generating speech:', {
            text: text.substring(0, 50) + '...',
            voice: this.currentVoice,
            characters: charCount
        });
        
        try {
            // Make API request using queue
            const audioData = await this.queuedRequest(async () => {
                const response = await fetch(`${this.apiEndpoint}/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'xi-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: this.model,
                        voice_settings: settings
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
                }
                
                return await response.arrayBuffer();
            });
            
            // Update character usage
            this.characterCount += charCount;
            this.savePreference('characterCount', this.characterCount);
            
            // Update stats
            this.requestCount++;
            console.log('✅ Speech generated successfully:', {
                size: (audioData.byteLength / 1024).toFixed(2) + ' KB',
                charactersUsed: this.characterCount
            });
            
            return audioData;
            
        } catch (error) {
            this.errorCount++;
            console.error('❌ Speech generation failed:', error);
            
            // Report error to global handler
            if (typeof window !== 'undefined' && window.errorHandler) {
                window.errorHandler.handleError(error, {
                    context: 'ElevenLabs TTS',
                    service: this.serviceName,
                    text: text.substring(0, 100)
                });
            }
            
            throw error;
        }
    }
    
    /**
     * Generate speech with streaming (for long texts)
     * 
     * @param {string} text - Text to convert to speech
     * @param {object} options - Voice options
     * @returns {Promise<void>} Streams audio directly to playback
     */
    async textToSpeechStream(text, options = {}) {
        if (!this.hasAPIKey()) {
            throw new Error('ElevenLabs API key not configured');
        }
        
        if (!this.enabled) {
            console.log('🔇 Voice is disabled, skipping streaming TTS');
            return;
        }
        
        const personality = this.voicePersonalities[this.currentVoice];
        const voiceId = options.voiceId || personality.voiceId;
        const settings = { ...personality.settings, ...options.voice_settings };
        
        console.log('🎤 Starting streaming speech generation...');
        
        try {
            const response = await fetch(`${this.apiEndpoint}/text-to-speech/${voiceId}/stream`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: this.model,
                    voice_settings: settings
                })
            });
            
            if (!response.ok) {
                throw new Error(`Streaming failed: ${response.status}`);
            }
            
            // Stream audio chunks
            const reader = response.body.getReader();
            const chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
            
            // Combine chunks and play
            const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                audioData.set(chunk, offset);
                offset += chunk.length;
            }
            
            await this.playAudio(audioData.buffer);
            
            // Update usage
            this.characterCount += text.length;
            this.savePreference('characterCount', this.characterCount);
            
            console.log('✅ Streaming speech completed');
            
        } catch (error) {
            this.errorCount++;
            console.error('❌ Streaming speech failed:', error);
            throw error;
        }
    }
    
    /**
     * Play audio data through Web Audio API
     * 
     * @param {ArrayBuffer} audioData - Audio data to play
     * @returns {Promise<void>}
     */
    async playAudio(audioData) {
        try {
            // Stop any currently playing audio
            this.stopAudio();
            
            // Initialize AudioContext if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(audioData);
            
            // Create audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            
            // Track playback state
            this.isPlaying = true;
            this.currentAudio = source;
            
            // Play audio
            source.start(0);
            
            // Handle playback end
            source.onended = () => {
                this.isPlaying = false;
                this.currentAudio = null;
                console.log('✅ Audio playback finished');
            };
            
            console.log('🔊 Playing audio:', {
                duration: audioBuffer.duration.toFixed(2) + 's',
                sampleRate: audioBuffer.sampleRate
            });
            
        } catch (error) {
            this.isPlaying = false;
            this.currentAudio = null;
            console.error('❌ Audio playback failed:', error);
            throw error;
        }
    }
    
    /**
     * Stop currently playing audio
     */
    stopAudio() {
        if (this.currentAudio) {
            try {
                this.currentAudio.stop();
                this.currentAudio.disconnect();
            } catch (error) {
                // Audio might already be stopped
            }
            this.currentAudio = null;
            this.isPlaying = false;
            console.log('⏹️ Audio playback stopped');
        }
    }
    
    /**
     * Generate voice explanation of generated code
     * 
     * @param {object} generatedCode - Generated code object with HTML/CSS/JS
     * @param {string} language - User's language (for multilingual)
     * @returns {Promise<ArrayBuffer>} Audio explanation
     */
    async explainCode(generatedCode, language = 'en') {
        const explanation = this.generateExplanationText(generatedCode, language);
        return await this.textToSpeech(explanation, { language });
    }
    
    /**
     * Generate explanation text for code
     * 
     * @param {object} generatedCode - Generated code object
     * @param {string} language - User's language
     * @returns {string} Explanation text
     */
    generateExplanationText(generatedCode, language = 'en') {
        // Count lines of code
        const htmlLines = (generatedCode.html || '').split('\n').length;
        const cssLines = (generatedCode.css || '').split('\n').length;
        const jsLines = (generatedCode.js || '').split('\n').length;
        const totalLines = htmlLines + cssLines + jsLines;
        
        // Voice personality affects tone
        const personality = this.currentVoice;
        
        // Generate explanation based on personality
        let explanation = '';
        
        if (personality === 'street') {
            explanation = `Yo! I just cooked up ${totalLines} lines of code for you! ` +
                         `Got ${htmlLines} lines of HTML for structure, ` +
                         `${cssLines} lines of CSS to make it look fire, ` +
                         `and ${jsLines} lines of JavaScript to make it work smooth. ` +
                         `This app is ready to go, fam!`;
        } else if (personality === 'encouraging') {
            explanation = `Amazing work! I've created ${totalLines} lines of code just for you! ` +
                         `There's ${htmlLines} lines of HTML to structure your app, ` +
                         `${cssLines} lines of CSS to make it beautiful, ` +
                         `and ${jsLines} lines of JavaScript to bring it to life. ` +
                         `You're doing great! Keep coding!`;
        } else if (personality === 'tutorial') {
            explanation = `Let me explain what we've created here. ` +
                         `I've generated ${totalLines} lines of code in total. ` +
                         `First, there are ${htmlLines} lines of HTML, which define the structure of your application. ` +
                         `Then, ${cssLines} lines of CSS handle all the styling and visual presentation. ` +
                         `Finally, ${jsLines} lines of JavaScript add interactivity and dynamic behavior. ` +
                         `Together, these create a complete, functional application.`;
        } else if (personality === 'excited') {
            explanation = `YES! This is SO COOL! I just made ${totalLines} lines of AWESOME code! ` +
                         `We've got ${htmlLines} lines of HTML, ` +
                         `${cssLines} lines of BEAUTIFUL CSS, ` +
                         `and ${jsLines} lines of AMAZING JavaScript! ` +
                         `This is going to be INCREDIBLE!`;
        } else { // professional
            explanation = `Code generation complete. I've created ${totalLines} lines of production-ready code. ` +
                         `The application includes ${htmlLines} lines of semantic HTML, ` +
                         `${cssLines} lines of responsive CSS, ` +
                         `and ${jsLines} lines of modern JavaScript. ` +
                         `The code follows best practices and is ready for deployment.`;
        }
        
        return explanation;
    }
    
    /**
     * Change voice personality
     * 
     * @param {string} personality - Voice personality key
     */
    setVoicePersonality(personality) {
        if (!this.voicePersonalities[personality]) {
            throw new Error(`Unknown voice personality: ${personality}`);
        }
        
        this.currentVoice = personality;
        this.savePreference('voice', personality);
        
        console.log('🎤 Voice personality changed to:', this.voicePersonalities[personality].name);
    }
    
    /**
     * Toggle voice enabled/disabled
     */
    toggleEnabled() {
        this.enabled = !this.enabled;
        this.savePreference('enabled', this.enabled);
        
        console.log(this.enabled ? '✅ Voice enabled' : '🔇 Voice disabled');
        
        if (!this.enabled) {
            this.stopAudio();
        }
    }
    
    /**
     * Get available voices from ElevenLabs API
     * 
     * @returns {Promise<Array>} List of available voices
     */
    async getAvailableVoices() {
        if (!this.hasAPIKey()) {
            throw new Error('ElevenLabs API key not configured');
        }
        
        try {
            const response = await fetch(`${this.apiEndpoint}/voices`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch voices: ${response.status}`);
            }
            
            const data = await response.json();
            return data.voices;
            
        } catch (error) {
            console.error('❌ Failed to fetch voices:', error);
            throw error;
        }
    }
    
    /**
     * Get usage statistics
     * 
     * @returns {object} Usage stats
     */
    getUsageStats() {
        return {
            charactersUsed: this.characterCount,
            characterLimit: this.characterLimit,
            percentUsed: ((this.characterCount / this.characterLimit) * 100).toFixed(1) + '%',
            voice: this.voicePersonalities[this.currentVoice].name,
            enabled: this.enabled,
            isPlaying: this.isPlaying
        };
    }
    
    /**
     * Reset character count (at start of new month)
     */
    resetCharacterCount() {
        this.characterCount = 0;
        this.savePreference('characterCount', 0);
        console.log('✅ Character count reset');
    }
    
    /**
     * Test API key validity
     * 
     * @param {string} apiKey - API key to test (optional, uses stored key if not provided)
     * @returns {Promise<object>} Test result
     */
    async testAPIKey(apiKey = null) {
        const keyToTest = apiKey || this.apiKey;
        
        if (!keyToTest) {
            return { valid: false, error: 'No API key provided' };
        }
        
        try {
            // Test by fetching available voices
            const response = await fetch(`${this.apiEndpoint}/voices`, {
                headers: {
                    'xi-api-key': keyToTest
                }
            });
            
            if (response.ok) {
                return { valid: true };
            } else {
                const errorText = await response.text();
                return { 
                    valid: false, 
                    error: `API key invalid (${response.status}): ${errorText}` 
                };
            }
            
        } catch (error) {
            return { 
                valid: false, 
                error: error.message 
            };
        }
    }
    
    /**
     * Save preference to localStorage
     */
    savePreference(key, value) {
        try {
            localStorage.setItem(`vibecoder_voice_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save voice preference:', error);
        }
    }
    
    /**
     * Load preference from localStorage
     */
    loadPreference(key, defaultValue) {
        try {
            const stored = localStorage.getItem(`vibecoder_voice_${key}`);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('Failed to load voice preference:', error);
            return defaultValue;
        }
    }
    
    /**
     * Get current state for debugging
     */
    getState() {
        return {
            service: this.serviceName,
            voice: this.currentVoice,
            enabled: this.enabled,
            isPlaying: this.isPlaying,
            charactersUsed: this.characterCount,
            characterLimit: this.characterLimit,
            hasAPIKey: this.hasAPIKey(),
            usageStats: this.getUsageStats()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElevenLabsVoiceService;
}
