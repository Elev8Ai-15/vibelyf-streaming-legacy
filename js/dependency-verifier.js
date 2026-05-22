/**
 * Dependency Verifier - Ensures All Required Modules Load Correctly
 * 
 * Prevents application startup if critical dependencies are missing.
 * Shows user-friendly error messages and diagnostic information.
 * 
 * @version 2.0.0 - Updated for Hybrid Architecture
 * @date 2025-11-19
 */

class DependencyVerifier {
    constructor() {
        this.requiredModules = {
            // Core utilities
            'ErrorHandler': { type: 'class', critical: true },
            
            // Language processors (Cultural Innovation - Preserved!)
            'AdvancedLanguageProcessor': { type: 'class', critical: true },
            'EnhancedInputNormalizer': { type: 'class', critical: true },
            'CommunityLearningSystem': { type: 'class', critical: true },
            
            // Hybrid Generation Architecture (NEW - 72% code reduction)
            'GenSparkService': { type: 'class', critical: true },
            'GeminiAPIService': { type: 'class', critical: true },
            'HybridGenerationService': { type: 'class', critical: true },
            
            // UI Components
            'TranslationFeedbackUI': { type: 'class', critical: true },
            'InteractiveTutorial': { type: 'class', critical: false },
            
            // Data (Knowledge Base)
            'sociolinguisticFoundations': { type: 'object', critical: true },
            'grammaticalRules': { type: 'object', critical: true },
            'phonologyPatterns': { type: 'object', critical: true },
            'comprehensiveCulturalLanguage': { type: 'array', critical: true }
        };
        
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }
    
    /**
     * Verify all dependencies are loaded
     */
    verify() {
        console.log('🔍 Verifying dependencies...');
        
        for (const [moduleName, config] of Object.entries(this.requiredModules)) {
            const result = this.checkModule(moduleName, config);
            
            if (result.loaded) {
                this.results.passed.push(moduleName);
            } else {
                if (config.critical) {
                    this.results.failed.push({ name: moduleName, config });
                } else {
                    this.results.warnings.push({ name: moduleName, config });
                }
            }
        }
        
        return this.generateReport();
    }
    
    /**
     * Check if a specific module is loaded
     */
    checkModule(moduleName, config) {
        try {
            const module = window[moduleName];
            
            if (!module) {
                return { loaded: false, reason: 'Module not found in window scope' };
            }
            
            // Type checking
            if (config.type === 'class' && typeof module !== 'function') {
                return { loaded: false, reason: `Expected class, got ${typeof module}` };
            }
            
            if (config.type === 'object' && typeof module !== 'object') {
                return { loaded: false, reason: `Expected object, got ${typeof module}` };
            }
            
            if (config.type === 'array' && !Array.isArray(module)) {
                return { loaded: false, reason: `Expected array, got ${typeof module}` };
            }
            
            return { loaded: true };
        } catch (error) {
            return { loaded: false, reason: error.message };
        }
    }
    
    /**
     * Generate verification report
     */
    generateReport() {
        const total = Object.keys(this.requiredModules).length;
        const passed = this.results.passed.length;
        const failed = this.results.failed.length;
        const warnings = this.results.warnings.length;
        
        const report = {
            success: failed === 0,
            total,
            passed,
            failed,
            warnings,
            passRate: (passed / total * 100).toFixed(1),
            details: this.results
        };
        
        // Log results
        if (report.success) {
            console.log(`✅ All critical dependencies loaded (${passed}/${total})`);
            if (warnings > 0) {
                console.warn(`⚠️ ${warnings} optional module(s) missing:`, 
                    this.results.warnings.map(w => w.name));
            }
        } else {
            console.error(`❌ Dependency verification failed!`);
            console.error(`Missing critical modules (${failed}):`, 
                this.results.failed.map(f => f.name));
        }
        
        return report;
    }
    
    /**
     * Show error UI if verification fails
     */
    showErrorUI(report) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            ">
                <div style="
                    max-width: 600px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid #ef4444;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                ">
                    <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
                    <h1 style="color: #ef4444; font-size: 28px; margin-bottom: 16px; font-weight: 700;">
                        Application Failed to Load
                    </h1>
                    <p style="color: #f1f5f9; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Some critical modules failed to load properly. 
                        This usually happens due to network issues or incorrect file paths.
                    </p>
                    
                    <div style="
                        background: rgba(15, 23, 42, 0.5);
                        border: 1px solid #334155;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 24px;
                        text-align: left;
                    ">
                        <div style="color: #ef4444; font-weight: 600; margin-bottom: 12px;">
                            Missing Modules (${report.failed}):
                        </div>
                        <ul style="color: #94a3b8; font-size: 14px; margin: 0; padding-left: 20px;">
                            ${report.details.failed.map(f => 
                                `<li style="margin-bottom: 8px;">${f.name}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button onclick="location.reload()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            🔄 Reload Page
                        </button>
                        <button onclick="window.depVerifier.showDiagnostics()" style="
                            padding: 12px 24px;
                            background: transparent;
                            border: 2px solid #334155;
                            border-radius: 8px;
                            color: #94a3b8;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            🔍 Show Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', errorHTML);
    }
    
    /**
     * Show diagnostic information
     */
    showDiagnostics() {
        const diagnostics = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            online: navigator.onLine,
            cookiesEnabled: navigator.cookieEnabled,
            localStorage: this.checkLocalStorage(),
            windowKeys: Object.keys(window).filter(k => k.includes('Service') || k.includes('System') || k.includes('Processor')),
            loadedScripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
            errors: this.results
        };
        
        console.group('🔍 Diagnostic Information');
        console.log('User Agent:', diagnostics.userAgent);
        console.log('Platform:', diagnostics.platform);
        console.log('Online:', diagnostics.online);
        console.log('LocalStorage:', diagnostics.localStorage);
        console.log('Loaded Scripts:', diagnostics.loadedScripts.length);
        console.log('Window Keys:', diagnostics.windowKeys);
        console.log('Verification Results:', diagnostics.errors);
        console.groupEnd();
        
        alert('Diagnostic information has been logged to the console. Press F12 to view.');
    }
    
    /**
     * Check localStorage availability
     */
    checkLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return 'Available';
        } catch (e) {
            return 'Unavailable: ' + e.message;
        }
    }
    
    /**
     * Wait for specific module to load (with timeout)
     */
    async waitForModule(moduleName, timeout = 5000) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                if (window[moduleName]) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
                
                if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Timeout waiting for ${moduleName}`));
                }
            }, 100);
        });
    }
    
    /**
     * Verify and wait for all critical modules
     */
    async verifyAndWait(timeout = 10000) {
        console.log('⏳ Waiting for dependencies to load...');
        
        const criticalModules = Object.entries(this.requiredModules)
            .filter(([name, config]) => config.critical)
            .map(([name]) => name);
        
        const promises = criticalModules.map(async (moduleName) => {
            try {
                await this.waitForModule(moduleName, timeout);
                return { module: moduleName, loaded: true };
            } catch (error) {
                return { module: moduleName, loaded: false, error: error.message };
            }
        });
        
        const results = await Promise.all(promises);
        const failed = results.filter(r => !r.loaded);
        
        if (failed.length > 0) {
            console.error('❌ Failed to load critical modules:', failed);
            return false;
        }
        
        console.log('✅ All critical modules loaded successfully');
        return true;
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.DependencyVerifier = DependencyVerifier;
    window.depVerifier = new DependencyVerifier();
}

console.log('✅ Dependency Verifier loaded');
