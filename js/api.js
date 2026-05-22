/**
 * VibeTribe RESTful Table API Wrapper
 * Simplified interface for database operations
 */

class VibeAPI {
    constructor() {
        this.baseURL = 'tables/';
        this.currentUser = this.getCurrentUser();
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            return JSON.parse(userStr);
        }
        
        // For demo purposes, default to user1
        return { id: 'user1', username: 'alexcodes' };
    }

    /**
     * Set current user
     */
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // ==================== APPS API ====================

    /**
     * Get apps with pagination and filters
     * @param {Object} options - { page, limit, search, sort, featured, trending, culturalProfile }
     */
    async getApps(options = {}) {
        const {
            page = 1,
            limit = 10,
            search = '',
            sort = '-created_at',
            featured = null,
            trending = null,
            culturalProfile = null,
            creatorId = null
        } = options;

        const params = new URLSearchParams({
            page,
            limit,
            sort
        });

        if (search) params.append('search', search);

        try {
            const response = await fetch(`${this.baseURL}apps?${params}`);
            const data = await response.json();
            
            // Apply additional filters (client-side for demo)
            let filteredData = data.data;
            
            if (featured !== null) {
                filteredData = filteredData.filter(app => app.featured === featured);
            }
            
            if (trending !== null) {
                filteredData = filteredData.filter(app => app.trending_score && app.trending_score >= 80);
            }
            
            if (culturalProfile) {
                filteredData = filteredData.filter(app => app.cultural_profile === culturalProfile);
            }
            
            if (creatorId) {
                filteredData = filteredData.filter(app => app.creator_id === creatorId);
            }

            return {
                ...data,
                data: filteredData,
                total: filteredData.length
            };
        } catch (error) {
            console.error('Error fetching apps:', error);
            throw error;
        }
    }

    /**
     * Get single app by ID
     */
    async getApp(appId) {
        try {
            const response = await fetch(`${this.baseURL}apps/${appId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching app:', error);
            throw error;
        }
    }

    /**
     * Create new app
     */
    async createApp(appData) {
        try {
            const response = await fetch(`${this.baseURL}apps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...appData,
                    creator_id: this.currentUser.id,
                    likes_count: 0,
                    comments_count: 0,
                    saves_count: 0,
                    remixes_count: 0,
                    views_count: 0,
                    status: 'published',
                    featured: false,
                    trending_score: 0
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating app:', error);
            throw error;
        }
    }

    /**
     * Update app
     */
    async updateApp(appId, updates) {
        try {
            const response = await fetch(`${this.baseURL}apps/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating app:', error);
            throw error;
        }
    }

    /**
     * Delete app
     */
    async deleteApp(appId) {
        try {
            await fetch(`${this.baseURL}apps/${appId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting app:', error);
            throw error;
        }
    }

    /**
     * Increment view count
     */
    async incrementViews(appId) {
        try {
            const app = await this.getApp(appId);
            await this.updateApp(appId, {
                views_count: (app.views_count || 0) + 1
            });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }

    // ==================== USERS API ====================

    /**
     * Get users with pagination
     */
    async getUsers(options = {}) {
        const { page = 1, limit = 10, search = '' } = options;

        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);

        try {
            const response = await fetch(`${this.baseURL}users?${params}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    /**
     * Get single user by ID
     */
    async getUser(userId) {
        try {
            const response = await fetch(`${this.baseURL}users/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateUser(userId, updates) {
        try {
            const response = await fetch(`${this.baseURL}users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // ==================== INTERACTIONS API ====================

    /**
     * Like an app
     */
    async likeApp(appId) {
        try {
            // Check if already liked
            const existingLike = await this.getInteraction(appId, 'like');
            if (existingLike) {
                // Unlike
                await this.deleteInteraction(existingLike.id);
                await this.updateApp(appId, {
                    likes_count: Math.max(0, (await this.getApp(appId)).likes_count - 1)
                });
                return { liked: false };
            } else {
                // Like
                await this.createInteraction({
                    app_id: appId,
                    type: 'like'
                });
                await this.updateApp(appId, {
                    likes_count: (await this.getApp(appId)).likes_count + 1
                });
                return { liked: true };
            }
        } catch (error) {
            console.error('Error liking app:', error);
            throw error;
        }
    }

    /**
     * Save an app
     */
    async saveApp(appId) {
        try {
            const existingSave = await this.getInteraction(appId, 'save');
            if (existingSave) {
                await this.deleteInteraction(existingSave.id);
                await this.updateApp(appId, {
                    saves_count: Math.max(0, (await this.getApp(appId)).saves_count - 1)
                });
                return { saved: false };
            } else {
                await this.createInteraction({
                    app_id: appId,
                    type: 'save'
                });
                await this.updateApp(appId, {
                    saves_count: (await this.getApp(appId)).saves_count + 1
                });
                return { saved: true };
            }
        } catch (error) {
            console.error('Error saving app:', error);
            throw error;
        }
    }

    /**
     * Add comment to app
     */
    async commentOnApp(appId, commentText, parentCommentId = null) {
        try {
            const comment = await this.createInteraction({
                app_id: appId,
                type: 'comment',
                comment_text: commentText,
                parent_comment_id: parentCommentId
            });
            
            await this.updateApp(appId, {
                comments_count: (await this.getApp(appId)).comments_count + 1
            });
            
            return comment;
        } catch (error) {
            console.error('Error commenting on app:', error);
            throw error;
        }
    }

    /**
     * Get comments for an app
     */
    async getComments(appId) {
        try {
            const response = await fetch(`${this.baseURL}interactions?limit=100`);
            const data = await response.json();
            
            return data.data.filter(interaction => 
                interaction.type === 'comment' && 
                interaction.app_id === appId
            );
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    /**
     * Get user's interaction with an app
     */
    async getInteraction(appId, type) {
        try {
            const response = await fetch(`${this.baseURL}interactions?limit=100`);
            const data = await response.json();
            
            return data.data.find(interaction => 
                interaction.user_id === this.currentUser.id &&
                interaction.app_id === appId &&
                interaction.type === type
            );
        } catch (error) {
            console.error('Error fetching interaction:', error);
            return null;
        }
    }

    /**
     * Create interaction
     */
    async createInteraction(interactionData) {
        try {
            const response = await fetch(`${this.baseURL}interactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...interactionData,
                    user_id: this.currentUser.id
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating interaction:', error);
            throw error;
        }
    }

    /**
     * Delete interaction
     */
    async deleteInteraction(interactionId) {
        try {
            await fetch(`${this.baseURL}interactions/${interactionId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting interaction:', error);
            throw error;
        }
    }

    /**
     * Get user's saved apps
     */
    async getSavedApps() {
        try {
            const response = await fetch(`${this.baseURL}interactions?limit=100`);
            const data = await response.json();
            
            const savedInteractions = data.data.filter(interaction => 
                interaction.user_id === this.currentUser.id &&
                interaction.type === 'save'
            );
            
            const appIds = savedInteractions.map(i => i.app_id);
            const apps = await Promise.all(appIds.map(id => this.getApp(id)));
            
            return apps.filter(app => app); // Filter out any failed requests
        } catch (error) {
            console.error('Error fetching saved apps:', error);
            throw error;
        }
    }

    // ==================== FOLLOWS API ====================

    /**
     * Follow a user
     */
    async followUser(userId) {
        try {
            const existingFollow = await this.getFollow(userId);
            if (existingFollow) {
                // Unfollow
                await this.deleteFollow(existingFollow.id);
                return { following: false };
            } else {
                // Follow
                await fetch(`${this.baseURL}follows`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        follower_id: this.currentUser.id,
                        following_id: userId
                    })
                });
                return { following: true };
            }
        } catch (error) {
            console.error('Error following user:', error);
            throw error;
        }
    }

    /**
     * Get follow relationship
     */
    async getFollow(userId) {
        try {
            const response = await fetch(`${this.baseURL}follows?limit=100`);
            const data = await response.json();
            
            return data.data.find(follow => 
                follow.follower_id === this.currentUser.id &&
                follow.following_id === userId
            );
        } catch (error) {
            console.error('Error fetching follow:', error);
            return null;
        }
    }

    /**
     * Delete follow
     */
    async deleteFollow(followId) {
        try {
            await fetch(`${this.baseURL}follows/${followId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting follow:', error);
            throw error;
        }
    }

    /**
     * Get user's followers
     */
    async getFollowers(userId) {
        try {
            const response = await fetch(`${this.baseURL}follows?limit=1000`);
            const data = await response.json();
            
            const followerIds = data.data
                .filter(follow => follow.following_id === userId)
                .map(follow => follow.follower_id);
            
            const followers = await Promise.all(
                followerIds.map(id => this.getUser(id))
            );
            
            return followers.filter(user => user);
        } catch (error) {
            console.error('Error fetching followers:', error);
            throw error;
        }
    }

    /**
     * Get users that a user is following
     */
    async getFollowing(userId) {
        try {
            const response = await fetch(`${this.baseURL}follows?limit=1000`);
            const data = await response.json();
            
            const followingIds = data.data
                .filter(follow => follow.follower_id === userId)
                .map(follow => follow.following_id);
            
            const following = await Promise.all(
                followingIds.map(id => this.getUser(id))
            );
            
            return following.filter(user => user);
        } catch (error) {
            console.error('Error fetching following:', error);
            throw error;
        }
    }

    // ==================== NOTIFICATIONS API ====================

    /**
     * Get notifications for current user
     */
    async getNotifications(options = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = options;

        try {
            const response = await fetch(`${this.baseURL}notifications?page=${page}&limit=100`);
            const data = await response.json();
            
            let notifications = data.data.filter(notif => 
                notif.recipient_id === this.currentUser.id
            );
            
            if (unreadOnly) {
                notifications = notifications.filter(notif => !notif.read);
            }
            
            // Sort by creation date (newest first)
            notifications.sort((a, b) => b.created_at - a.created_at);
            
            return {
                ...data,
                data: notifications.slice(0, limit),
                total: notifications.length
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId) {
        try {
            await fetch(`${this.baseURL}notifications/${notificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsRead() {
        try {
            const { data } = await this.getNotifications({ unreadOnly: true });
            await Promise.all(
                data.map(notif => this.markNotificationRead(notif.id))
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Create notification
     */
    async createNotification(notificationData) {
        try {
            const response = await fetch(`${this.baseURL}notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...notificationData,
                    actor_id: this.currentUser.id,
                    read: false
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // ==================== FEED ALGORITHMS ====================

    /**
     * Get "For You" feed (personalized)
     */
    async getForYouFeed(page = 1, limit = 10) {
        try {
            // Get all apps
            const { data: apps } = await this.getApps({ page, limit: 100 });
            
            // Simple algorithm: Mix trending, followed users, and cultural profile matches
            const scoredApps = apps.map(app => {
                let score = 0;
                
                // Trending boost
                if (app.trending_score) score += app.trending_score;
                
                // Engagement boost
                score += (app.likes_count * 2) + (app.comments_count * 3) + (app.saves_count * 5);
                
                // Featured boost
                if (app.featured) score += 50;
                
                // Recency boost (newer apps get higher scores)
                const daysSinceCreation = (Date.now() - app.created_at) / (1000 * 60 * 60 * 24);
                score += Math.max(0, 100 - daysSinceCreation * 10);
                
                return { ...app, score };
            });
            
            // Sort by score and paginate
            scoredApps.sort((a, b) => b.score - a.score);
            const start = (page - 1) * limit;
            const paginatedApps = scoredApps.slice(start, start + limit);
            
            return {
                data: paginatedApps,
                total: scoredApps.length,
                page,
                limit
            };
        } catch (error) {
            console.error('Error fetching For You feed:', error);
            throw error;
        }
    }

    /**
     * Get "Following" feed
     */
    async getFollowingFeed(page = 1, limit = 10) {
        try {
            const following = await this.getFollowing(this.currentUser.id);
            const followingIds = following.map(user => user.id);
            
            const { data: apps } = await this.getApps({ page, limit: 100 });
            const followingApps = apps.filter(app => 
                followingIds.includes(app.creator_id)
            );
            
            // Sort by creation date (newest first)
            followingApps.sort((a, b) => b.created_at - a.created_at);
            
            const start = (page - 1) * limit;
            const paginatedApps = followingApps.slice(start, start + limit);
            
            return {
                data: paginatedApps,
                total: followingApps.length,
                page,
                limit
            };
        } catch (error) {
            console.error('Error fetching Following feed:', error);
            throw error;
        }
    }

    /**
     * Get "Trending" feed
     */
    async getTrendingFeed(page = 1, limit = 10) {
        try {
            const { data: apps } = await this.getApps({ page, limit: 100, trending: true });
            
            // Sort by trending score
            apps.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));
            
            const start = (page - 1) * limit;
            const paginatedApps = apps.slice(start, start + limit);
            
            return {
                data: paginatedApps,
                total: apps.length,
                page,
                limit
            };
        } catch (error) {
            console.error('Error fetching Trending feed:', error);
            throw error;
        }
    }
}

// Initialize API instance
const api = new VibeAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibeAPI;
}
