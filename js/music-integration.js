/**
 * MusicIntegration - Spotify & Pandora Player Integration for VibeCoder
 * 
 * Provides mood-enhancing background music during coding sessions.
 * 
 * Features:
 * - Dual service support (Spotify Web Player & Pandora Widget)
 * - Curated coding playlists (Lo-Fi, Hip-Hop, Jazz, Electronic, Focus)
 * - Volume control with localStorage persistence
 * - Collapsible UI panel
 * - Keyboard shortcuts (Ctrl+M to toggle)
 * - Service switching without page reload
 * 
 * Philosophy:
 * "The whole Vibe of Vibe coding is finding your Vibe and what better way 
 * than with your favorite playlist!"
 * 
 * @version 1.0.0
 * @date 2025-11-19
 * @author VibeCoder Team
 */

class MusicIntegration {
    /**
     * Initialize the music integration system
     */
    constructor() {
        // Service configuration
        this.currentService = this.loadPreference('service', 'spotify');
        this.enabled = this.loadPreference('enabled', true);
        this.volume = this.loadPreference('volume', 0.5);
        this.currentPlaylist = this.loadPreference('playlist', 'lofi');
        this.collapsed = this.loadPreference('collapsed', false);
        
        // Curated coding playlists (Spotify URIs)
        this.spotifyPlaylists = {
            lofi: {
                uri: 'spotify:playlist:37i9dQZF1DWWQRwui0ExPn',
                name: '🎧 Lo-Fi Beats',
                description: 'Chill beats to code to'
            },
            hiphop: {
                uri: 'spotify:playlist:37i9dQZF1DX0XUsuxWHRQd',
                name: '🔥 Hip-Hop Vibes',
                description: 'Energetic rap & hip-hop'
            },
            jazz: {
                uri: 'spotify:playlist:37i9dQZF1DXbITWG1ZJKYt',
                name: '🎷 Jazz Cafe',
                description: 'Smooth jazz for focus'
            },
            electronic: {
                uri: 'spotify:playlist:37i9dQZF1DX4dyzvuaRJ0n',
                name: '⚡ Electronic Focus',
                description: 'Upbeat electronic music'
            },
            focus: {
                uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ',
                name: '🧠 Deep Focus',
                description: 'Ambient sounds for concentration'
            },
            studybeats: {
                uri: 'spotify:playlist:37i9dQZF1DX8NTLI2TtZa6',
                name: '📚 Study Beats',
                description: 'Calm beats for productivity'
            }
        };
        
        // Pandora station IDs (examples - users can customize)
        this.pandoraStations = {
            lofi: {
                id: 'ST:395482973',
                name: '🎧 Lo-Fi Hip Hop Radio',
                description: 'Relaxing lo-fi beats'
            },
            hiphop: {
                id: 'ST:123456789',
                name: '🔥 Hip-Hop Radio',
                description: 'Classic & modern hip-hop'
            },
            jazz: {
                id: 'ST:234567890',
                name: '🎷 Jazz Radio',
                description: 'Smooth jazz classics'
            },
            electronic: {
                id: 'ST:345678901',
                name: '⚡ Electronic Radio',
                description: 'EDM & electronic music'
            },
            focus: {
                id: 'ST:456789012',
                name: '🧠 Focus Radio',
                description: 'Ambient & instrumental'
            }
        };
        
        // UI state
        this.panelElement = null;
        this.playerElement = null;
        this.isInitialized = false;
        
        console.log('🎵 MusicIntegration initialized', {
            service: this.currentService,
            enabled: this.enabled,
            playlist: this.currentPlaylist
        });
    }
    
    /**
     * Initialize the music panel UI
     * Call this after DOM is ready
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('MusicIntegration already initialized');
            return;
        }
        
        this.createMusicPanel();
        this.attachEventListeners();
        this.setupKeyboardShortcuts();
        
        if (this.enabled) {
            this.loadPlayer();
        }
        
        this.isInitialized = true;
        console.log('✅ MusicIntegration initialized successfully');
    }
    
    /**
     * Create the music panel HTML structure
     */
    createMusicPanel() {
        const panel = document.createElement('div');
        panel.id = 'music-panel';
        panel.className = `music-panel ${this.collapsed ? 'collapsed' : ''}`;
        
        panel.innerHTML = `
            <div class="music-header">
                <div class="music-header-left">
                    <span class="music-icon">🎵</span>
                    <span class="music-title">Find Your Vibe</span>
                    <button class="music-toggle-btn" id="music-toggle-btn" title="Enable/Disable Music">
                        ${this.enabled ? '🔊' : '🔇'}
                    </button>
                </div>
                <div class="music-header-right">
                    <button class="music-collapse-btn" id="music-collapse-btn" title="Collapse Panel (Ctrl+M)">
                        ${this.collapsed ? '▲' : '▼'}
                    </button>
                </div>
            </div>
            
            <div class="music-body" id="music-body" style="${this.collapsed ? 'display: none;' : ''}">
                <!-- Service Selector -->
                <div class="music-service-selector">
                    <button class="service-btn ${this.currentService === 'spotify' ? 'active' : ''}" 
                            data-service="spotify">
                        <span class="service-icon">🎧</span>
                        Spotify
                    </button>
                    <button class="service-btn ${this.currentService === 'pandora' ? 'active' : ''}" 
                            data-service="pandora">
                        <span class="service-icon">📻</span>
                        Pandora
                    </button>
                </div>
                
                <!-- Playlist Selector (Spotify) -->
                <div class="music-playlist-selector" id="spotify-playlists" 
                     style="${this.currentService === 'spotify' ? '' : 'display: none;'}">
                    <label class="playlist-label">Choose Your Vibe:</label>
                    <select class="playlist-select" id="playlist-select">
                        ${Object.entries(this.spotifyPlaylists).map(([key, pl]) => `
                            <option value="${key}" ${this.currentPlaylist === key ? 'selected' : ''}>
                                ${pl.name} - ${pl.description}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Station Selector (Pandora) -->
                <div class="music-playlist-selector" id="pandora-stations" 
                     style="${this.currentService === 'pandora' ? '' : 'display: none;'}">
                    <label class="playlist-label">Choose Your Station:</label>
                    <select class="station-select" id="station-select">
                        ${Object.entries(this.pandoraStations).map(([key, st]) => `
                            <option value="${key}" ${this.currentPlaylist === key ? 'selected' : ''}>
                                ${st.name} - ${st.description}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Player Container -->
                <div class="music-player-container" id="music-player-container">
                    ${this.enabled ? '<div class="loading-message">🎵 Loading player...</div>' : 
                      '<div class="disabled-message">🔇 Music is disabled. Click 🔊 to enable.</div>'}
                </div>
                
                <!-- Volume Control -->
                <div class="music-volume-control">
                    <span class="volume-icon">🔉</span>
                    <input type="range" 
                           class="volume-slider" 
                           id="volume-slider" 
                           min="0" 
                           max="100" 
                           value="${this.volume * 100}"
                           ${!this.enabled ? 'disabled' : ''}>
                    <span class="volume-label">${Math.round(this.volume * 100)}%</span>
                </div>
                
                <!-- Info Footer -->
                <div class="music-info">
                    <small>
                        💡 Tip: Music continues playing while you code. Use Ctrl+M to quickly toggle this panel.
                    </small>
                </div>
            </div>
        `;
        
        // Insert panel into studio page (before chat panel)
        const chatPanel = document.querySelector('.chat-panel') || document.querySelector('#chat-panel');
        if (chatPanel) {
            chatPanel.parentNode.insertBefore(panel, chatPanel);
        } else {
            // Fallback: append to main container
            const mainContainer = document.querySelector('.studio-container') || document.body;
            mainContainer.insertBefore(panel, mainContainer.firstChild);
        }
        
        this.panelElement = panel;
    }
    
    /**
     * Attach event listeners to UI controls
     */
    attachEventListeners() {
        // Toggle enable/disable
        const toggleBtn = document.getElementById('music-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleEnabled());
        }
        
        // Collapse/expand panel
        const collapseBtn = document.getElementById('music-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleCollapse());
        }
        
        // Service selector
        const serviceBtns = document.querySelectorAll('.service-btn');
        serviceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const service = e.currentTarget.dataset.service;
                this.switchService(service);
            });
        });
        
        // Playlist/station selector
        const playlistSelect = document.getElementById('playlist-select');
        if (playlistSelect) {
            playlistSelect.addEventListener('change', (e) => {
                this.changePlaylist(e.target.value);
            });
        }
        
        const stationSelect = document.getElementById('station-select');
        if (stationSelect) {
            stationSelect.addEventListener('change', (e) => {
                this.changePlaylist(e.target.value);
            });
        }
        
        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+M: Toggle music panel
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.toggleCollapse();
            }
        });
    }
    
    /**
     * Load the appropriate music player (Spotify or Pandora)
     */
    loadPlayer() {
        if (!this.enabled) return;
        
        const container = document.getElementById('music-player-container');
        if (!container) return;
        
        // Clear existing player
        container.innerHTML = '<div class="loading-message">🎵 Loading player...</div>';
        
        if (this.currentService === 'spotify') {
            this.loadSpotifyPlayer();
        } else if (this.currentService === 'pandora') {
            this.loadPandoraPlayer();
        }
    }
    
    /**
     * Load Spotify Web Player (iframe embed)
     */
    loadSpotifyPlayer() {
        const container = document.getElementById('music-player-container');
        if (!container) return;
        
        const playlist = this.spotifyPlaylists[this.currentPlaylist];
        const playlistId = playlist.uri.split(':').pop();
        
        // Spotify iframe embed
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = '352';
        iframe.frameBorder = '0';
        iframe.allowTransparency = 'true';
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';
        iframe.style.borderRadius = '12px';
        
        container.innerHTML = '';
        container.appendChild(iframe);
        
        console.log('✅ Spotify player loaded:', playlist.name);
    }
    
    /**
     * Load Pandora Widget
     */
    loadPandoraPlayer() {
        const container = document.getElementById('music-player-container');
        if (!container) return;
        
        const station = this.pandoraStations[this.currentPlaylist];
        
        // Pandora widget embed
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.pandora.com/embed/${station.id}`;
        iframe.width = '100%';
        iframe.height = '352';
        iframe.frameBorder = '0';
        iframe.style.borderRadius = '12px';
        iframe.allow = 'autoplay';
        
        container.innerHTML = '';
        container.appendChild(iframe);
        
        console.log('✅ Pandora player loaded:', station.name);
    }
    
    /**
     * Toggle music enabled/disabled
     */
    toggleEnabled() {
        this.enabled = !this.enabled;
        this.savePreference('enabled', this.enabled);
        
        const toggleBtn = document.getElementById('music-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = this.enabled ? '🔊' : '🔇';
            toggleBtn.title = this.enabled ? 'Disable Music' : 'Enable Music';
        }
        
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.disabled = !this.enabled;
        }
        
        if (this.enabled) {
            this.loadPlayer();
        } else {
            const container = document.getElementById('music-player-container');
            if (container) {
                container.innerHTML = '<div class="disabled-message">🔇 Music is disabled. Click 🔊 to enable.</div>';
            }
        }
        
        console.log(this.enabled ? '✅ Music enabled' : '🔇 Music disabled');
    }
    
    /**
     * Toggle panel collapse/expand
     */
    toggleCollapse() {
        this.collapsed = !this.collapsed;
        this.savePreference('collapsed', this.collapsed);
        
        const panel = document.getElementById('music-panel');
        const body = document.getElementById('music-body');
        const collapseBtn = document.getElementById('music-collapse-btn');
        
        if (panel) {
            panel.classList.toggle('collapsed', this.collapsed);
        }
        
        if (body) {
            body.style.display = this.collapsed ? 'none' : 'block';
        }
        
        if (collapseBtn) {
            collapseBtn.textContent = this.collapsed ? '▲' : '▼';
        }
    }
    
    /**
     * Switch between Spotify and Pandora
     */
    switchService(service) {
        if (service === this.currentService) return;
        
        this.currentService = service;
        this.savePreference('service', service);
        
        // Update active button
        document.querySelectorAll('.service-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.service === service);
        });
        
        // Show/hide playlist selectors
        const spotifyPlaylists = document.getElementById('spotify-playlists');
        const pandoraStations = document.getElementById('pandora-stations');
        
        if (spotifyPlaylists) {
            spotifyPlaylists.style.display = service === 'spotify' ? 'block' : 'none';
        }
        
        if (pandoraStations) {
            pandoraStations.style.display = service === 'pandora' ? 'block' : 'none';
        }
        
        // Reload player with new service
        if (this.enabled) {
            this.loadPlayer();
        }
        
        console.log('🔄 Switched to', service);
    }
    
    /**
     * Change current playlist/station
     */
    changePlaylist(playlistKey) {
        this.currentPlaylist = playlistKey;
        this.savePreference('playlist', playlistKey);
        
        if (this.enabled) {
            this.loadPlayer();
        }
        
        const playlist = this.currentService === 'spotify' ? 
            this.spotifyPlaylists[playlistKey] : 
            this.pandoraStations[playlistKey];
        
        console.log('🎵 Changed to:', playlist.name);
    }
    
    /**
     * Set volume level
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.savePreference('volume', this.volume);
        
        // Update volume label
        const volumeLabel = document.querySelector('.volume-label');
        if (volumeLabel) {
            volumeLabel.textContent = `${Math.round(this.volume * 100)}%`;
        }
        
        // Note: Volume control for iframe embeds is limited by browser security.
        // Users control volume directly in the Spotify/Pandora player UI.
        console.log('🔊 Volume set to', Math.round(this.volume * 100) + '%');
    }
    
    /**
     * Save preference to localStorage
     */
    savePreference(key, value) {
        try {
            localStorage.setItem(`vibecoder_music_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save music preference:', error);
        }
    }
    
    /**
     * Load preference from localStorage
     */
    loadPreference(key, defaultValue) {
        try {
            const stored = localStorage.getItem(`vibecoder_music_${key}`);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('Failed to load music preference:', error);
            return defaultValue;
        }
    }
    
    /**
     * Get current state for debugging
     */
    getState() {
        return {
            service: this.currentService,
            enabled: this.enabled,
            volume: this.volume,
            playlist: this.currentPlaylist,
            collapsed: this.collapsed,
            initialized: this.isInitialized
        };
    }
    
    /**
     * Destroy the music integration (cleanup)
     */
    destroy() {
        if (this.panelElement) {
            this.panelElement.remove();
        }
        
        this.isInitialized = false;
        console.log('🗑️ MusicIntegration destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicIntegration;
}
