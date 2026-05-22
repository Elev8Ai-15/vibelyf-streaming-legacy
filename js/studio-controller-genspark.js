/**
 * Studio Controller - GenSpark Edition
 * 
 * Simplified version that uses GenSpark service instead of multi-LLM orchestration
 * This replaces 162 KB of LLM infrastructure with a clean 17 KB integration
 * 
 * @class StudioController
 * @version 2.0.0 (GenSpark)
 * @date 2025-11-19
 */

class StudioController {
    constructor() {
        // Core language processing (keep - this is our innovation!)
        this.languageProcessor = new AdvancedLanguageProcessor();
        this.inputNormalizer = new EnhancedInputNormalizer();
        
        // NEW: Single GenSpark service replaces all LLM services
        this.gensparkService = new GenSparkService();
        
        // UI state
        this.messages = [];
        this.currentApp = null;
        this.isGenerating = false;
        
        this.init();
    }

    async init() {
        console.log('🎨 Vibenicity Studio initializing (GenSpark Edition)...');
        
        // Check GenSpark health
        const health = await this.checkServiceHealth();
        
        if (!health.healthy) {
            console.warn('⚠️ GenSpark service health check failed');
            this.showServiceWarning();
        } else {
            console.log('✅ GenSpark service healthy and ready!');
        }
        
        this.setupTextarea();
        this.showWelcomeMessage();
    }
    
    /**
     * Check if GenSpark service is operational
     */
    async checkServiceHealth() {
        try {
            return await this.gensparkService.healthCheck();
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return { healthy: false, error: error.message };
        }
    }
    
    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        this.addMessage('assistant', `
            <strong>🌟 Welcome to Vibenicity Studio!</strong><br><br>
            
            <strong>Powered by GenSpark AI</strong> 🚀<br><br>
            
            Tell me what app you want to build in YOUR voice:<br>
            • AAVE: "yo imma need a todo app dat slap"<br>
            • Southern: "y'all, I need me a weather app"<br>
            • Appalachian: "I'm fixin to make a photo gallery"<br>
            • Or just standard English!<br><br>
            
            I'll translate your cultural language into working code while teaching you about the linguistic patterns you use. 🎓
        `);
    }
    
    /**
     * Show service warning if health check fails
     */
    showServiceWarning() {
        this.addMessage('assistant', `
            <strong>⚠️ Service Connection Issue</strong><br><br>
            
            The GenSpark AI service may be temporarily unavailable.<br>
            You can still describe your app, and I'll try to generate it when the service reconnects.<br><br>
            
            If this persists, please check:<br>
            • Your internet connection<br>
            • Browser console for errors<br>
        `);
    }

    setupTextarea() {
        const textarea = document.getElementById('chatInput');
        if (!textarea) {
            console.error('❌ Chat input textarea not found');
            return;
        }

        // Auto-resize textarea as user types
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        });

        // Send on Enter (but Shift+Enter for new line)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    /**
     * Send user message and generate app
     */
    async sendMessage() {
        if (this.isGenerating) {
            console.log('⏳ Generation already in progress...');
            return;
        }

        const textarea = document.getElementById('chatInput');
        const message = textarea.value.trim();

        if (!message) {
            console.log('⚠️ Empty message, ignoring');
            return;
        }

        // Validate input
        if (window.inputValidator) {
            const validation = window.inputValidator.validateAppDescription(message);
            
            if (!validation.valid) {
                window.inputValidator.showError(textarea, validation.errors[0]);
                this.addMessage('assistant', `❌ ${validation.errors[0]}\n\nPlease check your input and try again.`);
                return;
            }
            
            // Check for spam
            if (window.inputValidator.checkForSpam(message)) {
                window.inputValidator.showError(textarea, 'Input looks like spam');
                this.addMessage('assistant', '⚠️ Your input looks like spam. Please provide a genuine app description.');
                return;
            }
        }

        // Clear input and add user message
        textarea.value = '';
        textarea.style.height = 'auto';
        this.addMessage('user', message);

        // Start generation
        this.isGenerating = true;
        await this.generateApp(message);
        this.isGenerating = false;
    }

    /**
     * Generate app using GenSpark - THE MAGIC HAPPENS HERE
     * 
     * This replaces the entire multi-LLM orchestration flow with a simple,
     * elegant process that leverages GenSpark's intelligence
     */
    async generateApp(userInput) {
        console.log('🚀 Starting app generation with GenSpark...');
        
        try {
            // Step 1: Analyze cultural language patterns
            const linguisticAnalysis = this.analyzeLanguagePatterns(userInput);
            
            // Step 2: Normalize input while preserving context
            const normalizationResult = this.inputNormalizer.normalizeInput(userInput);
            
            // Step 3: Build enriched context for GenSpark
            const context = {
                detectedPatterns: linguisticAnalysis.patterns,
                normalized: normalizationResult.normalized,
                culturalContext: linguisticAnalysis.context,
                confidence: normalizationResult.confidence
            };
            
            // Step 4: Show loading with progress
            if (window.feedbackUI) {
                window.feedbackUI.showLoadingWithProgress('🧠 GenSpark is Creating Your App...', [
                    'Analyzing cultural language...',
                    'Understanding your intent...',
                    'Designing architecture...',
                    'Generating code...',
                    'Adding polish...',
                    'Finalizing project...'
                ]);
                
                window.feedbackUI.updateProgress(0, true);
                window.feedbackUI.updateProgress(1, true);
            }
            
            // Step 5: Send to GenSpark (this is where the simplification magic happens!)
            const project = await this.gensparkService.generateFullStack(userInput, context);
            
            // Step 6: Update progress
            if (window.feedbackUI) {
                window.feedbackUI.updateProgress(2, true);
                window.feedbackUI.updateProgress(3, true);
                window.feedbackUI.updateProgress(4, true);
                window.feedbackUI.updateProgress(5, true);
            }
            
            // Step 7: Show results
            this.displayGeneratedApp(project);
            
            // Step 8: Show educational feedback
            if (linguisticAnalysis.patterns.length > 0) {
                this.showEducationalFeedback(linguisticAnalysis, normalizationResult);
            }
            
            // Step 9: Learn from this interaction (community learning)
            if (window.communityLearning) {
                window.communityLearning.logTranslation(
                    userInput,
                    normalizationResult.normalized,
                    linguisticAnalysis.patterns
                );
            }
            
            // Step 10: Hide loading
            setTimeout(() => {
                if (window.feedbackUI) window.feedbackUI.hideLoading();
            }, 500);
            
            // Success!
            console.log('✅ App generation complete!');
            
        } catch (error) {
            console.error('❌ Generation failed:', error);
            
            if (window.feedbackUI) window.feedbackUI.hideLoading();
            
            this.addMessage('assistant', `
                <strong>❌ Generation Failed</strong><br><br>
                
                ${error.message}<br><br>
                
                Please try again or describe your app differently.
            `);
        }
    }
    
    /**
     * Analyze language patterns using our linguistic processor
     * (This is our core innovation - we keep this!)
     */
    analyzeLanguagePatterns(input) {
        const analysis = this.languageProcessor.analyzeText(input);
        
        const patterns = [];
        const context = {};
        
        // Extract detected patterns
        if (analysis.aaveFeatures && analysis.aaveFeatures.length > 0) {
            context.variety = 'AAVE';
            patterns.push(...analysis.aaveFeatures.map(f => ({
                name: f.name || f.type,
                description: f.explanation || f.description,
                example: f.example || input.substring(f.position, f.position + 20)
            })));
        }
        
        if (analysis.southernFeatures && analysis.southernFeatures.length > 0) {
            context.variety = context.variety || 'Southern American English';
            patterns.push(...analysis.southernFeatures.map(f => ({
                name: f.name || f.type,
                description: f.explanation || f.description,
                example: f.example || input.substring(f.position, f.position + 20)
            })));
        }
        
        if (analysis.appalachianFeatures && analysis.appalachianFeatures.length > 0) {
            context.variety = context.variety || 'Appalachian English';
            patterns.push(...analysis.appalachianFeatures.map(f => ({
                name: f.name || f.type,
                description: f.explanation || f.description,
                example: f.example || input.substring(f.position, f.position + 20)
            })));
        }
        
        return { patterns, context };
    }
    
    /**
     * Display generated app with preview
     */
    displayGeneratedApp(project) {
        this.currentApp = project;
        
        // Show success message
        this.addMessage('assistant', `
            <strong>✅ App Generated Successfully!</strong><br><br>
            
            <strong>Project:</strong> ${project.projectName || 'Your App'}<br>
            <strong>Description:</strong> ${project.description || 'Custom web application'}<br>
            <strong>Files:</strong> ${project.files ? project.files.length : 0}<br><br>
            
            <button onclick="studioController.previewApp()" class="preview-btn">
                👁️ Preview App
            </button>
            <button onclick="studioController.downloadApp()" class="download-btn">
                💾 Download Code
            </button>
        `);
        
        // Show file structure
        if (project.files && project.files.length > 0) {
            let filesHTML = '<br><strong>📁 Generated Files:</strong><br><ul>';
            project.files.forEach(file => {
                filesHTML += `<li><code>${file.path}</code> (${file.type})</li>`;
            });
            filesHTML += '</ul>';
            
            this.addMessage('assistant', filesHTML);
        }
    }
    
    /**
     * Show educational feedback about detected patterns
     */
    showEducationalFeedback(analysis, normalization) {
        if (analysis.patterns.length === 0) return;
        
        let feedback = '<br><br><strong>🎓 Cultural Language Insights</strong><br><br>';
        feedback += `You used <strong>${analysis.context.variety || 'cultural language'}</strong> patterns!<br><br>`;
        
        feedback += '<strong>Patterns Detected:</strong><ul>';
        analysis.patterns.forEach(pattern => {
            feedback += `<li><strong>${pattern.name}</strong>: ${pattern.description}</li>`;
        });
        feedback += '</ul>';
        
        feedback += `<br><strong>Standard English:</strong> "${normalization.normalized}"<br>`;
        feedback += `<strong>Your Input:</strong> "${normalization.original}"<br><br>`;
        
        feedback += 'These patterns are part of systematic, rule-based language varieties. Learn more in the <strong>Tutorial</strong>! 📚';
        
        this.addMessage('assistant', feedback);
    }

    /**
     * Preview generated app in iframe
     */
    previewApp() {
        if (!this.currentApp || !this.currentApp.files) {
            console.error('❌ No app to preview');
            return;
        }
        
        // Find HTML file
        const htmlFile = this.currentApp.files.find(f => f.type === 'html' || f.path.endsWith('.html'));
        
        if (!htmlFile) {
            alert('No HTML file found in generated app');
            return;
        }
        
        // Create preview window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(htmlFile.content);
        previewWindow.document.close();
    }
    
    /**
     * Download generated app as ZIP
     */
    downloadApp() {
        if (!this.currentApp || !this.currentApp.files) {
            console.error('❌ No app to download');
            return;
        }
        
        // For now, download individual files
        // TODO: Implement ZIP download with JSZip library
        
        this.currentApp.files.forEach(file => {
            const blob = new Blob([file.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.path.split('/').pop();
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    /**
     * Add message to chat
     */
    addMessage(role, content) {
        const message = { role, content, timestamp: Date.now() };
        this.messages.push(message);
        
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Get service metrics for monitoring
     */
    getMetrics() {
        return this.gensparkService.getMetrics();
    }
}

// Initialize when DOM is ready
let studioController;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing Studio Controller...');
    studioController = new StudioController();
    window.studioController = studioController; // Make globally accessible
});

console.log('✅ Studio Controller (GenSpark Edition) loaded');
