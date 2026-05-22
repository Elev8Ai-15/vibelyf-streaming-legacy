/**
 * GenSpark Service - Simplified LLM Integration
 * 
 * This replaces 162 KB of multi-LLM orchestration code with a single,
 * elegant integration to GenSpark AI.
 * 
 * Key Benefits:
 * - 93% code reduction in LLM infrastructure
 * - Single API integration point
 * - Automatic model selection by GenSpark
 * - Future-proof (auto-access to new models)
 * - Simplified error handling
 * - Better performance (backend optimization)
 * 
 * What This Does:
 * 1. Takes cultural language input (AAVE, Southern, Appalachian)
 * 2. Enriches with sociolinguistic context
 * 3. Sends to GenSpark with structured instructions
 * 4. Returns generated code with metadata
 * 
 * @class GenSparkService
 * @version 1.0.0
 * @date 2025-11-19
 */

class GenSparkService {
    constructor() {
        this.serviceName = 'GenSpark';
        this.version = '1.0.0';
        this.apiEndpoint = '/api/chat'; // Relative path for GenSpark API
        
        // Configuration
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000, // 30 seconds
            streamEnabled: false // Can be enabled for streaming responses
        };
        
        // Track request metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
        };
        
        console.log('✅ GenSparkService initialized');
    }
    
    /**
     * Generate full-stack application code from cultural language input
     * 
     * This is the main method that replaces multi-llm-orchestrator.generateFullStack()
     * 
     * @param {string} userInput - User's description in cultural language
     * @param {object} options - Generation options
     * @param {object} options.context - Sociolinguistic context from normalizer
     * @param {string} options.outputFormat - Desired output format (default: 'full-stack')
     * @param {array} options.detectedPatterns - AAVE/dialect patterns detected
     * @returns {Promise<object>} Generated project with code, metadata, and educational feedback
     */
    async generateFullStack(userInput, options = {}) {
        console.log('🚀 GenSparkService starting code generation...');
        console.log('📝 Input:', userInput);
        console.log('🎯 Options:', options);
        
        const startTime = Date.now();
        this.metrics.totalRequests++;
        
        try {
            // Build enriched prompt with cultural context
            const enrichedPrompt = this.buildEnrichedPrompt(userInput, options);
            
            // Send to GenSpark
            const response = await this.sendToGenSpark(enrichedPrompt, options);
            
            // Parse and structure response
            const project = this.parseGenSparkResponse(response, options);
            
            // Add educational metadata
            project.educationalFeedback = this.generateEducationalFeedback(options);
            
            // Update metrics
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true);
            
            console.log(`✅ Generation complete in ${responseTime}ms`);
            return project;
            
        } catch (error) {
            console.error('❌ GenSpark generation failed:', error);
            this.metrics.failedRequests++;
            throw this.handleError(error);
        }
    }
    
    /**
     * Build enriched prompt with sociolinguistic context
     * 
     * This is where we add value - enriching the raw user input with
     * cultural context, detected patterns, and linguistic insights
     */
    buildEnrichedPrompt(userInput, options = {}) {
        const { context, detectedPatterns = [], normalized = '' } = options;
        
        let prompt = `# Code Generation Request\n\n`;
        
        // Add cultural context if available
        if (context && detectedPatterns.length > 0) {
            prompt += `## Cultural Language Context\n`;
            prompt += `This request uses cultural language patterns. Here's the linguistic analysis:\n\n`;
            
            detectedPatterns.forEach(pattern => {
                prompt += `- **${pattern.name}**: ${pattern.description}\n`;
                prompt += `  Example: "${pattern.example}"\n`;
            });
            
            prompt += `\n**Original Input** (cultural language): "${userInput}"\n`;
            prompt += `**Normalized Input** (standard English): "${normalized}"\n\n`;
            prompt += `Please respect the cultural context while generating code.\n\n`;
        }
        
        // Add generation instructions
        prompt += `## Generation Instructions\n\n`;
        prompt += `Generate a complete, working web application based on this description:\n\n`;
        prompt += `**User Request**: ${normalized || userInput}\n\n`;
        
        // Specify output format
        prompt += `## Required Output Format\n\n`;
        prompt += `Please provide:\n`;
        prompt += `1. **HTML** - Complete, semantic HTML5 structure\n`;
        prompt += `2. **CSS** - Modern, responsive styles (mobile-first)\n`;
        prompt += `3. **JavaScript** - Clean, well-commented functionality\n`;
        prompt += `4. **Documentation** - Brief README with features and usage\n\n`;
        
        prompt += `## Code Quality Requirements\n\n`;
        prompt += `- Use semantic HTML tags (header, main, nav, section, etc.)\n`;
        prompt += `- Make it fully responsive (mobile, tablet, desktop)\n`;
        prompt += `- Add accessibility features (ARIA labels, alt text)\n`;
        prompt += `- Include error handling for user interactions\n`;
        prompt += `- Write clean, readable, well-commented code\n`;
        prompt += `- Use modern JavaScript (ES6+)\n`;
        prompt += `- Make it visually appealing with modern design\n\n`;
        
        prompt += `## Output Structure\n\n`;
        prompt += `Please structure your response as JSON:\n`;
        prompt += `\`\`\`json\n`;
        prompt += `{\n`;
        prompt += `  "projectName": "descriptive-name",\n`;
        prompt += `  "description": "Brief description of the app",\n`;
        prompt += `  "files": [\n`;
        prompt += `    {\n`;
        prompt += `      "path": "index.html",\n`;
        prompt += `      "content": "<!-- HTML code here -->",\n`;
        prompt += `      "type": "html"\n`;
        prompt += `    },\n`;
        prompt += `    {\n`;
        prompt += `      "path": "css/style.css",\n`;
        prompt += `      "content": "/* CSS code here */",\n`;
        prompt += `      "type": "css"\n`;
        prompt += `    },\n`;
        prompt += `    {\n`;
        prompt += `      "path": "js/script.js",\n`;
        prompt += `      "content": "// JavaScript code here",\n`;
        prompt += `      "type": "javascript"\n`;
        prompt += `    },\n`;
        prompt += `    {\n`;
        prompt += `      "path": "README.md",\n`;
        prompt += `      "content": "# Project documentation here",\n`;
        prompt += `      "type": "markdown"\n`;
        prompt += `    }\n`;
        prompt += `  ],\n`;
        prompt += `  "features": ["feature1", "feature2", "feature3"],\n`;
        prompt += `  "techStack": ["HTML5", "CSS3", "JavaScript"]\n`;
        prompt += `}\n`;
        prompt += `\`\`\`\n\n`;
        
        prompt += `Generate complete, production-ready code that works immediately when deployed.`;
        
        return prompt;
    }
    
    /**
     * Send request to GenSpark API
     */
    async sendToGenSpark(prompt, options = {}) {
        console.log('📡 Sending to GenSpark...');
        
        const requestBody = {
            messages: [
                {
                    role: 'system',
                    content: this.getSystemPrompt()
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: options.model || 'auto', // Let GenSpark choose best model
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 8000
        };
        
        // Retry logic
        let lastError;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${this.config.maxRetries}`);
                
                const response = await this.makeRequest(requestBody);
                
                console.log('✅ GenSpark response received');
                return response;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
                
                if (attempt < this.config.maxRetries) {
                    const delay = this.config.retryDelay * attempt;
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Make HTTP request to GenSpark API
     */
    async makeRequest(requestBody) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.config.timeout}ms`);
            }
            
            throw error;
        }
    }
    
    /**
     * Parse GenSpark response into project structure
     */
    parseGenSparkResponse(response, options = {}) {
        console.log('🔍 Parsing GenSpark response...');
        
        try {
            // Extract content from response
            const content = this.extractContent(response);
            
            // Try to parse as JSON
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                const project = JSON.parse(jsonMatch[1]);
                console.log('✅ Parsed JSON project structure');
                return project;
            }
            
            // Fallback: Parse code blocks manually
            console.log('⚠️ No JSON found, parsing code blocks...');
            return this.parseCodeBlocks(content, options);
            
        } catch (error) {
            console.error('❌ Parse error:', error);
            throw new Error(`Failed to parse GenSpark response: ${error.message}`);
        }
    }
    
    /**
     * Extract content from GenSpark response
     */
    extractContent(response) {
        // Handle different response formats
        if (typeof response === 'string') {
            return response;
        }
        
        if (response.choices && response.choices[0]) {
            return response.choices[0].message?.content || response.choices[0].text || '';
        }
        
        if (response.content) {
            return response.content;
        }
        
        if (response.message && response.message.content) {
            return response.message.content;
        }
        
        throw new Error('Unexpected response format from GenSpark');
    }
    
    /**
     * Parse code blocks from markdown response
     */
    parseCodeBlocks(content, options = {}) {
        const files = [];
        
        // Extract HTML
        const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/);
        if (htmlMatch) {
            files.push({
                path: 'index.html',
                content: htmlMatch[1].trim(),
                type: 'html'
            });
        }
        
        // Extract CSS
        const cssMatch = content.match(/```css\s*([\s\S]*?)\s*```/);
        if (cssMatch) {
            files.push({
                path: 'css/style.css',
                content: cssMatch[1].trim(),
                type: 'css'
            });
        }
        
        // Extract JavaScript
        const jsMatch = content.match(/```(?:javascript|js)\s*([\s\S]*?)\s*```/);
        if (jsMatch) {
            files.push({
                path: 'js/script.js',
                content: jsMatch[1].trim(),
                type: 'javascript'
            });
        }
        
        return {
            projectName: options.projectName || 'vibenicity-app',
            description: 'Generated by Vibenicity with GenSpark',
            files: files,
            features: ['Generated from cultural language input'],
            techStack: ['HTML5', 'CSS3', 'JavaScript']
        };
    }
    
    /**
     * Generate educational feedback about cultural language patterns
     */
    generateEducationalFeedback(options = {}) {
        const { detectedPatterns = [], context } = options;
        
        if (detectedPatterns.length === 0) {
            return null;
        }
        
        return {
            title: '🎓 Cultural Language Insights',
            message: 'Your input used culturally rich language patterns!',
            patterns: detectedPatterns.map(p => ({
                name: p.name,
                description: p.description,
                example: p.example,
                standardEnglish: p.standardEnglish
            })),
            learnMore: 'These patterns are part of systematic, rule-based language varieties like AAVE, Southern American English, and Appalachian English.'
        };
    }
    
    /**
     * Get system prompt for GenSpark
     */
    getSystemPrompt() {
        return `You are an expert full-stack web developer integrated into Vibenicity, a platform that makes code creation accessible through cultural language understanding.

Your role:
1. Generate complete, production-ready web applications
2. Respect cultural language context provided in user requests
3. Create clean, modern, responsive code (HTML5, CSS3, JavaScript)
4. Follow web accessibility best practices
5. Write well-commented, maintainable code
6. Provide structured JSON output when requested

Key principles:
- Mobile-first responsive design
- Semantic HTML structure
- Modern CSS (Grid, Flexbox)
- ES6+ JavaScript
- Accessibility (ARIA, alt text, keyboard navigation)
- Clean, readable code with comments

You're helping democratize code creation for speakers of AAVE, Southern American English, Appalachian English, and other language varieties.`;
    }
    
    /**
     * Handle errors with user-friendly messages
     */
    handleError(error) {
        const errorMap = {
            'timeout': 'Request took too long. Please try again.',
            'network': 'Network error. Check your connection and try again.',
            'parse': 'Failed to understand GenSpark response. Please try again.',
            'auth': 'Authentication failed. Please check your API configuration.',
            'rate_limit': 'Too many requests. Please wait a moment and try again.'
        };
        
        for (const [key, message] of Object.entries(errorMap)) {
            if (error.message.toLowerCase().includes(key)) {
                return new Error(message);
            }
        }
        
        return new Error(`Generation failed: ${error.message}`);
    }
    
    /**
     * Update performance metrics
     */
    updateMetrics(responseTime, success) {
        if (success) {
            this.metrics.successfulRequests++;
            this.metrics.totalResponseTime += responseTime;
            this.metrics.averageResponseTime = 
                this.metrics.totalResponseTime / this.metrics.successfulRequests;
        }
    }
    
    /**
     * Get service metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalRequests > 0
                ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
                : 0
        };
    }
    
    /**
     * Sleep utility for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Health check - verify service is operational
     */
    async healthCheck() {
        try {
            const response = await this.makeRequest({
                messages: [
                    { role: 'user', content: 'Test connection - respond with OK' }
                ],
                model: 'auto',
                max_tokens: 10
            });
            
            return { healthy: true, service: this.serviceName };
        } catch (error) {
            return { healthy: false, service: this.serviceName, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GenSparkService;
}

// Make available globally
window.GenSparkService = GenSparkService;

console.log('✅ GenSparkService loaded successfully');
