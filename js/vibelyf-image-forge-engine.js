/**
 * VIBELYF IMAGE FORGE ENGINE
 * Advanced multi-model Gemini build engine with image support
 * Extracted from V20 Forge Edition
 * UPGRADED: May 2026 — Gemini 3.5 Flash chain (Google I/O 2026 release, 4× faster output)
 * TODO Phase 2: migrate to fal.ai router (Flux 1.1 Pro / Ideogram 3 / Recraft V4 / Nano Banana Pro)
 *                per notes/vibelyf-ai-stack-modernization-2026-05-22.md
 */

window.VibeLyfImageForge = {

    // Configuration
    config: {
        // Phase 1.H Part 2 follow-up: Image Forge now routes through the VibeLyf
        // Worker proxy (/api/llm/codegen), which holds the provider key server-side
        // and translates inline_data image parts for the model. apiKey stays empty.
        apiKey: '',
        workerBase: (typeof window !== 'undefined' && window.VIBELYF_WORKER_API) || 'https://vibelyf-api.bradgpowell1123.workers.dev',
        workingModel: null,
        currentMode: 'build' // 'build' or 'editor'
    },
    
    // State
    files: [],
    blobUrls: [],
    currentCode: '',
    
    /**
     * Initialize the Image Forge engine
     */
    init(apiKey) {
        // Worker-backed: no browser key needed. Accept (and ignore) a key for
        // backward compatibility with old callers.
        if (apiKey) this.config.apiKey = apiKey;
        console.log('🎨 Image Forge Engine initialized (Worker proxy)');
        return true;
    },

    /**
     * Set API key (legacy no-op — Worker holds the key server-side)
     */
    setApiKey(apiKey) {
        this.config.apiKey = apiKey || '';
        console.log('🎨 Image Forge: keys live on the Worker now; local key ignored');
    },

    /**
     * Check if initialized — always ready, the Worker holds the credentials.
     */
    isReady() {
        return true;
    },
    
    /**
     * Detect if user wants to build an app (with image support)
     */
    isBuildRequest(message) {
        const buildKeywords = [
            'build', 'make', 'create', 'generate', 'design', 'craft',
            'website', 'app', 'page', 'site', 'interface', 'ui',
            'landing page', 'portfolio', 'gallery', 'showcase',
            'whip up', 'cook up', 'spin up'
        ];
        
        const lowerMessage = message.toLowerCase();
        return buildKeywords.some(keyword => lowerMessage.includes(keyword));
    },
    
    /**
     * Generate app with retry logic across model chain
     */
    async generateWithRetry(prompt, files = []) {
        const results = {
            attempts: [],
            successModel: null,
            code: null,
            error: null
        };

        // Single call — the Worker owns provider selection/failover server-side.
        results.attempts.push({ model: 'worker:codegen', status: 'attempting' });
        try {
            const { code, model } = await this.callGemini('worker', prompt, files);
            this.config.workingModel = model;
            results.successModel = model;
            results.code = code;
            results.attempts[results.attempts.length - 1].status = 'success';
            console.log(`✅ Image Forge success via Worker (${model})`);
            return results;
        } catch (e) {
            console.log(`❌ Image Forge Worker call failed: ${e.message}`);
            results.attempts[results.attempts.length - 1].status = 'failed';
            results.attempts[results.attempts.length - 1].error = e.message;
        }

        results.error = 'Code generation failed.';
        throw new Error(results.error);
    },
    
    /**
     * Call Gemini API with specific model
     */
    async callGemini(model, prompt, files = []) {
        // 🎨 LINGUISTICS V32: Detect vibe archetypes and build CSS instructions
        let vibeBlock = '';
        if (window.Linguistics && window.Linguistics.compile) {
            const vibes = window.Linguistics.compile(prompt);
            if (vibes.length > 0) {
                vibeBlock = '\n\nVIBE AESTHETIC DETECTED — MANDATORY STYLING:\n' +
                    vibes.map(v => `• ${v.key}: Apply these Tailwind classes to main elements: ${v.spec}`).join('\n') +
                    '\nThese vibe classes MUST dominate the visual design.\n';
            }
        }

        // Build the parts array
        const parts = [{
            text: `You are VibeLyf V20 Image Forge. Build a production-ready single HTML file.

REQUEST: "${prompt}"

${files.length > 0 ? 'IMAGE: User uploaded ' + files.length + ' image(s). Include <img src="placeholder.jpg"> elements - the system will inject real images.' : ''}
${vibeBlock}
REQUIREMENTS:
1. Single HTML file with inline CSS and JavaScript
2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Modern dark theme with professional design
4. Fully responsive (mobile, tablet, desktop)
5. Include smooth animations and transitions
6. Make it interactive and functional
7. Use modern JavaScript (ES6+)
8. If images are provided, use them thoughtfully in the design

STYLE GUIDELINES:
${vibeBlock ? '- FOLLOW THE VIBE AESTHETIC ABOVE as primary visual direction' : '- Dark background (#09090b, #18181b)\n- Accent color: violet/purple (#8b5cf6, #a78bfa)'}
- Clean, minimal, professional
- Smooth animations (fade, slide, scale)
- Proper spacing and typography

OUTPUT FORMAT: Only output raw HTML code. No markdown, no backticks, no explanations. Just pure HTML starting with <!DOCTYPE html>.`
        }];
        
        // Add images if provided
        if (files.length > 0) {
            for (const file of files) {
                const base64 = await this.fileToBase64(file);
                parts.push({
                    inline_data: {
                        mime_type: file.type,
                        data: base64
                    }
                });
            }
        }
        
        // Route through the Worker proxy. It accepts the Gemini-native shape
        // (including inline_data image parts, which it translates for the model)
        // and holds the provider key server-side.
        const response = await fetch(`${this.config.workerBase}/api/llm/codegen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: parts
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192
                }
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
            throw new Error(data?.error?.message || `Worker codegen error: ${response.status}`);
        }

        if (!data.data?.text) {
            throw new Error('Empty response from model');
        }

        const servedModel = data.meta?.model || 'worker';
        let code = data.data.text;
        
        // Clean up markdown formatting
        code = code.replace(/```html\n?/gi, '');
        code = code.replace(/```\n?/g, '');
        code = code.trim();
        
        // Extract HTML if wrapped in other text
        const htmlMatch = code.match(/<!DOCTYPE html>[\s\S]*<\/html>/i) || code.match(/<html[\s\S]*<\/html>/i);
        if (htmlMatch) {
            code = htmlMatch[0];
        }

        return { code, model: servedModel };
    },
    
    /**
     * Convert file to base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Create blob URLs for images
     */
    createBlobUrls(files) {
        this.blobUrls = files.map(file => URL.createObjectURL(file));
        return this.blobUrls;
    },
    
    /**
     * Inject blob URLs into generated code
     */
    injectImages(code, blobUrls) {
        if (blobUrls.length === 0) return code;
        
        let modifiedCode = code;
        
        // Replace placeholder images
        modifiedCode = modifiedCode.replace(/src="placeholder\.jpg"/gi, `src="${blobUrls[0]}"`);
        modifiedCode = modifiedCode.replace(/src="[^"]*placeholder[^"]*"/gi, `src="${blobUrls[0]}"`);
        modifiedCode = modifiedCode.replace(/src="https:\/\/via\.placeholder\.com[^"]*"/gi, `src="${blobUrls[0]}"`);
        
        return modifiedCode;
    },
    
    /**
     * Export code as ZIP
     */
    async exportAsZip(code, projectName = 'vibelyf-project') {
        if (!window.JSZip) {
            throw new Error('JSZip library not loaded');
        }
        
        const zip = new JSZip();
        
        // Add main HTML file
        zip.file('index.html', code);
        
        // Add README
        const readme = `# ${projectName}

Generated by VibeLyf Image Forge

**Generated:** ${new Date().toLocaleString()}
**Model:** ${this.config.workingModel || 'Unknown'}
**Engine:** Gemini Flash

## Usage

1. Open \`index.html\` in a web browser
2. Everything is self-contained - no build process needed!

## Features

- Single HTML file (no dependencies)
- Tailwind CSS (via CDN)
- Fully responsive design
- Modern dark theme
- Interactive and animated

---

**Powered by VibeLyf** 🎨
`;
        
        zip.file('README.md', readme);
        
        // Generate ZIP
        const blob = await zip.generateAsync({ type: 'blob' });
        
        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.zip`;
        a.click();
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        return blob;
    },
    
    /**
     * Get model chain status
     */
    getModelStatus() {
        return {
            chain: this.config.modelChain,
            working: this.config.workingModel,
            total: this.config.modelChain.length
        };
    },
    
    /**
     * Clean up blob URLs
     */
    cleanup() {
        this.blobUrls.forEach(url => URL.revokeObjectURL(url));
        this.blobUrls = [];
        this.files = [];
        this.currentCode = '';
    }
};

// Export for debugging
console.log('✅ VibeLyfImageForge loaded');
