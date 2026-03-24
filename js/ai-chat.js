/**
 * AI Chat Manager
 * Handles integration with AI Chat services
 */

class AIChatManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.chatUrl = null;
        this.chatWindow = null;
        this.loadConfig();
    }

    /**
     * Load chat configuration from settings
     */
    loadConfig() {
        const settings = this.dataManager.getSettings();
        this.chatUrl = settings.aiChatUrl || null;
    }

    /**
     * Set AI Chat URL
     */
    setAIChatUrl(url) {
        if (this.isValidUrl(url)) {
            this.chatUrl = url;
            this.dataManager.updateSettings({ aiChatUrl: url });
            return true;
        }
        return false;
    }

    /**
     * Get AI Chat URL
     */
    getAIChatUrl() {
        return this.chatUrl;
    }

    /**
     * Open AI Chat
     */
    openAIChat() {
        if (!this.chatUrl) {
            console.warn('AI Chat URL not configured');
            return false;
        }

        try {
            // Open in a modal iframe
            const modalId = 'ai-chat-modal';
            let modal = document.getElementById(modalId);

            if (!modal) {
                modal = this.createAIChatModal();
                document.body.appendChild(modal);
            }

            modal.classList.add('active');
            return true;
        } catch (error) {
            console.error('Error opening AI Chat:', error);
            return false;
        }
    }

    /**
     * Create AI Chat modal
     */
    createAIChatModal() {
        const modal = document.createElement('div');
        modal.id = 'ai-chat-modal';
        modal.className = 'modal ai-chat-modal';
        modal.innerHTML = `
            <div class="ai-chat-modal-content">
                <button class="close ai-chat-close">&times;</button>
                <h2>AI Chat Assistant</h2>
                <div class="ai-chat-container">
                    <iframe 
                        id="ai-chat-iframe"
                        src="${this.chatUrl}"
                        class="ai-chat-iframe"
                        allow="camera; microphone; geolocation"
                    ></iframe>
                </div>
            </div>
        `;

        // Add close handler
        modal.querySelector('.close').addEventListener('click', () => {
            this.closeAIChat();
        });

        return modal;
    }

    /**
     * Close AI Chat
     */
    closeAIChat() {
        const modal = document.getElementById('ai-chat-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Open AI Chat for lesson generation
     */
    openAIChatForLessonGeneration(courseId = null) {
        const prompt = `I want to create an AlphaTex lesson for teaching ${courseId ? 'a specific course' : 'music'}.
Can you help me generate AlphaTex notation that I can copy and paste into a lesson?

Please generate AlphaTex content with:
- Clear notation
- Section headers
- Progressive difficulty if applicable
- Comments explaining the notation

The format should be compatible with AlphaTab for rendering.`;

        // You could pre-populate the chat with this prompt if the service supports it
        this.openAIChat();
    }

    /**
     * Validate URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    /**
     * Is AI Chat configured
     */
    isConfigured() {
        return this.chatUrl !== null && this.chatUrl !== '';
    }

    /**
     * Get default AI Chat URLs
     */
    getDefaultAIChatUrls() {
        return [
            {
                name: 'Google Gemini',
                url: 'https://gemini.google.com/app'
            },
            {
                name: 'ChatGPT',
                url: 'https://chat.openai.com'
            },
            {
                name: 'Claude',
                url: 'https://claude.ai'
            },
            {
                name: 'Copilot',
                url: 'https://copilot.microsoft.com'
            }
        ];
    }
}

// Initialize AI Chat Manager
const aiChatManager = new AIChatManager(dataManager);

// Add styles for AI Chat modal
const style = document.createElement('style');
style.textContent = `
.ai-chat-modal.active {
    display: flex;
}

.ai-chat-modal-content {
    background-color: white;
    padding: var(--spacing-lg);
    border-radius: 10px;
    max-width: 90vw;
    max-height: 90vh;
    width: 1000px;
    height: 700px;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-xl);
    position: relative;
}

.ai-chat-close {
    position: absolute;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    font-size: var(--font-size-2xl);
    cursor: pointer;
    color: var(--gray);
    border: none;
    background: none;
    z-index: 10;
}

.ai-chat-close:hover {
    color: var(--dark);
}

.ai-chat-modal-content h2 {
    margin-top: 0;
    margin-bottom: var(--spacing-lg);
}

.ai-chat-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 8px;
}

.ai-chat-iframe {
    width: 100%;
    height: 100%;
    border: none;
}

@media (max-width: 768px) {
    .ai-chat-modal-content {
        width: 95vw;
        height: 80vh;
    }
}
`;
document.head.appendChild(style);
