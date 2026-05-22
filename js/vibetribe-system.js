/**
 * VibeTribe Community System
 * 
 * A revolutionary crowd-powered linguistic archive where users contribute,
 * vote on, and curate slang terms from diverse cultural backgrounds.
 * 
 * Features:
 * - User authentication and profiles
 * - Slang submission system with "Add Slang" button
 * - VibeVote democratic voting mechanism
 * - Community dashboard with trending terms
 * - Reputation and badge system
 * - Moderation tools for quality control
 * - Auto-integration into knowledge base
 * 
 * Vision: Build the most comprehensive and culturally rich linguistic archive
 * in history through collaborative community effort.
 * 
 * @version 1.0.0
 * @date 2025-11-19
 * @author VibeCoder Team
 */

class VibeTribeSystem {
    /**
     * Initialize VibeTribe community system
     */
    constructor() {
        // Current user session
        this.currentUser = null;
        
        // API endpoints (RESTful Table API)
        this.endpoints = {
            users: 'tables/vibetribe_users',
            submissions: 'tables/slang_submissions',
            votes: 'tables/slang_votes',
            comments: 'tables/slang_comments'
        };
        
        // Cache for frequently accessed data
        this.cache = {
            trendingSubmissions: [],
            topContributors: [],
            recentSubmissions: [],
            lastUpdate: null
        };
        
        // Vote threshold for auto-approval
        this.AUTO_APPROVE_THRESHOLD = 50;
        
        // Reputation points system
        this.REPUTATION_POINTS = {
            SUBMISSION_CREATED: 5,
            SUBMISSION_APPROVED: 25,
            UPVOTE_RECEIVED: 2,
            DOWNVOTE_RECEIVED: -1,
            VOTE_CAST: 1,
            COMMENT_POSTED: 1,
            FEATURED_SUBMISSION: 50
        };
        
        // Badge definitions
        this.BADGES = {
            first_submission: {
                id: 'first_submission',
                name: '🎤 First Drop',
                description: 'Submit your first slang term',
                emoji: '🎤',
                requirement: 1
            },
            trending_creator: {
                id: 'trending_creator',
                name: '🔥 Trendsetter',
                description: 'Have a submission reach 100+ upvotes',
                emoji: '🔥',
                requirement: 100
            },
            community_leader: {
                id: 'community_leader',
                name: '👑 Vibe Leader',
                description: 'Reach 1000 reputation points',
                emoji: '👑',
                requirement: 1000
            },
            dedicated_voter: {
                id: 'dedicated_voter',
                name: '🗳️ Voice of the Tribe',
                description: 'Cast 100+ votes',
                emoji: '🗳️',
                requirement: 100
            },
            cultural_ambassador: {
                id: 'cultural_ambassador',
                name: '🌍 Cultural Ambassador',
                description: 'Get 5+ terms approved',
                emoji: '🌍',
                requirement: 5
            }
        };
        
        // Load current user from localStorage
        this.loadCurrentUser();
        
        console.log('🌟 VibeTribe Community System initialized');
    }
    
    /**
     * Load current user from localStorage
     */
    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('vibetribe_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('👤 User loaded:', this.currentUser.username);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    }
    
    /**
     * Save current user to localStorage
     */
    saveCurrentUser() {
        try {
            if (this.currentUser) {
                localStorage.setItem('vibetribe_user', JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    /**
     * Sign up new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Created user object
     */
    async signUp(userData) {
        try {
            // Validate username uniqueness
            const existingUsers = await this.searchUsers({ username: userData.username });
            if (existingUsers.length > 0) {
                throw new Error('Username already taken');
            }
            
            // Create user record
            const newUser = {
                username: userData.username,
                email: userData.email || '',
                display_name: userData.display_name || userData.username,
                avatar_emoji: userData.avatar_emoji || '👤',
                cultural_profile: userData.cultural_profile || 'universal',
                bio: userData.bio || 'New VibeTribe member!',
                reputation_score: 0,
                contributions_count: 0,
                votes_cast: 0,
                joined_date: Date.now(),
                last_active: Date.now(),
                badges: [],
                is_moderator: false
            };
            
            const response = await fetch(this.endpoints.users, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create user account');
            }
            
            const createdUser = await response.json();
            
            // Set as current user
            this.currentUser = createdUser;
            this.saveCurrentUser();
            
            console.log('✅ User signed up:', createdUser.username);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('vibetribeUserSignedUp', {
                detail: { user: createdUser }
            }));
            
            return createdUser;
            
        } catch (error) {
            console.error('Sign up failed:', error);
            throw error;
        }
    }
    
    /**
     * Log in existing user
     * @param {string} username - Username to log in
     * @returns {Promise<object>} User object
     */
    async logIn(username) {
        try {
            // Search for user
            const users = await this.searchUsers({ username });
            
            if (users.length === 0) {
                throw new Error('User not found');
            }
            
            const user = users[0];
            
            // Update last active
            await this.updateUser(user.id, {
                last_active: Date.now()
            });
            
            // Set as current user
            this.currentUser = user;
            this.saveCurrentUser();
            
            console.log('✅ User logged in:', user.username);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('vibetribeUserLoggedIn', {
                detail: { user }
            }));
            
            return user;
            
        } catch (error) {
            console.error('Log in failed:', error);
            throw error;
        }
    }
    
    /**
     * Log out current user
     */
    logOut() {
        this.currentUser = null;
        localStorage.removeItem('vibetribe_user');
        
        console.log('✅ User logged out');
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('vibetribeUserLoggedOut'));
    }
    
    /**
     * Search for users
     * @param {object} criteria - Search criteria
     * @returns {Promise<Array>} Array of users
     */
    async searchUsers(criteria) {
        try {
            let url = this.endpoints.users + '?limit=100';
            
            if (criteria.username) {
                url += `&search=${encodeURIComponent(criteria.username)}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data.data || [];
            
        } catch (error) {
            console.error('User search failed:', error);
            return [];
        }
    }
    
    /**
     * Update user data
     * @param {string} userId - User ID
     * @param {object} updates - Fields to update
     * @returns {Promise<object>} Updated user
     */
    async updateUser(userId, updates) {
        try {
            const response = await fetch(`${this.endpoints.users}/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            
            const updatedUser = await response.json();
            
            // Update current user if it's them
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = updatedUser;
                this.saveCurrentUser();
            }
            
            return updatedUser;
            
        } catch (error) {
            console.error('User update failed:', error);
            throw error;
        }
    }
    
    /**
     * Submit new slang term
     * @param {object} slangData - Slang submission data
     * @returns {Promise<object>} Created submission
     */
    async submitSlang(slangData) {
        if (!this.isLoggedIn()) {
            throw new Error('Must be logged in to submit slang');
        }
        
        try {
            // Create submission record
            const submission = {
                term: slangData.term.toLowerCase(),
                meaning: slangData.meaning,
                category: slangData.category,
                language: slangData.language,
                context: slangData.context || '',
                example_usage: slangData.example_usage || '',
                submitted_by: this.currentUser.id,
                submitter_username: this.currentUser.username,
                submission_date: Date.now(),
                status: 'pending',
                upvotes: 0,
                downvotes: 0,
                vote_score: 0,
                comments_count: 0,
                trending_score: 0,
                is_featured: false,
                approved_by: '',
                approved_date: null
            };
            
            const response = await fetch(this.endpoints.submissions, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit slang');
            }
            
            const createdSubmission = await response.json();
            
            // Award reputation points
            await this.awardReputation(
                this.currentUser.id,
                this.REPUTATION_POINTS.SUBMISSION_CREATED,
                'Submitted slang term'
            );
            
            // Update user contributions count
            await this.updateUser(this.currentUser.id, {
                contributions_count: (this.currentUser.contributions_count || 0) + 1
            });
            
            // Check for first submission badge
            await this.checkBadge('first_submission', this.currentUser.contributions_count + 1);
            
            console.log('✅ Slang submitted:', createdSubmission.term);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('vibetribeSlangSubmitted', {
                detail: { submission: createdSubmission }
            }));
            
            // Clear cache
            this.cache.lastUpdate = null;
            
            return createdSubmission;
            
        } catch (error) {
            console.error('Slang submission failed:', error);
            throw error;
        }
    }
    
    /**
     * Vote on a slang submission
     * @param {string} submissionId - Submission ID
     * @param {string} voteType - 'upvote' or 'downvote'
     * @returns {Promise<object>} Updated submission
     */
    async voteOnSlang(submissionId, voteType) {
        if (!this.isLoggedIn()) {
            throw new Error('Must be logged in to vote');
        }
        
        try {
            // Check if user already voted
            const existingVote = await this.getUserVote(submissionId, this.currentUser.id);
            
            if (existingVote) {
                // Update existing vote
                if (existingVote.vote_type === voteType) {
                    // Remove vote
                    await this.removeVote(existingVote.id, submissionId);
                    return await this.getSubmission(submissionId);
                } else {
                    // Change vote
                    await this.updateVote(existingVote.id, voteType, submissionId);
                    return await this.getSubmission(submissionId);
                }
            }
            
            // Create new vote
            const vote = {
                submission_id: submissionId,
                user_id: this.currentUser.id,
                vote_type: voteType,
                vote_date: Date.now(),
                vote_weight: Math.min(this.currentUser.reputation_score / 100, 2) || 1
            };
            
            const response = await fetch(this.endpoints.votes, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vote)
            });
            
            if (!response.ok) {
                throw new Error('Failed to cast vote');
            }
            
            // Update submission vote counts
            const submission = await this.getSubmission(submissionId);
            const upvoteChange = voteType === 'upvote' ? 1 : 0;
            const downvoteChange = voteType === 'downvote' ? 1 : 0;
            
            const updatedSubmission = await this.updateSubmission(submissionId, {
                upvotes: submission.upvotes + upvoteChange,
                downvotes: submission.downvotes + downvoteChange,
                vote_score: (submission.upvotes + upvoteChange) - (submission.downvotes + downvoteChange)
            });
            
            // Award reputation to voter
            await this.awardReputation(
                this.currentUser.id,
                this.REPUTATION_POINTS.VOTE_CAST,
                'Cast vote'
            );
            
            // Update voter's vote count
            await this.updateUser(this.currentUser.id, {
                votes_cast: (this.currentUser.votes_cast || 0) + 1
            });
            
            // Check for dedicated voter badge
            await this.checkBadge('dedicated_voter', this.currentUser.votes_cast + 1);
            
            // Award reputation to submission author
            const reputationPoints = voteType === 'upvote' 
                ? this.REPUTATION_POINTS.UPVOTE_RECEIVED 
                : this.REPUTATION_POINTS.DOWNVOTE_RECEIVED;
                
            await this.awardReputation(
                submission.submitted_by,
                reputationPoints,
                `Received ${voteType}`
            );
            
            // Check for trending creator badge
            if (updatedSubmission.upvotes >= 100) {
                await this.checkBadge('trending_creator', updatedSubmission.upvotes, submission.submitted_by);
            }
            
            // Check for auto-approval
            if (updatedSubmission.vote_score >= this.AUTO_APPROVE_THRESHOLD && 
                updatedSubmission.status === 'pending') {
                await this.approveSubmission(submissionId, 'auto');
            }
            
            console.log(`✅ Vote cast: ${voteType} on ${submission.term}`);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('vibetribeVoteCast', {
                detail: { submission: updatedSubmission, voteType }
            }));
            
            // Clear cache
            this.cache.lastUpdate = null;
            
            return updatedSubmission;
            
        } catch (error) {
            console.error('Vote failed:', error);
            throw error;
        }
    }
    
    /**
     * Get user's vote on a submission
     * @param {string} submissionId - Submission ID
     * @param {string} userId - User ID
     * @returns {Promise<object|null>} Vote object or null
     */
    async getUserVote(submissionId, userId) {
        try {
            const response = await fetch(`${this.endpoints.votes}?limit=100`);
            const data = await response.json();
            
            const votes = data.data || [];
            return votes.find(v => v.submission_id === submissionId && v.user_id === userId) || null;
            
        } catch (error) {
            console.error('Failed to get user vote:', error);
            return null;
        }
    }
    
    /**
     * Remove a vote
     * @param {string} voteId - Vote ID
     * @param {string} submissionId - Submission ID
     */
    async removeVote(voteId, submissionId) {
        try {
            await fetch(`${this.endpoints.votes}/${voteId}`, {
                method: 'DELETE'
            });
            
            // Update submission counts
            const submission = await this.getSubmission(submissionId);
            const vote = await fetch(`${this.endpoints.votes}/${voteId}`).then(r => r.json());
            
            const upvoteChange = vote.vote_type === 'upvote' ? -1 : 0;
            const downvoteChange = vote.vote_type === 'downvote' ? -1 : 0;
            
            await this.updateSubmission(submissionId, {
                upvotes: submission.upvotes + upvoteChange,
                downvotes: submission.downvotes + downvoteChange,
                vote_score: (submission.upvotes + upvoteChange) - (submission.downvotes + downvoteChange)
            });
            
        } catch (error) {
            console.error('Failed to remove vote:', error);
        }
    }
    
    /**
     * Update a vote
     * @param {string} voteId - Vote ID
     * @param {string} newVoteType - New vote type
     * @param {string} submissionId - Submission ID
     */
    async updateVote(voteId, newVoteType, submissionId) {
        try {
            await fetch(`${this.endpoints.votes}/${voteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote_type: newVoteType })
            });
            
            // Update submission counts (change from one to the other)
            const submission = await this.getSubmission(submissionId);
            const upvoteChange = newVoteType === 'upvote' ? 2 : -2;
            
            await this.updateSubmission(submissionId, {
                upvotes: submission.upvotes + (newVoteType === 'upvote' ? 1 : -1),
                downvotes: submission.downvotes + (newVoteType === 'downvote' ? 1 : -1),
                vote_score: submission.vote_score + upvoteChange
            });
            
        } catch (error) {
            console.error('Failed to update vote:', error);
        }
    }
    
    /**
     * Get a single submission
     * @param {string} submissionId - Submission ID
     * @returns {Promise<object>} Submission object
     */
    async getSubmission(submissionId) {
        try {
            const response = await fetch(`${this.endpoints.submissions}/${submissionId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get submission:', error);
            throw error;
        }
    }
    
    /**
     * Update a submission
     * @param {string} submissionId - Submission ID
     * @param {object} updates - Fields to update
     * @returns {Promise<object>} Updated submission
     */
    async updateSubmission(submissionId, updates) {
        try {
            const response = await fetch(`${this.endpoints.submissions}/${submissionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Failed to update submission:', error);
            throw error;
        }
    }
    
    /**
     * Get trending submissions
     * @param {number} limit - Number of submissions to return
     * @returns {Promise<Array>} Array of submissions
     */
    async getTrendingSubmissions(limit = 20) {
        try {
            // Check cache
            if (this.cache.trendingSubmissions.length > 0 && 
                this.cache.lastUpdate && 
                Date.now() - this.cache.lastUpdate < 60000) { // 1 minute cache
                return this.cache.trendingSubmissions.slice(0, limit);
            }
            
            // Fetch all submissions
            const response = await fetch(`${this.endpoints.submissions}?limit=1000&sort=-vote_score`);
            const data = await response.json();
            
            const submissions = data.data || [];
            
            // Calculate trending score (recency + votes)
            const now = Date.now();
            submissions.forEach(sub => {
                const ageHours = (now - sub.submission_date) / (1000 * 60 * 60);
                const recencyFactor = Math.max(0, 1 - (ageHours / 168)); // Decay over 1 week
                sub.trending_score = (sub.vote_score * recencyFactor) + (sub.upvotes * 0.1);
            });
            
            // Sort by trending score
            submissions.sort((a, b) => b.trending_score - a.trending_score);
            
            // Update cache
            this.cache.trendingSubmissions = submissions;
            this.cache.lastUpdate = Date.now();
            
            return submissions.slice(0, limit);
            
        } catch (error) {
            console.error('Failed to get trending submissions:', error);
            return [];
        }
    }
    
    /**
     * Get recent submissions
     * @param {number} limit - Number of submissions to return
     * @returns {Promise<Array>} Array of submissions
     */
    async getRecentSubmissions(limit = 20) {
        try {
            const response = await fetch(`${this.endpoints.submissions}?limit=${limit}&sort=-submission_date`);
            const data = await response.json();
            
            return data.data || [];
            
        } catch (error) {
            console.error('Failed to get recent submissions:', error);
            return [];
        }
    }
    
    /**
     * Get top contributors
     * @param {number} limit - Number of users to return
     * @returns {Promise<Array>} Array of users
     */
    async getTopContributors(limit = 10) {
        try {
            const response = await fetch(`${this.endpoints.users}?limit=100&sort=-reputation_score`);
            const data = await response.json();
            
            return (data.data || []).slice(0, limit);
            
        } catch (error) {
            console.error('Failed to get top contributors:', error);
            return [];
        }
    }
    
    /**
     * Approve a submission (moderator only)
     * @param {string} submissionId - Submission ID
     * @param {string} moderatorId - Moderator user ID ('auto' for auto-approval)
     * @returns {Promise<object>} Updated submission
     */
    async approveSubmission(submissionId, moderatorId) {
        try {
            const submission = await this.getSubmission(submissionId);
            
            // Update submission status
            const updatedSubmission = await this.updateSubmission(submissionId, {
                status: 'approved',
                approved_by: moderatorId,
                approved_date: Date.now()
            });
            
            // Award reputation to submitter
            await this.awardReputation(
                submission.submitted_by,
                this.REPUTATION_POINTS.SUBMISSION_APPROVED,
                'Submission approved'
            );
            
            // Add to global knowledge base
            await this.addToKnowledgeBase(updatedSubmission);
            
            console.log('✅ Submission approved:', updatedSubmission.term);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('vibetribeSubmissionApproved', {
                detail: { submission: updatedSubmission }
            }));
            
            return updatedSubmission;
            
        } catch (error) {
            console.error('Failed to approve submission:', error);
            throw error;
        }
    }
    
    /**
     * Add approved submission to global knowledge base
     * @param {object} submission - Approved submission
     */
    async addToKnowledgeBase(submission) {
        try {
            // Get the appropriate database array
            let database = null;
            switch (submission.language) {
                case 'aave':
                    database = window.aaveSlang;
                    break;
                case 'latino':
                    database = window.latinoSlang;
                    break;
                case 'asian':
                    database = window.asianSlang;
                    break;
                case 'southern':
                    database = window.southernSlang;
                    break;
                case 'internet':
                    database = window.internetSlang;
                    break;
                case 'british':
                    database = window.britishSlang;
                    break;
                case 'caribbean':
                    database = window.caribbeanSlang;
                    break;
            }
            
            if (!database) {
                console.warn('Unknown language database:', submission.language);
                return;
            }
            
            // Check if term already exists
            if (database.find(entry => entry.term === submission.term)) {
                console.log('Term already in knowledge base:', submission.term);
                return;
            }
            
            // Add to database
            const entry = {
                term: submission.term,
                meaning: submission.meaning,
                language: submission.language,
                category: submission.category,
                confidence: 0.95, // Community-approved terms get high confidence
                context: submission.context,
                example: submission.example_usage,
                source: 'vibetribe_community',
                contributor: submission.submitter_username,
                votes: submission.vote_score
            };
            
            database.push(entry);
            
            // Also add to comprehensive array
            if (window.comprehensiveCulturalLanguage) {
                window.comprehensiveCulturalLanguage.push(entry);
            }
            
            // Rebuild CultrVibe indexes if available
            if (window.cultrVibeSystem) {
                window.cultrVibeSystem.profileIndexes = window.cultrVibeSystem.buildProfileIndexes();
            }
            
            console.log(`✅ Added "${submission.term}" to ${submission.language} knowledge base`);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('vibetribeKnowledgeBaseUpdated', {
                detail: { term: submission.term, database: submission.language }
            }));
            
        } catch (error) {
            console.error('Failed to add to knowledge base:', error);
        }
    }
    
    /**
     * Award reputation points to user
     * @param {string} userId - User ID
     * @param {number} points - Points to award
     * @param {string} reason - Reason for award
     */
    async awardReputation(userId, points, reason) {
        try {
            const response = await fetch(`${this.endpoints.users}/${userId}`);
            const user = await response.json();
            
            const newScore = (user.reputation_score || 0) + points;
            
            await this.updateUser(userId, {
                reputation_score: Math.max(0, newScore)
            });
            
            console.log(`🏆 Awarded ${points} reputation to ${user.username}: ${reason}`);
            
            // Check for community leader badge
            if (newScore >= 1000) {
                await this.checkBadge('community_leader', newScore, userId);
            }
            
        } catch (error) {
            console.error('Failed to award reputation:', error);
        }
    }
    
    /**
     * Check and award badge if requirements met
     * @param {string} badgeId - Badge ID
     * @param {number} value - Value to check against requirement
     * @param {string} userId - User ID (defaults to current user)
     */
    async checkBadge(badgeId, value, userId = null) {
        try {
            const targetUserId = userId || this.currentUser.id;
            const badge = this.BADGES[badgeId];
            
            if (!badge) return;
            
            const response = await fetch(`${this.endpoints.users}/${targetUserId}`);
            const user = await response.json();
            
            // Check if user already has badge
            if (user.badges && user.badges.includes(badgeId)) {
                return;
            }
            
            // Check if requirement met
            if (value >= badge.requirement) {
                const newBadges = [...(user.badges || []), badgeId];
                
                await this.updateUser(targetUserId, {
                    badges: newBadges
                });
                
                console.log(`🎖️ Badge earned: ${badge.name} by ${user.username}`);
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('vibetribeBadgeEarned', {
                    detail: { userId: targetUserId, badge }
                }));
            }
            
        } catch (error) {
            console.error('Failed to check badge:', error);
        }
    }
    
    /**
     * Get user statistics
     * @param {string} userId - User ID
     * @returns {Promise<object>} User stats
     */
    async getUserStats(userId) {
        try {
            const user = await fetch(`${this.endpoints.users}/${userId}`).then(r => r.json());
            
            // Get user's submissions
            const submissionsResponse = await fetch(`${this.endpoints.submissions}?limit=1000`);
            const submissionsData = await submissionsResponse.json();
            const userSubmissions = (submissionsData.data || []).filter(s => s.submitted_by === userId);
            
            // Calculate stats
            const stats = {
                username: user.username,
                reputation: user.reputation_score || 0,
                totalSubmissions: userSubmissions.length,
                approvedSubmissions: userSubmissions.filter(s => s.status === 'approved').length,
                pendingSubmissions: userSubmissions.filter(s => s.status === 'pending').length,
                totalUpvotes: userSubmissions.reduce((sum, s) => sum + s.upvotes, 0),
                totalVotesCast: user.votes_cast || 0,
                badges: user.badges || [],
                joinedDate: user.joined_date,
                rank: null // Will be calculated
            };
            
            return stats;
            
        } catch (error) {
            console.error('Failed to get user stats:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeTribeSystem;
}
