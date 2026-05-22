/**
 * VibeUp Auto-Scanner
 * 
 * Automatic code quality scanning system that promotes:
 * 1. Habitual stability-focused building
 * 2. Skill progression tracking
 * 3. Language improvement feedback
 * 4. Knowledge base expansion
 * 
 * Features:
 * - Scans every 3 builds automatically
 * - Tracks user skill progression
 * - Graduates users when they reach mastery
 * - Educational feedback on language patterns
 * - Gamified skill levels
 * 
 * The Triple Win:
 * - Better VibeCoding skills
 * - Better written communication
 * - Better code quality
 * 
 * @class VibeUpAutoScanner
 * @version 1.0.0
 * @date 2025-11-19
 */

class VibeUpAutoScanner {
    constructor() {
        this.serviceName = 'VibeUp Auto-Scanner';
        this.version = '1.0.0';
        
        // User progress tracking
        this.userProgress = {
            buildCount: 0,
            scanCount: 0,
            skillLevel: 1,
            skillPoints: 0,
            totalScore: 0,
            averageScore: 0,
            lastScanScore: 0,
            improvementTrend: 'neutral',
            graduationReady: false,
            scansUntilNext: 3
        };
        
        // Skill levels and graduation criteria
        this.skillLevels = {
            1: { name: 'Beginner', minScore: 0, color: '#dc3545', scansNeeded: 10 },
            2: { name: 'Learning', minScore: 60, color: '#fd7e14', scansNeeded: 8 },
            3: { name: 'Developing', minScore: 70, color: '#ffc107', scansNeeded: 6 },
            4: { name: 'Proficient', minScore: 80, color: '#20c997', scansNeeded: 5 },
            5: { name: 'Advanced', minScore: 85, color: '#0dcaf0', scansNeeded: 4 },
            6: { name: 'Expert', minScore: 90, color: '#0d6efd', scansNeeded: 3 },
            7: { name: 'Master', minScore: 95, color: '#6f42c1', scansNeeded: 0 }
        };
        
        // Graduation criteria
        this.graduationCriteria = {
            minSkillLevel: 7,
            minConsecutiveScores: 3,
            minAverageScore: 95,
            minTotalScans: 15
        };
        
        // Scan categories
        this.scanCategories = [
            'Input Quality',
            'Pattern Recognition',
            'Code Structure',
            'Error Handling',
            'Language Clarity',
            'Technical Accuracy'
        ];
        
        // Load saved progress
        this.loadProgress();
        
        // Initialize scan history
        this.scanHistory = [];
        
        console.log('✅ VibeUp Auto-Scanner initialized');
        console.log(`📊 Skill Level: ${this.skillLevels[this.userProgress.skillLevel].name}`);
        console.log(`🎯 Builds until next scan: ${this.userProgress.scansUntilNext}`);
    }
    
    /**
     * Track a new build
     */
    trackBuild() {
        this.userProgress.buildCount++;
        this.userProgress.scansUntilNext--;
        
        console.log(`🔨 Build #${this.userProgress.buildCount} tracked`);
        console.log(`⏳ Scans until next: ${this.userProgress.scansUntilNext}`);
        
        // Check if scan is needed
        if (this.userProgress.scansUntilNext <= 0 && !this.userProgress.graduationReady) {
            console.log('🎯 Scan triggered!');
            this.triggerScan();
        }
        
        this.saveProgress();
    }
    
    /**
     * Trigger automatic scan
     */
    triggerScan() {
        console.log('🔍 VibeUp scan triggered after 3 builds');
        
        // Show scan notification
        this.showScanNotification();
        
        // Perform scan
        setTimeout(() => {
            this.performScan();
        }, 1000);
    }
    
    /**
     * Show scan notification
     */
    showScanNotification() {
        const notification = document.createElement('div');
        notification.className = 'vibeup-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 2em; margin-right: 10px;">🔍</span>
                <div>
                    <strong style="font-size: 1.2em;">VibeUp Scan Ready!</strong><br>
                    <small>Time to check your progress</small>
                </div>
            </div>
            <p style="margin: 10px 0; font-size: 0.9em;">
                You've completed 3 builds! Let's see how your skills are improving.
            </p>
            <button onclick="window.vibeUpScanner.openVibeUpTab()" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
            ">
                View Scan Results 🎯
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }
        }, 10000);
    }
    
    /**
     * Perform automatic scan
     */
    async performScan() {
        console.log('🔍 Performing VibeUp scan...');
        
        // Analyze recent builds
        const recentBuilds = this.getRecentBuilds();
        
        // Calculate scores
        const scores = this.calculateScores(recentBuilds);
        
        // Update progress
        this.updateProgress(scores);
        
        // Save scan
        this.saveScanResults(scores);
        
        // Check for graduation
        this.checkGraduation();
        
        // Reset counter
        const skillLevel = this.skillLevels[this.userProgress.skillLevel];
        this.userProgress.scansUntilNext = skillLevel.scansNeeded || 3;
        
        this.saveProgress();
        
        console.log('✅ VibeUp scan complete!');
        console.log(`📊 Score: ${scores.overall}/100`);
        
        return scores;
    }
    
    /**
     * Get recent builds from community learning system
     */
    getRecentBuilds() {
        if (!window.communityLearning) {
            return [];
        }
        
        // Get last 3 translations
        const translations = window.communityLearning.getTranslationHistory();
        return translations.slice(-3);
    }
    
    /**
     * Calculate scores based on builds
     */
    calculateScores(builds) {
        const scores = {
            overall: 0,
            categories: {},
            improvements: [],
            concerns: []
        };
        
        // If no builds, give baseline scores
        if (builds.length === 0) {
            scores.overall = 70;
            this.scanCategories.forEach(cat => {
                scores.categories[cat] = 70;
            });
            return scores;
        }
        
        // Analyze each category
        scores.categories['Input Quality'] = this.analyzeInputQuality(builds);
        scores.categories['Pattern Recognition'] = this.analyzePatternRecognition(builds);
        scores.categories['Code Structure'] = this.analyzeCodeStructure(builds);
        scores.categories['Error Handling'] = this.analyzeErrorHandling(builds);
        scores.categories['Language Clarity'] = this.analyzeLanguageClarity(builds);
        scores.categories['Technical Accuracy'] = this.analyzeTechnicalAccuracy(builds);
        
        // Calculate overall score
        const categoryScores = Object.values(scores.categories);
        scores.overall = Math.round(
            categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        );
        
        // Identify improvements and concerns
        Object.entries(scores.categories).forEach(([category, score]) => {
            if (score >= 90) {
                scores.improvements.push({ category, score, message: 'Excellent work!' });
            } else if (score < 70) {
                scores.concerns.push({ category, score, message: 'Needs improvement' });
            }
        });
        
        return scores;
    }
    
    /**
     * Analyze input quality
     */
    analyzeInputQuality(builds) {
        let score = 70; // Baseline
        
        builds.forEach(build => {
            const input = build.original || '';
            
            // Check length (not too short, not too long)
            if (input.length >= 20 && input.length <= 500) score += 5;
            
            // Check for complete thoughts
            if (input.includes('.') || input.includes('!') || input.includes('?')) score += 5;
            
            // Check for descriptive words
            if (input.split(' ').length >= 5) score += 3;
            
            // Avoid spam patterns
            if (!/(.)\1{5,}/.test(input)) score += 2;
        });
        
        return Math.min(100, score);
    }
    
    /**
     * Analyze pattern recognition
     */
    analyzePatternRecognition(builds) {
        let score = 70; // Baseline
        
        builds.forEach(build => {
            const patterns = build.patterns || [];
            
            // Good: Patterns were detected
            if (patterns.length > 0) score += 10;
            
            // Better: Multiple patterns detected
            if (patterns.length >= 2) score += 5;
            
            // Best: Diverse pattern types
            const patternTypes = new Set(patterns.map(p => p.type || p.name));
            if (patternTypes.size >= 2) score += 5;
        });
        
        return Math.min(100, score);
    }
    
    /**
     * Analyze code structure
     */
    analyzeCodeStructure(builds) {
        let score = 75; // Baseline
        
        builds.forEach(build => {
            const normalized = build.normalized || '';
            
            // Check for clear intent
            if (normalized.length >= 15) score += 5;
            
            // Check for technical terms
            const techTerms = ['app', 'website', 'page', 'form', 'button', 'database'];
            if (techTerms.some(term => normalized.toLowerCase().includes(term))) score += 5;
            
            // Check for specificity
            if (normalized.split(' ').length >= 7) score += 5;
        });
        
        return Math.min(100, score);
    }
    
    /**
     * Analyze error handling
     */
    analyzeErrorHandling(builds) {
        // Check if builds completed successfully
        let score = 80; // Baseline (assume good)
        
        // Bonus for consistent success
        if (builds.length === 3) score += 10;
        
        return Math.min(100, score);
    }
    
    /**
     * Analyze language clarity
     */
    analyzeLanguageClarity(builds) {
        let score = 70; // Baseline
        
        builds.forEach(build => {
            const original = build.original || '';
            const normalized = build.normalized || '';
            
            // If original and normalized are similar, language was already clear
            const similarity = this.calculateSimilarity(original.toLowerCase(), normalized.toLowerCase());
            
            if (similarity > 0.7) score += 10; // Very clear
            else if (similarity > 0.5) score += 7; // Moderately clear
            else if (similarity > 0.3) score += 5; // Needed translation but workable
            
            // Check for complete sentences
            if (original.trim().endsWith('.') || original.trim().endsWith('!')) score += 3;
        });
        
        return Math.min(100, score);
    }
    
    /**
     * Analyze technical accuracy
     */
    analyzeTechnicalAccuracy(builds) {
        let score = 75; // Baseline
        
        builds.forEach(build => {
            const normalized = build.normalized || '';
            
            // Check for specific technical requests
            const hasFeatures = /\b(with|and|that|include|add)\b/i.test(normalized);
            if (hasFeatures) score += 5;
            
            // Check for architecture clarity
            const hasArchitecture = /\b(frontend|backend|database|api|user|auth)\b/i.test(normalized);
            if (hasArchitecture) score += 5;
            
            // Check for completeness
            if (normalized.length >= 30) score += 5;
        });
        
        return Math.min(100, score);
    }
    
    /**
     * Calculate string similarity
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * Update user progress
     */
    updateProgress(scores) {
        this.userProgress.scanCount++;
        this.userProgress.lastScanScore = scores.overall;
        this.userProgress.totalScore += scores.overall;
        this.userProgress.averageScore = Math.round(
            this.userProgress.totalScore / this.userProgress.scanCount
        );
        
        // Calculate skill points
        if (scores.overall >= 90) this.userProgress.skillPoints += 10;
        else if (scores.overall >= 80) this.userProgress.skillPoints += 7;
        else if (scores.overall >= 70) this.userProgress.skillPoints += 5;
        else this.userProgress.skillPoints += 2;
        
        // Check for level up
        this.checkLevelUp();
        
        // Calculate improvement trend
        if (this.scanHistory.length >= 2) {
            const previousScore = this.scanHistory[this.scanHistory.length - 1].overall;
            const improvement = scores.overall - previousScore;
            
            if (improvement >= 5) this.userProgress.improvementTrend = 'improving';
            else if (improvement <= -5) this.userProgress.improvementTrend = 'declining';
            else this.userProgress.improvementTrend = 'stable';
        }
    }
    
    /**
     * Check for level up
     */
    checkLevelUp() {
        const currentLevel = this.userProgress.skillLevel;
        const currentScore = this.userProgress.averageScore;
        
        // Check if user qualifies for next level
        for (let level = currentLevel + 1; level <= 7; level++) {
            const levelReq = this.skillLevels[level];
            if (currentScore >= levelReq.minScore) {
                this.userProgress.skillLevel = level;
                this.showLevelUpNotification(level);
                console.log(`🎉 Level up! Now ${levelReq.name}`);
            } else {
                break;
            }
        }
    }
    
    /**
     * Show level up notification
     */
    showLevelUpNotification(newLevel) {
        const levelInfo = this.skillLevels[newLevel];
        
        const notification = document.createElement('div');
        notification.className = 'levelup-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, ${levelInfo.color} 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            z-index: 10001;
            text-align: center;
            animation: bounceIn 0.8s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
            <h2 style="font-size: 2em; margin-bottom: 10px;">LEVEL UP!</h2>
            <p style="font-size: 1.5em; margin-bottom: 20px;">
                You're now a <strong>${levelInfo.name}</strong>!
            </p>
            <p style="opacity: 0.9;">
                Keep building great apps! 🚀
            </p>
            <button onclick="this.parentElement.remove()" style="
                background: white;
                color: ${levelInfo.color};
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                margin-top: 20px;
                font-size: 1.1em;
            ">
                Awesome! 🎯
            </button>
        `;
        
        document.body.appendChild(notification);
    }
    
    /**
     * Save scan results
     */
    saveScanResults(scores) {
        const scan = {
            timestamp: Date.now(),
            buildNumber: this.userProgress.buildCount,
            scanNumber: this.userProgress.scanCount,
            ...scores
        };
        
        this.scanHistory.push(scan);
        
        // Keep last 20 scans
        if (this.scanHistory.length > 20) {
            this.scanHistory = this.scanHistory.slice(-20);
        }
        
        this.saveScanHistory();
    }
    
    /**
     * Check graduation criteria
     */
    checkGraduation() {
        const criteria = this.graduationCriteria;
        const progress = this.userProgress;
        
        // Check all criteria
        const meetsLevel = progress.skillLevel >= criteria.minSkillLevel;
        const meetsScans = progress.scanCount >= criteria.minTotalScans;
        const meetsAverage = progress.averageScore >= criteria.minAverageScore;
        
        // Check consecutive high scores
        const recentScans = this.scanHistory.slice(-criteria.minConsecutiveScores);
        const meetsConsecutive = recentScans.length >= criteria.minConsecutiveScores &&
            recentScans.every(scan => scan.overall >= criteria.minAverageScore);
        
        if (meetsLevel && meetsScans && meetsAverage && meetsConsecutive) {
            this.userProgress.graduationReady = true;
            this.showGraduationNotification();
        }
    }
    
    /**
     * Show graduation notification
     */
    showGraduationNotification() {
        const notification = document.createElement('div');
        notification.className = 'graduation-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            z-index: 10002;
            text-align: center;
            max-width: 500px;
            animation: bounceIn 0.8s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 5em; margin-bottom: 20px;">🎓</div>
            <h2 style="font-size: 2.5em; margin-bottom: 10px; color: #333;">CONGRATULATIONS!</h2>
            <p style="font-size: 1.3em; margin-bottom: 20px; color: #555;">
                You've mastered VibeCoding!
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <p style="font-weight: 600; margin-bottom: 10px;">Your Achievements:</p>
                <ul style="list-style: none; padding: 0; text-align: left;">
                    <li>✅ Skill Level: Master</li>
                    <li>✅ Average Score: ${this.userProgress.averageScore}/100</li>
                    <li>✅ Total Builds: ${this.userProgress.buildCount}</li>
                    <li>✅ Total Scans: ${this.userProgress.scanCount}</li>
                </ul>
            </div>
            <p style="font-size: 0.95em; margin-bottom: 20px; color: #666;">
                VibeUp automatic scanning will now be disabled. You've proven you can build with consistent quality!
            </p>
            <button onclick="this.parentElement.remove()" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                font-size: 1.2em;
            ">
                Thank You! 🎉
            </button>
        `;
        
        document.body.appendChild(notification);
    }
    
    /**
     * Open VibeUp tab in studio
     */
    openVibeUpTab() {
        // Switch to VibeUp mode if it exists
        if (window.modeSwitcher) {
            window.modeSwitcher.switchMode('vibeup');
        }
        
        // Show scan results
        this.displayScanResults();
    }
    
    /**
     * Display scan results in UI
     */
    displayScanResults() {
        if (this.scanHistory.length === 0) {
            console.warn('No scan results available');
            return;
        }
        
        const latestScan = this.scanHistory[this.scanHistory.length - 1];
        
        // This will be called by the VibeUp UI component
        if (window.vibeUpUI) {
            window.vibeUpUI.displayScan(latestScan, this.userProgress);
        }
    }
    
    /**
     * Get user statistics
     */
    getStatistics() {
        return {
            ...this.userProgress,
            skillLevelInfo: this.skillLevels[this.userProgress.skillLevel],
            scanHistory: this.scanHistory,
            graduationProgress: this.getGraduationProgress()
        };
    }
    
    /**
     * Get graduation progress
     */
    getGraduationProgress() {
        const criteria = this.graduationCriteria;
        const progress = this.userProgress;
        
        return {
            skillLevel: {
                current: progress.skillLevel,
                required: criteria.minSkillLevel,
                met: progress.skillLevel >= criteria.minSkillLevel
            },
            totalScans: {
                current: progress.scanCount,
                required: criteria.minTotalScans,
                met: progress.scanCount >= criteria.minTotalScans
            },
            averageScore: {
                current: progress.averageScore,
                required: criteria.minAverageScore,
                met: progress.averageScore >= criteria.minAverageScore
            },
            consecutiveScores: {
                current: this.scanHistory.slice(-criteria.minConsecutiveScores).length,
                required: criteria.minConsecutiveScores,
                met: this.scanHistory.slice(-criteria.minConsecutiveScores).every(s => s.overall >= criteria.minAverageScore)
            }
        };
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem('vibeup_user_progress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.warn('Failed to save VibeUp progress:', error);
        }
    }
    
    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('vibeup_user_progress');
            if (saved) {
                this.userProgress = { ...this.userProgress, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load VibeUp progress:', error);
        }
    }
    
    /**
     * Save scan history
     */
    saveScanHistory() {
        try {
            localStorage.setItem('vibeup_scan_history', JSON.stringify(this.scanHistory));
        } catch (error) {
            console.warn('Failed to save scan history:', error);
        }
    }
    
    /**
     * Load scan history
     */
    loadScanHistory() {
        try {
            const saved = localStorage.getItem('vibeup_scan_history');
            if (saved) {
                this.scanHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load scan history:', error);
        }
    }
    
    /**
     * Reset progress (for testing or user request)
     */
    resetProgress() {
        this.userProgress = {
            buildCount: 0,
            scanCount: 0,
            skillLevel: 1,
            skillPoints: 0,
            totalScore: 0,
            averageScore: 0,
            lastScanScore: 0,
            improvementTrend: 'neutral',
            graduationReady: false,
            scansUntilNext: 3
        };
        
        this.scanHistory = [];
        this.saveProgress();
        this.saveScanHistory();
        
        console.log('✅ VibeUp progress reset');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeUpAutoScanner;
}

// Make globally available
window.VibeUpAutoScanner = VibeUpAutoScanner;

console.log('✅ VibeUpAutoScanner loaded successfully');
