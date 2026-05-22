/**
 * 🎤 VIBELYF VOICE INPUT SYSTEM
 * 
 * Voice-first coding in your own dialect.
 * Uses the Web Speech API (FREE, built into all modern browsers).
 * 
 * "Yo, build me a fire todo app" — spoken aloud → understood → generated
 * 
 * This is the killer feature for inner-city youth who communicate
 * verbally more naturally than through typing.
 * 
 * CREATED: March 2026 — VIBELYF Accessibility Upgrade
 * 
 * Features:
 *   - Push-to-talk mic button
 *   - Real-time transcript display
 *   - Auto-submit on speech end
 *   - Visual feedback (pulsing mic, waveform)
 *   - Multi-language support
 *   - Graceful degradation (hide mic if unsupported)
 */

window.VibeLyfVoice = {

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    state: {
        isListening: false,
        isSupported: false,
        recognition: null,
        transcript: '',
        interimTranscript: '',
        confidence: 0,
        autoSubmit: true,       // Auto-send message when speech ends
        language: 'en-US',       // Default language
        sessionCount: 0,         // Voice messages this session
        totalVoiceMessages: 0    // All-time voice messages
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    init() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('🎤 Voice input not supported in this browser');
            this.state.isSupported = false;
            return false;
        }

        this.state.isSupported = true;
        this.state.recognition = new SpeechRecognition();

        // Configure recognition
        const recognition = this.state.recognition;
        recognition.continuous = false;         // Stop after a pause
        recognition.interimResults = true;      // Show real-time transcript
        recognition.lang = this.state.language;
        recognition.maxAlternatives = 1;

        // Bind event handlers
        recognition.onstart = () => this.onStart();
        recognition.onresult = (event) => this.onResult(event);
        recognition.onerror = (event) => this.onError(event);
        recognition.onend = () => this.onEnd();
        recognition.onspeechend = () => this.onSpeechEnd();

        // Load stats
        this.loadStats();

        // Inject mic button into chat UI
        this.injectMicButton();

        console.log('🎤 Voice Input initialized — speak your mind!');
        return true;
    },

    // ═══════════════════════════════════════════════════════════════
    // UI INJECTION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Inject mic button next to the chat input
     */
    injectMicButton() {
        // Find the chat input area
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) {
            console.warn('🎤 Chat input not found, will retry in 2s');
            setTimeout(() => this.injectMicButton(), 2000);
            return;
        }

        // Don't double-inject
        if (document.getElementById('voiceMicBtn')) return;

        // Create mic button
        const micBtn = document.createElement('button');
        micBtn.id = 'voiceMicBtn';
        micBtn.className = 'voice-mic-btn';
        micBtn.title = 'Click to speak (voice input)';
        micBtn.innerHTML = '🎤';
        micBtn.onclick = (e) => {
            e.preventDefault();
            this.toggleListening();
        };

        // Create interim transcript display
        const transcriptDisplay = document.createElement('div');
        transcriptDisplay.id = 'voiceTranscript';
        transcriptDisplay.className = 'voice-transcript';
        transcriptDisplay.style.display = 'none';

        // Insert mic button after the 📎 button and before input
        const inputContainer = chatInput.parentElement;
        if (inputContainer) {
            // Insert before the send button
            const sendBtn = inputContainer.querySelector('button[onclick*="sendMessage"], .send-button');
            if (sendBtn) {
                inputContainer.insertBefore(micBtn, sendBtn);
            } else {
                inputContainer.appendChild(micBtn);
            }
            
            // Add transcript display above input container
            inputContainer.parentElement.insertBefore(transcriptDisplay, inputContainer);
        }

        // Inject styles
        this.injectStyles();
    },

    /**
     * Inject CSS styles for voice UI
     */
    injectStyles() {
        if (document.getElementById('vibelyf-voice-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'vibelyf-voice-styles';
        styles.textContent = `
            /* Mic Button */
            .voice-mic-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid rgba(0, 229, 255, 0.3);
                background: rgba(0, 229, 255, 0.08);
                color: #00e5ff;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin: 0 4px;
                position: relative;
                outline: none;
            }

            .voice-mic-btn:hover {
                background: rgba(0, 229, 255, 0.15);
                border-color: rgba(0, 229, 255, 0.5);
                transform: scale(1.05);
            }

            /* Listening state — pulsing glow */
            .voice-mic-btn.listening {
                background: rgba(255, 59, 48, 0.15);
                border-color: rgba(255, 59, 48, 0.6);
                color: #ff3b30;
                animation: mic-pulse 1.5s ease-in-out infinite;
                box-shadow: 0 0 20px rgba(255, 59, 48, 0.3);
            }

            @keyframes mic-pulse {
                0%, 100% { box-shadow: 0 0 10px rgba(255, 59, 48, 0.2); transform: scale(1); }
                50% { box-shadow: 0 0 25px rgba(255, 59, 48, 0.5); transform: scale(1.08); }
            }

            /* Transcript Display */
            .voice-transcript {
                padding: 8px 14px;
                margin-bottom: 6px;
                background: rgba(0, 229, 255, 0.06);
                border: 1px solid rgba(0, 229, 255, 0.15);
                border-radius: 12px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
                min-height: 32px;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: fadeInUp 0.3s ease;
            }

            .voice-transcript .interim {
                color: rgba(0, 229, 255, 0.5);
                font-style: italic;
            }

            .voice-transcript .final {
                color: rgba(0, 229, 255, 0.9);
                font-weight: 500;
            }

            .voice-transcript .listening-indicator {
                display: inline-flex;
                gap: 3px;
                align-items: center;
            }

            .voice-transcript .listening-indicator span {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #00e5ff;
                animation: voice-dots 1.4s ease-in-out infinite;
            }

            .voice-transcript .listening-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .voice-transcript .listening-indicator span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes voice-dots {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                40% { transform: scale(1.2); opacity: 1; }
            }

            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Unsupported — hide mic */
            .voice-mic-btn.unsupported {
                display: none !important;
            }
        `;
        document.head.appendChild(styles);
    },

    // ═══════════════════════════════════════════════════════════════
    // RECOGNITION CONTROLS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Toggle listening on/off
     */
    toggleListening() {
        if (this.state.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    },

    /**
     * Start listening
     */
    startListening() {
        if (!this.state.isSupported || !this.state.recognition) {
            console.warn('🎤 Voice recognition not available');
            return;
        }

        try {
            this.state.transcript = '';
            this.state.interimTranscript = '';
            this.state.recognition.start();
        } catch (error) {
            // Already started
            if (error.name === 'InvalidStateError') {
                this.state.recognition.stop();
                setTimeout(() => this.state.recognition.start(), 200);
            } else {
                console.error('🎤 Failed to start recognition:', error);
            }
        }
    },

    /**
     * Stop listening
     */
    stopListening() {
        if (this.state.recognition && this.state.isListening) {
            this.state.recognition.stop();
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ═══════════════════════════════════════════════════════════════

    onStart() {
        this.state.isListening = true;
        console.log('🎤 Listening...');

        // Update UI
        const micBtn = document.getElementById('voiceMicBtn');
        if (micBtn) micBtn.classList.add('listening');

        // Show transcript area
        const transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            transcriptEl.style.display = 'flex';
            transcriptEl.innerHTML = `
                <div class="listening-indicator"><span></span><span></span><span></span></div>
                <span class="interim">Listening...</span>
            `;
        }

        // Track analytics
        if (window.posthog) {
            window.posthog.capture('voice_input_started');
        }
    },

    onResult(event) {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                final += transcript;
                this.state.confidence = event.results[i][0].confidence;
            } else {
                interim += transcript;
            }
        }

        if (final) {
            this.state.transcript += final;
        }
        this.state.interimTranscript = interim;

        // Update transcript display
        const transcriptEl = document.getElementById('voiceTranscript');
        if (transcriptEl) {
            const displayText = this.state.transcript || interim;
            transcriptEl.innerHTML = `
                🎤 ${this.state.transcript ? `<span class="final">${this.state.transcript}</span>` : ''}
                ${interim ? `<span class="interim">${interim}</span>` : ''}
            `;
        }

        // Also populate the chat input in real-time
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = (this.state.transcript + interim).trim();
        }
    },

    onSpeechEnd() {
        console.log('🎤 Speech ended');
        if (this.state.recognition) {
            this.state.recognition.stop();
        }
    },

    onEnd() {
        this.state.isListening = false;
        console.log(`🎤 Recognition ended. Transcript: "${this.state.transcript}"`);

        // Update UI
        const micBtn = document.getElementById('voiceMicBtn');
        if (micBtn) micBtn.classList.remove('listening');

        // Hide transcript after delay
        const transcriptEl = document.getElementById('voiceTranscript');
        
        // If we got a transcript, auto-submit
        if (this.state.transcript.trim() && this.state.autoSubmit) {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = this.state.transcript.trim();
            }

            // Update stats
            this.state.sessionCount++;
            this.state.totalVoiceMessages++;
            this.saveStats();

            // Show final transcript briefly then auto-send
            if (transcriptEl) {
                transcriptEl.innerHTML = `✅ <span class="final">${this.state.transcript}</span>`;
            }

            // Auto-send after 500ms visual confirmation
            setTimeout(() => {
                if (transcriptEl) transcriptEl.style.display = 'none';
                
                // Trigger the send
                if (window.VibeLyfApp && typeof window.VibeLyfApp.sendMessage === 'function') {
                    window.VibeLyfApp.sendMessage();
                }
            }, 600);

            // Track analytics
            if (window.posthog) {
                window.posthog.capture('voice_message_sent', {
                    transcript_length: this.state.transcript.length,
                    confidence: this.state.confidence
                });
            }
        } else {
            // No transcript — hide display
            if (transcriptEl) {
                setTimeout(() => { transcriptEl.style.display = 'none'; }, 1000);
            }
        }
    },

    onError(event) {
        console.error('🎤 Recognition error:', event.error);

        const micBtn = document.getElementById('voiceMicBtn');
        if (micBtn) micBtn.classList.remove('listening');

        const transcriptEl = document.getElementById('voiceTranscript');

        switch (event.error) {
            case 'not-allowed':
                if (transcriptEl) {
                    transcriptEl.style.display = 'flex';
                    transcriptEl.innerHTML = '⚠️ Microphone access denied. Click the 🔒 in your address bar to enable.';
                    setTimeout(() => { transcriptEl.style.display = 'none'; }, 4000);
                }
                break;
            case 'no-speech':
                if (transcriptEl) {
                    transcriptEl.style.display = 'flex';
                    transcriptEl.innerHTML = '🤫 No speech detected. Try again!';
                    setTimeout(() => { transcriptEl.style.display = 'none'; }, 2000);
                }
                break;
            case 'network':
                if (transcriptEl) {
                    transcriptEl.style.display = 'flex';
                    transcriptEl.innerHTML = '📡 Network error. Check your connection.';
                    setTimeout(() => { transcriptEl.style.display = 'none'; }, 3000);
                }
                break;
            default:
                if (transcriptEl) {
                    transcriptEl.innerHTML = `❌ Error: ${event.error}`;
                    setTimeout(() => { transcriptEl.style.display = 'none'; }, 2000);
                }
        }

        this.state.isListening = false;
    },

    // ═══════════════════════════════════════════════════════════════
    // STATS & PERSISTENCE
    // ═══════════════════════════════════════════════════════════════

    loadStats() {
        try {
            const saved = JSON.parse(localStorage.getItem('vibelyf_voice_stats') || '{}');
            this.state.totalVoiceMessages = saved.total || 0;
        } catch (e) {
            this.state.totalVoiceMessages = 0;
        }
    },

    saveStats() {
        localStorage.setItem('vibelyf_voice_stats', JSON.stringify({
            total: this.state.totalVoiceMessages,
            lastUsed: new Date().toISOString()
        }));
    },

    getStats() {
        return {
            supported: this.state.isSupported,
            sessionMessages: this.state.sessionCount,
            totalMessages: this.state.totalVoiceMessages,
            isListening: this.state.isListening,
            language: this.state.language
        };
    }
};

// Auto-initialize after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.VibeLyfVoice.init());
} else {
    // DOM already loaded — wait a tick for chat UI to render
    setTimeout(() => window.VibeLyfVoice.init(), 500);
}
