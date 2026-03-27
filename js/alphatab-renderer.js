/**
 * AlphaTab Renderer
 * Handles rendering of AlphaTex notation using AlphaTab
 */

class AlphaTabRenderer {
    constructor() {
        this.renderer = null;
        this.currentScore = null;
        this.currentContainerId = null;
        this.renderingPromises = {}; // Track pending renders by container
        this.visibilityTimeouts = {}; // Track visibility check timeouts
        this.init();
    }

    init() {
        // AlphaTab will be loaded from CDN
        if (typeof alphaTab !== 'undefined') {
            console.log('AlphaTab library loaded');
        }
    }

    /**
     * Render AlphaTex content
     */
    renderAlphaTex(alphaTex, containerId = 'alphatab-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return false;
        }

        // Check if alphaTab library is loaded
        if (typeof alphaTab === 'undefined') {
            console.error('AlphaTab library not loaded');
            container.innerHTML = '<p style="color: #f44; padding: 20px;">Music notation library not available. Please refresh the page.</p>';
            return false;
        }

        // Cancel any pending visibility checks for this container
        if (this.visibilityTimeouts[containerId]) {
            clearTimeout(this.visibilityTimeouts[containerId]);
            delete this.visibilityTimeouts[containerId];
        }

        // Ensure container is visible
        const isVisible = container.offsetParent !== null;
        if (!isVisible) {
            console.warn(`Container ${containerId} is not visible, waiting...`);
            // Wait for element to become visible - only one pending check per container
            this.visibilityTimeouts[containerId] = setTimeout(() => {
                delete this.visibilityTimeouts[containerId];
                this.renderAlphaTex(alphaTex, containerId);
            }, 100);
            return false;
        }

        if (!alphaTex || alphaTex.trim() === '') {
            container.innerHTML = '<p style="color: #999; padding: 20px;">No AlphaTex content to display</p>';
            return true;
        }

        try {
            // Destroy previous instance if it exists and is different container
            if (this.currentScore && this.currentContainerId !== containerId) {
                try {
                    this.currentScore.destroy?.();
                } catch (e) {
                    // Ignore errors during cleanup
                }
                this.currentScore = null;
            }

            // Clear previous content completely
            container.innerHTML = '';
            container.textContent = '';
            
            // Ensure container is positioned so cursor overlay works
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.maxWidth = '100%';
            container.style.minHeight = '300px';
            container.style.maxHeight = '100%';
            container.style.overflow = 'hidden'; // Important for cursor clipping

            // Place AlphaTex content directly in the container element
            container.textContent = alphaTex;

            // Create AlphaTab instance with proper API usage
            // tex: true tells AlphaTab to parse the container's text content as AlphaTex
            const viewport = container.parentElement; // Get the .at-viewport parent
            const at = new alphaTab.AlphaTabApi(container, {
                core: {
                    tex: true,
                    tracks: [0]
                },
                display: {
                    scale: 1.0,
                    layoutMode: alphaTab.LayoutMode.Page
                },
                player: {
                    enablePlayer: true,
                    enableCursor: true,
                    scrollElement: viewport, // This enables autoscrolling
                    soundFont: [
                        'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
                    ]
                }
            });

            this.currentScore = at;
            this.currentContainerId = containerId;
            this.setupEventListeners(at);

            return true;
        } catch (error) {
            console.error('Error rendering AlphaTex:', error);
            container.innerHTML = `<p style="color: #f44; padding: 20px;">Error rendering notation: ${error.message}</p>`;
            return false;
        }
    }

    /**
     * Setup event listeners for the renderer
     */
    setupEventListeners(alphaTabInstance) {
        // Check if API supports events
        if (!alphaTabInstance) {
            console.warn('AlphaTab instance is not available');
            return;
        }

        try {
            // Try to listen for score loaded event if available
            if (alphaTabInstance.scoreLoaded && typeof alphaTabInstance.scoreLoaded.on === 'function') {
                alphaTabInstance.scoreLoaded.on(() => {
                    console.log('Score loaded successfully');
                });
            }

            // Listen for rendering errors if available
            if (alphaTabInstance.renderingErrors && typeof alphaTabInstance.renderingErrors.on === 'function') {
                alphaTabInstance.renderingErrors.on((error) => {
                    console.error('AlphaTab rendering error:', error);
                });
            }
        } catch (error) {
            console.warn('Could not setup AlphaTab event listeners:', error);
        }
    }

    /**
     * Play the rendered notation
     */
    play() {
        if (this.currentScore) {
            this.currentScore.play();
        }
    }

    /**
     * Pause the rendered notation
     */
    pause() {
        if (this.currentScore) {
            this.currentScore.pause();
        }
    }

    /**
     * Stop playback
     */
    stop() {
        if (this.currentScore) {
            this.currentScore.stop();
        }
    }

    /**
     * Check if currently playing
     */
    isPlaying() {
        return this.currentScore ? this.currentScore.isPlaying : false;
    }

    /**
     * Get playback tempo
     */
    getPlaybackTempo() {
        if (this.currentScore && this.currentScore.score) {
            return this.currentScore.score.tempo;
        }
        return 120;
    }

    /**
     * Set playback tempo
     */
    setPlaybackTempo(tempo) {
        if (this.currentScore && this.currentScore.score) {
            this.currentScore.score.tempo = Math.max(20, Math.min(300, tempo));
            this.currentScore.updateViewport();
        }
    }

    /**
     * Export rendered notation as image or PDF
     */
    exportAsImage() {
        if (this.currentScore) {
            try {
                // This would require additional AlphaTab export functionality
                console.log('Exporting as image');
                // Implementation depends on AlphaTab version
            } catch (error) {
                console.error('Error exporting image:', error);
            }
        }
    }

    /**
     * Clear rendered content
     */
    clear(containerId = 'alphatab-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
        this.currentScore = null;
    }

    /**
     * Validate AlphaTex syntax
     */
    validateAlphaTex(alphaTex) {
        // Basic validation - check for required AlphaTex markers
        if (!alphaTex || alphaTex.trim() === '') {
            return { valid: false, errors: ['AlphaTex content is empty'] };
        }

        const errors = [];

        // Check for basic structure (not fully comprehensive)
        if (!alphaTex.includes(':') && !alphaTex.includes('.')) {
            errors.push('AlphaTex content may be invalid or incomplete');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get current score information
     */
    getScoreInfo() {
        if (!this.currentScore || !this.currentScore.score) {
            return null;
        }

        const score = this.currentScore.score;
        return {
            tracks: score.tracks.length,
            tempo: score.tempo,
            timeSignature: score.tracks[0]?.staves[0]?.bars[0]?.timeSignatureNumerator + '/' + 
                          score.tracks[0]?.staves[0]?.bars[0]?.timeSignatureDenominator
        };
    }

    /**
     * Zoom in/out
     */
    setZoom(scale) {
        if (this.currentScore) {
            this.currentScore.settings.display.scale = Math.max(0.5, Math.min(2.0, scale));
            this.currentScore.updateViewport();
        }
    }

    /**
     * Get current zoom level
     */
    getZoom() {
        if (this.currentScore) {
            return this.currentScore.settings.display.scale;
        }
        return 1.0;
    }
}

// Initialize AlphaTab renderer
const alphaTabRenderer = new AlphaTabRenderer();
