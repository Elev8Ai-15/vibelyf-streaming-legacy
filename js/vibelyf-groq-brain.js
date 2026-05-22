/**
 * ⚡ VIBELYF GROQ FAST-BRAIN SERVICE  (+ Cerebras failover)
 *
 * Ultra-fast LLM inference for the "fast brain" tier:
 *   - Slang detection & classification (<500ms)
 *   - Vague message analysis (<300ms)
 *   - Clarification generation (<500ms)
 *   - Intent classification (<200ms)
 *
 * Primary:  Groq      — Llama 4 Scout (17B/16E) (17B active / 400B total MoE, day-zero on GroqCloud)
 * Failover: Cerebras  — Llama 4 Scout (free tier: 1M tokens/day, 2,600 tok/s, no card)
 *
 * Deep-brain tasks (code generation) still go to Gemini 3.5 Flash via vibelyf-code-generator.js.
 *
 * Groq free tier: 6,000 requests/day
 * Cerebras free: 1,000,000 tokens/day (more than enough headroom for slang detection)
 *
 * UPGRADED: May 2026 — Llama 4 Scout (17B/16E) (replaces Llama 3.3 70B)
 *                       Cerebras failover wiring TODO in Phase 1.H Workers proxy.
 */

window.VibeLyfGroqBrain = {

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    config: {
        // Primary provider: Groq
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',           // Day-zero on Groq, May 2026
        fallbackModel: 'llama-3.3-70b-versatile',      // Lighter Llama 4 in-Groq backup
        apiKey: '',                          // User provides via setup or localStorage
        maxTokens: 500,
        temperature: 0.1,
        timeout: 8000,
        enabled: false,
        requestCount: 0,
        dailyLimit: 6000,
        lastResetDate: null
    },

    // Cross-provider failover: Cerebras Cloud (free 1M tok/day, 2,600 tok/s)
    // Activated by Phase 1.H — Workers proxy will detect Groq 429 / timeout
    // and retry on Cerebras with Llama 4 Scout. For now this block holds the
    // config; the failover logic itself is TODO in the proxy refactor.
    cerebras: {
        endpoint: 'https://api.cerebras.ai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        apiKey: '',                          // User provides via setup or localStorage
        maxTokens: 500,
        temperature: 0.1,
        timeout: 8000,
        enabled: false,
        requestCount: 0,
        dailyTokenLimit: 1_000_000           // Cerebras free tier limit
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    init() {
        // Load Groq API key from localStorage
        const savedKey = localStorage.getItem('vibelyf_groq_api_key');
        if (savedKey) {
            this.config.apiKey = savedKey;
            this.config.enabled = true;
        }

        // Load Cerebras API key from localStorage (for failover)
        const cerebrasKey = localStorage.getItem('vibelyf_cerebras_api_key');
        if (cerebrasKey) {
            this.cerebras.apiKey = cerebrasKey;
            this.cerebras.enabled = true;
        }

        // Load daily counter
        this.loadDailyCounter();

        console.log(
            `⚡ Fast-Brain ${this.config.enabled ? 'ACTIVE' : 'STANDBY'} | ` +
            `Groq: ${this.config.model}` +
            (this.cerebras.enabled ? ` | Cerebras failover: ${this.cerebras.model}` : '')
        );
        return this.config.enabled;
    },

    /**
     * Set Cerebras API key for cross-provider failover
     */
    setCerebrasApiKey(key) {
        this.cerebras.apiKey = key;
        this.cerebras.enabled = !!key;
        localStorage.setItem('vibelyf_cerebras_api_key', key);
        console.log(`⚡ Cerebras failover ${key ? 'saved & enabled' : 'cleared'}`);
        return this.cerebras.enabled;
    },

    /**
     * Set API key and enable Groq
     */
    setApiKey(key) {
        this.config.apiKey = key;
        this.config.enabled = !!key;
        localStorage.setItem('vibelyf_groq_api_key', key);
        console.log(`⚡ Groq API key ${key ? 'saved & enabled' : 'cleared'}`);
        return this.config.enabled;
    },

    /**
     * Check if Groq is ready to use
     */
    isReady() {
        return this.config.enabled && this.config.apiKey && this.config.requestCount < this.config.dailyLimit;
    },

    /**
     * Track daily usage
     */
    loadDailyCounter() {
        try {
            const saved = JSON.parse(localStorage.getItem('vibelyf_groq_usage') || '{}');
            const today = new Date().toISOString().split('T')[0];
            if (saved.date === today) {
                this.config.requestCount = saved.count || 0;
            } else {
                this.config.requestCount = 0;
            }
            this.config.lastResetDate = today;
        } catch (e) {
            this.config.requestCount = 0;
        }
    },

    incrementCounter() {
        this.config.requestCount++;
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('vibelyf_groq_usage', JSON.stringify({
            date: today,
            count: this.config.requestCount
        }));
    },

    // ═══════════════════════════════════════════════════════════════
    // CORE API CALL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Make a fast Groq API call
     * @param {string} systemPrompt - System instruction
     * @param {string} userMessage - User message to analyze
     * @param {Object} options - Override options
     * @returns {Promise<Object>} Parsed JSON response
     */
    async query(systemPrompt, userMessage, options = {}) {
        if (!this.isReady()) {
            console.warn('⚡ Groq not ready, falling back to local processing');
            return null;
        }

        const startTime = performance.now();
        const model = options.model || this.config.model;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: options.temperature ?? this.config.temperature,
                    max_tokens: options.maxTokens ?? this.config.maxTokens,
                    response_format: options.jsonMode ? { type: 'json_object' } : undefined
                })
            });

            clearTimeout(timeoutId);
            this.incrementCounter();

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`⚡ Groq API error ${response.status}:`, errorBody);
                
                // Try fallback model if primary fails
                if (model === this.config.model && this.config.fallbackModel) {
                    console.log(`⚡ Trying fallback model: ${this.config.fallbackModel}`);
                    return this.query(systemPrompt, userMessage, { 
                        ...options, 
                        model: this.config.fallbackModel 
                    });
                }
                return null;
            }

            const data = await response.json();
            const elapsed = Math.round(performance.now() - startTime);
            const content = data.choices?.[0]?.message?.content || '';

            console.log(`⚡ Groq responded in ${elapsed}ms (${model})`);

            // Try to parse as JSON if requested
            if (options.jsonMode) {
                try {
                    return JSON.parse(content);
                } catch (e) {
                    // Try to extract JSON from the response
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    }
                    console.warn('⚡ Groq response not valid JSON:', content);
                    return { raw: content };
                }
            }

            return { text: content, elapsed, model };

        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`⚡ Groq request timed out after ${this.config.timeout}ms`);
            } else {
                console.error('⚡ Groq request failed:', error.message);
            }

            // Try fallback model on timeout
            if (model === this.config.model && this.config.fallbackModel) {
                console.log(`⚡ Trying fallback model: ${this.config.fallbackModel}`);
                return this.query(systemPrompt, userMessage, { 
                    ...options, 
                    model: this.config.fallbackModel 
                });
            }
            return null;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SPECIALIZED FAST FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * ⚡ INSTANT SLANG DETECTION — Identify slang terms in a message
     * Returns structured data about detected terms
     * Target: <500ms
     */
    async detectSlang(message) {
        const result = await this.query(
            `You are a cultural linguistics expert specializing in AAVE, Gen Z slang, street language, prison slang, Southern dialect, Hispanic/Latino colloquialisms, and digital culture.

Analyze the user's message and identify ALL slang/informal terms. For each term, provide:
- term: the exact word/phrase
- meaning: clear English definition
- category: one of [aave, gen-z, street, prison, southern, hispanic, digital, british, asian, appalachian, general-slang]
- confidence: high/medium/low

Return JSON format:
{
  "detected": [
    { "term": "bussin", "meaning": "extremely good or excellent", "category": "aave", "confidence": "high" }
  ],
  "hasSlang": true,
  "messageClarity": "clear" | "vague" | "moderate"
}

If no slang detected, return: { "detected": [], "hasSlang": false, "messageClarity": "clear" }

IMPORTANT: Be comprehensive but don't flag common informal words like "gonna", "wanna", "hey" unless they carry cultural significance.`,
            message,
            { jsonMode: true, maxTokens: 400 }
        );

        return result || { detected: [], hasSlang: false, messageClarity: 'clear' };
    },

    /**
     * ⚡ INSTANT VAGUE ANALYSIS — Is this message too vague to act on?
     * Target: <300ms
     */
    async analyzeVagueness(message) {
        const result = await this.query(
            `You analyze messages for vagueness. A message is VAGUE if it lacks specifics about WHAT to build.

VAGUE examples: "make something", "build a thing", "create anything", "help me", "do something cool"
NOT VAGUE examples: "build a todo app", "create an API for tasks", "make a calculator", "build me a fire landing page"

A message with ANY concrete concept (todo, calculator, portfolio, api, game, etc.) is NOT vague even if casual.

Return JSON:
{
  "isVague": boolean,
  "reason": "brief explanation",
  "suggestion": "what to ask for clarification" | null,
  "confidence": "high" | "medium" | "low"
}`,
            message,
            { jsonMode: true, maxTokens: 200, model: this.config.fallbackModel }
        );

        return result || { isVague: false, reason: 'Analysis unavailable', suggestion: null, confidence: 'low' };
    },

    /**
     * ⚡ INSTANT INTENT CLASSIFICATION — What does the user want?
     * Target: <200ms
     */
    async classifyIntent(message) {
        const result = await this.query(
            `Classify the user's intent into one category:

- "build_app": Wants to create/generate a web app, website, or UI
- "build_api": Wants to create a backend API, server, or database
- "learn_term": Is asking about the meaning of a word or term
- "teach_term": Is explaining/defining a term (answering a previous question)
- "conversation": General chat, questions, feedback
- "command": Slash command like /score, /help, /stats
- "customize": Wants to change theme, colors, layout

Return JSON:
{
  "intent": "build_app",
  "confidence": "high",
  "keywords": ["todo", "app"],
  "vibeKeywords": ["fire", "dark"]
}`,
            message,
            { jsonMode: true, maxTokens: 150, model: this.config.fallbackModel }
        );

        return result || { intent: 'conversation', confidence: 'low', keywords: [], vibeKeywords: [] };
    },

    /**
     * ⚡ INSTANT CLARIFICATION GENERATOR — Generate a friendly clarification question
     * Target: <500ms
     */
    async generateClarification(message, context = {}) {
        const result = await this.query(
            `You are VibeLyf, a cultural AI that celebrates linguistic diversity. A user sent a vague message. Generate a friendly, encouraging clarification question.

Rules:
- Never shame or correct their language
- Use their energy/tone back
- Suggest 2-3 specific examples they could try
- Keep it short (2-3 sentences max)
- Add relevant emoji

Example: "Yo that sounds dope! But I need a bit more detail 🎯 What kind of app? Like a todo list, a game, a calculator? Hit me with the specifics!"`,
            `User said: "${message}"\nContext: ${JSON.stringify(context)}`,
            { maxTokens: 200 }
        );

        return result?.text || "That sounds cool! Can you be more specific about what you want to build? 🎯";
    },

    /**
     * ⚡ RESEARCH UNKNOWN TERM — Look up a term's meaning
     * Target: <1s
     */
    async researchTerm(term, context = '') {
        const result = await this.query(
            `You are a cultural linguistics researcher. The user used the term "${term}" in context. Research its meaning.

Provide:
- meaning: Clear definition
- category: [aave, gen-z, street, prison, southern, hispanic, digital, british, asian, appalachian, general-slang]
- etymology: Brief origin/history
- examples: 2 usage examples
- confidence: high/medium/low

Return JSON:
{
  "term": "${term}",
  "meaning": "...",
  "category": "...",
  "etymology": "...",
  "examples": ["...", "..."],
  "confidence": "high",
  "isSlang": true
}

If you genuinely don't know the term or it's not slang, return: { "term": "${term}", "isSlang": false, "confidence": "low" }`,
            `Term: "${term}"\nContext: "${context}"`,
            { jsonMode: true, maxTokens: 300 }
        );

        return result || { term, isSlang: false, confidence: 'low' };
    },

    // ═══════════════════════════════════════════════════════════════
    // STATS & DIAGNOSTICS
    // ═══════════════════════════════════════════════════════════════

    getStats() {
        return {
            enabled: this.config.enabled,
            model: this.config.model,
            requestsToday: this.config.requestCount,
            dailyLimit: this.config.dailyLimit,
            remainingRequests: this.config.dailyLimit - this.config.requestCount,
            utilizationPercent: Math.round((this.config.requestCount / this.config.dailyLimit) * 100)
        };
    },

    /**
     * Run a quick diagnostic test
     */
    async runDiagnostic() {
        if (!this.isReady()) {
            return { success: false, error: 'Groq not configured. Set API key first.' };
        }

        const start = performance.now();
        const result = await this.query(
            'Respond with exactly: {"status":"ok","message":"Groq Fast-Brain is operational"}',
            'diagnostic test',
            { jsonMode: true, maxTokens: 50 }
        );
        const elapsed = Math.round(performance.now() - start);

        return {
            success: !!result,
            elapsed: `${elapsed}ms`,
            model: this.config.model,
            response: result
        };
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.VibeLyfGroqBrain.init());
} else {
    window.VibeLyfGroqBrain.init();
}
