/**
 * AlphaTex Editor
 * Handles editing and live preview of AlphaTex notation
 */

class AlphTexEditor {
    constructor() {
        this.alphaTabInstance = null;
        this.isLooping = false;
        this.renderTimeout = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        // this.loadExampleData();
        this.setStatus('ready');
    }

    setupElements() {
        this.elements = {
            input: document.getElementById('alphaTex-input'),
            renderBtn: document.getElementById('render-btn'),
            playBtn: document.getElementById('play-btn'),
            stopBtn: document.getElementById('stop-btn'),
            loopBtn: document.getElementById('loop-btn'),
            loadExampleBtn: document.getElementById('load-example'),
            clearBtn: document.getElementById('clear-editor'),
            container: document.getElementById('alphatab-container'),
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text'),
            charCount: document.getElementById('char-count')
        };
    }

    setupEventListeners() {
        // Input events
        this.elements.input.addEventListener('input', () => {
            this.updateCharCount();
            this.autoRender();
        });

        // Button events
        this.elements.renderBtn.addEventListener('click', () => this.render());
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.loopBtn.addEventListener('click', () => this.toggleLoop());
        this.elements.loadExampleBtn.addEventListener('click', () => this.loadExampleData());
        this.elements.clearBtn.addEventListener('click', () => this.clearEditor());

        // Listen for AlphaTab events
        if (typeof alphaTab !== 'undefined') {
            console.log('AlphaTab loaded');
        }
    }

    updateCharCount() {
        const count = this.elements.input.value.length;
        this.elements.charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }

    autoRender() {
        clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => {
            this.render();
        }, 500);
    }

    async render() {
        const alphaTex = this.elements.input.value.trim();

        if (!alphaTex) {
            this.elements.container.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">Enter AlphaTex notation to see preview</p>';
            this.setStatus('error', 'No AlphaTex content');
            return;
        }

        this.setStatus('loading', 'Rendering...');

        try {
            // Check if alphaTab library is loaded
            if (typeof alphaTab === 'undefined') {
                throw new Error('AlphaTab library not loaded. Please refresh the page.');
            }

            // Clear previous content
            this.elements.container.innerHTML = '';

            // Set up container
            const mainDiv = document.createElement('div');
            mainDiv.className = 'at-main';
            mainDiv.style.position = 'relative';
            mainDiv.style.width = '100%';
            mainDiv.style.maxWidth = '100%';
            mainDiv.style.minHeight = '300px';
            mainDiv.style.maxHeight = '100%';
            mainDiv.style.overflow = 'hidden';
            mainDiv.textContent = alphaTex;

            this.elements.container.appendChild(mainDiv);

            // Get the viewport for scrolling
            const viewport = this.elements.container;

            // Create AlphaTab instance
            this.alphaTabInstance = new alphaTab.AlphaTabApi(mainDiv, {
                core: {
                    tex: true,
                    tracks: [0]
                },
                display: {
                    scale: 1.0,
                    layoutMode: alphaTab.LayoutMode.Page,
                    studioSetupUrl: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
                },
                player: {
                    enablePlayer: true,
                    enableCursor: true,
                    scrollElement: viewport,
                    soundFont: [
                        'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
                    ]
                }
            });

            this.setupAlphaTabEvents();
            this.setStatus('success', 'Rendered successfully');
            this.elements.playBtn.disabled = false;

        } catch (error) {
            console.error('Rendering error:', error);
            this.elements.container.innerHTML = `<div class="error-message"><strong>Error:</strong> ${error.message}</div>`;
            this.setStatus('error', 'Rendering failed');
            this.elements.playBtn.disabled = true;
        }
    }

    setupAlphaTabEvents() {
        if (!this.alphaTabInstance) return;

        try {
            if (this.alphaTabInstance.scoreLoaded && typeof this.alphaTabInstance.scoreLoaded.on === 'function') {
                this.alphaTabInstance.scoreLoaded.on(() => {
                    console.log('Score loaded successfully');
                });
            }

            if (this.alphaTabInstance.renderingErrors && typeof this.alphaTabInstance.renderingErrors.on === 'function') {
                this.alphaTabInstance.renderingErrors.on((error) => {
                    console.error('AlphaTab rendering error:', error);
                });
            }
        } catch (error) {
            console.warn('Could not setup event listeners:', error);
        }
    }

    play() {
        if (this.alphaTabInstance && this.alphaTabInstance.play) {
            this.alphaTabInstance.play();
            this.elements.playBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
        }
    }

    stop() {
        if (this.alphaTabInstance && this.alphaTabInstance.stop) {
            this.alphaTabInstance.stop();
            this.elements.playBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
        }
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.elements.loopBtn.classList.toggle('active', this.isLooping);

        if (this.alphaTabInstance && this.alphaTabInstance.score) {
            // Note: Check if AlphaTab supports loop via API
            console.log('Loop:', this.isLooping ? 'enabled' : 'disabled');
        }
    }

    loadExampleData() {
        const example = `\\title "Guitar Spider Warm Up"
\\tempo 80
.
\\track "Guitar"
\\instrument acoustic-guitar-steel
\\lyrics "Synchronization Exercise"
:8 1.6 2.6 3.6 4.6 | 
:8 1.5 2.5 3.5 4.5 | 
:8 1.4 2.4 3.4 4.4 | 
:8 1.3 2.3 3.3 4.3 |`;

        this.elements.input.value = example;
        this.updateCharCount();
        setTimeout(() => this.render(), 100);
    }

    clearEditor() {
        if (confirm('Clear all content? This cannot be undone.')) {
            this.elements.input.value = '';
            this.updateCharCount();
            this.elements.container.innerHTML = '<p style="color: #999; padding: 20px; text-align: center;">Enter AlphaTex notation to see preview</p>';
            this.setStatus('ready', 'Editor cleared');
            this.elements.playBtn.disabled = true;
            this.elements.stopBtn.disabled = true;
        }
    }

    setStatus(status, message) {
        const indicator = this.elements.statusIndicator;
        const text = this.elements.statusText;

        indicator.classList.remove('error', 'loading');

        if (status === 'success' || status === 'ready') {
            indicator.classList.add('success');
            indicator.style.background = '#10b981';
        } else if (status === 'error') {
            indicator.classList.add('error');
            indicator.style.background = '#ef4444';
        } else if (status === 'loading') {
            indicator.classList.add('loading');
            indicator.style.background = '#f59e0b';
        }

        text.textContent = message || 'Ready';
    }

    exportAsJson() {
        const alphaTex = this.elements.input.value;
        const data = {
            alphaTex: alphaTex,
            exportedAt: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alphatex-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importFromJson(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.alphaTex) {
                    this.elements.input.value = data.alphaTex;
                    this.updateCharCount();
                    this.render();
                    this.setStatus('success', 'File imported successfully');
                } else {
                    throw new Error('Invalid JSON format. Expected "alphaTex" field.');
                }
            } catch (error) {
                this.setStatus('error', `Import failed: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize editor when DOM is ready
let editor;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        editor = new AlphTexEditor();
    });
} else {
    editor = new AlphTexEditor();
}
