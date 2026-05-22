/**
 * VibeCoder App Generation Engine
 * Revolutionary code generation from AAVE/Natural Language descriptions
 * 
 * Features:
 * - Intent recognition from natural language
 * - Component extraction and mapping
 * - Template-based code generation
 * - Smart feature detection
 * - Full app scaffolding
 */

class AppGenerationEngine {
    constructor(languageProcessor, geminiService = null) {
        this.languageProcessor = languageProcessor;
        this.geminiService = geminiService;
        this.templates = this.initTemplates();
        this.componentLibrary = this.initComponentLibrary();
        this.stylePresets = this.initStylePresets();
        this.featureDetectors = this.initFeatureDetectors();
        this.useGemini = true; // Try Gemini first, fall back to templates
    }

    /**
     * Main generation method - converts description to working app
     * Now with Gemini API integration and error handling!
     */
    async generateApp(description, options = {}) {
        try {
            // Step 1: Process AAVE/slang to standard English
            const processed = this.languageProcessor.processInput(description, null, {
                showAlternatives: true
            });

            // Step 2: Extract intent and features
            const intent = this.analyzeIntent(processed.normalized);

            // Step 3: Detect required components
            const components = this.detectComponents(intent);

            // Step 4: Try Gemini API first, fall back to templates
            let code;
            let generationMethod = 'template';

            if (this.useGemini && this.geminiService && this.geminiService.hasAPIKey()) {
                try {
                    console.log('🤖 Using Gemini API for generation...');
                    const geminiResult = await this.geminiService.generateApp(
                        processed.normalized,
                        processed.features,
                        intent.stylePreference
                    );
                    code = geminiResult.code;
                    generationMethod = 'gemini';
                    console.log('✅ Gemini generation successful!');
                } catch (error) {
                    console.warn('⚠️ Gemini API failed, falling back to templates:', error.message);
                    
                    // Route through error handler if available
                    if (window.errorHandler) {
                        window.errorHandler.handleError(error, 'Gemini API Generation');
                    }
                    
                    code = this.buildApp(intent, components, options);
                }
            } else {
                // Use template-based generation
                console.log('📝 Using template-based generation...');
                code = this.buildApp(intent, components, options);
            }

            // Step 5: Return complete project
            return {
                success: true,
                originalDescription: description,
                processedDescription: processed.normalized,
                aaveFeatures: processed.features || [],
                detectedIntent: intent,
                components: components,
                code: code,
                preview: this.generatePreviewURL(code),
                confidence: this.calculateConfidence(intent, components),
                generationMethod: generationMethod
            };
        } catch (error) {
            // Route through error handler if available
            if (window.errorHandler) {
                window.errorHandler.handleError(error, 'App Generation Engine');
            }
            
            // Return error result
            return {
                success: false,
                error: error.message,
                originalDescription: description
            };
        }
    }

    /**
     * Analyze user intent from description
     */
    analyzeIntent(description) {
        const lowerDesc = description.toLowerCase();
        
        const intent = {
            appType: 'custom',
            purpose: '',
            features: [],
            dataNeeds: [],
            stylePreference: 'modern',
            complexity: 'simple'
        };

        // Detect app type
        if (this.matchesPattern(lowerDesc, ['todo', 'task', 'checklist', 'reminder'])) {
            intent.appType = 'todo';
            intent.purpose = 'Task management application';
        } else if (this.matchesPattern(lowerDesc, ['calculator', 'calculate', 'math', 'compute'])) {
            intent.appType = 'calculator';
            intent.purpose = 'Calculation tool';
        } else if (this.matchesPattern(lowerDesc, ['portfolio', 'showcase', 'profile', 'about me'])) {
            intent.appType = 'portfolio';
            intent.purpose = 'Personal portfolio website';
        } else if (this.matchesPattern(lowerDesc, ['blog', 'post', 'article', 'write'])) {
            intent.appType = 'blog';
            intent.purpose = 'Blogging platform';
        } else if (this.matchesPattern(lowerDesc, ['timer', 'countdown', 'stopwatch', 'clock'])) {
            intent.appType = 'timer';
            intent.purpose = 'Time tracking tool';
        } else if (this.matchesPattern(lowerDesc, ['game', 'play', 'quiz', 'trivia'])) {
            intent.appType = 'game';
            intent.purpose = 'Interactive game';
        } else if (this.matchesPattern(lowerDesc, ['chat', 'message', 'dm', 'talk'])) {
            intent.appType = 'chat';
            intent.purpose = 'Messaging application';
        } else if (this.matchesPattern(lowerDesc, ['music', 'player', 'audio', 'sound', 'playlist'])) {
            intent.appType = 'music';
            intent.purpose = 'Music player application';
        } else if (this.matchesPattern(lowerDesc, ['weather', 'forecast', 'temperature'])) {
            intent.appType = 'weather';
            intent.purpose = 'Weather information display';
        } else if (this.matchesPattern(lowerDesc, ['note', 'notepad', 'memo', 'write down'])) {
            intent.appType = 'notes';
            intent.purpose = 'Note-taking application';
        }

        // Detect features
        if (this.matchesPattern(lowerDesc, ['search', 'find', 'filter', 'look for'])) {
            intent.features.push('search');
        }
        if (this.matchesPattern(lowerDesc, ['sort', 'organize', 'arrange'])) {
            intent.features.push('sorting');
        }
        if (this.matchesPattern(lowerDesc, ['save', 'store', 'keep', 'remember'])) {
            intent.features.push('persistence');
        }
        if (this.matchesPattern(lowerDesc, ['dark mode', 'theme', 'color'])) {
            intent.features.push('theming');
        }
        if (this.matchesPattern(lowerDesc, ['notification', 'alert', 'remind'])) {
            intent.features.push('notifications');
        }
        if (this.matchesPattern(lowerDesc, ['share', 'export', 'download'])) {
            intent.features.push('export');
        }

        // Detect style preference
        if (this.matchesPattern(lowerDesc, ['minimal', 'simple', 'clean', 'basic'])) {
            intent.stylePreference = 'minimal';
        } else if (this.matchesPattern(lowerDesc, ['vibey', 'cool', 'hip hop', 'urban', 'street'])) {
            intent.stylePreference = 'urban';
        } else if (this.matchesPattern(lowerDesc, ['professional', 'business', 'corporate'])) {
            intent.stylePreference = 'professional';
        } else if (this.matchesPattern(lowerDesc, ['colorful', 'bright', 'fun', 'playful'])) {
            intent.stylePreference = 'colorful';
        }

        // Detect complexity
        const complexWords = ['advanced', 'complex', 'detailed', 'full featured'];
        const simpleWords = ['simple', 'basic', 'easy', 'straightforward'];
        
        if (this.matchesPattern(lowerDesc, complexWords)) {
            intent.complexity = 'advanced';
        } else if (this.matchesPattern(lowerDesc, simpleWords)) {
            intent.complexity = 'simple';
        } else {
            intent.complexity = 'moderate';
        }

        return intent;
    }

    /**
     * Helper to match patterns in text
     */
    matchesPattern(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    /**
     * Detect required components based on intent
     */
    detectComponents(intent) {
        const components = {
            header: true,
            footer: false,
            navigation: false,
            mainContent: true,
            sidebar: false,
            forms: [],
            lists: [],
            cards: [],
            modals: []
        };

        // App-specific components
        switch(intent.appType) {
            case 'todo':
                components.forms.push('task-input');
                components.lists.push('task-list');
                components.footer = true;
                break;
            case 'calculator':
                components.forms.push('calculator-pad');
                break;
            case 'portfolio':
                components.navigation = true;
                components.cards.push('project-card');
                components.footer = true;
                break;
            case 'notes':
                components.forms.push('note-editor');
                components.lists.push('note-list');
                components.sidebar = true;
                break;
            case 'timer':
                components.forms.push('time-controls');
                break;
            case 'music':
                components.lists.push('playlist');
                components.forms.push('player-controls');
                break;
        }

        // Feature-based components
        if (intent.features.includes('search')) {
            components.forms.push('search-bar');
        }
        if (intent.features.includes('theming')) {
            components.forms.push('theme-toggle');
        }

        return components;
    }

    /**
     * Build the complete app code
     */
    buildApp(intent, components, options) {
        const template = this.templates[intent.appType] || this.templates.custom;
        const styles = this.stylePresets[intent.stylePreference];

        // Generate HTML
        const html = this.generateHTML(intent, components, template);
        
        // Generate CSS
        const css = this.generateCSS(intent, styles, components);
        
        // Generate JavaScript
        const js = this.generateJS(intent, components);

        return {
            html: html,
            css: css,
            js: js,
            combined: this.combineCode(html, css, js)
        };
    }

    /**
     * Generate HTML structure
     */
    generateHTML(intent, components, template) {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.generateTitle(intent)}</title>
    <style id="app-styles">
        /* Styles will be injected here */
    </style>
</head>
<body>
    ${components.header ? this.componentLibrary.header(intent) : ''}
    
    ${components.navigation ? this.componentLibrary.navigation(intent) : ''}
    
    <main class="main-content">
        ${template.body || this.generateMainContent(intent, components)}
    </main>
    
    ${components.footer ? this.componentLibrary.footer(intent) : ''}
    
    <script>
        /* App logic will be injected here */
    </script>
</body>
</html>`;
        
        return html;
    }

    /**
     * Generate CSS styles
     */
    generateCSS(intent, stylePreset, components) {
        return `
/* VibeCoder Generated App - ${intent.purpose} */
/* Style: ${intent.stylePreference} */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${stylePreset.fontFamily};
    background: ${stylePreset.backgroundColor};
    color: ${stylePreset.textColor};
    line-height: 1.6;
    min-height: 100vh;
}

.main-content {
    max-width: ${stylePreset.maxWidth};
    margin: 0 auto;
    padding: ${stylePreset.padding};
}

header {
    background: ${stylePreset.headerBg};
    color: ${stylePreset.headerColor};
    padding: 1.5rem;
    text-align: center;
    box-shadow: ${stylePreset.shadow};
}

h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

button {
    background: ${stylePreset.primaryColor};
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: ${stylePreset.borderRadius};
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
}

button:hover {
    background: ${stylePreset.primaryColorHover};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid ${stylePreset.borderColor};
    border-radius: ${stylePreset.borderRadius};
    font-size: 1rem;
    font-family: inherit;
    background: ${stylePreset.inputBg};
    color: ${stylePreset.textColor};
    transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
    outline: none;
    border-color: ${stylePreset.primaryColor};
}

.card {
    background: ${stylePreset.cardBg};
    padding: 1.5rem;
    border-radius: ${stylePreset.borderRadius};
    box-shadow: ${stylePreset.shadow};
    margin-bottom: 1rem;
}

${this.generateResponsiveCSS(stylePreset)}
`;
    }

    /**
     * Generate JavaScript logic
     */
    generateJS(intent, components) {
        const appClass = this.generateAppClass(intent, components);
        
        return `
// VibeCoder Generated App - ${intent.purpose}
// Generated: ${new Date().toISOString()}

${appClass}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new ${this.getAppClassName(intent)}();
    app.init();
});
`;
    }

    /**
     * Generate app-specific class
     */
    generateAppClass(intent, components) {
        switch(intent.appType) {
            case 'todo':
                return this.generateTodoApp(components);
            case 'calculator':
                return this.generateCalculatorApp(components);
            case 'notes':
                return this.generateNotesApp(components);
            case 'timer':
                return this.generateTimerApp(components);
            default:
                return this.generateGenericApp(intent, components);
        }
    }

    /**
     * Generate Todo App
     */
    generateTodoApp(components) {
        return `
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const form = document.getElementById('task-form');
        const input = document.getElementById('task-input');
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask(input.value);
            input.value = '';
        });
    }

    addTask(text) {
        if (!text.trim()) return;
        
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.save();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    render() {
        const container = document.getElementById('task-list');
        if (!container) return;
        
        if (this.tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">No tasks yet. Add one above! 🎯</p>';
            return;
        }
        
        container.innerHTML = this.tasks.map(task => \`
            <div class="task-item \${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    \${task.completed ? 'checked' : ''} 
                    onchange="app.toggleTask(\${task.id})"
                >
                <span class="task-text">\${task.text}</span>
                <button class="delete-btn" onclick="app.deleteTask(\${task.id})">🗑️</button>
            </div>
        \`).join('');
    }
}

// Make app accessible globally
let app;
`;
    }

    /**
     * Generate Calculator App
     */
    generateCalculatorApp(components) {
        return `
class CalculatorApp {
    constructor() {
        this.display = '';
        this.previousValue = null;
        this.operation = null;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addNumber(btn.dataset.value));
        });

        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setOperation(btn.dataset.operation));
        });

        document.getElementById('equals-btn')?.addEventListener('click', () => this.calculate());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clear());
    }

    addNumber(num) {
        this.display += num;
        this.updateDisplay();
    }

    setOperation(op) {
        if (this.display) {
            this.previousValue = parseFloat(this.display);
            this.operation = op;
            this.display = '';
        }
    }

    calculate() {
        if (this.previousValue !== null && this.operation && this.display) {
            const current = parseFloat(this.display);
            let result;

            switch(this.operation) {
                case '+': result = this.previousValue + current; break;
                case '-': result = this.previousValue - current; break;
                case '*': result = this.previousValue * current; break;
                case '/': result = this.previousValue / current; break;
                default: return;
            }

            this.display = result.toString();
            this.previousValue = null;
            this.operation = null;
            this.updateDisplay();
        }
    }

    clear() {
        this.display = '';
        this.previousValue = null;
        this.operation = null;
        this.updateDisplay();
    }

    updateDisplay() {
        const displayEl = document.getElementById('calculator-display');
        if (displayEl) {
            displayEl.textContent = this.display || '0';
        }
    }
}
`;
    }

    /**
     * Generate Notes App
     */
    generateNotesApp(components) {
        return `
class NotesApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentNote = null;
    }

    init() {
        this.setupEventListeners();
        this.renderNotesList();
    }

    setupEventListeners() {
        document.getElementById('new-note-btn')?.addEventListener('click', () => this.createNote());
        document.getElementById('save-note-btn')?.addEventListener('click', () => this.saveCurrentNote());
        document.getElementById('note-content')?.addEventListener('input', (e) => {
            if (this.currentNote) {
                this.currentNote.content = e.target.value;
            }
        });
    }

    createNote() {
        const note = {
            id: Date.now(),
            title: 'New Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.currentNote = note;
        this.save();
        this.renderNotesList();
        this.renderNoteEditor();
    }

    selectNote(id) {
        this.currentNote = this.notes.find(n => n.id === id);
        this.renderNoteEditor();
    }

    saveCurrentNote() {
        if (this.currentNote) {
            this.currentNote.updatedAt = new Date().toISOString();
            this.save();
            this.showNotification('Note saved! ✓');
        }
    }

    deleteNote(id) {
        if (confirm('Delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== id);
            if (this.currentNote?.id === id) {
                this.currentNote = null;
            }
            this.save();
            this.renderNotesList();
            this.renderNoteEditor();
        }
    }

    save() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    renderNotesList() {
        const container = document.getElementById('notes-list');
        if (!container) return;

        if (this.notes.length === 0) {
            container.innerHTML = '<p class="empty-state">No notes yet. Create one! 📝</p>';
            return;
        }

        container.innerHTML = this.notes.map(note => \`
            <div class="note-item \${this.currentNote?.id === note.id ? 'active' : ''}" 
                 onclick="app.selectNote(\${note.id})">
                <h3>\${note.title || 'Untitled'}</h3>
                <p>\${note.content.substring(0, 50)}...</p>
                <small>\${new Date(note.updatedAt).toLocaleDateString()}</small>
                <button class="delete-btn" onclick="event.stopPropagation(); app.deleteNote(\${note.id})">🗑️</button>
            </div>
        \`).join('');
    }

    renderNoteEditor() {
        const editor = document.getElementById('note-content');
        if (editor) {
            editor.value = this.currentNote?.content || '';
            editor.disabled = !this.currentNote;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 2000);
    }
}

let app;
`;
    }

    /**
     * Generate Timer App
     */
    generateTimerApp(components) {
        return `
class TimerApp {
    constructor() {
        this.seconds = 0;
        this.interval = null;
        this.isRunning = false;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        document.getElementById('start-btn')?.addEventListener('click', () => this.start());
        document.getElementById('pause-btn')?.addEventListener('click', () => this.pause());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => {
                this.seconds++;
                this.updateDisplay();
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset() {
        this.pause();
        this.seconds = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        const hours = Math.floor(this.seconds / 3600);
        const minutes = Math.floor((this.seconds % 3600) / 60);
        const secs = this.seconds % 60;

        const display = document.getElementById('timer-display');
        if (display) {
            display.textContent = \`\${this.pad(hours)}:\${this.pad(minutes)}:\${this.pad(secs)}\`;
        }
    }

    pad(num) {
        return num.toString().padStart(2, '0');
    }
}
`;
    }

    /**
     * Generate generic app template
     */
    generateGenericApp(intent, components) {
        return `
class CustomApp {
    constructor() {
        this.data = {};
    }

    init() {
        console.log('${intent.purpose} initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add your event listeners here
    }

    // Add your custom methods here
}
`;
    }

    /**
     * Initialize templates for different app types
     */
    initTemplates() {
        return {
            todo: {
                body: `
                    <div class="app-container">
                        <div class="card">
                            <h2>Add a Task</h2>
                            <form id="task-form">
                                <input type="text" id="task-input" placeholder="What needs to be done?" />
                                <button type="submit">Add Task ➕</button>
                            </form>
                        </div>
                        <div id="task-list" class="task-list"></div>
                    </div>
                `
            },
            calculator: {
                body: `
                    <div class="calculator">
                        <div id="calculator-display" class="display">0</div>
                        <div class="calculator-buttons">
                            ${[7,8,9,4,5,6,1,2,3,0].map(n => 
                                `<button class="number-btn" data-value="${n}">${n}</button>`
                            ).join('')}
                            <button class="operation-btn" data-operation="+">+</button>
                            <button class="operation-btn" data-operation="-">-</button>
                            <button class="operation-btn" data-operation="*">×</button>
                            <button class="operation-btn" data-operation="/">÷</button>
                            <button id="equals-btn">=</button>
                            <button id="clear-btn">C</button>
                        </div>
                    </div>
                `
            },
            notes: {
                body: `
                    <div class="notes-app">
                        <aside class="sidebar">
                            <button id="new-note-btn">New Note ➕</button>
                            <div id="notes-list"></div>
                        </aside>
                        <main class="editor-area">
                            <button id="save-note-btn">Save 💾</button>
                            <textarea id="note-content" placeholder="Start typing your note..."></textarea>
                        </main>
                    </div>
                `
            },
            timer: {
                body: `
                    <div class="timer-container">
                        <div id="timer-display" class="timer-display">00:00:00</div>
                        <div class="timer-controls">
                            <button id="start-btn">Start ▶️</button>
                            <button id="pause-btn">Pause ⏸️</button>
                            <button id="reset-btn">Reset 🔄</button>
                        </div>
                    </div>
                `
            },
            custom: {
                body: `
                    <div class="app-container">
                        <h2>Your Custom App</h2>
                        <p>This is a template for your custom application.</p>
                        <p>Edit the code to add your features!</p>
                    </div>
                `
            }
        };
    }

    /**
     * Initialize component library
     */
    initComponentLibrary() {
        return {
            header: (intent) => `
                <header>
                    <h1>${this.generateTitle(intent)}</h1>
                    <p>${intent.purpose}</p>
                </header>
            `,
            navigation: (intent) => `
                <nav class="navigation">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </nav>
            `,
            footer: (intent) => `
                <footer>
                    <p>Built with ❤️ using VibeCoder | ${new Date().getFullYear()}</p>
                </footer>
            `
        };
    }

    /**
     * Initialize style presets
     */
    initStylePresets() {
        return {
            minimal: {
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: '#ffffff',
                textColor: '#000000',
                headerBg: '#f5f5f5',
                headerColor: '#000000',
                primaryColor: '#000000',
                primaryColorHover: '#333333',
                borderColor: '#e0e0e0',
                inputBg: '#ffffff',
                cardBg: '#ffffff',
                borderRadius: '4px',
                shadow: '0 2px 4px rgba(0,0,0,0.1)',
                maxWidth: '800px',
                padding: '2rem'
            },
            urban: {
                fontFamily: "'Bebas Neue', 'Montserrat', sans-serif",
                backgroundColor: '#1a1a2e',
                textColor: '#ffffff',
                headerBg: 'linear-gradient(135deg, #9d4edd, #00ffff)',
                headerColor: '#ffffff',
                primaryColor: '#b026ff',
                primaryColorHover: '#9d4edd',
                borderColor: '#9d4edd',
                inputBg: '#16213e',
                cardBg: 'rgba(157, 78, 221, 0.1)',
                borderRadius: '12px',
                shadow: '0 8px 32px rgba(157, 78, 221, 0.3)',
                maxWidth: '1200px',
                padding: '2rem'
            },
            professional: {
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                backgroundColor: '#f8f9fa',
                textColor: '#212529',
                headerBg: '#0d6efd',
                headerColor: '#ffffff',
                primaryColor: '#0d6efd',
                primaryColorHover: '#0b5ed7',
                borderColor: '#dee2e6',
                inputBg: '#ffffff',
                cardBg: '#ffffff',
                borderRadius: '8px',
                shadow: '0 4px 6px rgba(0,0,0,0.1)',
                maxWidth: '1000px',
                padding: '2rem'
            },
            colorful: {
                fontFamily: "'Poppins', 'Comic Sans MS', sans-serif",
                backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textColor: '#ffffff',
                headerBg: 'rgba(255,255,255,0.1)',
                headerColor: '#ffffff',
                primaryColor: '#ff006e',
                primaryColorHover: '#d90058',
                borderColor: 'rgba(255,255,255,0.3)',
                inputBg: 'rgba(255,255,255,0.1)',
                cardBg: 'rgba(255,255,255,0.15)',
                borderRadius: '20px',
                shadow: '0 8px 32px rgba(0,0,0,0.1)',
                maxWidth: '900px',
                padding: '2rem'
            },
            modern: {
                fontFamily: "'Inter', -apple-system, sans-serif",
                backgroundColor: '#0f172a',
                textColor: '#e2e8f0',
                headerBg: '#1e293b',
                headerColor: '#f1f5f9',
                primaryColor: '#3b82f6',
                primaryColorHover: '#2563eb',
                borderColor: '#334155',
                inputBg: '#1e293b',
                cardBg: '#1e293b',
                borderRadius: '8px',
                shadow: '0 4px 6px rgba(0,0,0,0.3)',
                maxWidth: '1000px',
                padding: '2rem'
            }
        };
    }

    /**
     * Initialize feature detectors
     */
    initFeatureDetectors() {
        return {
            persistence: (desc) => desc.includes('save') || desc.includes('store'),
            search: (desc) => desc.includes('search') || desc.includes('find'),
            sorting: (desc) => desc.includes('sort') || desc.includes('filter'),
            theming: (desc) => desc.includes('theme') || desc.includes('dark mode'),
            notifications: (desc) => desc.includes('notify') || desc.includes('alert')
        };
    }

    /**
     * Helper methods
     */
    generateTitle(intent) {
        const titles = {
            todo: 'My Task Manager',
            calculator: 'Calculator',
            portfolio: 'My Portfolio',
            blog: 'My Blog',
            timer: 'Timer App',
            notes: 'My Notes',
            music: 'Music Player',
            weather: 'Weather App',
            game: 'Game',
            chat: 'Chat App'
        };
        return titles[intent.appType] || 'My App';
    }

    getAppClassName(intent) {
        const names = {
            todo: 'TodoApp',
            calculator: 'CalculatorApp',
            notes: 'NotesApp',
            timer: 'TimerApp'
        };
        return names[intent.appType] || 'CustomApp';
    }

    generateMainContent(intent, components) {
        return '<div class="app-container"><p>Custom content will be generated here</p></div>';
    }

    generateResponsiveCSS(stylePreset) {
        return `
/* Responsive Design */
@media (max-width: 768px) {
    .main-content {
        padding: 1rem;
    }
    
    h1 {
        font-size: 1.5rem;
    }
    
    button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
}
`;
    }

    combineCode(html, css, js) {
        return html
            .replace('/* Styles will be injected here */', css)
            .replace('/* App logic will be injected here */', js);
    }

    generatePreviewURL(code) {
        // Create a data URL for preview
        const blob = new Blob([code.combined], { type: 'text/html' });
        return URL.createObjectURL(blob);
    }

    calculateConfidence(intent, components) {
        // Calculate confidence based on recognized patterns
        let confidence = 0.5;
        
        if (intent.appType !== 'custom') confidence += 0.3;
        if (intent.features.length > 0) confidence += 0.1;
        if (intent.stylePreference !== 'modern') confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppGenerationEngine;
}
