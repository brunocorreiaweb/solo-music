/**
 * Solo Music App
 * Main application initialization and setup
 */

class SoloMusicApp {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎵 Initializing Solo Music App v' + this.version);

            // Check if all required modules are loaded
            this.validateDependencies();

            // Initialize UI
            uiManager.init();

            // Check for OAuth callback
            if (googleDriveSyncManager.handleOAuthCallback()) {
                console.log('✅ Google Drive authenticated');
                uiManager.updateGoogleDriveStatus();
                uiManager.showToast('Successfully connected to Google Drive!', 'success');

                // Try to create backup folder
                try {
                    await googleDriveSyncManager.getOrCreateBackupFolder();
                    console.log('✅ Backup folder created/found');
                } catch (error) {
                    console.error('Error creating backup folder:', error);
                }
            }

            // Update initial view
            uiManager.showView('dashboard');

            // Add event listener for when courses view is shown
            this.setupCoursesViewHandler();

            // Add AlphaTex preview live update
            this.setupAlphaTaxLivePreview();

            console.log('✅ App initialized successfully');
            this.initialized = true;
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showErrorMessage('Failed to initialize application');
        }
    }

    /**
     * Validate all required dependencies are loaded
     */
    validateDependencies() {
        const required = [
            { name: 'dataManager', obj: dataManager },
            { name: 'courseManager', obj: courseManager },
            { name: 'lessonManager', obj: lessonManager },
            { name: 'progressTracker', obj: progressTracker },
            { name: 'alphaTabRenderer', obj: alphaTabRenderer },
            { name: 'googleDriveSyncManager', obj: googleDriveSyncManager },
            { name: 'aiChatManager', obj: aiChatManager },
            { name: 'uiManager', obj: uiManager }
        ];

        const missing = required.filter(dep => !dep.obj);
        if (missing.length > 0) {
            throw new Error(`Missing dependencies: ${missing.map(d => d.name).join(', ')}`);
        }
    }

    /**
     * Setup courses view handler
     */
    setupCoursesViewHandler() {
        // Use MutationObserver or a custom event to detect when courses view is shown
        const originalShowView = uiManager.showView.bind(uiManager);
        uiManager.showView = function(viewName) {
            originalShowView(viewName);
            if (viewName === 'courses') {
                uiManager.displayAllCourses();
            }
        };
    }

    /**
     * Setup AlphaTex manual preview button
     */
    setupAlphaTaxLivePreview() {
        const renderBtn = document.getElementById('btn-render-preview');
        const alphaTaxInput = document.getElementById('lesson-alphatex');
        
        if (renderBtn && alphaTaxInput) {
            renderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const alphaTex = alphaTaxInput.value;
                if (alphaTex.trim()) {
                    alphaTabRenderer.renderAlphaTex(alphaTex, 'alphatab-container');
                } else {
                    alphaTabRenderer.clear('alphatab-container');
                }
            });
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: #ef4444;">Error</h2>
                    <p>${message}</p>
                    <p style="color: #999; font-size: 0.875rem; margin-top: 1rem; white-space: pre-wrap;">
                        Check the console (F12) for more details.
                    </p>
                </div>
            `;
        }
    }

    /**
     * Get app information
     */
    getInfo() {
        return {
            name: 'Solo Music',
            version: this.version,
            description: 'Personal Instrumental Learning Management System',
            initialized: this.initialized
        };
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            courses: courseManager.getAllCourses().length,
            lessons: lessonManager.getAllLessons().length,
            progress: dataManager.getStatistics()
        };
    }

    /**
     * Reset app to initial state
     */
    resetApp() {
        if (confirm('Reset the app to initial state? This will clear all data.')) {
            dataManager.clearAll();
            window.location.reload();
        }
    }

    /**
     * Export app state
     */
    exportAppState() {
        return {
            appInfo: this.getInfo(),
            data: dataManager.exportData(),
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SoloMusicApp();
    window.app.init();
});

// Make managers available globally for debugging
window.debug = {
    getApp: () => window.app,
    getDataManager: () => dataManager,
    getCourseManager: () => courseManager,
    getLessonManager: () => lessonManager,
    getProgressTracker: () => progressTracker,
    getStatistics: () => window.dataManager.getStatistics(),
    exportData: () => dataManager.exportData(),
    clearAllData: () => {
        if (confirm('Clear all data?')) {
            dataManager.clearAll();
            location.reload();
        }
    }
};
