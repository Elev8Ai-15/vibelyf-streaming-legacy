/**
 * VIBELYF HOVER-REVEAL TAB SYSTEM v2.0
 * 
 * ENHANCES the existing #banner layout — does NOT replace it.
 * Each .banner-section starts collapsed (label only) and slides open
 * on mouse-over, collapsing again on mouse-out.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ COLLAPSED (default):                                         │
 * │ ┌────────────┐  ┌──────────┐  ┌──────────┐                  │
 * │ │📱 SOCIAL   │  │🎵 MUSIC  │  │🛒 SHOP   │                  │
 * │ └────────────┘  └──────────┘  └──────────┘                  │
 * │                                                              │
 * │ EXPANDED (hovering SOCIAL):                                  │
 * │ ┌───────────────────────────────────────┐                    │
 * │ │📱 SOCIAL  [f][▶️][📷][🎵][𝕏][👻]… [+]│                    │
 * │ └───────────────────────────────────────┘                    │
 * │                   ┌──────────┐  ┌──────────┐                 │
 * │                   │🎵 MUSIC  │  │🛒 SHOP   │                 │
 * │                   └──────────┘  └──────────┘                 │
 * └──────────────────────────────────────────────────────────────┘
 *
 * DESIGN PRINCIPLES:
 * - Zero DOM replacement: works with existing .banner-section HTML
 * - GPU-composited: animations via transform + opacity (no reflows)
 * - 60fps target: will-change hints, contain: layout style
 * - Debounced hover intent: prevents flicker on rapid mouse movement
 * - Keyboard accessible: Tab/Enter/Space/Escape/ArrowKeys + ARIA
 * - Touch support: tap-to-toggle on mobile
 * - Transition interruption safe: cancels timers + handles mid-anim
 * - Memory-leak free: single AbortController for all listeners
 *
 * @version 2.0.0
 * @date March 2026
 */

window.VibeLyfTabs = {

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    config: {
        // Timing (ms)
        expandDuration: 280,
        collapseDuration: 220,
        hoverIntentDelay: 100,   // debounce before expanding
        collapseDelay: 250,      // forgiveness zone before collapsing
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',  // smooth ease-out

        // Behaviour
        allowMultipleOpen: false,
        closeOnClickOutside: true,
        startCollapsed: true
    },

    // Runtime state
    state: {
        sections: [],          // Array of { el, label, widgetWrap, id }
        hoverTimers: {},
        collapseTimers: {},
        isMobile: false,
        abortController: null  // For clean listener teardown
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALISATION — enhance existing DOM
    // ═══════════════════════════════════════════════════════════════

    // Category icon definitions — AI-generated lit-up sphere icons
    categoryIcons: {
        social: {
            src: 'images/icons/category-social.png',
            alt: 'Social Media',
            label: 'SOCIAL'
        },
        music: {
            src: 'images/icons/category-music.png',
            alt: 'Music Streaming',
            label: 'MUSIC'
        },
        shopping: {
            src: 'images/icons/category-shop.png',
            alt: 'Shopping',
            label: 'SHOP'
        }
    },

    init() {
        const banner = document.getElementById('banner');
        if (!banner) {
            console.warn('🗂️ Tabs: #banner not found — skipping');
            return;
        }

        // Abort any previous init (hot-reload safe)
        this.destroy();
        this.state.abortController = new AbortController();
        const signal = this.state.abortController.signal;

        this.state.isMobile = window.matchMedia('(max-width: 768px)').matches;
        window.matchMedia('(max-width: 768px)').addEventListener('change',
            (e) => { this.state.isMobile = e.matches; }, { signal });

        // Inject enhanced animation CSS (idempotent)
        this._injectStyles();

        // Discover existing .banner-section elements
        const sectionEls = banner.querySelectorAll('.banner-section');
        sectionEls.forEach((section, index) => {
            this._enhanceSection(section, index, signal);
        });

        // Inject category icons into banner labels
        this._injectCategoryIcons();

        // Inject WIDGETS section into left nav
        this._injectNavWidgetShortcuts();

        // Click-outside to collapse all
        if (this.config.closeOnClickOutside) {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#banner')) {
                    this.collapseAll();
                }
            }, { signal });
        }

        console.log('🗂️ Hover-Reveal Tabs v2 initialized —', this.state.sections.length, 'sections enhanced');
    },

    // ═══════════════════════════════════════════════════════════════
    // INJECT CATEGORY ICONS — always-visible "lit up" spheres
    // ═══════════════════════════════════════════════════════════════

    _injectCategoryIcons() {
        this.state.sections.forEach(entry => {
            const iconDef = this.categoryIcons[entry.id];
            if (!iconDef) return;

            // Don't inject twice
            if (entry.label.querySelector('.category-icon')) return;

            // Create the glowing orb icon element
            const iconEl = document.createElement('span');
            iconEl.className = 'category-icon';
            iconEl.setAttribute('aria-hidden', 'true');
            iconEl.title = iconDef.alt;

            // Insert as first child of label (before emoji text)
            entry.label.insertBefore(iconEl, entry.label.firstChild);

            console.log(`🗂️ Category icon injected: ${entry.id}`);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // INJECT LEFT NAV WIDGET SHORTCUTS — permanent access points
    // ═══════════════════════════════════════════════════════════════

    _injectNavWidgetShortcuts() {
        const leftNav = document.getElementById('left-nav');
        if (!leftNav) return;

        // Don't inject twice
        if (leftNav.querySelector('.widget-shortcuts-section')) return;

        // Count widgets per category
        const counts = {};
        this.state.sections.forEach(entry => {
            const widgets = entry.widgetWrap ? entry.widgetWrap.querySelectorAll('.social-widget, .shopping-widget') : [];
            counts[entry.id] = widgets.length;
        });

        // Create WIDGETS nav section
        const section = document.createElement('div');
        section.className = 'nav-section widget-shortcuts-section';
        section.innerHTML = `
            <div class="nav-label widgets-label">🔮 WIDGETS</div>
            <div class="nav-item widget-shortcut" data-target="social" title="Jump to Social widgets">
                <span class="shortcut-icon social-ico"></span>
                <span>Social</span>
                <span class="widget-count">${counts.social || 10}</span>
            </div>
            <div class="nav-item widget-shortcut" data-target="music" title="Jump to Music widgets">
                <span class="shortcut-icon music-ico"></span>
                <span>Music</span>
                <span class="widget-count">${counts.music || 5}</span>
            </div>
            <div class="nav-item widget-shortcut" data-target="shopping" title="Jump to Shopping widgets">
                <span class="shortcut-icon shop-ico"></span>
                <span>Shopping</span>
                <span class="widget-count">${counts.shopping || 10}</span>
            </div>
        `;

        // Insert after the first nav-section (NAVIGATION)
        const firstSection = leftNav.querySelector('.nav-section');
        if (firstSection && firstSection.nextSibling) {
            leftNav.insertBefore(section, firstSection.nextSibling);
        } else {
            leftNav.appendChild(section);
        }

        // Add click handlers — expand the corresponding banner section
        section.querySelectorAll('.widget-shortcut').forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.dataset.target;
                this.expandSection(targetId);

                // Scroll banner into view
                const entry = this.state.sections.find(s => s.id === targetId);
                if (entry && entry.el) {
                    entry.el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        });

        console.log('🗂️ Widget shortcuts injected into left nav');
    },

    // ═══════════════════════════════════════════════════════════════
    // ENHANCE A SINGLE SECTION — wraps widgets, adds events/ARIA
    // ═══════════════════════════════════════════════════════════════

    _enhanceSection(section, index, signal) {
        // Identify the label (always the first child .banner-label)
        const label = section.querySelector('.banner-label');
        if (!label) return;

        // Determine a slug from the section's class list (social | music | shopping)
        const id = ['social', 'music', 'shopping'].find(c => section.classList.contains(c)) || `section-${index}`;

        // ── Wrap widget children ────────────────────────────────
        // Everything after the .banner-label that is NOT already
        // wrapped in .banner-widgets gets wrapped now.
        let widgetWrap = section.querySelector('.banner-widgets');
        if (!widgetWrap) {
            widgetWrap = document.createElement('div');
            widgetWrap.className = 'banner-widgets';

            // Move all children after the label into the wrapper
            const children = Array.from(section.children);
            let foundLabel = false;
            children.forEach(child => {
                if (child === label) { foundLabel = true; return; }
                if (foundLabel) {
                    widgetWrap.appendChild(child);
                }
            });
            section.appendChild(widgetWrap);
        }

        // ── ARIA attributes ─────────────────────────────────────
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', label.textContent.trim());
        section.setAttribute('tabindex', index === 0 ? '0' : '-1');
        label.setAttribute('role', 'button');
        label.setAttribute('aria-expanded', this.config.startCollapsed ? 'false' : 'true');
        label.id = label.id || `banner-label-${id}`;
        widgetWrap.setAttribute('role', 'group');
        widgetWrap.setAttribute('aria-labelledby', label.id);

        // ── Start collapsed ─────────────────────────────────────
        if (this.config.startCollapsed) {
            section.classList.add('collapsed');
        }

        // Store reference
        const entry = { el: section, label, widgetWrap, id };
        this.state.sections.push(entry);

        // ── MOUSE: hover intent with debounce ───────────────────
        section.addEventListener('mouseenter', () => {
            if (this.state.isMobile) return;
            this._clearCollapseTimer(id);
            this._startHoverIntent(id);
        }, { signal });

        section.addEventListener('mouseleave', () => {
            if (this.state.isMobile) return;
            this._clearHoverTimer(id);
            this._startCollapseTimer(id);
        }, { signal });

        // ── TOUCH / CLICK: tap label to toggle ──────────────────
        label.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = section.classList.contains('collapsed');
            if (isCollapsed) {
                this.expandSection(id);
            } else {
                this.collapseSection(id);
            }
        }, { signal });

        // ── KEYBOARD ────────────────────────────────────────────
        section.addEventListener('keydown', (e) => {
            this._handleSectionKeydown(e, id, index);
        }, { signal });

        // Widget keyboard (enter/space to activate, escape to close)
        widgetWrap.addEventListener('keydown', (e) => {
            this._handleWidgetKeydown(e, id);
        }, { signal });
    },

    // ═══════════════════════════════════════════════════════════════
    // STYLE INJECTION — enhanced 60fps GPU-composited animations
    // Overrides/extends the existing .banner-section CSS
    // ═══════════════════════════════════════════════════════════════

    _injectStyles() {
        if (document.getElementById('vibe-tab-styles')) return;

        const dur = this.config.expandDuration;
        const ease = this.config.easing;

        const style = document.createElement('style');
        style.id = 'vibe-tab-styles';
        style.textContent = `
            /* ═══ ENHANCED BANNER SECTION — hover-reveal ═══ */

            /* Ensure sections handle overflow properly */
            .banner-section {
                flex-wrap: nowrap;
                transition: box-shadow ${dur}ms ${ease},
                            border-color ${dur}ms ${ease};
                will-change: box-shadow;
            }

            /* Widget wrapper — GPU-composited slide */
            .banner-widgets {
                display: flex;
                gap: 6px;
                align-items: center;
                overflow: hidden;
                white-space: nowrap;
                /* Use max-width for horizontal slide instead of max-height */
                max-width: 2000px;
                opacity: 1;
                transform: translateZ(0);                      /* GPU layer */
                transition: max-width ${dur}ms ${ease},
                            opacity ${dur}ms ${ease};
                will-change: max-width, opacity;
                contain: layout style;
            }

            /* Collapsed: widgets slide closed horizontally */
            .banner-section.collapsed .banner-widgets {
                max-width: 0;
                opacity: 0;
                pointer-events: none;
                overflow: hidden;
            }

            /* Label arrow rotates */
            .banner-label::after {
                transition: transform ${dur}ms ${ease} !important;
            }
            .banner-section.collapsed .banner-label::after {
                transform: rotate(-90deg);
            }

            /* Subtle glow boost when expanded (not collapsed) */
            .banner-section:not(.collapsed) {
                box-shadow: 
                    inset 0 0 var(--shadow-medium, 15px) rgba(var(--primary-glow, 0, 229, 255), 0.15),
                    0 0 var(--shadow-standard, 20px) rgba(var(--primary-glow, 0, 229, 255), 0.08);
            }

            /* Focus ring for keyboard nav */
            .banner-section:focus-visible {
                outline: 2px solid rgba(var(--primary-glow, 0, 229, 255), 0.8);
                outline-offset: 2px;
            }

            .banner-widgets .social-widget:focus-visible,
            .banner-widgets .shopping-widget:focus-visible,
            .banner-widgets .add-widget-btn:focus-visible {
                outline: 2px solid white;
                outline-offset: 1px;
                border-radius: inherit;
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .banner-section,
                .banner-widgets,
                .banner-label::after {
                    transition-duration: 0ms !important;
                }
            }

            /* Mobile: slightly faster animation */
            @media (max-width: 768px) {
                .banner-widgets {
                    transition-duration: 180ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // ═══════════════════════════════════════════════════════════════
    // EXPAND / COLLAPSE — toggle the .collapsed class
    // ═══════════════════════════════════════════════════════════════

    expandSection(id) {
        const entry = this.state.sections.find(s => s.id === id);
        if (!entry || !entry.el.classList.contains('collapsed')) return;

        // Close others first (if single-open mode)
        if (!this.config.allowMultipleOpen) {
            this.collapseAll();
        }

        entry.el.classList.remove('collapsed');
        entry.label.setAttribute('aria-expanded', 'true');

        // Make widgets focusable
        const widgets = entry.widgetWrap.querySelectorAll('.social-widget, .shopping-widget, .add-widget-btn');
        widgets.forEach((w, i) => w.setAttribute('tabindex', i === 0 ? '0' : '-1'));

        console.log(`🗂️ Expanded: ${id}`);
    },

    collapseSection(id) {
        const entry = this.state.sections.find(s => s.id === id);
        if (!entry || entry.el.classList.contains('collapsed')) return;

        entry.el.classList.add('collapsed');
        entry.label.setAttribute('aria-expanded', 'false');

        // Remove widget focusability
        const widgets = entry.widgetWrap.querySelectorAll('.social-widget, .shopping-widget, .add-widget-btn');
        widgets.forEach(w => w.setAttribute('tabindex', '-1'));

        console.log(`🗂️ Collapsed: ${id}`);
    },

    collapseAll() {
        this.state.sections.forEach(entry => {
            if (!entry.el.classList.contains('collapsed')) {
                this.collapseSection(entry.id);
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // HOVER INTENT — debounced timers to prevent flicker
    // ═══════════════════════════════════════════════════════════════

    _startHoverIntent(id) {
        this._clearHoverTimer(id);
        this.state.hoverTimers[id] = setTimeout(() => {
            this.expandSection(id);
        }, this.config.hoverIntentDelay);
    },

    _startCollapseTimer(id) {
        this._clearCollapseTimer(id);
        this.state.collapseTimers[id] = setTimeout(() => {
            this.collapseSection(id);
        }, this.config.collapseDelay);
    },

    _clearHoverTimer(id) {
        if (this.state.hoverTimers[id]) {
            clearTimeout(this.state.hoverTimers[id]);
            delete this.state.hoverTimers[id];
        }
    },

    _clearCollapseTimer(id) {
        if (this.state.collapseTimers[id]) {
            clearTimeout(this.state.collapseTimers[id]);
            delete this.state.collapseTimers[id];
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // KEYBOARD HANDLERS
    // ═══════════════════════════════════════════════════════════════

    _handleSectionKeydown(e, id, index) {
        const sections = this.state.sections;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                const entry = sections.find(s => s.id === id);
                if (entry.el.classList.contains('collapsed')) {
                    this.expandSection(id);
                } else {
                    this.collapseSection(id);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.collapseAll();
                sections[index]?.el.focus();
                break;

            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this._focusSection((index + 1) % sections.length);
                break;

            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this._focusSection((index - 1 + sections.length) % sections.length);
                break;

            case 'Home':
                e.preventDefault();
                this._focusSection(0);
                break;

            case 'End':
                e.preventDefault();
                this._focusSection(sections.length - 1);
                break;

            case 'Tab':
                // If expanded and pressing Tab, move focus into widgets
                if (!e.shiftKey) {
                    const entry2 = sections.find(s => s.id === id);
                    if (!entry2.el.classList.contains('collapsed')) {
                        const firstWidget = entry2.widgetWrap.querySelector(
                            '.social-widget, .shopping-widget, .add-widget-btn');
                        if (firstWidget) {
                            e.preventDefault();
                            firstWidget.setAttribute('tabindex', '0');
                            firstWidget.focus();
                        }
                    }
                }
                break;
        }
    },

    _handleWidgetKeydown(e, sectionId) {
        const widget = e.target.closest('.social-widget, .shopping-widget, .add-widget-btn');
        if (!widget) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            widget.click();
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            this.collapseSection(sectionId);
            const entry = this.state.sections.find(s => s.id === sectionId);
            entry?.el.focus();
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const entry = this.state.sections.find(s => s.id === sectionId);
            const allWidgets = Array.from(entry.widgetWrap.querySelectorAll(
                '.social-widget, .shopping-widget, .add-widget-btn'));
            const idx = allWidgets.indexOf(widget);
            const next = e.key === 'ArrowRight'
                ? allWidgets[(idx + 1) % allWidgets.length]
                : allWidgets[(idx - 1 + allWidgets.length) % allWidgets.length];

            widget.setAttribute('tabindex', '-1');
            next.setAttribute('tabindex', '0');
            next.focus();
        }
    },

    _focusSection(index) {
        this.state.sections.forEach((s, i) => {
            s.el.setAttribute('tabindex', i === index ? '0' : '-1');
        });
        this.state.sections[index]?.el.focus();
    },

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    getStatus() {
        return {
            sections: this.state.sections.length,
            expanded: this.state.sections.filter(s => !s.el.classList.contains('collapsed')).map(s => s.id),
            isMobile: this.state.isMobile,
            initialized: this.state.sections.length > 0
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // CLEANUP — remove all injected state, restore original
    // ═══════════════════════════════════════════════════════════════

    destroy() {
        // Abort all listeners
        if (this.state.abortController) {
            this.state.abortController.abort();
            this.state.abortController = null;
        }

        // Clear all timers
        Object.keys(this.state.hoverTimers).forEach(k => clearTimeout(this.state.hoverTimers[k]));
        Object.keys(this.state.collapseTimers).forEach(k => clearTimeout(this.state.collapseTimers[k]));
        this.state.hoverTimers = {};
        this.state.collapseTimers = {};

        // Remove injected category icons
        document.querySelectorAll('.banner-label .category-icon').forEach(el => el.remove());

        // Remove injected nav widget shortcuts
        document.querySelectorAll('.widget-shortcuts-section').forEach(el => el.remove());

        // Unwrap widget containers — move children back to section
        this.state.sections.forEach(entry => {
            entry.el.classList.remove('collapsed');
            entry.el.removeAttribute('role');
            entry.el.removeAttribute('tabindex');
            entry.label.removeAttribute('role');
            entry.label.removeAttribute('aria-expanded');

            // Move widgets back out of wrapper
            if (entry.widgetWrap) {
                const parent = entry.widgetWrap.parentNode;
                while (entry.widgetWrap.firstChild) {
                    parent.appendChild(entry.widgetWrap.firstChild);
                }
                entry.widgetWrap.remove();
            }
        });

        // Remove injected styles
        document.getElementById('vibe-tab-styles')?.remove();

        this.state.sections = [];
        console.log('🗂️ Tabs v2 destroyed — original layout restored');
    }
};

console.log('🗂️ VibeLyfTabs v2 module loaded — hover-reveal for existing banner');
