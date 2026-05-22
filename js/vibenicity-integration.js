/**
 * VIBENICITY API Generator - Integration Snippet
 * 
 * Add this to your index.html around line 4045 (inside sendMessage function)
 * Or include this file after claude-api-generator.js
 */

// ═══════════════════════════════════════════════════════════════
// INTEGRATION INTO VIBENICITY
// ═══════════════════════════════════════════════════════════════

/**
 * Hook into the existing sendMessage flow
 * Place this check early in your sendMessage() function
 */
async function handleAPIGeneratorRequest(userMessage) {
    // Check if this is an API generation request
    if (!isAPIRequest(userMessage)) {
        return null; // Not an API request, continue normal flow
    }

    // Show loading state
    showAPIGeneratorLoading();

    try {
        // Initialize generator with API key (get from settings or prompt user)
        const apiKey = getClaudeApiKey();
        
        if (!apiKey) {
            return showAPIKeyPrompt();
        }

        ClaudeAPIGenerator.init(apiKey);

        // Generate the API
        const result = await ClaudeAPIGenerator.generate(userMessage);

        if (result.success) {
            // Display the result
            displayAPIGeneratorResult(result);
        } else {
            displayAPIGeneratorError(result.errors);
        }

        return result;

    } catch (error) {
        console.error('API Generator error:', error);
        displayAPIGeneratorError([error.message]);
        return { success: false, error: error.message };
    }
}

/**
 * Get Claude API key from localStorage or settings
 */
function getClaudeApiKey() {
    // Check localStorage first
    let key = localStorage.getItem('vibenicity_claude_api_key');
    
    // If not found, check if there's a settings object
    if (!key && window.vibenicitySettings?.claudeApiKey) {
        key = window.vibenicitySettings.claudeApiKey;
    }
    
    return key;
}

/**
 * Show prompt for API key input
 */
function showAPIKeyPrompt() {
    const modal = document.createElement('div');
    modal.className = 'vibe-modal api-key-modal';
    modal.innerHTML = `
        <div class="vibe-modal-content">
            <h3>🔑 Claude API Key Required</h3>
            <p>To generate APIs, enter your Claude API key from <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a></p>
            <input type="password" id="claude-api-key-input" placeholder="sk-ant-..." />
            <div class="vibe-modal-actions">
                <button onclick="this.closest('.vibe-modal').remove()" class="btn-secondary">Cancel</button>
                <button onclick="saveClaudeApiKey()" class="btn-primary">Save & Continue</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Save Claude API key
 */
function saveClaudeApiKey() {
    const input = document.getElementById('claude-api-key-input');
    const key = input?.value?.trim();
    
    if (key && key.startsWith('sk-')) {
        localStorage.setItem('vibenicity_claude_api_key', key);
        document.querySelector('.api-key-modal')?.remove();
        
        // Retry the last message
        if (window.lastAPIRequestMessage) {
            handleAPIGeneratorRequest(window.lastAPIRequestMessage);
        }
    } else {
        alert('Please enter a valid Claude API key');
    }
}

/**
 * Show loading state
 */
function showAPIGeneratorLoading() {
    const loadingHTML = `
        <div class="api-generator-loading" id="api-gen-loading">
            <div class="loading-spinner"></div>
            <div class="loading-stages">
                <div class="stage active" data-stage="parse">🧠 Parsing intent...</div>
                <div class="stage" data-stage="schema">📊 Extracting schema...</div>
                <div class="stage" data-stage="generate">💻 Generating code...</div>
                <div class="stage" data-stage="package">📦 Packaging files...</div>
            </div>
        </div>
    `;
    
    // Insert into chat area or designated container
    const container = document.querySelector('.chat-messages') || document.querySelector('#chat-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', loadingHTML);
        container.scrollTop = container.scrollHeight;
    }
}

/**
 * Update loading stage
 */
function updateAPIGeneratorStage(stage) {
    const stages = document.querySelectorAll('.api-generator-loading .stage');
    let found = false;
    
    stages.forEach(el => {
        if (found) {
            el.classList.remove('active', 'complete');
        } else if (el.dataset.stage === stage) {
            el.classList.add('active');
            el.classList.remove('complete');
            found = true;
        } else {
            el.classList.remove('active');
            el.classList.add('complete');
        }
    });
}

/**
 * Display generation result
 */
function displayAPIGeneratorResult(result) {
    // Remove loading
    document.getElementById('api-gen-loading')?.remove();
    
    const { schema, files, endpoints, stats } = result;
    const fileCount = Object.keys(files).length;
    const duration = (stats.duration / 1000).toFixed(2);

    const resultHTML = `
        <div class="api-generator-result">
            <div class="result-header">
                <h3>🚀 API Generated Successfully!</h3>
                <span class="result-stats">${fileCount} files • ${endpoints.length} endpoints • ${duration}s</span>
            </div>
            
            <div class="result-summary">
                <h4>${schema.apiName || 'Generated API'}</h4>
                <p>${schema.description || ''}</p>
            </div>

            <div class="result-entities">
                <h5>📦 Entities</h5>
                <div class="entity-tags">
                    ${schema.entities.map(e => `<span class="entity-tag">${e.name}</span>`).join('')}
                </div>
            </div>

            <div class="result-endpoints">
                <h5>🔗 Endpoints</h5>
                <div class="endpoints-list">
                    ${endpoints.slice(0, 8).map(ep => `
                        <div class="endpoint">
                            <span class="method method-${ep.method.toLowerCase()}">${ep.method}</span>
                            <code>${ep.path}</code>
                        </div>
                    `).join('')}
                    ${endpoints.length > 8 ? `<div class="more-endpoints">+${endpoints.length - 8} more</div>` : ''}
                </div>
            </div>

            <div class="result-files">
                <h5>📁 Files</h5>
                <div class="file-tree">
                    ${generateFileTree(files)}
                </div>
            </div>

            <div class="result-actions">
                <button onclick="downloadGeneratedAPI()" class="btn-primary">
                    📥 Download ZIP
                </button>
                <button onclick="previewGeneratedFile('README.md')" class="btn-secondary">
                    📖 View README
                </button>
                <button onclick="showDeployOptions()" class="btn-secondary">
                    🚀 Deploy
                </button>
            </div>
        </div>
    `;

    // Store result for download
    window.lastGeneratedAPI = result;

    // Insert into chat
    const container = document.querySelector('.chat-messages') || document.querySelector('#chat-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', resultHTML);
        container.scrollTop = container.scrollHeight;
    }
}

/**
 * Generate file tree HTML
 */
function generateFileTree(files) {
    const tree = {};
    
    // Build tree structure
    Object.keys(files).forEach(path => {
        const parts = path.split('/');
        let current = tree;
        
        parts.forEach((part, i) => {
            if (i === parts.length - 1) {
                current[part] = null; // File
            } else {
                current[part] = current[part] || {};
                current = current[part];
            }
        });
    });

    // Render tree
    function renderTree(obj, indent = 0) {
        let html = '';
        const entries = Object.entries(obj).sort((a, b) => {
            // Folders first
            const aIsFolder = a[1] !== null;
            const bIsFolder = b[1] !== null;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a[0].localeCompare(b[0]);
        });

        entries.forEach(([name, value]) => {
            const isFolder = value !== null;
            const icon = isFolder ? '📁' : getFileIcon(name);
            const pad = '  '.repeat(indent);
            
            html += `<div class="tree-item" style="padding-left: ${indent * 16}px">
                <span class="tree-icon">${icon}</span>
                <span class="tree-name ${isFolder ? 'folder' : 'file'}" 
                      ${!isFolder ? `onclick="previewGeneratedFile('${name}')"` : ''}>
                    ${name}
                </span>
            </div>`;
            
            if (isFolder) {
                html += renderTree(value, indent + 1);
            }
        });
        
        return html;
    }

    return renderTree(tree);
}

/**
 * Get file icon based on extension
 */
function getFileIcon(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons = {
        js: '📜', json: '📋', md: '📝', prisma: '💎',
        env: '⚙️', gitignore: '🔒', dockerfile: '🐳'
    };
    return icons[ext] || '📄';
}

/**
 * Download generated API as ZIP
 */
async function downloadGeneratedAPI() {
    if (!window.lastGeneratedAPI?.files) {
        alert('No API to download');
        return;
    }

    try {
        // Load JSZip if not available
        if (typeof JSZip === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
        }

        const { schema, files } = window.lastGeneratedAPI;
        const filename = `${schema.apiName || 'vibenicity-api'}.zip`;
        
        await ClaudeAPIGenerator.createZip(files, filename);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to create ZIP: ' + error.message);
    }
}

/**
 * Preview a generated file
 */
function previewGeneratedFile(filename) {
    if (!window.lastGeneratedAPI?.files) return;

    // Find file by name (search all paths)
    const files = window.lastGeneratedAPI.files;
    const matchingPath = Object.keys(files).find(p => p.endsWith(filename));
    
    if (!matchingPath) {
        alert('File not found: ' + filename);
        return;
    }

    const content = files[matchingPath];
    
    const modal = document.createElement('div');
    modal.className = 'vibe-modal file-preview-modal';
    modal.innerHTML = `
        <div class="vibe-modal-content large">
            <div class="modal-header">
                <h3>${getFileIcon(filename)} ${matchingPath}</h3>
                <button onclick="this.closest('.vibe-modal').remove()" class="close-btn">×</button>
            </div>
            <pre class="code-preview"><code>${escapeHtml(content)}</code></pre>
            <div class="modal-footer">
                <button onclick="copyFileContent('${matchingPath}')" class="btn-secondary">📋 Copy</button>
                <button onclick="this.closest('.vibe-modal').remove()" class="btn-primary">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Copy file content to clipboard
 */
function copyFileContent(path) {
    const content = window.lastGeneratedAPI?.files?.[path];
    if (content) {
        navigator.clipboard.writeText(content);
        alert('Copied to clipboard!');
    }
}

/**
 * Show deployment options
 */
function showDeployOptions() {
    const { deployConfig } = window.lastGeneratedAPI || {};
    if (!deployConfig) return;

    const modal = document.createElement('div');
    modal.className = 'vibe-modal deploy-modal';
    modal.innerHTML = `
        <div class="vibe-modal-content">
            <h3>🚀 Deploy Your API</h3>
            
            <div class="deploy-option" onclick="showDeployInstructions('railway')">
                <div class="deploy-icon">🚂</div>
                <div class="deploy-info">
                    <h4>Railway</h4>
                    <p>One-click deploy with automatic HTTPS</p>
                </div>
            </div>

            <div class="deploy-option" onclick="showDeployInstructions('render')">
                <div class="deploy-icon">🎨</div>
                <div class="deploy-info">
                    <h4>Render</h4>
                    <p>Free tier available, easy setup</p>
                </div>
            </div>

            <div class="deploy-option" onclick="showDeployInstructions('docker')">
                <div class="deploy-icon">🐳</div>
                <div class="deploy-info">
                    <h4>Docker</h4>
                    <p>Self-host anywhere</p>
                </div>
            </div>

            <button onclick="this.closest('.vibe-modal').remove()" class="btn-secondary" style="margin-top: 16px; width: 100%;">
                Cancel
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Show deployment instructions
 */
function showDeployInstructions(platform) {
    document.querySelector('.deploy-modal')?.remove();
    
    const instructions = {
        railway: `
## Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Or use Railway CLI:

\`\`\`bash
npm install -g @railway/cli
railway login
railway init
railway up
\`\`\`

Railway will auto-detect Node.js and set up your database.
        `,
        render: `
## Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Render will auto-detect settings

Or create \`render.yaml\` in your project root (included in ZIP).
        `,
        docker: `
## Deploy with Docker

A Dockerfile is included. Build and run:

\`\`\`bash
docker build -t my-api .
docker run -p 3000:3000 -e DATABASE_URL="file:./data.db" my-api
\`\`\`

Or use docker-compose:

\`\`\`bash
docker-compose up -d
\`\`\`
        `
    };

    const modal = document.createElement('div');
    modal.className = 'vibe-modal';
    modal.innerHTML = `
        <div class="vibe-modal-content">
            <div class="markdown-content">${marked ? marked.parse(instructions[platform]) : instructions[platform]}</div>
            <button onclick="this.closest('.vibe-modal').remove()" class="btn-primary" style="margin-top: 16px;">
                Got it!
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Display error
 */
function displayAPIGeneratorError(errors) {
    document.getElementById('api-gen-loading')?.remove();
    
    const errorHTML = `
        <div class="api-generator-error">
            <h4>❌ Generation Failed</h4>
            <ul>
                ${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
            </ul>
            <p>Try rephrasing your request or check your API key.</p>
        </div>
    `;

    const container = document.querySelector('.chat-messages') || document.querySelector('#chat-container');
    if (container) {
        container.insertAdjacentHTML('beforeend', errorHTML);
    }
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Utility: Load external script
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ═══════════════════════════════════════════════════════════════
// EXAMPLE SENDMESSAGE INTEGRATION
// ═══════════════════════════════════════════════════════════════

/*
 * Add this to your existing sendMessage() function around line 4045:
 *
 * async function sendMessage() {
 *     const input = document.getElementById('userInput').value.trim();
 *     if (!input) return;
 *     
 *     // ⬇️ ADD THIS BLOCK ⬇️
 *     if (isAPIRequest(input)) {
 *         window.lastAPIRequestMessage = input;
 *         const result = await handleAPIGeneratorRequest(input);
 *         if (result) return; // Handled by API generator
 *     }
 *     // ⬆️ END BLOCK ⬆️
 *     
 *     // ... rest of your existing sendMessage code
 * }
 */
