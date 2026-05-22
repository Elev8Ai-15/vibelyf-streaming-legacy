/**
 * 🚀 VIBELYF CODE GENERATOR
 *
 * Takes clarified, interpreted user messages and generates actual working code.
 * Uses Google Gemini 3.5 Flash API to turn natural language into HTML/CSS/JS applications.
 *
 * THE REWARD FOR CLEAR COMMUNICATION.
 *
 * UPGRADED: May 2026 — Gemini 3.5 Flash (Google I/O 2026 release, outperforms 3.1 Pro,
 *                       4× faster output, 1M context, native code execution)
 * NOTE:    API key is sourced from window.VIBELYF_API_KEYS or localStorage at runtime
 *          once Phase 1.H Workers proxy lands. Hardcoded keys are dev-only placeholders.
 */

const VibeLyfCodeGenerator = {
    // Gemini API Configuration
    config: {
        apiKey: 'AIzaSyB9jQaRGkfj4Tyq5y5j45RiYAeb_H2e-2g',
        model: 'gemini-3-5-flash',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-5-flash:generateContent',
        // Fallback chain: try latest first, fall back gracefully
        fallbackModels: ['gemini-3-5-flash', 'gemini-3-1-pro', 'gemini-2-5-flash', 'gemini-2-5-pro'],
        fallbackIndex: 0
    },

    // State
    state: {
        generating: false,
        lastGenerated: null,
        history: []
    },

    /**
     * Initialize the code generator
     */
    init() {
        console.log('🚀 Code Generator initialized - Ready to build apps!');
        this.loadHistory();
    },

    /**
     * Load generation history
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('vibelyf_code_history');
            if (saved) {
                this.state.history = JSON.parse(saved);
                console.log(`📜 Loaded ${this.state.history.length} previous generations`);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    },

    /**
     * Save generation to history
     */
    saveToHistory(generation) {
        this.state.history.unshift(generation);
        // Keep only last 50 generations
        if (this.state.history.length > 50) {
            this.state.history = this.state.history.slice(0, 50);
        }
        try {
            localStorage.setItem('vibelyf_code_history', JSON.stringify(this.state.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    },

    /**
     * Generate code from user request
     * @param {string} userMessage - Original user message
     * @param {string} interpretedMessage - Clarified/interpreted version
     * @param {Array} detectedSlang - Array of detected slang terms
     * @returns {Promise<Object>} Generated code and metadata
     */
    async generateCode(userMessage, interpretedMessage, detectedSlang = []) {
        if (this.state.generating) {
            return {
                success: false,
                error: 'Already generating code. Please wait...'
            };
        }

        this.state.generating = true;

        try {
            console.log('🎨 Generating code...');
            console.log('📝 Original:', userMessage);
            console.log('✨ Interpreted:', interpretedMessage);
            console.log('🔍 Slang:', detectedSlang.map(s => s.term));

            // Build the prompt for Gemini
            const prompt = this.buildPrompt(userMessage, interpretedMessage, detectedSlang);

            // Call Gemini API
            const response = await this.callGeminiAPI(prompt);

            if (response.success) {
                const generation = {
                    timestamp: Date.now(),
                    userMessage,
                    interpretedMessage,
                    detectedSlang,
                    code: response.code,
                    metadata: response.metadata
                };

                this.state.lastGenerated = generation;
                this.saveToHistory(generation);

                console.log('✅ Code generated successfully!');

                return {
                    success: true,
                    ...generation,
                    message: this.formatSuccessMessage(generation)
                };
            } else {
                console.error('❌ Code generation failed:', response.error);
                return {
                    success: false,
                    error: response.error,
                    message: this.formatErrorMessage(response.error)
                };
            }

        } catch (error) {
            console.error('❌ Error generating code:', error);
            return {
                success: false,
                error: error.message,
                message: this.formatErrorMessage(error.message)
            };
        } finally {
            this.state.generating = false;
        }
    },

    /**
     * Build the prompt for Gemini API
     * @param {string} userMessage - Original message
     * @param {string} interpretedMessage - Clarified message
     * @param {Array} detectedSlang - Detected slang
     * @returns {string} Formatted prompt
     */
    buildPrompt(userMessage, interpretedMessage, detectedSlang) {
        const slangContext = detectedSlang.length > 0 
            ? `\n\nCultural Context: The user used slang (${detectedSlang.map(s => `"${s.term}"`).join(', ')}), which was interpreted as: ${detectedSlang.map(s => `"${s.term}" = ${s.definition || s.meaning}`).join(', ')}.`
            : '';

        // 🎨 LINGUISTICS V32: Detect vibe archetypes and inject exact CSS
        let vibeInstructions = '';
        if (window.Linguistics && window.Linguistics.compile) {
            const vibes = window.Linguistics.compile(userMessage);
            if (vibes.length > 0) {
                const vibeList = vibes.map(v => 
                    `• ${v.key} → Tailwind classes: "${v.spec}"`
                ).join('\n');
                vibeInstructions = `

VIBE AESTHETIC DETECTED — MANDATORY STYLING:
The user requested specific visual aesthetics. You MUST apply these exact Tailwind CSS classes to the main UI elements:

${vibeList}

Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
Apply the detected vibe classes to containers, cards, buttons, and key visual elements.
The vibe should DOMINATE the visual design — it's what the user asked for.`;
            }
        }

        // 🗣️ LINGUISTICS V32: Detect slang chips for UI feedback
        let slangChips = '';
        if (window.Linguistics && window.Linguistics.analyze) {
            const chips = window.Linguistics.analyze(userMessage);
            if (chips.length > 0) {
                slangChips = `\n\nSlang detected: ${chips.map(c => `"${c.term}" → ${c.meaning}`).join(', ')}`;
            }
        }

        return `You are VIBELYF Code Generator, an AI that builds web applications from natural language descriptions.

USER'S ORIGINAL MESSAGE (may contain slang):
"${userMessage}"

CLARIFIED INTERPRETATION:
"${interpretedMessage}"
${slangContext}${slangChips}
${vibeInstructions}

YOUR TASK:
Generate a complete, working, beautiful web application that fulfills the user's request.

REQUIREMENTS:
1. Generate COMPLETE HTML with inline CSS and JavaScript
2. Make it visually stunning with modern design
3. Use vibrant colors, gradients, and animations
4. Make it fully functional (not just a mockup)
5. Include helpful comments in the code
6. Make it mobile-responsive
7. Use modern JavaScript (ES6+)
8. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>

STYLE GUIDELINES:
${vibeInstructions ? '- FOLLOW THE VIBE AESTHETIC ABOVE as the primary visual direction' : '- Dark theme with neon/cyber aesthetic (matches VIBELYF brand)'}
- Use gradients (purple, cyan, pink, electric blue)
- Add subtle animations and hover effects
- Clean, modern typography
- Rounded corners and subtle shadows
- Make it feel premium and polished

OUTPUT FORMAT:
Return ONLY valid HTML code, nothing else. No markdown, no explanations, just the complete HTML file that can be rendered directly.

The HTML should be a complete, self-contained file that works when opened in a browser.

Generate the code now:`;
    },

    /**
     * Call Gemini API
     * @param {string} prompt - The prompt to send
     * @returns {Promise<Object>} API response
     */
    async callGeminiAPI(prompt) {
        try {
            const response = await fetch(`${this.config.endpoint}?key=${this.config.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No code generated from Gemini API');
            }

            const generatedText = data.candidates[0].content.parts[0].text;
            
            // Extract HTML code (remove markdown if present)
            let code = generatedText;
            
            // Remove markdown code blocks if present
            if (code.includes('```html')) {
                code = code.split('```html')[1].split('```')[0].trim();
            } else if (code.includes('```')) {
                code = code.split('```')[1].split('```')[0].trim();
            }

            return {
                success: true,
                code: code,
                metadata: {
                    model: this.config.model,
                    timestamp: Date.now(),
                    promptLength: prompt.length,
                    codeLength: code.length
                }
            };

        } catch (error) {
            console.error('Gemini API call failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Format success message
     * @param {Object} generation - Generation data
     * @returns {string} HTML success message
     */
    formatSuccessMessage(generation) {
        return `
            <div style="
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 229, 255, 0.1));
                border: 2px solid rgba(0, 255, 136, 0.4);
                border-radius: 16px;
                padding: 24px;
                margin: 16px 0;
            ">
                <div style="font-size: 28px; margin-bottom: 16px;">🎉 CODE GENERATED!</div>
                
                <div style="
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12px;
                    padding: 20px;
                    margin: 16px 0;
                ">
                    <div style="font-weight: 600; margin-bottom: 12px; font-size: 18px; color: rgba(var(--secondary-glow), 1);">
                        ✨ YOUR APP IS READY
                    </div>
                    <div style="font-size: 15px; line-height: 1.8; opacity: 0.95;">
                        <div><strong>Original Request:</strong> "${generation.userMessage}"</div>
                        <div style="margin-top: 8px;"><strong>What I Built:</strong> ${generation.interpretedMessage}</div>
                        ${generation.detectedSlang.length > 0 ? `
                            <div style="margin-top: 8px;">
                                <strong>Slang Understood:</strong> 
                                ${generation.detectedSlang.map(s => `"${s.term}"`).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div style="
                    background: linear-gradient(135deg, rgba(var(--primary-glow), 0.15), rgba(var(--secondary-glow), 0.15));
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                ">
                    <div style="font-weight: 600; margin-bottom: 12px; font-size: 18px;">
                        🚀 WHAT YOU JUST DID:
                    </div>
                    <ul style="
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        font-size: 15px;
                        line-height: 1.8;
                    ">
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>Communicated your idea clearly</strong>
                        </li>
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>Bridged cultural language</strong> (slang → professional specs)
                        </li>
                        <li style="margin-bottom: 10px;">
                            ✅ <strong>Got a working app</strong> as a reward for clarity
                        </li>
                        <li>
                            ✅ <strong>Proved you can code</strong> in your own voice
                        </li>
                    </ul>
                </div>

                <div style="
                    text-align: center;
                    padding: 20px;
                    background: rgba(0, 255, 136, 0.08);
                    border-radius: 12px;
                    margin-top: 20px;
                ">
                    <p style="font-size: 16px; margin: 0; font-weight: 600; line-height: 1.6;">
                        🎓 This is VIBE CODING: Start in your language → Clarify your intent → 
                        Get real results → Learn professional skills → Keep your cultural identity.
                        <br><br>
                        <strong style="color: rgba(var(--secondary-glow), 1);">
                            You just became a developer. For real. 💪
                        </strong>
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Format error message
     * @param {string} error - Error message
     * @returns {string} HTML error message
     */
    formatErrorMessage(error) {
        return `
            <div style="
                background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 136, 0, 0.1));
                border: 2px solid rgba(255, 68, 68, 0.4);
                border-radius: 16px;
                padding: 24px;
                margin: 16px 0;
            ">
                <div style="font-size: 24px; margin-bottom: 12px;">⚠️ GENERATION FAILED</div>
                
                <div style="
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12px;
                    padding: 20px;
                    margin: 16px 0;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">Error Details:</div>
                    <div style="font-family: 'Courier New', monospace; font-size: 14px; opacity: 0.9;">
                        ${error}
                    </div>
                </div>

                <div style="
                    background: rgba(255, 136, 0, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 16px;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">💡 What to try:</div>
                    <ul style="font-size: 14px; line-height: 1.8; margin: 8px 0;">
                        <li>Make sure you described what you want clearly</li>
                        <li>Try rephrasing your request</li>
                        <li>Check your internet connection</li>
                        <li>Wait a moment and try again</li>
                    </ul>
                </div>
            </div>
        `;
    },

    /**
     * Get generation history
     * @returns {Array} Array of previous generations
     */
    getHistory() {
        return this.state.history;
    },

    /**
     * Clear generation history
     */
    clearHistory() {
        this.state.history = [];
        localStorage.removeItem('vibelyf_code_history');
        console.log('🗑️ Cleared generation history');
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.VibeLyfCodeGenerator = VibeLyfCodeGenerator;
    console.log('🚀 VIBELYF Code Generator loaded - Ready to build apps from your words!');
}
