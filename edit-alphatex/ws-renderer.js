/**
 * AlphaTex WebSocket Renderer
 * Receives alphaTeX notation from a Java backend via WebSocket
 * and renders it in real-time using AlphaTab
 */

class WebSocketRenderer {
    constructor() {
        this.socket = null;
        this.alphaTabApi = null;
        this.wsUrl = 'ws://localhost:8080';
        this.messageCount = 0;
        this.lastAlphaTeX = '';
        
        this.elements = {
            alphaTab: document.getElementById('alphaTab'),
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            stopBtn: document.getElementById('stop-btn'),
            exportBtn: document.getElementById('export-btn'),
            statusDot: document.getElementById('status-dot'),
            statusText: document.getElementById('status-text'),
            errorPanel: document.getElementById('error-panel'),
            errorMessage: document.getElementById('error-message'),
            infoWsStatus: document.getElementById('info-ws-status'),
            infoMessages: document.getElementById('info-messages'),
            infoUpdated: document.getElementById('info-updated'),
            infoUrl: document.getElementById('info-url'),
            modal: document.getElementById('export-modal'),
            exportTextarea: document.getElementById('export-textarea'),
            closeModalBtn: document.getElementById('close-modal-btn'),
            closeModal: document.getElementById('close-modal'),
            copyBtn: document.getElementById('copy-btn')
        };

        this.init();
    }

    init() {
        this.setupAlphaTab();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.connectWebSocket();
    }

    setupAlphaTab() {
        try {
            if (typeof alphaTab === 'undefined') {
                throw new Error('AlphaTab library not loaded');
            }

            const settings = {
                core: { engine: 'svg' },
                // core: {
                //     tex: true,
                //     tracks: [0]
                // },
                display: {
                    scale: 1.0,
                    layoutMode: alphaTab.LayoutMode.Page,
                    studioSetupUrl: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
                },
                player: {
                    enablePlayer: true,
                    enableCursor: true,
                    // scrollElement: viewport,
                    soundFont: [
                        'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2'
                    ]
                }
            };

            console.log(this.elements.alphaTab);
            this.alphaTabApi = new alphaTab.AlphaTabApi(
                this.elements.alphaTab,
                settings
            );

            console.log('✅ AlphaTab initialized');
            this.showError(null);
        } catch (error) {
            console.error('Failed to initialize AlphaTab:', error);
            this.showError('Failed to initialize AlphaTab: ' + error.message);
        }
    }

    setupEventListeners() {
        this.elements.playBtn.addEventListener('click', () => {
            if (this.alphaTabApi) {
                console.log('▶️ Playing notation');
                this.alphaTabApi.play();
            } else {
                console.warn('AlphaTab API not initialized');
            }
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            if (this.alphaTabApi) {
                console.log('⏸️ Pausing notation');
                this.alphaTabApi.pause();
            } else {
                console.warn('AlphaTab API not initialized');
            }
        });

        this.elements.stopBtn.addEventListener('click', () => {
            if (this.alphaTabApi) {
                console.log('⏹️ Stopping notation');
                this.alphaTabApi.stop();
            } else {
                console.warn('AlphaTab API not initialized');
            }
        });

        this.elements.exportBtn.addEventListener('click', () => {
            this.openExportModal();
        });

        // Modal close handlers
        this.elements.closeModalBtn.addEventListener('click', () => {
            this.closeExportModal();
        });

        this.elements.closeModal.addEventListener('click', () => {
            this.closeExportModal();
        });

        // Close modal when clicking outside
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeExportModal();
            }
        });

        // Copy to clipboard
        this.elements.copyBtn.addEventListener('click', () => {
            const text = this.elements.exportTextarea.value;
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('📋 Copied to clipboard');
                    const originalText = this.elements.copyBtn.innerHTML;
                    this.elements.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        this.elements.copyBtn.innerHTML = originalText;
                    }, 2000);
                });
            }
        });
    }

    connectWebSocket() {
        try {
            console.log(`🔌 Connecting to WebSocket: ${this.wsUrl}`);
            this.setStatus('connecting', 'Connecting...');
            
            this.socket = new WebSocket(this.wsUrl);

            this.socket.onopen = () => {
                console.log('✅ WebSocket connected');
                this.setStatus('connected', 'Connected');
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.setStatus('error', 'Error');
                this.showError('WebSocket error occurred');
            };

            this.socket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.setStatus('disconnected', 'Disconnected');
                this.showError('WebSocket disconnected. Attempting to reconnect in 3 seconds...');
                setTimeout(() => this.connectWebSocket(), 3000);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            this.setStatus('error', 'Connection Failed');
            this.showError('Failed to connect to WebSocket: ' + error.message);
        }
    }

    handleMessage(data) {
        try {
            console.log('📥 Received notation data');
            
            const alphaTexContent = data.trim();
            
            if (!alphaTexContent) {
                console.warn('Empty notation data received');
                this.showError('Empty notation data received');
                return;
            }

            // Store the original alphaTeX in local storage and memory
            this.lastAlphaTeX = alphaTexContent;
            this.saveToLocalStorage();

            // Wrap in standard AlphaTex metadata if not already wrapped
            let fullScore = alphaTexContent;
            if (!alphaTexContent.includes('\\title')) {
                fullScore = `\\title "Live Performance" . \\track "Drums" \\instrument percussion ${alphaTexContent}`;
            } else if (!alphaTexContent.includes('\\track')) {
                fullScore = `${alphaTexContent} . \\track "Default" \\instrument drums`;
            }

            // Render the notation
            if (this.alphaTabApi) {
                console.log('🎼 Rendering notation: ' + fullScore);
                this.alphaTabApi.tex(fullScore);
                console.log('✅ Notation rendered');
                this.showError(null);
                this.updateInfo();
            }
        } catch (error) {
            console.error('Failed to render notation:', error);
            this.showError('Failed to render notation: ' + error.message);
        }
    }

    updateInfo() {
        this.messageCount++;
        this.elements.infoMessages.textContent = this.messageCount;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.elements.infoUpdated.textContent = timeStr;
    }

    saveToLocalStorage() {
        try {
            const data = {
                alphaTeX: this.lastAlphaTeX,
                timestamp: new Date().toISOString(),
                messageCount: this.messageCount
            };
            localStorage.setItem('alphatex_notation', JSON.stringify(data));
            console.log('💾 Saved to local storage');
        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('alphatex_notation');
            if (data) {
                const parsed = JSON.parse(data);
                this.lastAlphaTeX = parsed.alphaTeX || '';
                console.log('📖 Loaded from local storage');
                return parsed;
            }
        } catch (error) {
            console.error('Failed to load from local storage:', error);
        }
        return null;
    }

    openExportModal() {
        if (!this.lastAlphaTeX) {
            this.showError('No notation data to export. Waiting for WebSocket messages...');
            return;
        }

        this.elements.exportTextarea.value = this.lastAlphaTeX;
        this.elements.modal.classList.add('show');
        console.log('📂 Export modal opened');
    }

    closeExportModal() {
        this.elements.modal.classList.remove('show');
        console.log('📂 Export modal closed');
    }

    setStatus(status, text) {
        this.elements.statusText.textContent = text;
        this.elements.infoWsStatus.textContent = text;
        
        // Update status dot
        const dot = this.elements.statusDot;
        dot.classList.remove('connecting', 'connected', 'disconnected');
        
        if (status === 'connecting') {
            dot.classList.add('connecting');
        } else if (status === 'connected') {
            dot.classList.add('connected');
        } else if (status === 'disconnected' || status === 'error') {
            dot.classList.add('disconnected');
        }
    }

    showError(message) {
        const panel = this.elements.errorPanel;
        
        if (message) {
            this.elements.errorMessage.textContent = message;
            panel.classList.add('show');
            console.error('❌ Error:', message);
        } else {
            panel.classList.remove('show');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎸 AlphaTex WebSocket Renderer starting...');
    new WebSocketRenderer();
});
