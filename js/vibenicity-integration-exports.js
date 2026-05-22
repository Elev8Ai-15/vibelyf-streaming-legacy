
// ═══════════════════════════════════════════════════════════════
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ═══════════════════════════════════════════════════════════════

// Export key functions to window for access from index.html
if (typeof window !== 'undefined') {
    // Note: isAPIRequest is handled by the Orchestrator (vibenicity-orchestrator.js)
    window.displayAPIGeneratorResult = displayAPIGeneratorResult;
    window.displayAPIGeneratorError = displayAPIGeneratorError;
    window.showAPIGeneratorLoading = showAPIGeneratorLoading;
    window.downloadGeneratedAPI = downloadGeneratedAPI;
    window.previewGeneratedFile = previewGeneratedFile;
    window.showDeployOptions = showDeployOptions;
    window.saveClaudeApiKey = saveClaudeApiKey;
    
    console.log('✅ VIBENICITY API Generator Integration loaded');
}
