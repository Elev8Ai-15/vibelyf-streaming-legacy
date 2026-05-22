/**
 * VibeCoder App Builder UI Controller
 * Manages the user interface and connects the language processor with the generation engine
 */

class AppBuilderUI {
    constructor() {
        this.languageProcessor = new AdvancedLanguageProcessor();
        this.generationEngine = new AppGenerationEngine(this.languageProcessor);
        this.currentGeneration = null;
        this.currentCodeTab = 'html';
        
        this.init();
    }

    init() {
        console.log('🎨 VibeCoder App Builder initialized');
        this.setupExamples();
    }

    setupExamples() {
        this.examples = {
            todo: "Yo, I need a todo app that be tracking my daily tasks. Make it look vibey and urban with that dark mode aesthetic. Users finna add, delete, and check off tasks. Save everything to localStorage so it don't disappear when they close the browser. Keep it simple but fire. 🔥",
            
            calculator: "yo make me a calculator that's clean and easy to use. Just basic math - add, subtract, multiply, divide. Make it look modern and professional, not too flashy. Numbers should be big and easy to see. Include a clear button too.",
            
            notes: "finna build a notes app where I can save my thoughts and ideas. Need a sidebar that shows all my notes, and when I click one it opens in the editor. Should be able to create new notes, save them, and delete old ones. Keep it minimal but functional. Dark theme would be dope.",
            
            timer: "I be needing a timer for my workouts. Should have start, pause, and reset buttons. Display should show hours, minutes, and seconds. Make it big and colorful so I can see it from across the room. Simple controls, nothing complicated."
        };
    }
}

// Global instance
let appBuilder;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    appBuilder = new AppBuilderUI();
});

/**
 * Use example description
 */
function useExample(type) {
    const textarea = document.getElementById('app-description');
    if (textarea && appBuilder.examples[type]) {
        textarea.value = appBuilder.examples[type];
        textarea.focus();
        
        // Show a little animation
        textarea.style.borderColor = '#b026ff';
        setTimeout(() => {
            textarea.style.borderColor = '';
        }, 500);
    }
}

/**
 * Clear input
 */
function clearInput() {
    const textarea = document.getElementById('app-description');
    if (textarea) {
        textarea.value = '';
        textarea.focus();
    }
    
    // Hide generated section
    document.getElementById('generated-section').classList.add('hidden');
    
    // Reset processing info
    document.getElementById('processing-info').innerHTML = `
        <div class="text-gray-400 text-center py-12">
            <i class="fas fa-lightbulb text-5xl text-purple-400 mb-4"></i>
            <p>Describe your app to see the AI analysis...</p>
        </div>
    `;
}

/**
 * Main generation function
 */
async function generateApp() {
    const textarea = document.getElementById('app-description');
    const description = textarea.value.trim();
    
    if (!description) {
        showNotification('Please describe your app first! 💭', 'warning');
        textarea.focus();
        return;
    }

    // Get style preference
    const styleRadio = document.querySelector('input[name="style"]:checked');
    const stylePreference = styleRadio ? styleRadio.value : 'urban';

    // Show loading
    showLoading(true);

    try {
        // Small delay for effect
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate the app
        const result = await appBuilder.generationEngine.generateApp(description, {
            stylePreference: stylePreference
        });

        console.log('Generated app:', result);

        // Store current generation
        appBuilder.currentGeneration = result;

        // Show processing info
        displayProcessingInfo(result);

        // Show generated code
        displayGeneratedCode(result);

        // Show live preview
        updateLivePreview(result);

        // Show the generated section
        document.getElementById('generated-section').classList.remove('hidden');

        // Scroll to results
        document.getElementById('generated-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });

        showNotification('App generated successfully! 🎉', 'success');

    } catch (error) {
        console.error('Generation error:', error);
        showNotification('Error generating app. Please try again. 😕', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Display processing info
 */
function displayProcessingInfo(result) {
    const container = document.getElementById('processing-info');
    
    let html = '';

    // Original vs Processed
    if (result.originalDescription !== result.processedDescription) {
        html += `
            <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-purple-500 border-opacity-30">
                <h4 class="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-language"></i>
                    AAVE Translation
                </h4>
                <p class="text-sm text-gray-300 mb-2">
                    <strong>Original:</strong> "${result.originalDescription.substring(0, 100)}..."
                </p>
                <p class="text-sm text-cyan-300">
                    <strong>Processed:</strong> "${result.processedDescription.substring(0, 100)}..."
                </p>
            </div>
        `;
    }

    // AAVE Features Detected
    if (result.aaveFeatures && result.aaveFeatures.length > 0) {
        html += `
            <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-cyan-500 border-opacity-30">
                <h4 class="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-check-circle"></i>
                    AAVE Features Detected
                </h4>
                <div class="flex flex-wrap gap-2">
                    ${result.aaveFeatures.slice(0, 5).map(feature => `
                        <span class="feature-badge px-3 py-1 rounded-full text-xs">
                            ${feature.feature.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // App Type & Purpose
    html += `
        <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-green-500 border-opacity-30">
            <h4 class="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <i class="fas fa-bullseye"></i>
                Detected App Type
            </h4>
            <p class="text-lg font-bold text-white capitalize">${result.detectedIntent.appType}</p>
            <p class="text-sm text-gray-300 mt-1">${result.detectedIntent.purpose}</p>
            <div class="mt-3 flex items-center gap-2">
                <span class="text-xs text-gray-400">Confidence:</span>
                <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-green-500 to-cyan-500" 
                         style="width: ${result.confidence * 100}%"></div>
                </div>
                <span class="text-xs font-semibold text-green-400">${Math.round(result.confidence * 100)}%</span>
            </div>
        </div>
    `;

    // Features Detected
    if (result.detectedIntent.features.length > 0) {
        html += `
            <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-yellow-500 border-opacity-30">
                <h4 class="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-star"></i>
                    Features Included
                </h4>
                <div class="flex flex-wrap gap-2">
                    ${result.detectedIntent.features.map(feature => `
                        <span class="px-3 py-1 bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-40 rounded-full text-xs text-yellow-300">
                            ${feature.toUpperCase()}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Style & Complexity
    html += `
        <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-pink-500 border-opacity-30">
            <h4 class="font-semibold text-pink-400 mb-2 flex items-center gap-2">
                <i class="fas fa-palette"></i>
                Style & Complexity
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span class="text-gray-400">Style:</span>
                    <span class="text-white font-semibold capitalize ml-2">${result.detectedIntent.stylePreference}</span>
                </div>
                <div>
                    <span class="text-gray-400">Complexity:</span>
                    <span class="text-white font-semibold capitalize ml-2">${result.detectedIntent.complexity}</span>
                </div>
            </div>
        </div>
    `;

    // Components
    const componentsList = [];
    if (result.components.header) componentsList.push('Header');
    if (result.components.navigation) componentsList.push('Navigation');
    if (result.components.footer) componentsList.push('Footer');
    if (result.components.sidebar) componentsList.push('Sidebar');
    componentsList.push(...result.components.forms.map(f => f.replace(/-/g, ' ').toUpperCase()));
    componentsList.push(...result.components.lists.map(l => l.replace(/-/g, ' ').toUpperCase()));

    if (componentsList.length > 0) {
        html += `
            <div class="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-blue-500 border-opacity-30">
                <h4 class="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <i class="fas fa-puzzle-piece"></i>
                    Generated Components
                </h4>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    ${componentsList.map(comp => `
                        <div class="flex items-center gap-2">
                            <i class="fas fa-check text-green-400"></i>
                            <span class="text-gray-300">${comp}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Display generated code
 */
function displayGeneratedCode(result) {
    appBuilder.generatedCode = result.code;
    showCodeTab('html');
}

/**
 * Show specific code tab
 */
function showCodeTab(tab) {
    appBuilder.currentCodeTab = tab;
    
    const code = appBuilder.generatedCode;
    const display = document.getElementById('code-display');
    
    // Update active tab
    document.querySelectorAll('.code-tab').forEach(btn => {
        btn.classList.remove('active', 'bg-gray-800', 'border-b-2', 'border-blue-500');
        btn.classList.add('bg-gray-700', 'hover:bg-gray-600');
    });
    
    const activeTab = event?.target || document.querySelector(`button[onclick="showCodeTab('${tab}')"]`);
    if (activeTab) {
        activeTab.classList.remove('bg-gray-700', 'hover:bg-gray-600');
        activeTab.classList.add('active', 'bg-gray-800', 'border-b-2', 'border-blue-500');
    }
    
    // Update code display
    let codeContent = '';
    switch(tab) {
        case 'html':
            codeContent = code.html;
            break;
        case 'css':
            codeContent = code.css;
            break;
        case 'js':
            codeContent = code.js;
            break;
        case 'combined':
            codeContent = code.combined;
            break;
    }
    
    display.innerHTML = `<code>${escapeHtml(codeContent)}</code>`;
}

/**
 * Update live preview
 */
function updateLivePreview(result) {
    const iframe = document.getElementById('preview-frame');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    doc.open();
    doc.write(result.code.combined);
    doc.close();
}

/**
 * Copy code to clipboard
 */
function copyCode() {
    const code = appBuilder.generatedCode;
    let textToCopy = '';
    
    switch(appBuilder.currentCodeTab) {
        case 'html': textToCopy = code.html; break;
        case 'css': textToCopy = code.css; break;
        case 'js': textToCopy = code.js; break;
        case 'combined': textToCopy = code.combined; break;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('Code copied to clipboard! 📋', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showNotification('Failed to copy code 😕', 'error');
    });
}

/**
 * Open in new tab
 */
function openInNewTab() {
    const code = appBuilder.generatedCode.combined;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

/**
 * Download individual file
 */
function downloadCode(type) {
    const code = appBuilder.generatedCode;
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';
    
    switch(type) {
        case 'html':
            content = code.html;
            filename = 'index.html';
            mimeType = 'text/html';
            break;
        case 'css':
            content = code.css;
            filename = 'styles.css';
            mimeType = 'text/css';
            break;
        case 'js':
            content = code.js;
            filename = 'script.js';
            mimeType = 'application/javascript';
            break;
    }
    
    downloadFile(content, filename, mimeType);
    showNotification(`Downloaded ${filename} 💾`, 'success');
}

/**
 * Download complete project
 */
function downloadComplete() {
    const code = appBuilder.generatedCode.combined;
    downloadFile(code, 'app.html', 'text/html');
    showNotification('Downloaded complete app! 🎉', 'success');
}

/**
 * Helper: Download file
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Show loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in`;
    notification.innerHTML = `
        <i class="fas ${icons[type]} text-xl"></i>
        <span class="font-semibold">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Helper: Escape HTML for display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);
