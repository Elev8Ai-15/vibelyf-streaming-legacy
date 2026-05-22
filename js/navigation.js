/**
 * VibeTribe Navigation Controller
 * Manages bottom navigation, routing, and page state
 */

class NavigationController {
    constructor() {
        this.currentMode = 'home'; // home, studio, create, you, notifications
        this.notificationCount = 0;
        this.init();
    }

    /**
     * Initialize navigation system
     */
    init() {
        this.createBottomNav();
        this.attachEventListeners();
        this.detectCurrentPage();
        this.loadNotificationCount();
        
        // Check for deep linking
        this.handleDeepLink();
    }

    /**
     * Create bottom navigation HTML
     */
    createBottomNav() {
        const navHTML = `
            <nav class="bottom-nav" id="bottomNav">
                <a href="home.html" class="nav-item" data-mode="home">
                    <i class="nav-item-icon">🏠</i>
                    <span class="nav-item-label">Home</span>
                </a>
                
                <a href="studio.html" class="nav-item" data-mode="studio">
                    <i class="nav-item-icon">🎨</i>
                    <span class="nav-item-label">Studio</span>
                </a>
                
                <button class="nav-item create" data-mode="create">
                    <div class="nav-item-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                        </svg>
                    </div>
                </button>
                
                <a href="notifications.html" class="nav-item" data-mode="notifications">
                    <div class="nav-item-icon-wrapper">
                        <i class="nav-item-icon">🔔</i>
                        <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                    </div>
                    <span class="nav-item-label">Notifications</span>
                </a>
                
                <a href="profile.html" class="nav-item" data-mode="you">
                    <i class="nav-item-icon">👤</i>
                    <span class="nav-item-label">You</span>
                </a>
            </nav>
        `;

        // Insert navigation at the end of body
        document.body.insertAdjacentHTML('beforeend', navHTML);
    }

    /**
     * Attach event listeners to navigation items
     */
    attachEventListeners() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const mode = item.dataset.mode;
                
                if (mode === 'create') {
                    e.preventDefault();
                    this.openCreateModal();
                } else {
                    // Let normal link navigation happen, but update active state
                    this.setActiveMode(mode);
                }
            });
        });
    }

    /**
     * Detect current page and set active navigation state
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'home.html';
        
        let mode = 'home';
        
        if (filename.includes('home')) mode = 'home';
        else if (filename.includes('studio')) mode = 'studio';
        else if (filename.includes('notifications')) mode = 'notifications';
        else if (filename.includes('profile')) mode = 'you';
        
        this.setActiveMode(mode);
    }

    /**
     * Set active navigation mode
     */
    setActiveMode(mode) {
        this.currentMode = mode;
        
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to current mode
        const activeItem = document.querySelector(`.nav-item[data-mode="${mode}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * Open Create modal (Quick Actions)
     */
    openCreateModal() {
        const modalHTML = `
            <div class="modal-overlay" id="createModal">
                <div class="bottom-sheet">
                    <div class="bottom-sheet-header">
                        <div class="bottom-sheet-handle"></div>
                        <h3 class="text-xl font-semibold">Create</h3>
                        <button class="bottom-sheet-close" onclick="navigation.closeCreateModal()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="bottom-sheet-content">
                        <div class="create-options">
                            <a href="studio.html" class="create-option">
                                <div class="create-option-icon">✨</div>
                                <div class="create-option-content">
                                    <div class="create-option-title">New App</div>
                                    <div class="create-option-description">Create a new app from scratch</div>
                                </div>
                            </a>
                            
                            <button class="create-option" onclick="navigation.quickRemix()">
                                <div class="create-option-icon">🎭</div>
                                <div class="create-option-content">
                                    <div class="create-option-title">Quick Remix</div>
                                    <div class="create-option-description">Remix your last viewed app</div>
                                </div>
                            </button>
                            
                            <button class="create-option" onclick="navigation.addSlang()">
                                <div class="create-option-icon">💬</div>
                                <div class="create-option-content">
                                    <div class="create-option-title">Add Slang</div>
                                    <div class="create-option-description">Contribute to VibeTribe</div>
                                </div>
                            </button>
                            
                            <button class="create-option" onclick="navigation.fromTemplate()">
                                <div class="create-option-icon">📋</div>
                                <div class="create-option-content">
                                    <div class="create-option-title">From Template</div>
                                    <div class="create-option-description">Start with a template</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add click outside to close
        setTimeout(() => {
            const overlay = document.getElementById('createModal');
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeCreateModal();
                }
            });
        }, 100);
    }

    /**
     * Close Create modal
     */
    closeCreateModal() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Quick Remix - Remix last viewed app
     */
    quickRemix() {
        const lastViewedApp = localStorage.getItem('lastViewedApp');
        
        if (lastViewedApp) {
            window.location.href = `studio.html?remix=${lastViewedApp}`;
        } else {
            this.showToast('No recent apps to remix. Browse some apps first!');
            this.closeCreateModal();
            window.location.href = 'home.html';
        }
    }

    /**
     * Add Slang - Open slang contribution flow
     */
    addSlang() {
        this.closeCreateModal();
        window.location.href = 'studio.html?mode=slang';
    }

    /**
     * From Template - Open template gallery
     */
    fromTemplate() {
        this.closeCreateModal();
        window.location.href = 'studio.html?mode=template';
    }

    /**
     * Load notification count from API
     */
    async loadNotificationCount() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return;

            const response = await fetch(`tables/notifications?search=${currentUser.id}&limit=100`);
            const data = await response.json();
            
            // Count unread notifications
            const unreadCount = data.data.filter(notif => !notif.read).length;
            this.updateNotificationBadge(unreadCount);
        } catch (error) {
            console.error('Error loading notification count:', error);
        }
    }

    /**
     * Update notification badge
     */
    updateNotificationBadge(count) {
        this.notificationCount = count;
        const badge = document.getElementById('notificationBadge');
        
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Handle deep linking (URL parameters)
     */
    handleDeepLink() {
        const params = new URLSearchParams(window.location.search);
        
        // Check for app preview deep link
        const appId = params.get('app');
        if (appId) {
            this.openAppPreview(appId);
        }
        
        // Check for user profile deep link
        const userId = params.get('user');
        if (userId) {
            window.location.href = `profile.html?id=${userId}`;
        }
        
        // Check for notification deep link
        const notificationId = params.get('notification');
        if (notificationId) {
            this.handleNotificationDeepLink(notificationId);
        }
    }

    /**
     * Open app preview modal
     */
    openAppPreview(appId) {
        // Store for later implementation
        localStorage.setItem('pendingAppPreview', appId);
    }

    /**
     * Handle notification deep link
     */
    async handleNotificationDeepLink(notificationId) {
        try {
            const response = await fetch(`tables/notifications/${notificationId}`);
            const notification = await response.json();
            
            // Mark as read
            await fetch(`tables/notifications/${notificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });
            
            // Navigate to related content
            if (notification.app_id) {
                this.openAppPreview(notification.app_id);
            } else if (notification.actor_id) {
                window.location.href = `profile.html?id=${notification.actor_id}`;
            }
        } catch (error) {
            console.error('Error handling notification deep link:', error);
        }
    }

    /**
     * Get current user from localStorage (temporary auth simulation)
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
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toastHTML = `
            <div class="toast toast-${type}">
                <span>${message}</span>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', toastHTML);
        
        const toast = document.querySelector('.toast:last-child');
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Navigate to specific mode/page
     */
    navigateTo(mode, params = {}) {
        const pages = {
            home: 'home.html',
            studio: 'studio.html',
            notifications: 'notifications.html',
            you: 'profile.html'
        };
        
        const page = pages[mode];
        if (page) {
            const queryString = new URLSearchParams(params).toString();
            window.location.href = queryString ? `${page}?${queryString}` : page;
        }
    }

    /**
     * Refresh notification count
     */
    refreshNotifications() {
        this.loadNotificationCount();
    }
}

// Initialize navigation when DOM is ready
let navigation;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        navigation = new NavigationController();
    });
} else {
    navigation = new NavigationController();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
}
