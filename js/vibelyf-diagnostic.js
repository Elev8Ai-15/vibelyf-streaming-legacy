/**
 * 🔧 VIBELYF SYSTEM DIAGNOSTIC & FIX
 * 
 * This file tests and fixes all 3 systems:
 * 1. API Generator
 * 2. Language Model (Code Generator)
 * 3. Build Engine
 */

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTIC FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const VibeLyfDiagnostic = {
    
    /**
     * Run full system diagnostic
     */
    async runDiagnostic() {
        console.log('🔍 ═══════════════════════════════════════════');
        console.log('🔍 VIBELYF SYSTEM DIAGNOSTIC');
        console.log('🔍 ═══════════════════════════════════════════');
        
        const results = {
            culturalDatabase: this.checkCulturalDatabase(),
            learningLoop: this.checkLearningLoop(),
            codeGenerator: this.checkCodeGenerator(),
            appRenderer: this.checkAppRenderer(),
            apiGenerator: this.checkAPIGenerator(),
            communicationScore: this.checkCommunicationScore(),
            vagueDetector: this.checkVagueDetector()
        };
        
        console.log('\n📊 DIAGNOSTIC RESULTS:');
        console.table(results);
        
        // Check for critical issues
        const issues = Object.entries(results).filter(([key, status]) => !status);
        
        if (issues.length > 0) {
            console.error('❌ CRITICAL ISSUES FOUND:');
            issues.forEach(([key, status]) => {
                console.error(`   - ${key}: MISSING or BROKEN`);
            });
        } else {
            console.log('✅ ALL SYSTEMS OPERATIONAL!');
        }
        
        return results;
    },
    
    /**
     * Check Cultural Database
     */
    checkCulturalDatabase() {
        const exists = typeof window.culturalVocabularyMaster !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} Cultural Database: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists) {
            console.log(`   Total terms: ${window.culturalVocabularyMaster.metadata?.totalTerms || window.culturalVocabularyMaster.getAllTerms?.()?.length || 'unknown'}`);
        }
        return exists;
    },
    
    /**
     * Check Learning Loop
     */
    checkLearningLoop() {
        const exists = typeof window.VibeLyfLearningLoop !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} Learning Loop: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists && typeof window.VibeLyfLearningLoop.detectSlang === 'function') {
            console.log('   ✅ detectSlang() available');
        }
        return exists;
    },
    
    /**
     * Check Code Generator
     */
    checkCodeGenerator() {
        const exists = typeof window.VibeLyfCodeGenerator !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} Code Generator: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists) {
            console.log(`   API Key: ${window.VibeLyfCodeGenerator.config.apiKey ? 'SET' : 'MISSING'}`);
            console.log(`   Model: ${window.VibeLyfCodeGenerator.config.model}`);
            if (typeof window.VibeLyfCodeGenerator.generateCode === 'function') {
                console.log('   ✅ generateCode() available');
            }
        }
        return exists;
    },
    
    /**
     * Check App Renderer
     */
    checkAppRenderer() {
        const exists = typeof window.VibeLyfAppRenderer !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} App Renderer: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists && typeof window.VibeLyfAppRenderer.render === 'function') {
            console.log('   ✅ render() available');
        }
        return exists;
    },
    
    /**
     * Check API Generator
     */
    checkAPIGenerator() {
        const exists = typeof window.ClaudeAPIGenerator !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} API Generator: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists) {
            console.log(`   API Key: ${window.ClaudeAPIGenerator.config.claudeApiKey ? 'SET' : 'MISSING'}`);
            console.log(`   Model: ${window.ClaudeAPIGenerator.config.claudeModel}`);
            if (typeof window.ClaudeAPIGenerator.generate === 'function') {
                console.log('   ✅ generate() available');
            }
        }
        return exists;
    },
    
    /**
     * Check Communication Score
     */
    checkCommunicationScore() {
        const exists = typeof window.VibeLyfCommunicationScore !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} Communication Score: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists && typeof window.VibeLyfCommunicationScore.logMessage === 'function') {
            console.log('   ✅ logMessage() available');
            console.log(`   Current score: ${window.VibeLyfCommunicationScore.getScore()}%`);
        }
        return exists;
    },
    
    /**
     * Check Vague Detector
     */
    checkVagueDetector() {
        const exists = typeof window.VibeLyfVagueDetector !== 'undefined';
        console.log(`${exists ? '✅' : '❌'} Vague Detector: ${exists ? 'LOADED' : 'MISSING'}`);
        if (exists && typeof window.VibeLyfVagueDetector.isVague === 'function') {
            console.log('   ✅ isVague() available');
        }
        return exists;
    },
    
    /**
     * Test Code Generator with simple request
     */
    async testCodeGenerator() {
        console.log('\n🧪 TESTING CODE GENERATOR...');
        
        if (!window.VibeLyfCodeGenerator) {
            console.error('❌ Code Generator not loaded!');
            return false;
        }
        
        try {
            const result = await window.VibeLyfCodeGenerator.generateCode(
                'build me a simple calculator',
                'A calculator application for mathematical calculations',
                []
            );
            
            console.log('Result:', result);
            
            if (result.success) {
                console.log('✅ Code Generator is WORKING!');
                console.log(`   Generated ${result.code.length} characters of code`);
                return true;
            } else {
                console.error('❌ Code Generator failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Code Generator threw error:', error);
            return false;
        }
    },
    
    /**
     * Test API Generator
     */
    async testAPIGenerator() {
        console.log('\n🧪 TESTING API GENERATOR...');
        
        if (!window.ClaudeAPIGenerator) {
            console.error('❌ API Generator not loaded!');
            return false;
        }
        
        if (!window.ClaudeAPIGenerator.config.claudeApiKey) {
            console.error('❌ Claude API key not set!');
            console.log('💡 Set it with: window.ClaudeAPIGenerator.config.claudeApiKey = "sk-ant-..."');
            return false;
        }
        
        try {
            console.log('⏳ Calling Claude API...');
            const result = await window.ClaudeAPIGenerator.generate('build me an api for tasks', []);
            
            console.log('Result:', result);
            
            if (result.success) {
                console.log('✅ API Generator is WORKING!');
                return true;
            } else {
                console.error('❌ API Generator failed:', result.error || result.errors);
                return false;
            }
        } catch (error) {
            console.error('❌ API Generator threw error:', error);
            return false;
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// QUICK FIXES
// ═══════════════════════════════════════════════════════════════

const VibeLyfQuickFix = {
    
    /**
     * Fix missing VibeLyfApp reference
     */
    fixVibeLyfApp() {
        if (typeof window.VibeLyfApp === 'undefined') {
            console.warn('⚠️ VibeLyfApp not found on window - may need to wait for DOMContentLoaded');
            return false;
        }
        return true;
    },
    
    /**
     * Ensure all modules are on window object
     */
    ensureGlobalModules() {
        const modules = [
            'culturalVocabularyMaster',
            'VibeLyfLearningLoop',
            'VibeLyfCodeGenerator',
            'VibeLyfAppRenderer',
            'ClaudeAPIGenerator',
            'VibeLyfCommunicationScore',
            'VibeLyfVagueDetector'
        ];
        
        const missing = modules.filter(m => typeof window[m] === 'undefined');
        
        if (missing.length > 0) {
            console.error('❌ Missing global modules:', missing);
            return false;
        }
        
        console.log('✅ All modules available globally');
        return true;
    }
};

// ═══════════════════════════════════════════════════════════════
// AUTO-RUN ON LOAD
// ═══════════════════════════════════════════════════════════════

// Wait for page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            VibeLyfDiagnostic.runDiagnostic();
        }, 2000);
    });
} else {
    setTimeout(() => {
        VibeLyfDiagnostic.runDiagnostic();
    }, 2000);
}

// Export to window
window.VibeLyfDiagnostic = VibeLyfDiagnostic;
window.VibeLyfQuickFix = VibeLyfQuickFix;

console.log('🔧 Diagnostic tools loaded! Run: VibeLyfDiagnostic.runDiagnostic()');
console.log('🧪 Test code generator: VibeLyfDiagnostic.testCodeGenerator()');
console.log('🧪 Test API generator: VibeLyfDiagnostic.testAPIGenerator()');
