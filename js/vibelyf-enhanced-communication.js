/**
 * VIBELYF - Enhanced Communication System
 * 5-Step Loop: Vague Detection → Clarification → Context → Generation → Score
 */

// ═══════════════════════════════════════════════════════════════
// COMMUNICATION SCORE SYSTEM
// ═══════════════════════════════════════════════════════════════

const VibeLyfCommunicationScore = {
    
    /**
     * Log a message interaction
     */
    logMessage(type, message = '') {
        let stats = JSON.parse(localStorage.getItem('vibelyf_comm_stats')) || {
            clear: 0,
            vague: 0,
            history: [],
            achievements: []
        };
        
        stats[type]++;
        stats.history.push({
            type,
            message: message.substring(0, 100), // Store first 100 chars
            timestamp: Date.now()
        });
        
        // Keep only last 100 messages
        if (stats.history.length > 100) {
            stats.history = stats.history.slice(-100);
        }
        
        // Check for achievements
        this.checkAchievements(stats);
        
        localStorage.setItem('vibelyf_comm_stats', JSON.stringify(stats));
        
        console.log(`📊 Communication logged: ${type} | Score: ${this.getScore()}%`);
    },
    
    /**
     * Get current communication score
     */
    getScore() {
        let stats = JSON.parse(localStorage.getItem('vibelyf_comm_stats')) || { clear: 0, vague: 0 };
        const total = stats.clear + stats.vague;
        return total > 0 ? Math.round((stats.clear / total) * 100) : 0;
    },
    
    /**
     * Get detailed stats
     */
    getStats() {
        return JSON.parse(localStorage.getItem('vibelyf_comm_stats')) || {
            clear: 0,
            vague: 0,
            history: [],
            achievements: []
        };
    },
    
    /**
     * Display score in chat
     */
    displayScore() {
        const stats = this.getStats();
        const score = this.getScore();
        const total = stats.clear + stats.vague;
        
        let message = `
📊 **Your Communication Score: ${score}%**

**Breakdown:**
- ✅ Clear messages: ${stats.clear}
- 🤔 Vague messages: ${stats.vague}
- 📈 Total interactions: ${total}

${this.getScoreAdvice(score)}
        `;
        
        return message.trim();
    },
    
    /**
     * Get advice based on score
     */
    getScoreAdvice(score) {
        if (score >= 90) {
            return '🔥 **ELITE COMMUNICATOR!** You\'re crushing it! Your clarity is top-tier.';
        } else if (score >= 75) {
            return '💪 **STRONG!** You communicate well. Keep being specific!';
        } else if (score >= 60) {
            return '📈 **IMPROVING!** Add more details to boost your score.';
        } else if (score >= 40) {
            return '💡 **TIP:** Be more specific. Instead of "make something", try "build a REST API for tasks with authentication"';
        } else {
            return '🎯 **LEVEL UP!** Break requests down: What do you want? What features? What tech?';
        }
    },
    
    /**
     * Check for achievements
     */
    checkAchievements(stats) {
        const achievements = stats.achievements || [];
        const newAchievements = [];
        
        // First clear message
        if (stats.clear === 1 && !achievements.includes('first_clear')) {
            newAchievements.push({
                id: 'first_clear',
                name: '🎯 First Clear Message',
                description: 'Sent your first clear, specific request!'
            });
            achievements.push('first_clear');
        }
        
        // 10 clear messages
        if (stats.clear === 10 && !achievements.includes('10_clear')) {
            newAchievements.push({
                id: '10_clear',
                name: '💪 Communication Pro',
                description: '10 clear messages! You\'re getting good at this!'
            });
            achievements.push('10_clear');
        }
        
        // 80%+ score
        const score = this.getScore();
        if (score >= 80 && stats.clear + stats.vague >= 10 && !achievements.includes('high_score')) {
            newAchievements.push({
                id: 'high_score',
                name: '🔥 Elite Communicator',
                description: '80%+ communication score! You\'re a pro!'
            });
            achievements.push('high_score');
        }
        
        stats.achievements = achievements;
        
        // Show new achievements
        newAchievements.forEach(ach => {
            console.log(`🏆 NEW ACHIEVEMENT: ${ach.name} - ${ach.description}`);
            if (window.VibeLyfApp && window.VibeLyfApp.addChatMessage) {
                setTimeout(() => {
                    window.VibeLyfApp.addChatMessage(
                        `🏆 **ACHIEVEMENT UNLOCKED!**\n\n**${ach.name}**\n${ach.description}`,
                        'bot'
                    );
                }, 500);
            }
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// VAGUE DETECTION SYSTEM
// ═══════════════════════════════════════════════════════════════

const VibeLyfVagueDetector = {
    
    /**
     * Patterns that indicate vague requests (ONLY truly vague patterns)
     */
    vaguePatterns: [
        /\bsomethin\b/i,
        /\bsomething\b/i,
        /^.*(thing|stuff).*$/i, // Only if message is just "thing" or "stuff"
        /\banything\b/i,
        /\bwhatever\b/i,
        /\bidunno\b/i,
        /\bi don't know\b/i,
        /\bjust make\b/i,
        /\bmake me a thing\b/i,
        /\bbuild something\b/i
    ],
    
    /**
     * Check if message is vague
     */
    isVague(message) {
        // Too short (ONLY if extremely short - less than 3 words)
        if (message.split(' ').length < 3) {
            return {
                isVague: true,
                reason: 'too_short',
                message: 'Your message is too short. Add more details about what you want!'
            };
        }
        
        // Check vague patterns
        for (let pattern of this.vaguePatterns) {
            if (pattern.test(message)) {
                return {
                    isVague: true,
                    reason: 'vague_words',
                    pattern: pattern.toString(),
                    message: 'I see some vague language. Let\'s get more specific!'
                };
            }
        }
        
        // Check if has specifics (numbers, tech terms, features)
        const hasSpecifics = this.hasSpecifics(message);
        if (!hasSpecifics) {
            return {
                isVague: true,
                reason: 'no_specifics',
                message: 'Add more specifics: What features? What data? What tech stack?'
            };
        }
        
        return {
            isVague: false,
            reason: 'clear',
            message: 'Great! Your request is clear and specific.'
        };
    },
    
    /**
     * Check if message has specific details
     */
    hasSpecifics(message) {
        const specificIndicators = [
            /\d+/, // Numbers
            /\bapi\b/i,
            /\brest\b/i,
            /\bgraphql\b/i,
            /\bdatabase\b/i,
            /\bauth/i,
            /\blogin\b/i,
            /\buser/i,
            /\bpost/i,
            /\bcomment/i,
            /\blike/i,
            /\bfollow/i,
            /\bpage\b/i,
            /\bfacebook\b/i,
            /\binstagram\b/i,
            /\btwitter\b/i,
            /\byoutube\b/i,
            /\bwebsite\b/i,
            /\bapp\b/i,
            /\bupload\b/i,
            /\bdownload\b/i,
            /\bsearch\b/i,
            /\bfilter\b/i,
            /\bsort\b/i,
            /\bcrud\b/i,
            /\bjwt\b/i,
            /\boauth\b/i,
            /\bexpress\b/i,
            /\bnode\b/i,
            /\bprisma\b/i,
            /\bmongo\b/i,
            /\bpostgres\b/i,
            /\bmysql\b/i,
            /\bsqlite\b/i
        ];
        
        return specificIndicators.some(pattern => pattern.test(message));
    },
    
    /**
     * Generate clarification request
     */
    getClarificationMessage(vaguenessResult) {
        const tips = {
            too_short: [
                '🎯 **Too vague!** Let\'s break it down:',
                '• What are you building? (e.g., "REST API", "website", "app")',
                '• What features do you need? (e.g., "user login", "posts", "comments")',
                '• What data will it handle? (e.g., "users", "products", "tasks")',
                '',
                '**Example:** "Build a REST API for a todo app with user authentication and CRUD for tasks"'
            ],
            vague_words: [
                '🤔 **I see vague language!** Let\'s get specific:',
                '• Replace "something" with exactly what you want',
                '• Replace "thing" with the specific feature',
                '• Replace "make" with "build", "create", "generate"',
                '',
                '**Why?** Clear specs = fewer bugs = faster development!',
                '',
                '**Try again with more details!**'
            ],
            no_specifics: [
                '💡 **Add more specifics!** Good requests include:',
                '• **Tech stack:** "REST API", "GraphQL", "Express + Prisma"',
                '• **Features:** "authentication", "CRUD operations", "search"',
                '• **Data models:** "users", "posts", "comments", "likes"',
                '',
                '**Example:** "Create a REST API for a blog with users, posts, and comments. Include JWT auth and PostgreSQL database."'
            ]
        };
        
        return (tips[vaguenessResult.reason] || tips.too_short).join('\n');
    }
};

// ═══════════════════════════════════════════════════════════════
// WIDGET LOADING SYSTEM
// ═══════════════════════════════════════════════════════════════

const VibeLyfWidgetLoader = {
    
    /**
     * Widget URLs and configurations
     */
    widgets: {
        // Social platforms
        youtube: {
            url: 'https://www.youtube.com',
            embeddable: true,
            type: 'social'
        },
        instagram: {
            url: 'https://www.instagram.com',
            embeddable: false,
            type: 'social'
        },
        tiktok: {
            url: 'https://www.tiktok.com',
            embeddable: false,
            type: 'social'
        },
        twitter: {
            url: 'https://twitter.com',
            embeddable: true,
            type: 'social'
        },
        facebook: {
            url: 'https://www.facebook.com',
            embeddable: false,
            type: 'social'
        },
        
        // Shopping platforms
        amazon: {
            url: 'https://www.amazon.com',
            affiliate: true,
            affiliateParam: 'tag',
            type: 'shopping'
        },
        ebay: {
            url: 'https://www.ebay.com',
            affiliate: true,
            type: 'shopping'
        },
        aliexpress: {
            url: 'https://www.aliexpress.com',
            affiliate: true,
            type: 'shopping'
        }
    },
    
    /**
     * Load widget into main feed
     */
    loadWidget(platform) {
        const widget = this.widgets[platform];
        if (!widget) {
            console.error(`Widget not found: ${platform}`);
            return;
        }
        
        // Track click
        this.trackClick(platform);
        
        // Get feed element
        const feed = document.getElementById('main-feed') || document.getElementById('feed');
        if (!feed) {
            console.error('Feed element not found');
            return;
        }
        
        // Build URL with affiliate if applicable
        let url = widget.url;
        if (widget.affiliate && widget.affiliateParam) {
            const affiliateId = localStorage.getItem(`${platform}_affiliate_id`);
            if (affiliateId) {
                url += `?${widget.affiliateParam}=${affiliateId}`;
            }
        }
        
        // Load content
        if (widget.embeddable) {
            feed.innerHTML = `<iframe src="${url}" width="100%" height="800" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
        } else {
            feed.innerHTML = `
                <div class="widget-unavailable">
                    <h2>🔗 ${platform.toUpperCase()}</h2>
                    <p>${platform} doesn't allow embedding. Opening in new tab...</p>
                    <a href="${url}" target="_blank" class="btn-primary">Open ${platform}</a>
                </div>
            `;
            // Auto-open in new tab
            window.open(url, '_blank');
        }
        
        console.log(`📱 Loaded widget: ${platform}`);
    },
    
    /**
     * Track affiliate clicks
     */
    trackClick(platform) {
        let clicks = JSON.parse(localStorage.getItem('vibelyf_clicks')) || [];
        clicks.push({
            platform,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 clicks
        if (clicks.length > 1000) {
            clicks = clicks.slice(-1000);
        }
        
        localStorage.setItem('vibelyf_clicks', JSON.stringify(clicks));
    }
};

// ═══════════════════════════════════════════════════════════════
// EXPORT TO WINDOW
// ═══════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.VibeLyfCommunicationScore = VibeLyfCommunicationScore;
    window.VibeLyfVagueDetector = VibeLyfVagueDetector;
    window.VibeLyfWidgetLoader = VibeLyfWidgetLoader;
    
    console.log('✅ VIBELYF Enhanced Communication System loaded');
}
