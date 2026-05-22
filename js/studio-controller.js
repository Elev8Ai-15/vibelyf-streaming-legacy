/**
 * VibeCoder Studio Controller
 * Professional IDE-style interface controller
 * Manages chat, preview, and app generation
 */

class StudioController {
    constructor() {
        this.languageProcessor = new AdvancedLanguageProcessor();
        
        // Initialize all LLM services
        this.geminiService = new GeminiAPIService();
        
        // NEW: Use Multi-LLM Orchestrator for full-stack generation
        this.orchestrator = new MultiLLMOrchestrator(this.languageProcessor);
        
        // Keep legacy generation engine for backward compatibility
        this.generationEngine = new AppGenerationEngine(this.languageProcessor, this.geminiService);
        
        // Generation mode: 'multi-llm' (default) or 'single-llm' (fallback)
        this.generationMode = 'multi-llm';
        
        this.messages = [];
        this.currentApp = null;
        this.isGenerating = false;
        
        this.init();
    }

    async init() {
        console.log('🎨 VibeCoder Studio initializing...');
        
        // Initialize module loader and check system health
        if (window.moduleLoader) {
            const systemStatus = await window.moduleLoader.initialize();
            this.systemStatus = systemStatus;
            
            if (!systemStatus.ready) {
                console.warn('⚠️ System not fully ready:', systemStatus);
                this.generationMode = 'single-llm'; // Fallback mode
            } else {
                console.log('✅ All systems ready! Multi-LLM enabled.');
            }
        }
        
        this.checkAPIKeyStatus();
        this.setupTextarea();
    }

    checkAPIKeyStatus() {
        const services = {
            gemini: this.geminiService,
            claude: this.orchestrator.llms.claude,
            openai: this.orchestrator.llms.openai,
            mistral: this.orchestrator.llms.mistral
        };
        
        const configured = [];
        const missing = [];
        
        for (const [name, service] of Object.entries(services)) {
            if (service && service.hasAPIKey()) {
                configured.push(name);
                console.log(`✅ ${name} API key configured`);
            } else {
                missing.push(name);
            }
        }
        
        if (configured.length === 0) {
            console.warn('⚠️ No API keys found');
            this.showAPIKeyPrompt();
        } else if (configured.length < 4) {
            console.log(`✅ ${configured.length}/4 LLM services configured`);
            this.showPartialConfigMessage(configured, missing);
        } else {
            console.log('✅ All 4 LLM services configured!');
        }
    }
    
    showPartialConfigMessage(configured, missing) {
        this.addMessage('assistant', `
            <strong>✅ Partial Configuration Detected</strong><br><br>
            
            <strong>Configured LLMs:</strong> ${configured.join(', ')}<br>
            <strong>Missing:</strong> ${missing.join(', ')}<br><br>
            
            The system will work with reduced capabilities. For full multi-LLM power:
            <br>1. Click <strong>🔑 API Keys</strong> button above
            <br>2. Configure missing services<br><br>
            
            Current mode: ${this.generationMode === 'multi-llm' ? 'Multi-LLM (Full-Stack)' : 'Single-LLM (Frontend Only)'}
        `);
    }

    showAPIKeyPrompt() {
        this.addMessage('assistant', `
            <strong>🔑 Gemini API Key Required</strong><br><br>
            
            To generate advanced apps with AI, you need a Gemini API key.<br><br>
            
            <strong>How to get your API key:</strong><br>
            1. Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" style="color: var(--primary-cyan); text-decoration: underline;">Google AI Studio</a><br>
            2. Click "Create API Key"<br>
            3. Copy your key<br>
            4. Click the ⚙️ Settings button<br>
            5. Enter your API key<br><br>
            
            Don't have an API key? The template-based generator will still work! 
            Just try: "make me a todo app"
        `);
    }

    setupTextarea() {
        const textarea = document.getElementById('chatInput');
        if (textarea) {
            textarea.addEventListener('input', () => {
                // Auto-resize textarea
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                
                // Update send button state
                const sendBtn = document.getElementById('sendBtn');
                sendBtn.disabled = !textarea.value.trim();
            });
        }
    }

    addMessage(role, content, options = {}) {
        const message = {
            role, // 'user' or 'assistant'
            content,
            timestamp: new Date(),
            ...options
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}`;

        const avatar = message.role === 'assistant' ? '🤖' : '👤';
        const avatarClass = message.role === 'assistant' ? 'assistant-avatar' : 'user-avatar';
        const name = message.role === 'assistant' ? 'VibeCoder' : 'You';

        messageEl.innerHTML = `
            <div class="message-avatar ${avatarClass}">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-name">${name}</span>
                    <span class="message-time">${this.formatTime(message.timestamp)}</span>
                </div>
                <div class="message-bubble">
                    ${message.content}
                </div>
                ${message.progress !== undefined ? this.renderProgress(message.progress) : ''}
            </div>
        `;

        messagesContainer.appendChild(messageEl);
    }

    renderProgress(progress) {
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendMessage() {
        if (this.isGenerating) return;

        const textarea = document.getElementById('chatInput');
        const message = textarea.value.trim();

        if (!message) return;

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
            
            // Use sanitized version
            const sanitizedMessage = validation.sanitized;
            
            // Add user message with sanitized content
            this.addMessage('user', sanitizedMessage);

            // Clear input
            textarea.value = '';
            textarea.style.height = 'auto';
            document.getElementById('sendBtn').disabled = true;

            // Start generation
            this.isGenerating = true;
            await this.generateApp(sanitizedMessage);
            this.isGenerating = false;
        } else {
            // Fallback if validator not loaded
            // Add user message
            this.addMessage('user', message);

            // Clear input
            textarea.value = '';
            textarea.style.height = 'auto';
            document.getElementById('sendBtn').disabled = true;

            // Start generation
            this.isGenerating = true;
            await this.generateApp(message);
            this.isGenerating = false;
        }
    }

    async generateApp(description) {
        try {
            // Show thinking message
            const thinkingId = this.messages.length;
            this.addMessage('assistant', 'Got it! Let me build that for you... 🚀', {
                progress: 0
            });

            // Simulate progress updates
            for (let i = 20; i <= 80; i += 20) {
                await this.sleep(300);
                this.updateProgress(thinkingId, i);
            }

            // Generate the app
            const result = await this.generationEngine.generateApp(description, {});
            
            // Check for generation failure
            if (!result || !result.success) {
                throw new Error(result?.error || 'App generation failed');
            }

            // Complete progress
            this.updateProgress(thinkingId, 100);
            await this.sleep(300);

            // Remove progress message and add success message
            this.removeMessage(thinkingId);

            // Show success message
            const appName = this.getAppName(result.detectedIntent.appType);
            const generationIcon = result.generationMethod === 'gemini' ? '🤖' : '📝';
            const generationLabel = result.generationMethod === 'gemini' ? 'AI-Generated' : 'Template-Based';
            
            let successMessage = `✅ Done! I built you a <strong>${appName}</strong>!<br>`;
            successMessage += `${generationIcon} <em>${generationLabel}</em><br><br>`;

            // Add AAVE translation info if applicable
            if (result.originalDescription !== result.processedDescription) {
                successMessage += `<em>I understood your AAVE and made:</em><br>`;
            }

            successMessage += `<strong>Features:</strong><br>`;
            successMessage += `• ${result.detectedIntent.purpose}<br>`;
            
            if (result.detectedIntent.features.length > 0) {
                successMessage += `• ${result.detectedIntent.features.join(', ')}<br>`;
            }

            successMessage += `• Style: ${result.detectedIntent.stylePreference}<br><br>`;
            successMessage += `Check it out in the preview panel! 👉`;

            this.addMessage('assistant', successMessage);

            // Deploy to preview
            this.deployPreview(result);

            // Store current app
            this.currentApp = result;
            
            // Generate voice explanation if enabled
            if (window.voiceService && window.voiceService.enabled) {
                try {
                    console.log('🎤 Generating voice explanation...');
                    const audioData = await window.voiceService.explainCode(result.code);
                    if (audioData) {
                        await window.voiceService.playAudio(audioData);
                        console.log('✅ Voice explanation played');
                    }
                } catch (voiceError) {
                    console.warn('⚠️ Voice explanation failed:', voiceError);
                    // Don't fail the whole generation if voice fails
                }
            }

        } catch (error) {
            console.error('Generation error:', error);
            
            // Route through error handler if available
            if (window.errorHandler) {
                window.errorHandler.handleError(error, 'Studio App Generation');
            }
            
            this.addMessage('assistant', `Oops! Something went wrong 😕<br><br>Error: ${error.message}<br><br>Try describing your app differently!`);
        }
    }

    updateProgress(messageIndex, progress) {
        const messages = document.querySelectorAll('.message.assistant');
        if (messages[messageIndex]) {
            const progressBar = messages[messageIndex].querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    removeMessage(messageIndex) {
        const messages = document.querySelectorAll('.message.assistant');
        if (messages[messageIndex]) {
            messages[messageIndex].remove();
        }
    }

    deployPreview(result) {
        const iframe = document.getElementById('previewFrame');
        const empty = document.getElementById('previewEmpty');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('previewStatus');

        // Show iframe, hide empty state
        iframe.style.display = 'block';
        empty.style.display = 'none';

        // Update status
        statusDot.style.background = 'var(--primary-yellow)';
        statusText.textContent = 'Loading...';

        // Create blob and deploy
        const blob = new Blob([result.code.combined], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        iframe.onload = () => {
            statusDot.style.background = 'var(--primary-green)';
            statusText.textContent = 'Running ✓';

            // Enable toolbar buttons
            document.getElementById('refreshBtn').disabled = false;
            document.getElementById('openBtn').disabled = false;
            document.getElementById('downloadBtn').disabled = false;
        };

        iframe.src = url;
    }

    refreshPreview() {
        if (!this.currentApp) return;

        const iframe = document.getElementById('previewFrame');
        iframe.contentWindow.location.reload();

        this.showNotification('Preview refreshed! 🔄', 'info');
    }

    openInNewTab() {
        if (!this.currentApp) return;

        const blob = new Blob([this.currentApp.code.combined], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');

        this.showNotification('Opened in new tab! 🚀', 'success');
    }

    downloadApp() {
        if (!this.currentApp) {
            this.showNotification('Build an app first! 💡', 'warning');
            return;
        }

        const code = this.currentApp.code.combined;
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibecoder-${this.currentApp.detectedIntent.appType}-app.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('App downloaded! 💾', 'success');
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'var(--primary-green)',
            error: 'var(--primary-pink)',
            warning: 'var(--primary-yellow)',
            info: 'var(--primary-cyan)'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getAppName(appType) {
        const names = {
            todo: 'Todo List App',
            calculator: 'Calculator',
            notes: 'Notes App',
            timer: 'Timer App',
            portfolio: 'Portfolio Website',
            blog: 'Blog',
            custom: 'Custom App'
        };
        return names[appType] || 'App';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showStyleGallery() {
        this.addMessage('assistant', `
            <strong>🎨 Available Styles:</strong><br><br>
            
            <strong>1. Urban (Default)</strong> - Dark theme with purple & cyan neon colors. Hip-hop vibe! 🔥<br><br>
            
            <strong>2. Minimal</strong> - Clean black & white. Simple and focused. ✨<br><br>
            
            <strong>3. Professional</strong> - Business blue & gray. Corporate look. 💼<br><br>
            
            <strong>4. Colorful</strong> - Bright gradients and fun colors. Playful! 🌈<br><br>
            
            <strong>5. Modern</strong> - Sleek dark blue. Tech aesthetic. 🚀<br><br>
            
            Just mention the style when describing your app!<br>
            Example: "make me a todo app with a colorful style"
        `);
    }

    showTemplates() {
        this.addMessage('assistant', `
            <strong>📦 Available App Templates:</strong><br><br>
            
            <strong>📝 Todo List</strong> - Track your tasks, check them off, never forget!<br>
            <em>Try: "yo make me a todo app"</em><br><br>
            
            <strong>🔢 Calculator</strong> - Do quick math with a simple calculator<br>
            <em>Try: "I need a calculator"</em><br><br>
            
            <strong>📔 Notes App</strong> - Write and save your thoughts and ideas<br>
            <em>Try: "finna build a notes app"</em><br><br>
            
            <strong>⏱️ Timer</strong> - Track time for workouts, cooking, studying<br>
            <em>Try: "I need a timer for my workouts"</em><br><br>
            
            <strong>🎨 Custom</strong> - Tell me what you want and I'll build it!<br><br>
            
            What do you want to build? 🚀
        `);
    }

    showHelp() {
        this.addMessage('assistant', `
            <strong>💡 How to Use VibeLyf Studio:</strong><br><br>
            
            <strong>1. Describe Your App</strong><br>
            Tell me what you want to build in the chat. Use AAVE, slang, Southern, Spanglish, or regular English - I understand all of it!<br><br>
            
            <strong>2. Watch It Build</strong><br>
            I'll process your description and generate a complete working app in seconds!<br><br>
            
            <strong>3. Test in Preview</strong><br>
            Your app appears in the preview panel on the right. You can interact with it immediately!<br><br>
            
            <strong>4. Download Your App</strong><br>
            Click the download button to save your app as an HTML file. It works offline!<br><br>
            
            <strong>Tips:</strong><br>
            • Be specific about what you want<br>
            • Mention the style you like<br>
            • Ask for features you need<br>
            • Try different app types!<br><br>
            
            <button onclick="if(window.tutorial){window.tutorial.reset(); window.tutorial.start();}" 
                    style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 10px;">
                🎓 Restart Interactive Tutorial
            </button><br><br>
            
            Need examples? Click the "Apps" button in the left sidebar! 🎯
        `);
    }
}

// Global instance
let studio;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    studio = new StudioController();
});

// Global functions for UI
function sendMessage() {
    studio.sendMessage();
}

function handleKeyPress(event) {
    // Send on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function refreshPreview() {
    studio.refreshPreview();
}

function openInNewTab() {
    studio.openInNewTab();
}

function downloadApp() {
    studio.downloadApp();
}

function showStyleGallery() {
    studio.showStyleGallery();
}

function showTemplates() {
    studio.showTemplates();
}

function showHelp() {
    studio.showHelp();
}
