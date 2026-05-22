/**
 * VibeTribe App Card Renderer
 * Renders individual app cards with all interaction features
 */

/**
 * Render app card HTML
 * @param {Object} app - App data object
 * @param {Object} creator - Creator user object (optional, fetched if not provided)
 * @returns {string} HTML string for app card
 */
async function renderAppCard(app, creator = null) {
    // Fetch creator info if not provided
    if (!creator) {
        try {
            creator = await api.getUser(app.creator_id);
        } catch (error) {
            console.error('Error fetching creator:', error);
            creator = {
                username: 'unknown',
                display_name: 'Unknown Creator',
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.creator_id}`
            };
        }
    }

    // Check if current user has interacted with this app
    const hasLiked = await checkInteraction(app.id, 'like');
    const hasSaved = await checkInteraction(app.id, 'save');

    // Format time ago
    const timeAgo = formatTimeAgo(app.created_at);

    // Get cultural profile color
    const culturalColor = getCulturalColor(app.cultural_profile);

    return `
        <div class="app-card" data-app-id="${app.id}">
            <!-- Card Header -->
            <div class="app-card-header">
                <img 
                    src="${creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.creator_id}`}" 
                    alt="${creator.display_name}"
                    class="app-card-avatar"
                    onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${app.creator_id}'"
                >
                <div class="app-card-creator">
                    <div class="app-card-creator-name">${creator.display_name || creator.username}</div>
                    <div class="app-card-time">${timeAgo}</div>
                </div>
                <button class="app-card-menu-btn" data-app-id="${app.id}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                        <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                        <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                    </svg>
                </button>
            </div>

            <!-- Card Preview Image/Video -->
            <div class="app-card-preview" data-app-id="${app.id}">
                ${app.preview_video ? `
                    <video 
                        class="app-card-preview-media"
                        src="${app.preview_video}"
                        poster="${app.preview_image || ''}"
                        playsinline
                        webkit-playsinline
                        loop
                    ></video>
                ` : `
                    <img 
                        src="${app.preview_image || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop'}" 
                        alt="${app.title}"
                        class="app-card-preview-media"
                        onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop'"
                    >
                `}
                
                <!-- Featured Badge -->
                ${app.featured ? `
                    <div class="app-card-badge featured">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1l2.163 4.382L15 6.092l-3.5 3.408.826 4.818L8 12.217l-4.326 2.101.826-4.818L1 6.092l4.837-.71L8 1z"/>
                        </svg>
                        Featured
                    </div>
                ` : ''}
                
                <!-- Trending Badge -->
                ${app.trending_score && app.trending_score >= 80 ? `
                    <div class="app-card-badge trending">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 1l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 10l-4 2.5 1.5-4.5L2 5.5h4.5L8 1z"/>
                        </svg>
                        Trending
                    </div>
                ` : ''}
            </div>

            <!-- Card Content -->
            <div class="app-card-content">
                <h3 class="app-card-title">${app.title}</h3>
                ${app.description ? `
                    <p class="app-card-description">${truncateText(app.description, 120)}</p>
                ` : ''}
                
                <!-- Cultural Profile & Tags -->
                <div class="app-card-tags">
                    <span class="app-card-tag cultural" style="--tag-color: ${culturalColor}">
                        ${app.cultural_profile}
                    </span>
                    ${app.tags ? app.tags.slice(0, 3).map(tag => `
                        <span class="app-card-tag">#${tag}</span>
                    `).join('') : ''}
                </div>
                
                <!-- Stats -->
                <div class="app-card-stats">
                    <span class="app-card-stat">
                        <span class="stat-icon">👀</span>
                        ${formatNumber(app.views_count || 0)} views
                    </span>
                    ${app.remixes_count > 0 ? `
                        <span class="app-card-stat">
                            <span class="stat-icon">🎭</span>
                            ${formatNumber(app.remixes_count)} remixes
                        </span>
                    ` : ''}
                </div>
            </div>

            <!-- Card Actions -->
            <div class="app-card-actions">
                <button class="app-card-action like-btn ${hasLiked ? 'active' : ''}" data-app-id="${app.id}">
                    <span class="action-icon">${hasLiked ? '❤️' : '🤍'}</span>
                    <span class="action-count">${formatNumber(app.likes_count || 0)}</span>
                </button>
                
                <button class="app-card-action comment-btn" data-app-id="${app.id}">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${formatNumber(app.comments_count || 0)}</span>
                </button>
                
                <button class="app-card-action save-btn ${hasSaved ? 'active' : ''}" data-app-id="${app.id}">
                    <span class="action-icon">${hasSaved ? '🔖' : '📌'}</span>
                    <span class="action-count">${formatNumber(app.saves_count || 0)}</span>
                </button>
                
                <button class="app-card-action share-btn" data-app-id="${app.id}">
                    <span class="action-icon">📤</span>
                    <span class="action-text">Share</span>
                </button>
                
                <button class="app-card-action remix-btn" data-app-id="${app.id}">
                    <span class="action-icon">🎭</span>
                    <span class="action-text">Remix</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Render app card synchronously (without creator fetch)
 * Used for initial render, then hydrate with creator data
 */
function renderAppCardSync(app) {
    const timeAgo = formatTimeAgo(app.created_at);
    const culturalColor = getCulturalColor(app.cultural_profile);

    return `
        <div class="app-card" data-app-id="${app.id}">
            <div class="app-card-header">
                <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=${app.creator_id}" 
                    alt="Creator"
                    class="app-card-avatar"
                >
                <div class="app-card-creator">
                    <div class="app-card-creator-name">Loading...</div>
                    <div class="app-card-time">${timeAgo}</div>
                </div>
                <button class="app-card-menu-btn" data-app-id="${app.id}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                        <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                        <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                    </svg>
                </button>
            </div>

            <div class="app-card-preview" data-app-id="${app.id}">
                <img 
                    src="${app.preview_image || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop'}" 
                    alt="${app.title}"
                    class="app-card-preview-media"
                >
                ${app.featured ? '<div class="app-card-badge featured">⭐ Featured</div>' : ''}
            </div>

            <div class="app-card-content">
                <h3 class="app-card-title">${app.title}</h3>
                ${app.description ? `<p class="app-card-description">${truncateText(app.description, 120)}</p>` : ''}
                
                <div class="app-card-tags">
                    <span class="app-card-tag cultural" style="--tag-color: ${culturalColor}">
                        ${app.cultural_profile}
                    </span>
                </div>
                
                <div class="app-card-stats">
                    <span class="app-card-stat">👀 ${formatNumber(app.views_count || 0)} views</span>
                </div>
            </div>

            <div class="app-card-actions">
                <button class="app-card-action like-btn" data-app-id="${app.id}">
                    <span class="action-icon">🤍</span>
                    <span class="action-count">${formatNumber(app.likes_count || 0)}</span>
                </button>
                <button class="app-card-action comment-btn" data-app-id="${app.id}">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${formatNumber(app.comments_count || 0)}</span>
                </button>
                <button class="app-card-action save-btn" data-app-id="${app.id}">
                    <span class="action-icon">📌</span>
                    <span class="action-count">${formatNumber(app.saves_count || 0)}</span>
                </button>
                <button class="app-card-action share-btn" data-app-id="${app.id}">
                    <span class="action-icon">📤</span>
                    <span class="action-text">Share</span>
                </button>
                <button class="app-card-action remix-btn" data-app-id="${app.id}">
                    <span class="action-icon">🎭</span>
                    <span class="action-text">Remix</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Check if user has interacted with app
 */
async function checkInteraction(appId, type) {
    try {
        const interaction = await api.getInteraction(appId, type);
        return !!interaction;
    } catch (error) {
        return false;
    }
}

/**
 * Format time ago (e.g., "2 hours ago")
 */
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
}

/**
 * Format number (e.g., 1234 -> 1.2K)
 */
function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get cultural profile color
 */
function getCulturalColor(profile) {
    const colors = {
        'AAVE': '#FF6B9D',
        'Southern': '#F39C12',
        'Appalachian': '#2ECC71',
        'Spanglish': '#E74C3C'
    };
    return colors[profile] || '#667eea';
}

/**
 * Handle app card menu click
 */
function handleCardMenu(appId) {
    // TODO: Show action sheet with options
    console.log('Show menu for app:', appId);
}

/**
 * Handle remix click
 */
function handleRemix(appId) {
    window.location.href = `studio.html?remix=${appId}`;
}

// Export for global use
if (typeof window !== 'undefined') {
    window.renderAppCard = renderAppCardSync; // Use sync version for feed rendering
    window.handleCardMenu = handleCardMenu;
    window.handleRemix = handleRemix;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderAppCard,
        renderAppCardSync,
        checkInteraction,
        formatTimeAgo,
        formatNumber,
        truncateText,
        getCulturalColor,
        handleCardMenu,
        handleRemix
    };
}
