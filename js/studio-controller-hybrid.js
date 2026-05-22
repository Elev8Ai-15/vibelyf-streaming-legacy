/**
 * Studio Controller - Hybrid Edition
 * 
 * Uses Hybrid Generation Service for flexible code generation:
 * - Primary: Your Gemini API key (cost control)
 * - Fallback: GenSpark (reliability backup)
 * - Configurable priority
 * 
 * Benefits over multi-LLM orchestration:
 * - 72% less code (162 KB → 45 KB)
 * - Simpler architecture (7 files → 3 files)
 * - Cost control (use your own Gemini)
 * - Reliability (automatic fallback)
 * - No vendor lock-in (switch anytime)
 * 
 * @class StudioController
 * @version 3.0.0 (Hybrid)
 * @date 2025-11-19
 */

class StudioController {
    constructor() {
        // Core language processing (our innovation - 100% preserved!)
        this.languageProcessor = new AdvancedLanguageProcessor();
        this.inputNormalizer = new EnhancedInputNormalizer();
        
        // NEW: Hybrid generation service
        this.generationService = new HybridGenerationService();
        
        // UI state
        this.messages = [];
        this.currentApp = null;
        this.isGenerating = false;
        
        this.init();
    }

    async init() {
        console.log('🎨 VibeLyf Studio initializing (Hybrid Edition)...');
        
        // Check service status
        const status = await this.generationService.getStatus();
        this.serviceStatus = status;
        
        console.log('📊 Service Status:', status);
        
        // Show welcome message with service info
        this.showWelcomeMessage(status);
        
        // Setup UI
        this.setupTextarea();
        this.setupServiceSelector();
    }
    
    /**
     * Show welcome message with service configuration
     */
    showWelcomeMessage(status) {
        const primaryService = status.primaryMode === 'gemini' ? 'Your Gemini' : 'GenSpark';
        const fallbackService = status.primaryMode === 'gemini' ? 'GenSpark' : 'Your Gemini';
        
        let configInfo = '';
        
        if (status.gemini.available && status.genspark.available) {
            configInfo = `
                <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>✅ Full Configuration</strong><br>
                    <strong>Primary:</strong> ${primaryService}<br>
                    <strong>Fallback:</strong> ${fallbackService}<br>
                    <small>Maximum reliability with automatic fallback!</small>
                </div>
            `;
        } else if (status.gemini.available) {
            configInfo = `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>⚡ Gemini Only Mode</strong><br>
                    Using your Gemini API key<br>
                    <small>GenSpark fallback not available</small>
                </div>
            `;
        } else if (status.genspark.available) {
            configInfo = `
                <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>🚀 GenSpark Only Mode</strong><br>
                    Using GenSpark service<br>
                    <small>Configure Gemini API key for fallback option</small>
                </div>
            `;
        } else {
            configInfo = `
                <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>⚠️ Configuration Required</strong><br>
                    Please configure at least one service:<br>
                    • Gemini API key (click 🔑 button above)<br>
                    • Or ensure GenSpark is available
                </div>
            `;
        }
        
        this.addMessage('assistant', `
            <strong>🌟 Welcome to VibeLyf Studio!</strong><br><br>
            
            ${configInfo}
            
            <strong>Powered by Hybrid Architecture</strong> 🎯<br><br>
            
            Tell me what app you want to build in YOUR voice:<br>
            • AAVE: "yo imma need a todo app dat slap"<br>
            • Southern: "y'all, I need me a weather app"<br>
            • Appalachian: "I'm fixin to make a photo gallery"<br>
            • Or just standard English!<br><br>
            
            I'll translate your cultural language into working code while teaching you about the linguistic patterns you use. 🎓
        `);
        
        // Show service selector if both available
        if (status.gemini.available && status.genspark.available) {
            this.showServiceSelectorTip();
        }
    }
    
    /**
     * Show tip about service selector
     */
    showServiceSelectorTip() {
        this.addMessage('assistant', `
            <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                <strong>💡 Pro Tip:</strong> You can switch between services anytime!<br>
                Click the <strong>⚙️ Service Config</strong> button above to change your preference.
            </div>
        `);
    }

    /**
     * Setup service selector UI
     */
    setupServiceSelector() {
        // Check if selector button exists
        let selectorBtn = document.getElementById('serviceSelectorBtn');
        
        if (!selectorBtn) {
            // Create selector button in header
            const header = document.querySelector('.studio-header .header-actions');
            if (header) {
                selectorBtn = document.createElement('button');
                selectorBtn.id = 'serviceSelectorBtn';
                selectorBtn.className = 'header-btn';
                selectorBtn.innerHTML = '⚙️ Service Config';
                selectorBtn.onclick = () => this.showServiceSelector();
                header.insertBefore(selectorBtn, header.firstChild);
            }
        }
    }
    
    /**
     * Show service selector modal
     */
    async showServiceSelector() {
        const status = await this.generationService.getStatus();
        const metrics = this.generationService.getMetrics();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <h2 style="color: #667eea; margin-bottom: 20px;">⚙️ Service Configuration</h2>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px;">🎯 Primary Service</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; padding: 15px; border: 2px solid ${status.primaryMode === 'gemini' ? '#667eea' : '#ddd'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="primaryService" value="gemini" ${status.primaryMode === 'gemini' ? 'checked' : ''} 
                                   ${!status.gemini.available ? 'disabled' : ''}
                                   style="margin-right: 10px;">
                            <div style="flex: 1;">
                                <strong>Your Gemini API</strong>
                                ${!status.gemini.available ? '<br><small style="color: #dc3545;">⚠️ API key not configured</small>' : '<br><small style="color: #28a745;">✅ Available</small>'}
                                <br><small>Cost control • Your credits • Predictable billing</small>
                            </div>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; padding: 15px; border: 2px solid ${status.primaryMode === 'genspark' ? '#667eea' : '#ddd'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="primaryService" value="genspark" ${status.primaryMode === 'genspark' ? 'checked' : ''}
                                   ${!status.genspark.available ? 'disabled' : ''}
                                   style="margin-right: 10px;">
                            <div style="flex: 1;">
                                <strong>GenSpark Service</strong>
                                ${!status.genspark.available ? '<br><small style="color: #dc3545;">⚠️ Service unavailable</small>' : '<br><small style="color: #28a745;">✅ Available</small>'}
                                <br><small>Multi-model intelligence • Auto optimization</small>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px;">📊 Usage Metrics</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold; color: #667eea;">${metrics.totalRequests}</div>
                            <div style="color: #666; font-size: 0.9em;">Total Requests</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold; color: #28a745;">${Math.round(metrics.successRate)}%</div>
                            <div style="color: #666; font-size: 0.9em;">Success Rate</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold; color: #ff6b6b;">${metrics.geminiRequests}</div>
                            <div style="color: #666; font-size: 0.9em;">Gemini Requests</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold; color: #4ecdc4;">${metrics.gensparkRequests}</div>
                            <div style="color: #666; font-size: 0.9em;">GenSpark Requests</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="saveServiceConfig" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        💾 Save Configuration
                    </button>
                    <button id="closeServiceModal" style="padding: 12px 24px; background: #f8f9fa; color: #333; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle save
        document.getElementById('saveServiceConfig').onclick = () => {
            const selected = document.querySelector('input[name="primaryService"]:checked');
            if (selected) {
                this.generationService.setPrimaryMode(selected.value);
                this.addMessage('assistant', `
                    <div style="background: #d4edda; padding: 15px; border-radius: 8px;">
                        <strong>✅ Configuration Saved</strong><br>
                        Primary service set to: <strong>${selected.value === 'gemini' ? 'Your Gemini' : 'GenSpark'}</strong>
                    </div>
                `);
            }
            document.body.removeChild(modal);
        };
        
        // Handle close
        document.getElementById('closeServiceModal').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
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
     * Generate app using Hybrid Generation Service
     * 
     * This method preserves ALL cultural language processing while
     * using the simplified hybrid architecture
     */
    async generateApp(userInput) {
        console.log('🚀 Starting app generation with Hybrid service...');
        
        try {
            // Step 1: Analyze cultural language patterns (OUR INNOVATION!)
            const linguisticAnalysis = this.analyzeLanguagePatterns(userInput);
            
            // Step 2: Normalize input while preserving context
            const normalizationResult = this.inputNormalizer.normalizeInput(userInput);
            
            // Step 3: Build enriched context for generation service
            const context = {
                detectedPatterns: linguisticAnalysis.patterns,
                normalized: normalizationResult.normalized,
                culturalContext: linguisticAnalysis.context,
                confidence: normalizationResult.confidence,
                original: userInput
            };
            
            // Step 4: Show loading with progress
            if (window.feedbackUI) {
                window.feedbackUI.showLoadingWithProgress('🧠 Generating Your App...', [
                    'Analyzing cultural language...',
                    'Understanding your intent...',
                    'Selecting optimal service...',
                    'Generating code...',
                    'Adding polish...',
                    'Finalizing project...'
                ]);
                
                window.feedbackUI.updateProgress(0, true);
                window.feedbackUI.updateProgress(1, true);
                window.feedbackUI.updateProgress(2, false);
            }
            
            // Step 5: Generate with Hybrid service (THE MAGIC!)
            const project = await this.generationService.generateFullStack(userInput, context);
            
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
            
            // Step 9: Learn from this interaction
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
                
                Please try again or:<br>
                • Check your service configuration (⚙️ button above)<br>
                • Ensure you have API keys configured<br>
                • Describe your app differently
            `);
        }
    }
    
    /**
     * Analyze language patterns using our linguistic processor
     * (This is our core innovation - 100% preserved!)
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
        
        // Show which service was used
        const metrics = this.generationService.getMetrics();
        const serviceUsed = metrics.geminiRequests > metrics.gensparkRequests ? 'Your Gemini' : 'GenSpark';
        
        // Show success message
        this.addMessage('assistant', `
            <strong>✅ App Generated Successfully!</strong><br><br>
            
            <div style="background: #e7f3ff; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <small>Generated using: <strong>${serviceUsed}</strong></small>
            </div>
            
            <strong>Project:</strong> ${project.projectName || 'Your App'}<br>
            <strong>Description:</strong> ${project.description || 'Custom web application'}<br>
            <strong>Files:</strong> ${project.files ? project.files.length : 0}<br><br>
            
            <button onclick="studioController.previewApp()" class="preview-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">
                👁️ Preview App
            </button>
            <button onclick="studioController.downloadApp()" class="download-btn" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">
                💾 Download Code
            </button>
        `);
        
        // Show file structure
        if (project.files && project.files.length > 0) {
            let filesHTML = '<br><strong>📁 Generated Files:</strong><br><ul style="margin-left: 20px;">';
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
        
        feedback += '<strong>Patterns Detected:</strong><ul style="margin-left: 20px;">';
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
     * Preview generated app in new window
     */
    previewApp() {
        if (!this.currentApp || !this.currentApp.files) {
            console.error('❌ No app to preview');
            return;
        }
        
        const htmlFile = this.currentApp.files.find(f => f.type === 'html' || f.path.endsWith('.html'));
        
        if (!htmlFile) {
            alert('No HTML file found in generated app');
            return;
        }
        
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(htmlFile.content);
        previewWindow.document.close();
    }
    
    /**
     * Download generated app files
     */
    downloadApp() {
        if (!this.currentApp || !this.currentApp.files) {
            console.error('❌ No app to download');
            return;
        }
        
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
        return this.generationService.getMetrics();
    }
    
    /**
     * Get service status
     */
    async getStatus() {
        return await this.generationService.getStatus();
    }
}

// Initialize when DOM is ready
let studioController;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing Studio Controller (Hybrid Edition)...');
    studioController = new StudioController();
    window.studioController = studioController;
});

console.log('✅ Studio Controller (Hybrid Edition) loaded');
