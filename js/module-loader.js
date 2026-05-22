/**
 * Module Loader - Verifies all dependencies load correctly
 * Provides graceful degradation and user-friendly error messages
 */

class ModuleLoader {
    constructor() {
        this.requiredModules = [
            { name: 'BaseAPIService', file: 'js/base-api-service.js', critical: true },
            { name: 'AdvancedLanguageProcessor', file: 'js/advanced-language-processor.js', critical: true },
            { name: 'GeminiAPIService', file: 'js/gemini-api-service.js', critical: false },
            { name: 'ClaudeAPIService', file: 'js/claude-api-service.js', critical: false },
            { name: 'OpenAIAPIService', file: 'js/openai-api-service.js', critical: false },
            { name: 'MistralAPIService', file: 'js/mistral-api-service.js', critical: false },
            { name: 'MultiLLMOrchestrator', file: 'js/multi-llm-orchestrator.js', critical: true },
            { name: 'AppGenerationEngine', file: 'js/app-generation-engine.js', critical: true }
        ];
        
        this.loadedModules = {};
        this.failedModules = [];
        this.warnings = [];
    }

    /**
     * Check if a module/class is defined in global scope
     */
    isModuleDefined(moduleName) {
        return typeof window[moduleName] !== 'undefined';
    }

    /**
     * Verify all modules are loaded
     */
    verifyModules() {
        console.log('🔍 VibeCoder Module Loader - Verifying dependencies...');
        
        const results = {
            success: true,
            critical: [],
            optional: [],
            warnings: [],
            loaded: 0,
            total: this.requiredModules.length
        };

        for (const module of this.requiredModules) {
            const isDefined = this.isModuleDefined(module.name);
            
            if (isDefined) {
                this.loadedModules[module.name] = true;
                results.loaded++;
                console.log(`✅ ${module.name} loaded`);
            } else {
                if (module.critical) {
                    this.failedModules.push(module);
                    results.critical.push(module);
                    results.success = false;
                    console.error(`❌ CRITICAL: ${module.name} failed to load from ${module.file}`);
                } else {
                    this.warnings.push(module);
                    results.optional.push(module);
                    results.warnings.push(`⚠️ ${module.name} not available (non-critical)`);
                    console.warn(`⚠️ OPTIONAL: ${module.name} not loaded from ${module.file}`);
                }
            }
        }

        console.log(`📊 Module Load Summary: ${results.loaded}/${results.total} loaded`);
        
        return results;
    }

    /**
     * Check service health (API keys, connectivity)
     */
    async checkServiceHealth() {
        console.log('🏥 Checking service health...');
        
        const health = {
            services: {},
            readyCount: 0,
            totalCount: 0
        };

        const serviceClasses = [
            'GeminiAPIService',
            'ClaudeAPIService', 
            'OpenAIAPIService',
            'MistralAPIService'
        ];

        for (const serviceClass of serviceClasses) {
            if (!this.isModuleDefined(serviceClass)) {
                health.services[serviceClass] = {
                    loaded: false,
                    hasKey: false,
                    status: 'not_loaded'
                };
                health.totalCount++;
                continue;
            }

            try {
                const ServiceClass = window[serviceClass];
                const service = new ServiceClass();
                const hasKey = service.hasAPIKey();
                const info = service.getModelInfo();

                health.services[serviceClass] = {
                    loaded: true,
                    hasKey: hasKey,
                    status: hasKey ? 'ready' : 'missing_key',
                    info: info
                };

                if (hasKey) {
                    health.readyCount++;
                }
                health.totalCount++;

                console.log(`${hasKey ? '✅' : '⚠️'} ${serviceClass}: ${hasKey ? 'Ready' : 'Missing API key'}`);
            } catch (error) {
                health.services[serviceClass] = {
                    loaded: false,
                    hasKey: false,
                    status: 'error',
                    error: error.message
                };
                health.totalCount++;
                console.error(`❌ ${serviceClass} health check failed:`, error);
            }
        }

        console.log(`📊 Service Health: ${health.readyCount}/${health.totalCount} ready`);
        
        return health;
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(results) {
        if (results.critical.length === 0) {
            return null;
        }

        const missingModules = results.critical.map(m => m.name).join(', ');
        
        return `⚠️ Critical Error: Failed to load required modules: ${missingModules}
        
Please ensure all JavaScript files are loaded correctly:
${results.critical.map(m => `- ${m.file}`).join('\n')}

Check the browser console for more details.`;
    }

    /**
     * Get user-friendly warning message
     */
    getWarningMessage(results) {
        if (results.optional.length === 0) {
            return null;
        }

        const missingServices = results.optional.map(m => m.name).join(', ');
        
        return `⚠️ Warning: Some optional services are not available: ${missingServices}

The system will function with reduced capabilities. To enable full multi-LLM support:
${results.optional.map(m => `- Load ${m.file}`).join('\n')}
- Configure API keys in Settings`;
    }

    /**
     * Display status in UI
     */
    displayStatus(containerId = 'module-status') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const results = this.verifyModules();
        
        let html = '<div class="module-status">';
        
        if (!results.success) {
            html += `
                <div class="status-error">
                    <strong>❌ System Error</strong>
                    <p>${this.getErrorMessage(results)}</p>
                </div>
            `;
        } else if (results.warnings.length > 0) {
            html += `
                <div class="status-warning">
                    <strong>⚠️ System Warning</strong>
                    <p>${this.getWarningMessage(results)}</p>
                </div>
            `;
        } else {
            html += `
                <div class="status-success">
                    <strong>✅ All Systems Ready</strong>
                    <p>All modules loaded successfully (${results.loaded}/${results.total})</p>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Initialize with health check
     */
    async initialize() {
        console.log('🚀 VibeCoder Module Loader initializing...');
        
        // Step 1: Verify modules
        const moduleResults = this.verifyModules();
        
        // Step 2: Check service health
        const healthResults = await this.checkServiceHealth();
        
        // Step 3: Determine system status
        const systemStatus = {
            modulesOk: moduleResults.success,
            servicesReady: healthResults.readyCount,
            totalServices: healthResults.totalCount,
            ready: moduleResults.success && healthResults.readyCount > 0,
            moduleResults,
            healthResults
        };

        console.log('📊 System Status:', systemStatus);
        
        return systemStatus;
    }

    /**
     * Create diagnostic report
     */
    generateDiagnosticReport() {
        const report = {
            timestamp: new Date().toISOString(),
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                online: navigator.onLine
            },
            modules: {},
            services: {},
            localStorage: {
                available: this.checkLocalStorage()
            }
        };

        // Check each module
        for (const module of this.requiredModules) {
            report.modules[module.name] = {
                loaded: this.isModuleDefined(module.name),
                critical: module.critical,
                file: module.file
            };
        }

        // Check services
        const services = ['GeminiAPIService', 'ClaudeAPIService', 'OpenAIAPIService', 'MistralAPIService'];
        for (const serviceName of services) {
            if (this.isModuleDefined(serviceName)) {
                try {
                    const service = new window[serviceName]();
                    report.services[serviceName] = {
                        loaded: true,
                        hasKey: service.hasAPIKey(),
                        info: service.getModelInfo()
                    };
                } catch (error) {
                    report.services[serviceName] = {
                        loaded: false,
                        error: error.message
                    };
                }
            } else {
                report.services[serviceName] = {
                    loaded: false
                };
            }
        }

        return report;
    }

    /**
     * Check if localStorage is available
     */
    checkLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Export diagnostic report as JSON
     */
    exportDiagnosticReport() {
        const report = this.generateDiagnosticReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibecoder-diagnostic-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Auto-initialize on load
window.addEventListener('DOMContentLoaded', () => {
    window.moduleLoader = new ModuleLoader();
    
    // Auto-verify if in debug mode
    if (window.DEBUG_MODE || window.location.search.includes('debug=true')) {
        window.moduleLoader.initialize().then(status => {
            console.log('✅ Module Loader initialized:', status);
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}
