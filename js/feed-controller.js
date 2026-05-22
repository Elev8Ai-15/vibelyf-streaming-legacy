/**
 * VibeTribe Feed Controller
 * Manages feed loading, tabs, infinite scroll, and pull-to-refresh
 */

class FeedController {
    constructor() {
        this.currentTab = 'forYou';
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMore = true;
        this.feedData = [];
        this.featuredApps = [];
        
        this.init();
    }

    /**
     * Initialize feed controller
     */
    async init() {
        this.attachEventListeners();
        await this.loadFeaturedApps();
        await this.loadFeed();
        this.setupInfiniteScroll();
        this.setupPullToRefresh();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Feed tabs
        const tabs = document.querySelectorAll('.feed-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }
    }

    /**
     * Switch feed tab
     */
    async switchTab(tabName) {
        if (this.currentTab === tabName || this.isLoading) return;

        // Update tab UI
        document.querySelectorAll('.feed-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Reset and load new feed
        this.currentTab = tabName;
        this.currentPage = 1;
        this.feedData = [];
        this.hasMore = true;
        
        await this.loadFeed();
    }

    /**
     * Load featured apps carousel
     */
    async loadFeaturedApps() {
        try {
            const { data } = await api.getApps({ featured: true, limit: 10 });
            this.featuredApps = data;
            this.renderFeaturedCarousel();
        } catch (error) {
            console.error('Error loading featured apps:', error);
        }
    }

    /**
     * Render featured carousel
     */
    renderFeaturedCarousel() {
        const carousel = document.getElementById('featuredCarousel');
        if (!carousel) return;

        if (this.featuredApps.length === 0) {
            carousel.innerHTML = `
                <div class="text-sm text-secondary p-3">
                    No featured apps yet. Check back soon!
                </div>
            `;
            return;
        }

        carousel.innerHTML = this.featuredApps.map(app => `
            <div class="carousel-item" data-app-id="${app.id}">
                <div class="carousel-item-image-wrapper">
                    <img 
                        src="${app.preview_image || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400'}" 
                        alt="${app.title}"
                        class="carousel-item-image"
                        onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400'"
                    >
                </div>
                <span class="carousel-item-name">${app.title}</span>
            </div>
        `).join('');

        // Add click handlers
        carousel.querySelectorAll('.carousel-item').forEach(item => {
            item.addEventListener('click', () => {
                const appId = item.dataset.appId;
                this.openAppPreview(appId);
            });
        });
    }

    /**
     * Load feed based on current tab
     */
    async loadFeed() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            let feedData;

            switch (this.currentTab) {
                case 'forYou':
                    feedData = await api.getForYouFeed(this.currentPage, 10);
                    break;
                case 'following':
                    feedData = await api.getFollowingFeed(this.currentPage, 10);
                    break;
                case 'trending':
                    feedData = await api.getTrendingFeed(this.currentPage, 10);
                    break;
            }

            if (this.currentPage === 1) {
                this.feedData = feedData.data;
            } else {
                this.feedData = [...this.feedData, ...feedData.data];
            }

            this.hasMore = feedData.data.length >= 10;
            this.renderFeed();
        } catch (error) {
            console.error('Error loading feed:', error);
            this.showError();
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    /**
     * Load more apps (pagination)
     */
    async loadMore() {
        if (!this.hasMore || this.isLoading) return;
        
        this.currentPage++;
        await this.loadFeed();
    }

    /**
     * Render feed content
     */
    renderFeed() {
        const feedContent = document.getElementById('feedContent');
        const loadMoreContainer = document.getElementById('loadMoreContainer');

        if (!feedContent) return;

        // Empty state
        if (this.feedData.length === 0) {
            feedContent.innerHTML = this.getEmptyState();
            loadMoreContainer.style.display = 'none';
            return;
        }

        // Render app cards
        feedContent.innerHTML = this.feedData.map(app => 
            window.renderAppCard ? window.renderAppCard(app) : this.renderBasicAppCard(app)
        ).join('');

        // Show/hide load more button
        if (this.hasMore) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }

        // Attach event listeners to cards
        this.attachCardEventListeners();
    }

    /**
     * Render basic app card (fallback if app-card.js not loaded)
     */
    renderBasicAppCard(app) {
        return `
            <div class="app-card" data-app-id="${app.id}">
                <div class="app-card-header">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${app.creator_id}" 
                         alt="Creator" class="app-card-avatar">
                    <div class="app-card-creator">
                        <div class="app-card-creator-name">Creator</div>
                        <div class="app-card-time">Just now</div>
                    </div>
                    <button class="app-card-menu-btn">⋮</button>
                </div>
                
                <div class="app-card-preview">
                    <img src="${app.preview_image || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800'}" 
                         alt="${app.title}">
                </div>
                
                <div class="app-card-content">
                    <h3 class="app-card-title">${app.title}</h3>
                    <p class="app-card-description">${app.description || ''}</p>
                    <div class="app-card-tags">
                        <span class="app-card-tag">${app.cultural_profile}</span>
                    </div>
                </div>
                
                <div class="app-card-actions">
                    <button class="app-card-action like-btn" data-app-id="${app.id}">
                        <span class="action-icon">❤️</span>
                        <span class="action-count">${app.likes_count || 0}</span>
                    </button>
                    <button class="app-card-action comment-btn" data-app-id="${app.id}">
                        <span class="action-icon">💬</span>
                        <span class="action-count">${app.comments_count || 0}</span>
                    </button>
                    <button class="app-card-action save-btn" data-app-id="${app.id}">
                        <span class="action-icon">🔖</span>
                        <span class="action-count">${app.saves_count || 0}</span>
                    </button>
                    <button class="app-card-action share-btn" data-app-id="${app.id}">
                        <span class="action-icon">📤</span>
                        <span class="action-text">Share</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to app cards
     */
    attachCardEventListeners() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const appId = btn.dataset.appId;
                await this.handleLike(appId, btn);
            });
        });

        // Save buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const appId = btn.dataset.appId;
                await this.handleSave(appId, btn);
            });
        });

        // Comment buttons
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = btn.dataset.appId;
                this.openComments(appId);
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const appId = btn.dataset.appId;
                this.handleShare(appId);
            });
        });

        // Card click (open preview)
        document.querySelectorAll('.app-card').forEach(card => {
            card.addEventListener('click', () => {
                const appId = card.dataset.appId;
                this.openAppPreview(appId);
            });
        });
    }

    /**
     * Handle like action
     */
    async handleLike(appId, btn) {
        try {
            const result = await api.likeApp(appId);
            
            const countSpan = btn.querySelector('.action-count');
            const currentCount = parseInt(countSpan.textContent) || 0;
            
            if (result.liked) {
                btn.classList.add('active');
                countSpan.textContent = currentCount + 1;
            } else {
                btn.classList.remove('active');
                countSpan.textContent = Math.max(0, currentCount - 1);
            }
        } catch (error) {
            console.error('Error liking app:', error);
        }
    }

    /**
     * Handle save action
     */
    async handleSave(appId, btn) {
        try {
            const result = await api.saveApp(appId);
            
            const countSpan = btn.querySelector('.action-count');
            const currentCount = parseInt(countSpan.textContent) || 0;
            
            if (result.saved) {
                btn.classList.add('active');
                countSpan.textContent = currentCount + 1;
                this.showToast('App saved!');
            } else {
                btn.classList.remove('active');
                countSpan.textContent = Math.max(0, currentCount - 1);
                this.showToast('App removed from saved');
            }
        } catch (error) {
            console.error('Error saving app:', error);
        }
    }

    /**
     * Handle share action
     */
    handleShare(appId) {
        const shareURL = `${window.location.origin}/home.html?app=${appId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Check out this VibeTribe app!',
                url: shareURL
            }).catch(err => console.log('Share cancelled', err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareURL).then(() => {
                this.showToast('Link copied to clipboard!');
            });
        }
    }

    /**
     * Open app preview modal
     */
    openAppPreview(appId) {
        // Store last viewed app for quick remix
        localStorage.setItem('lastViewedApp', appId);
        
        // Increment view count
        api.incrementViews(appId);
        
        // TODO: Open app preview modal
        console.log('Opening app preview:', appId);
        this.showToast('App preview coming soon!');
    }

    /**
     * Open comments bottom sheet
     */
    openComments(appId) {
        // TODO: Open comments bottom sheet
        console.log('Opening comments for:', appId);
        this.showToast('Comments coming soon!');
    }

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        const emptyStates = {
            forYou: {
                icon: '✨',
                title: 'No apps yet',
                description: 'Apps from creators will appear here. Be the first to create something!',
                actionText: 'Create Your First App',
                actionLink: 'studio.html'
            },
            following: {
                icon: '👥',
                title: 'Follow some creators',
                description: 'Apps from people you follow will appear here. Start following creators to build your feed!',
                actionText: 'Discover Creators',
                actionLink: 'home.html?tab=forYou'
            },
            trending: {
                icon: '🔥',
                title: 'No trending apps',
                description: 'Apps with high engagement will appear here. Check back later!',
                actionText: 'View All Apps',
                actionLink: 'home.html?tab=forYou'
            }
        };

        const state = emptyStates[this.currentTab];

        return `
            <div class="feed-empty">
                <div class="feed-empty-icon">${state.icon}</div>
                <h3 class="feed-empty-title">${state.title}</h3>
                <p class="feed-empty-description">${state.description}</p>
                <a href="${state.actionLink}" class="btn btn-primary">
                    ${state.actionText}
                </a>
            </div>
        `;
    }

    /**
     * Show loading state
     */
    showLoading() {
        const feedContent = document.getElementById('feedContent');
        if (!feedContent) return;

        if (this.currentPage === 1) {
            feedContent.innerHTML = `
                <div class="feed-loading">
                    <div class="spinner"></div>
                    <p>Loading amazing apps...</p>
                </div>
            `;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        // Loading is hidden when feed is rendered
    }

    /**
     * Show error state
     */
    showError() {
        const feedContent = document.getElementById('feedContent');
        if (!feedContent) return;

        feedContent.innerHTML = `
            <div class="feed-empty">
                <div class="feed-empty-icon">😕</div>
                <h3 class="feed-empty-title">Oops! Something went wrong</h3>
                <p class="feed-empty-description">
                    We couldn't load the feed. Please check your connection and try again.
                </p>
                <button class="btn btn-primary" onclick="feedController.loadFeed()">
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * Setup infinite scroll
     */
    setupInfiniteScroll() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (ticking) return;

            ticking = true;
            requestAnimationFrame(() => {
                const scrollPosition = window.innerHeight + window.scrollY;
                const threshold = document.documentElement.scrollHeight - 500;

                if (scrollPosition >= threshold && !this.isLoading && this.hasMore) {
                    this.loadMore();
                }

                ticking = false;
            });
        });
    }

    /**
     * Setup pull to refresh
     */
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        const threshold = 80;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            currentY = e.touches[0].pageY;
            const pullDistance = currentY - startY;

            if (pullDistance > 0 && pullDistance < threshold) {
                // Show pull indicator
                const indicator = document.getElementById('pullToRefresh');
                if (indicator) {
                    indicator.style.transform = `translateX(-50%) translateY(${Math.min(pullDistance, threshold)}px)`;
                }
            }
        });

        document.addEventListener('touchend', async () => {
            if (!isPulling) return;

            const pullDistance = currentY - startY;
            isPulling = false;

            if (pullDistance >= threshold) {
                await this.refresh();
            }

            // Reset pull indicator
            const indicator = document.getElementById('pullToRefresh');
            if (indicator) {
                indicator.style.transform = 'translateX(-50%) translateY(-100%)';
            }
        });
    }

    /**
     * Refresh feed
     */
    async refresh() {
        const indicator = document.getElementById('pullToRefresh');
        if (indicator) {
            indicator.classList.add('visible');
        }

        this.currentPage = 1;
        this.feedData = [];
        this.hasMore = true;

        await Promise.all([
            this.loadFeaturedApps(),
            this.loadFeed()
        ]);

        if (indicator) {
            setTimeout(() => {
                indicator.classList.remove('visible');
            }, 500);
        }

        this.showToast('Feed refreshed!');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use navigation controller's toast if available
        if (window.navigation && window.navigation.showToast) {
            window.navigation.showToast(message, type);
        } else {
            console.log(message);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedController;
}
