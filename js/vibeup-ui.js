/**
 * VibeUp UI Component
 * 
 * Beautiful visualization of VibeUp scans with:
 * - Skill progression tracking
 * - Language improvement feedback
 * - Build quality trends
 * - Educational insights
 * - Graduation progress
 * 
 * @class VibeUpUI
 * @version 1.0.0
 * @date 2025-11-19
 */

class VibeUpUI {
    constructor(scanner) {
        this.scanner = scanner;
        this.container = null;
        
        console.log('✅ VibeUpUI initialized');
    }
    
    /**
     * Render VibeUp tab content
     */
    render(containerElement) {
        this.container = containerElement;
        
        const stats = this.scanner.getStatistics();
        const levelInfo = stats.skillLevelInfo;
        
        const html = `
            <div class="vibeup-container">
                <!-- Header -->
                <div class="vibeup-header">
                    <div class="header-content">
                        <h1>
                            <span class="icon">🔍</span>
                            VibeUp Progress
                        </h1>
                        <p class="subtitle">Your journey to VibeCoding mastery</p>
                    </div>
                </div>
                
                <!-- Skill Level Card -->
                <div class="skill-level-card" style="border-left-color: ${levelInfo.color};">
                    <div class="skill-header">
                        <div>
                            <div class="skill-level" style="color: ${levelInfo.color};">
                                Level ${stats.skillLevel}: ${levelInfo.name}
                            </div>
                            <div class="skill-points">${stats.skillPoints} Skill Points</div>
                        </div>
                        <div class="skill-icon" style="background: ${levelInfo.color};">
                            ${this.getSkillIcon(stats.skillLevel)}
                        </div>
                    </div>
                    
                    ${!stats.graduationReady ? this.renderProgressBar(stats) : this.renderGraduationBadge()}
                </div>
                
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🔨</div>
                        <div class="stat-value">${stats.buildCount}</div>
                        <div class="stat-label">Total Builds</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">🔍</div>
                        <div class="stat-value">${stats.scanCount}</div>
                        <div class="stat-label">Scans Completed</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${stats.averageScore}</div>
                        <div class="stat-label">Average Score</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">${this.getTrendIcon(stats.improvementTrend)}</div>
                        <div class="stat-value">${stats.lastScanScore || 'N/A'}</div>
                        <div class="stat-label">Last Scan</div>
                    </div>
                </div>
                
                <!-- Next Scan Countdown -->
                ${!stats.graduationReady ? `
                    <div class="next-scan-card">
                        <div class="countdown">
                            <div class="countdown-number">${stats.scansUntilNext}</div>
                            <div class="countdown-label">builds until next scan</div>
                        </div>
                        <p>Keep building! Your next VibeUp scan will happen automatically.</p>
                    </div>
                ` : ''}
                
                <!-- Scan History -->
                ${this.renderScanHistory(stats.scanHistory)}
                
                <!-- Educational Insights -->
                ${this.renderEducationalInsights(stats)}
                
                <!-- Graduation Progress -->
                ${!stats.graduationReady ? this.renderGraduationProgress(stats.graduationProgress) : ''}
            </div>
        `;
        
        this.container.innerHTML = html;
        this.addStyles();
    }
    
    /**
     * Get skill icon based on level
     */
    getSkillIcon(level) {
        const icons = {
            1: '🌱',
            2: '📚',
            3: '🎯',
            4: '⭐',
            5: '🚀',
            6: '💎',
            7: '👑'
        };
        return icons[level] || '🌱';
    }
    
    /**
     * Get trend icon
     */
    getTrendIcon(trend) {
        const icons = {
            'improving': '📈',
            'declining': '📉',
            'stable': '➡️',
            'neutral': '⏸️'
        };
        return icons[trend] || '⏸️';
    }
    
    /**
     * Render progress bar to next level
     */
    renderProgressBar(stats) {
        const nextLevel = stats.skillLevel + 1;
        if (nextLevel > 7) return '';
        
        const nextLevelInfo = this.scanner.skillLevels[nextLevel];
        const progress = Math.min(100, (stats.averageScore / nextLevelInfo.minScore) * 100);
        
        return `
            <div class="progress-container">
                <div class="progress-label">
                    <span>Progress to ${nextLevelInfo.name}</span>
                    <span>${stats.averageScore}/${nextLevelInfo.minScore}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%; background: ${nextLevelInfo.color};"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render graduation badge
     */
    renderGraduationBadge() {
        return `
            <div class="graduation-badge">
                <div class="badge-icon">🎓</div>
                <div class="badge-text">
                    <strong>Graduated!</strong>
                    <p>You've mastered VibeCoding. Automatic scans are now disabled.</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render scan history
     */
    renderScanHistory(history) {
        if (!history || history.length === 0) {
            return `
                <div class="scan-history">
                    <h2>Scan History</h2>
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <p>No scans yet! Complete 3 builds to trigger your first VibeUp scan.</p>
                    </div>
                </div>
            `;
        }
        
        const recent = history.slice(-5).reverse();
        
        return `
            <div class="scan-history">
                <h2>Recent Scans</h2>
                <div class="history-list">
                    ${recent.map((scan, index) => this.renderScanItem(scan, index === 0)).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render individual scan item
     */
    renderScanItem(scan, isLatest) {
        const scoreColor = this.getScoreColor(scan.overall);
        const date = new Date(scan.timestamp).toLocaleDateString();
        
        return `
            <div class="scan-item ${isLatest ? 'latest' : ''}">
                <div class="scan-header">
                    <div>
                        <div class="scan-title">
                            Scan #${scan.scanNumber}
                            ${isLatest ? '<span class="latest-badge">Latest</span>' : ''}
                        </div>
                        <div class="scan-date">${date} • Build #${scan.buildNumber}</div>
                    </div>
                    <div class="scan-score" style="color: ${scoreColor};">
                        ${scan.overall}/100
                    </div>
                </div>
                
                <div class="category-scores">
                    ${Object.entries(scan.categories).map(([category, score]) => `
                        <div class="category-item">
                            <span class="category-name">${category}</span>
                            <div class="category-bar">
                                <div class="category-fill" style="width: ${score}%; background: ${this.getScoreColor(score)};"></div>
                            </div>
                            <span class="category-score">${score}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${scan.improvements.length > 0 ? `
                    <div class="scan-feedback">
                        <strong>✅ Improvements:</strong>
                        <ul>
                            ${scan.improvements.map(imp => `<li>${imp.category}: ${imp.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${scan.concerns.length > 0 ? `
                    <div class="scan-feedback concerns">
                        <strong>⚠️ Areas to Focus:</strong>
                        <ul>
                            ${scan.concerns.map(con => `<li>${con.category}: ${con.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Get color based on score
     */
    getScoreColor(score) {
        if (score >= 90) return '#28a745';
        if (score >= 80) return '#20c997';
        if (score >= 70) return '#ffc107';
        if (score >= 60) return '#fd7e14';
        return '#dc3545';
    }
    
    /**
     * Render educational insights
     */
    renderEducationalInsights(stats) {
        if (!stats.scanHistory || stats.scanHistory.length === 0) {
            return '';
        }
        
        const latestScan = stats.scanHistory[stats.scanHistory.length - 1];
        
        return `
            <div class="educational-insights">
                <h2>💡 Learning Insights</h2>
                
                <div class="insight-card">
                    <div class="insight-icon">🗣️</div>
                    <div class="insight-content">
                        <h3>Language Improvement</h3>
                        <p>
                            Your language clarity is ${latestScan.categories['Language Clarity'] >= 80 ? 'excellent' : 'improving'}! 
                            ${latestScan.categories['Language Clarity'] >= 90 ? 
                                'You\'re writing clear, well-structured prompts that make translation easy.' :
                                'Try using complete sentences and specific technical terms for better results.'
                            }
                        </p>
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-icon">🎯</div>
                    <div class="insight-content">
                        <h3>Pattern Recognition</h3>
                        <p>
                            ${latestScan.categories['Pattern Recognition'] >= 80 ?
                                'Great! The system is recognizing your cultural language patterns effectively.' :
                                'Using more cultural language features helps improve the knowledge base for everyone!'
                            }
                        </p>
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-icon">🏗️</div>
                    <div class="insight-content">
                        <h3>Build Quality</h3>
                        <p>
                            Your code structure score is ${latestScan.categories['Code Structure']}/100. 
                            ${latestScan.categories['Code Structure'] >= 85 ?
                                'You\'re describing apps with clear architecture and features!' :
                                'Try being more specific about what features you want in your app.'
                            }
                        </p>
                    </div>
                </div>
                
                <div class="tip-box">
                    <strong>💡 Pro Tip:</strong> The more specific you are about what you want, 
                    the better your generated code will be. Don't be afraid to use cultural language – 
                    that's what makes Vibenicity special!
                </div>
            </div>
        `;
    }
    
    /**
     * Render graduation progress
     */
    renderGraduationProgress(progress) {
        return `
            <div class="graduation-progress">
                <h2>🎓 Path to Graduation</h2>
                <p class="graduation-desc">
                    Complete all criteria to graduate from automatic VibeUp scans and code freely!
                </p>
                
                <div class="criteria-list">
                    ${this.renderCriterion('Skill Level', progress.skillLevel)}
                    ${this.renderCriterion('Total Scans', progress.totalScans)}
                    ${this.renderCriterion('Average Score', progress.averageScore)}
                    ${this.renderCriterion('Consecutive High Scores', progress.consecutiveScores)}
                </div>
            </div>
        `;
    }
    
    /**
     * Render individual criterion
     */
    renderCriterion(name, criterion) {
        const percentage = Math.min(100, (criterion.current / criterion.required) * 100);
        
        return `
            <div class="criterion-item">
                <div class="criterion-header">
                    <span class="criterion-icon">${criterion.met ? '✅' : '⏳'}</span>
                    <span class="criterion-name">${name}</span>
                    <span class="criterion-value">${criterion.current}/${criterion.required}</span>
                </div>
                <div class="criterion-bar">
                    <div class="criterion-fill" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Display a specific scan
     */
    displayScan(scan, progress) {
        // If container exists, update it
        if (this.container) {
            this.render(this.container);
        }
    }
    
    /**
     * Add styles
     */
    addStyles() {
        if (document.getElementById('vibeup-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'vibeup-ui-styles';
        style.textContent = `
            .vibeup-container {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .vibeup-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                border-radius: 20px;
                margin-bottom: 30px;
                box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
            }
            
            .vibeup-header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .vibeup-header .icon {
                font-size: 1.2em;
            }
            
            .vibeup-header .subtitle {
                font-size: 1.2em;
                opacity: 0.9;
            }
            
            .skill-level-card {
                background: white;
                padding: 30px;
                border-radius: 15px;
                border-left: 5px solid #667eea;
                margin-bottom: 30px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            
            .skill-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .skill-level {
                font-size: 1.8em;
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .skill-points {
                font-size: 1.1em;
                color: #666;
            }
            
            .skill-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5em;
                color: white;
            }
            
            .progress-container {
                margin-top: 20px;
            }
            
            .progress-label {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 0.9em;
                color: #666;
            }
            
            .progress-bar {
                height: 12px;
                background: #f0f0f0;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                transition: width 0.5s ease;
            }
            
            .graduation-badge {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px;
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                border-radius: 10px;
                margin-top: 20px;
            }
            
            .badge-icon {
                font-size: 3em;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-icon {
                font-size: 3em;
                margin-bottom: 10px;
            }
            
            .stat-value {
                font-size: 2.5em;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 1em;
                color: #666;
            }
            
            .next-scan-card {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin-bottom: 30px;
            }
            
            .countdown {
                margin-bottom: 15px;
            }
            
            .countdown-number {
                font-size: 4em;
                font-weight: 700;
                color: #667eea;
            }
            
            .countdown-label {
                font-size: 1.2em;
                color: #666;
            }
            
            .scan-history,
            .educational-insights,
            .graduation-progress {
                background: white;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            
            .scan-history h2,
            .educational-insights h2,
            .graduation-progress h2 {
                font-size: 1.8em;
                margin-bottom: 20px;
                color: #333;
            }
            
            .empty-state {
                text-align: center;
                padding: 40px;
                color: #999;
            }
            
            .empty-icon {
                font-size: 5em;
                margin-bottom: 20px;
            }
            
            .history-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .scan-item {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            
            .scan-item.latest {
                border-left-color: #ffd700;
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 237, 78, 0.1) 100%);
            }
            
            .scan-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 15px;
            }
            
            .scan-title {
                font-size: 1.2em;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .latest-badge {
                background: #ffd700;
                color: #333;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 0.7em;
                margin-left: 10px;
                font-weight: 700;
            }
            
            .scan-date {
                font-size: 0.9em;
                color: #666;
            }
            
            .scan-score {
                font-size: 2em;
                font-weight: 700;
            }
            
            .category-scores {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .category-item {
                display: grid;
                grid-template-columns: 150px 1fr 50px;
                gap: 10px;
                align-items: center;
            }
            
            .category-name {
                font-size: 0.9em;
                color: #666;
            }
            
            .category-bar {
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .category-fill {
                height: 100%;
                transition: width 0.5s ease;
            }
            
            .category-score {
                text-align: right;
                font-weight: 600;
                font-size: 0.9em;
            }
            
            .scan-feedback {
                background: white;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
            }
            
            .scan-feedback.concerns {
                background: #fff3cd;
            }
            
            .scan-feedback ul {
                margin: 10px 0 0 20px;
                font-size: 0.9em;
            }
            
            .insight-card {
                display: flex;
                gap: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                margin-bottom: 15px;
            }
            
            .insight-icon {
                font-size: 2.5em;
            }
            
            .insight-content h3 {
                margin-bottom: 8px;
                color: #667eea;
            }
            
            .insight-content p {
                color: #666;
                line-height: 1.6;
            }
            
            .tip-box {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
                margin-top: 20px;
            }
            
            .graduation-desc {
                color: #666;
                margin-bottom: 20px;
                font-size: 1.1em;
            }
            
            .criteria-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .criterion-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
            }
            
            .criterion-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .criterion-icon {
                font-size: 1.5em;
            }
            
            .criterion-name {
                flex: 1;
                font-weight: 600;
            }
            
            .criterion-value {
                color: #667eea;
                font-weight: 600;
            }
            
            .criterion-bar {
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .criterion-fill {
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                transition: width 0.5s ease;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            @keyframes bounceIn {
                0% {
                    transform: translate(-50%, -50%) scale(0.3);
                    opacity: 0;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.05);
                }
                70% {
                    transform: translate(-50%, -50%) scale(0.9);
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .vibeup-container {
                    padding: 10px;
                }
                
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .category-item {
                    grid-template-columns: 1fr;
                    gap: 5px;
                }
                
                .category-score {
                    text-align: left;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeUpUI;
}

// Make globally available
window.VibeUpUI = VibeUpUI;

console.log('✅ VibeUpUI loaded successfully');
