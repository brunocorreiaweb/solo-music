/**
 * Google Drive Sync Manager
 * Handles Google Drive integration and syncing
 */

class GoogleDriveSyncManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.clientId = null;
        this.apiKey = '';
        this.accessToken = null;
        this.folderName = 'Solo Music Backups';
        this.folderId = null;
        this.redirectUri = window.location.href.split('?')[0].split('#')[0];
        this.loadConfig();
    }

    /**
     * Load configuration from settings
     */
    loadConfig() {
        const settings = this.dataManager.getSettings();
        this.clientId = settings.googleClientId || null;
        this.accessToken = settings.googleAccessToken || null;
        this.folderId = settings.googleFolderId || null;
    }

    /**
     * Save Client ID
     */
    saveClientId(clientId) {
        if (!clientId || clientId.trim() === '') {
            return false;
        }
        this.clientId = clientId;
        const settings = this.dataManager.getSettings();
        this.dataManager.updateSettings({
            ...settings,
            googleClientId: clientId
        });
        return true;
    }

    /**
     * Get saved Client ID
     */
    getClientId() {
        return this.clientId;
    }

    /**
     * Initialize OAuth flow
     */
    initiateOAuthFlow() {
        if (!this.clientId) {
            throw new Error('Google Client ID not configured');
        }

        const scopes = [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.appdata'
        ];

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('redirect_uri', this.redirectUri);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('scope', scopes.join(' '));
        authUrl.searchParams.append('prompt', 'consent');

        window.location.href = authUrl.toString();
    }

    /**
     * Handle OAuth callback
     */
    handleOAuthCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
            this.setAccessToken(token);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
        return false;
    }

    /**
     * Set access token
     */
    setAccessToken(token) {
        this.accessToken = token;
        const settings = this.dataManager.getSettings();
        this.dataManager.updateSettings({
            ...settings,
            googleAccessToken: token
        });
        this.dataManager.setGoogleAccessToken(token);
    }

    /**
     * Initialize Google Sign-In
     */
    initializeGoogleSignIn(clientId) {
        this.clientId = clientId;
        console.log('Google Sign-In initialized');
    }

    /**
     * Authenticate with Google
     */
    async authenticate(token) {
        try {
            this.accessToken = token;
            this.dataManager.setGoogleAccessToken(token);
            return true;
        } catch (error) {
            console.error('Authentication error:', error);
            return false;
        }
    }

    /**
     * Check if authenticated
     */
    isAuthenticated() {
        return this.accessToken !== null;
    }

    /**
     * Get or create backup folder
     */
    async getOrCreateBackupFolder() {
        if (!this.accessToken) {
            throw new Error('Not authenticated with Google Drive');
        }

        try {
            // Check if folder exists
            const existingFolder = await this.findFolder(this.folderName);
            if (existingFolder) {
                this.folderId = existingFolder.id;
                const settings = this.dataManager.getSettings();
                this.dataManager.updateSettings({
                    ...settings,
                    googleFolderId: this.folderId
                });
                this.dataManager.setGoogleFolderId(this.folderId);
                return existingFolder;
            }

            // Create new folder
            const folder = await this.createFolder(this.folderName);
            this.folderId = folder.id;
            const settings = this.dataManager.getSettings();
            this.dataManager.updateSettings({
                ...settings,
                googleFolderId: this.folderId
            });
            this.dataManager.setGoogleFolderId(this.folderId);
            return folder;
        } catch (error) {
            console.error('Error getting/creating folder:', error);
            throw error;
        }
    }

    /**
     * Find folder by name
     */
    async findFolder(folderName) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive&pageSize=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.status === 401) {
                console.warn('Google Drive access token expired. Re-authenticating...');
                this.disconnect();
                throw new Error('Unauthorized: Google Drive access token expired.');
            }

            if (response.ok) {
                const data = await response.json();
                return data.files.length > 0 ? data.files[0] : null;
            }
            return null;
        } catch (error) {
            console.error('Error finding folder:', error);
            throw error; // Re-throw to be caught by calling function
        }
    }

    /**
     * Create folder
     */
    async createFolder(folderName) {
        try {
            const metadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            };

            const response = await fetch(
                'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(metadata)
                }
            );

            if (response.status === 401) {
                console.warn('Google Drive access token expired. Re-authenticating...');
                this.disconnect();
                throw new Error('Unauthorized: Google Drive access token expired.');
            }

            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to create folder');
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    }

    /**
     * Sync data to Google Drive
     */
    async syncToGoogleDrive() {
        if (!this.accessToken || !this.folderId) {
            throw new Error('Google Drive not properly configured');
        }

        try {
            const success = await this.dataManager.syncToGoogleDrive();
            return success;
        } catch (error) {
            if (error.message.includes('Unauthorized')) {
                this.disconnect();
                throw new Error('Unauthorized: Google Drive access token expired. Please re-authenticate.');
            }
            console.error('Error syncing to Google Drive:', error);
            throw error;
        }
    }

    /**
     * List backup files
     */
    async listBackupFiles() {
        if (!this.accessToken || !this.folderId) {
            throw new Error('Google Drive not properly configured');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${this.folderId}' in parents and trashed=false&orderBy=createdTime desc&pageSize=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.status === 401) {
                console.warn('Google Drive access token expired. Re-authenticating...');
                this.disconnect();
                throw new Error('Unauthorized: Google Drive access token expired.');
            }

            if (response.ok) {
                const data = await response.json();
                return data.files || [];
            }
            return [];
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    /**
     * Download backup file
     */
    async downloadBackupFile(fileId) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.status === 401) {
                console.warn('Google Drive access token expired. Re-authenticating...');
                this.disconnect();
                throw new Error('Unauthorized: Google Drive access token expired.');
            }

            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to download file');
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    /**
     * Delete backup file
     */
    async deleteBackupFile(fileId) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            if (response.status === 401) {
                console.warn('Google Drive access token expired. Re-authenticating...');
                this.disconnect();
                throw new Error('Unauthorized: Google Drive access token expired.');
            }

            return response.ok;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(fileId) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        try {
            const backupData = await this.downloadBackupFile(fileId); // downloadBackupFile will handle 401
            const success = this.dataManager.importData(backupData);
            return success;
        } catch (error) {
            if (error.message.includes('Unauthorized')) {
                // Re-throw the unauthorized error from downloadBackupFile
                throw error;
            }
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    /**
     * Disconnect Google Drive
     */
    disconnect() {
        this.accessToken = null;
        this.folderId = null;
        const settings = this.dataManager.getSettings();
        this.dataManager.updateSettings({
            ...settings,
            googleAccessToken: null,
            googleFolderId: null
        });
        this.dataManager.setGoogleAccessToken(null);
        this.dataManager.setGoogleFolderId(null);
    }

    /**
     * Get sync status
     */
    getSyncStatus() {
        const settings = this.dataManager.getSettings();
        return {
            isConnected: this.isAuthenticated(),
            lastSyncTime: settings.lastSyncTime,
            canSync: this.isAuthenticated() && this.folderId !== null
        };
    }
}

// Initialize Google Drive Sync Manager
const googleDriveSyncManager = new GoogleDriveSyncManager(dataManager);
