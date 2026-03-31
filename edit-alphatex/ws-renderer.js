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
        this.isLooping = false;
        
        this.elements = {
            alphaTab: document.getElementById('alphaTab'),
            playBtn: document.getElementById('play-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            stopBtn: document.getElementById('stop-btn'),
            loopBtn: document.getElementById('loop-btn'),
            statusDot: document.getElementById('status-dot'),
            statusText: document.getElementById('status-text'),
            errorPanel: document.getElementById('error-panel'),
            errorMessage: document.getElementById('error-message'),
            infoWsStatus: document.getElementById('info-ws-status'),
            infoMessages: document.getElementById('info-messages'),
            infoUpdated: document.getElementById('info-updated'),
            infoUrl: document.getElementById('info-url')
        };

        this.init();
    }

    init() {
        this.setupAlphaTab();
        this.setupEventListeners();
        this.connectWebSocket();
    }

    setupAlphaTab() {
        try {
            if (typeof alphaTab === 'undefined') {
                throw new Error('AlphaTab library not loaded');
            }

            const settings = {
                core: { engine: 'svg' }
            };

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
                this.alphaTabApi.play();
            }
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            if (this.alphaTabApi) {
                this.alphaTabApi.pause();
            }
        });

        this.elements.stopBtn.addEventListener('click', () => {
            if (this.alphaTabApi) {
                this.alphaTabApi.stop();
            }
        });

        this.elements.loopBtn.addEventListener('click', () => {
            this.toggleLoop();
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

            // Wrap in standard AlphaTex metadata if not already wrapped
            let fullScore = alphaTexContent;
            if (!alphaTexContent.includes('\\title')) {
                fullScore = `\\title "Live Performance" . \\track "Drums" \\instrument percussion ${alphaTexContent}`;
            } else if (!alphaTexContent.includes('\\track')) {
                fullScore = `${alphaTexContent} . \\track "Default" \\instrument drums`;
            }

            // Render the notation
            if (this.alphaTabApi) {
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

    toggleLoop() {
        this.isLooping = !this.isLooping;
        
        if (this.alphaTabApi) {
            // Set repeat mode
            if (this.isLooping) {
                this.elements.loopBtn.style.background = '#10b981';
                console.log('🔁 Loop enabled');
            } else {
                this.elements.loopBtn.style.background = '#436d9d';
                console.log('🔁 Loop disabled');
            }
        }
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
