/**
 * UI Manager
 * Handles all DOM manipulation and event handling
 */

class UIManager {
    constructor() {
        this.currentView = 'dashboard';
        this.currentCourseId = null;
        this.currentLessonId = null;
    }

    /**
     * Initialize UI
     */
    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupEventListeners();
        this.updateDashboard();
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        const dashboardBtn = document.getElementById('nav-dashboard');
        const coursesBtn = document.getElementById('nav-courses');
        const settingsBtn = document.getElementById('nav-settings');

        dashboardBtn?.addEventListener('click', () => this.showView('dashboard'));
        coursesBtn?.addEventListener('click', () => this.showView('courses'));
        settingsBtn?.addEventListener('click', () => this.showView('settings'));
    }

    /**
     * Show view
     */
    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const view = document.getElementById(`${viewName}-view`);
        if (view) {
            view.classList.add('active');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const navBtn = Array.from(document.querySelectorAll('.nav-btn')).find(
            btn => btn.textContent.toLowerCase().includes(viewName.toLowerCase())
        );
        navBtn?.classList.add('active');

        this.currentView = viewName;
    }

    /**
     * Setup modals
     */
    setupModals() {
        const courseModal = document.getElementById('course-modal');
        const newCourseBtn = document.getElementById('btn-new-course');
        const addCourseBtn = document.getElementById('btn-add-course');
        const closeButtons = document.querySelectorAll('.close, .modal-close');

        newCourseBtn?.addEventListener('click', () => this.openModal('course-modal'));
        addCourseBtn?.addEventListener('click', () => this.openModal('course-modal'));

        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Course Form
        const courseForm = document.getElementById('course-form');
        courseForm?.addEventListener('submit', (e) => this.handleCreateCourse(e));

        // Lesson Form
        const lessonForm = document.getElementById('lesson-form');
        lessonForm?.addEventListener('submit', (e) => this.handleSaveLesson(e));

        // Delete lesson button
        const deleteBtn = document.getElementById('btn-delete-lesson');
        deleteBtn?.addEventListener('click', () => this.handleDeleteLesson());

        // Navigation buttons in views
        document.getElementById('btn-back-to-courses')?.addEventListener('click', () => {
            this.showView('courses');
        });

        document.getElementById('btn-back-from-lesson')?.addEventListener('click', () => {
            if (this.currentCourseId) {
                this.showCourseDetail(this.currentCourseId);
            } else {
                this.showView('courses');
            }
        });

        // Settings
        this.setupSettingsEventListeners();
    }

    /**
     * Setup settings event listeners
     */
    setupSettingsEventListeners() {
        const exportBtn = document.getElementById('btn-export-data');
        const importBtn = document.getElementById('btn-import-data');
        const clearBtn = document.getElementById('btn-clear-data');
        const googleClientIdInput = document.getElementById('google-client-id');
        const saveClientIdBtn = document.getElementById('btn-save-client-id');
        const googleConnectBtn = document.getElementById('btn-google-connect');
        const googleSyncBtn = document.getElementById('btn-google-sync');
        const googleListBackupsBtn = document.getElementById('btn-google-list-backups');
        const googleDisconnectBtn = document.getElementById('btn-google-disconnect');

        
        const settings = dataManager.getSettings();
        // Load saved Google Client ID
        if (googleClientIdInput && settings.googleClientId) {
            googleClientIdInput.value = settings.googleClientId;
        }

        // Save Google Client ID
        saveClientIdBtn?.addEventListener('click', () => {
            const clientId = googleClientIdInput?.value;
            if (clientId && googleDriveSyncManager.saveClientId(clientId)) {
                this.showToast('Google Client ID saved. You can now connect to Google Drive.', 'success');
            } else {
                this.showToast('Please enter a valid Client ID', 'error');
            }
        });

        // Load saved metronome URL
        const metronomeUrlInput = document.getElementById('metronome-url');
        const saveMetronomeBtn = document.getElementById('btn-save-metronome');
        const metronomeStatus = document.getElementById('metronome-status');
        
        if (metronomeUrlInput && localStorage.getItem('metronome-url')) {
            metronomeUrlInput.value = localStorage.getItem('metronome-url');
        }

        // Save Metronome URL
        if (saveMetronomeBtn) {
            saveMetronomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const url = metronomeUrlInput?.value;
                if (url) {
                    try {
                        new URL(url); // Validate URL format
                        localStorage.setItem('metronome-url', url);
                        metronomeStatus.textContent = '✓ Metronome URL saved successfully';
                        metronomeStatus.style.color = '#4CAF50';
                        this.showToast('Metronome URL saved', 'success');
                    } catch (e) {
                        metronomeStatus.textContent = '✗ Invalid URL format';
                        metronomeStatus.style.color = '#f44336';
                        this.showToast('Invalid URL format', 'error');
                    }
                } else {
                    metronomeStatus.textContent = '✗ Please enter a URL';
                    metronomeStatus.style.color = '#f44336';
                    this.showToast('Please enter a metronome URL', 'error');
                }
            });
        }

        // Export data
        exportBtn?.addEventListener('click', () => this.handleExportData());

        // Import data
        importBtn?.addEventListener('click', () => this.handleImportData());

        // Clear data
        clearBtn?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                dataManager.clearAll();
                this.showToast('All data cleared', 'success');
                this.updateDashboard();
            }
        });

        // Google Drive
        googleConnectBtn?.addEventListener('click', () => this.handleGoogleConnect());
        googleSyncBtn?.addEventListener('click', () => this.handleGoogleSync());
        googleListBackupsBtn?.addEventListener('click', () => this.handleGoogleListBackups());
        googleDisconnectBtn?.addEventListener('click', () => this.handleGoogleDisconnect());

        // Update Google Drive status
        this.updateGoogleDriveStatus();
    }

    /**
     * Update dashboard
     */
    updateDashboard() {
        const stats = dataManager.getStatistics();
        
        document.getElementById('stat-courses').textContent = stats.totalCourses;
        document.getElementById('stat-lessons').textContent = stats.totalLessons;
        document.getElementById('stat-completed').textContent = stats.completedLessons;
        document.getElementById('stat-progress').textContent = stats.overallProgress + '%';

        this.displayCoursesPreview();
    }

    /**
     * Display courses preview on dashboard
     */
    displayCoursesPreview() {
        const coursesList = document.getElementById('courses-list');
        const courses = courseManager.getRecentCourses(5);

        if (courses.length === 0) {
            coursesList.innerHTML = '<p class="empty-state">No courses yet. Create your first course to get started!</p>';
            return;
        }

        coursesList.innerHTML = courses.map(course => {
            const stats = courseManager.getCourseStats(course.id);
            return `
                <div class="course-card" onclick="uiManager.showCourseDetail('${course.id}')">
                    <h3>${this.escapeHtml(course.title)}</h3>
                    <p>${this.escapeHtml(course.description)}</p>
                    <div class="course-meta">
                        <span class="instrument-badge">${course.instrument}</span>
                        <span>${stats.completedLessons}/${stats.totalLessons}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Display all courses
     */
    displayAllCourses() {
        const grid = document.getElementById('all-courses-grid');
        const courses = courseManager.getAllCourses();

        if (courses.length === 0) {
            grid.innerHTML = '<p class="empty-state">No courses yet. <button class="btn btn-primary" onclick="uiManager.openModal(\'course-modal\')">Create a course</button></p>';
            return;
        }

        grid.innerHTML = courses.map(course => {
            const stats = courseManager.getCourseStats(course.id);
            return `
                <div class="course-card" onclick="uiManager.showCourseDetail('${course.id}')">
                    <h3>${this.escapeHtml(course.title)}</h3>
                    <p>${this.escapeHtml(course.description)}</p>
                    <div class="progress-container">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span>${Math.round(stats.progressPercentage)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${stats.progressPercentage}%"></div>
                        </div>
                    </div>
                    <div class="course-meta">
                        <span class="instrument-badge">${course.instrument}</span>
                        <span>${stats.completedLessons}/${stats.totalLessons}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Show course detail
     */
    showCourseDetail(courseId) {
        this.currentCourseId = courseId;
        const course = courseManager.getCourseWithLessons(courseId);

        if (!course) {
            this.showToast('Course not found', 'error');
            return;
        }

        const detailContent = document.getElementById('course-detail-content');
        const stats = course.stats;

        detailContent.innerHTML = `
            <div class="course-detail-header">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h2>${this.escapeHtml(course.title)}</h2>
                        <p>${this.escapeHtml(course.description)}</p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-md);">
                        <button class="btn btn-secondary" onclick="uiManager.showEditCourseModal('${courseId}')">Edit</button>
                        <button class="btn btn-danger" onclick="uiManager.confirmDeleteCourse('${courseId}')">Delete</button>
                    </div>
                </div>
            </div>

            <div class="course-info">
                <div class="course-info-grid">
                    <div class="info-item">
                        <h4>Instrument</h4>
                        <p class="instrument-badge">${course.instrument}</p>
                    </div>
                    <div class="info-item">
                        <h4>Lessons</h4>
                        <p>${stats.completedLessons}/${stats.totalLessons} completed</p>
                    </div>
                    <div class="info-item">
                        <h4>Progress</h4>
                        <p>${Math.round(stats.progressPercentage)}%</p>
                    </div>
                    <div class="info-item">
                        <h4>Rating</h4>
                        <p>${stats.averageRating}/5</p>
                    </div>
                </div>
            </div>

            <div class="lessons-container">
                <div class="lessons-header">
                    <h3>Lessons</h3>
                    <button class="btn btn-primary" onclick="uiManager.showLessonEditor(null, '${courseId}')">+ Add Lesson</button>
                </div>
                <div class="lessons-list" id="lessons-list">
                    ${course.lessons.length === 0 ? '<p class="empty-state">No lessons yet</p>' : ''}
                </div>
            </div>
        `;

        this.renderLessonsList(course.lessons, courseId);
        this.showView('course-detail');
    }

    /**
     * Render lessons list
     */
    renderLessonsList(lessons, courseId) {
        const lessonsList = document.getElementById('lessons-list');

        if (lessons.length === 0) {
            lessonsList.innerHTML = '<p class="empty-state">No lessons yet</p>';
            return;
        }

        lessonsList.innerHTML = lessons.map(lesson => `
            <div class="lesson-item">
                <div class="lesson-info">
                    <h3>${this.escapeHtml(lesson.title)}</h3>
                    <p>${this.escapeHtml(lesson.description)}</p>
                    <div class="lesson-meta">
                        <span class="lesson-status ${lesson.completed ? 'completed' : 'pending'}">
                            ${lesson.completed ? '✓ Completed' : 'Not Started'}
                        </span>
                        ${lesson.rating > 0 ? `<span>Rating: ${lesson.rating}/5</span>` : ''}
                    </div>
                </div>
                <div class="lesson-actions">
                    <button class="btn btn-primary" onclick="uiManager.showLessonEditor('${lesson.id}', '${courseId}')">Edit</button>
                    <button class="btn btn-secondary" onclick="uiManager.openLessonViewer('${lesson.id}')">View</button>
                    <button class="btn btn-danger" onclick="uiManager.confirmDeleteLesson('${lesson.id}', '${courseId}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Open lesson in new tab/window
     */
    openLessonViewer(lessonId) {
        const width = 1000;
        const height = 800;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        window.open(
            `lesson.html?id=${lessonId}`,
            'lessonViewer',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );
    }

    /**
     * Show lesson detail
     */
    showLessonDetail(lessonId) {
        const lesson = lessonManager.getLessonDetails(lessonId);
        if (!lesson) {
            this.showToast('Lesson not found', 'error');
            return;
        }

        console.log('Showing lesson detail:', lesson);
        
        // Create a modal to display lesson details
        let modal = document.getElementById('lesson-detail-modal');
        if (!modal) {
            // Create modal if it doesn't exist
            modal = document.createElement('div');
            modal.id = 'lesson-detail-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        // Render lesson content in modal
        const course = courseManager.getCourseById(lesson.courseId);
        const courseName = course ? course.title : 'Unknown Course';

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('lesson-detail-modal').style.display='none'">&times;</span>
                <h2>${this.escapeHtml(lesson.title)}</h2>
                <p><strong>Course:</strong> ${this.escapeHtml(courseName)}</p>
                <div style="margin: var(--spacing-lg) 0;">
                    <h3>Description</h3>
                    <p>${this.escapeHtml(lesson.description).replace(/\n/g, '<br>')}</p>
                </div>
                ${lesson.youtubeUrl ? `
                    <div style="margin: var(--spacing-lg) 0;">
                        <h3>Video</h3>
                        <p><a href="${this.escapeHtml(lesson.youtubeUrl)}" target="_blank">Watch on YouTube</a></p>
                    </div>
                ` : ''}
                ${lesson.alphaTex ? `
                    <div style="margin: var(--spacing-lg) 0;">
                        <h3>Notation Preview</h3>
                        <div id="lesson-detail-alphatab" style="background-color: #f5f5f5; padding: var(--spacing-lg); border-radius: 6px; border: 1px solid var(--border); min-height: 300px; overflow-x: auto;"></div>
                    </div>
                ` : ''}
                ${lesson.notes ? `
                    <div style="margin: var(--spacing-lg) 0;">
                        <h3>Notes</h3>
                        <p>${this.escapeHtml(lesson.notes).replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}
                ${lesson.progress ? `
                    <div style="margin: var(--spacing-lg) 0;">
                        <h3>Progress</h3>
                        <p><strong>Status:</strong> ${lesson.progress.completed ? '✓ Completed' : 'Not completed'}</p>
                        ${lesson.progress.rating ? `<p><strong>Rating:</strong> ${lesson.progress.rating}/5</p>` : ''}
                    </div>
                ` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('lesson-detail-modal').style.display='none'">Close</button>
                </div>
            </div>
        `;

        modal.style.display = 'block';

        // Render AlphaTex if present
        if (lesson.alphaTex) {
            setTimeout(() => {
                alphaTabRenderer.renderAlphaTex(lesson.alphaTex, 'lesson-detail-alphatab');
            }, 50);
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Show lesson editor
     */
    showLessonEditor(lessonId, courseId) {
        this.currentLessonId = lessonId;
        
        // Clear form
        const form = document.getElementById('lesson-form');
        form?.reset();

        if (lessonId) {
            // Edit existing lesson
            const lesson = lessonManager.getLessonDetails(lessonId);
            if (!lesson) {
                this.showToast('Lesson not found', 'error');
                return;
            }

            document.getElementById('lesson-title').value = lesson.title;
            document.getElementById('lesson-description').value = lesson.description;
            document.getElementById('lesson-youtube').value = lesson.youtubeUrl;
            document.getElementById('lesson-alphatex').value = lesson.alphaTex;
            document.getElementById('lesson-notes').value = lesson.notes;
            document.getElementById('lesson-rating').value = lesson.progress?.rating || 0;

            // Show delete button
            const deleteBtn = document.getElementById('btn-delete-lesson');
            if (deleteBtn) {
                deleteBtn.style.display = 'block';
            }
        } else {
            // New lesson
            const deleteBtn = document.getElementById('btn-delete-lesson');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
        }

        this.showView('lesson-editor');

        // Trigger AlphaTex rendering after view is shown to ensure container is visible
        setTimeout(() => {
            const alphaTex = document.getElementById('lesson-alphatex')?.value || '';
            if (alphaTex.trim()) {
                alphaTabRenderer.renderAlphaTex(alphaTex, 'alphatab-container');
            }
        }, 50);
        
        // Re-attach live preview listener
        this.setupAlphaTaxLivePreview();
    }

    /**
     * Handle create course
     */
    handleCreateCourse(e) {
        e.preventDefault();

        const title = document.getElementById('course-title').value;
        const description = document.getElementById('course-description').value;
        const instrument = document.getElementById('course-instrument').value;

        if (!title || !instrument) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const course = courseManager.createCourse({
                title,
                description,
                instrument
            });

            this.closeModal('course-modal');
            this.updateDashboard();
            this.displayAllCourses();
            this.showToast('Course created successfully', 'success');
        } catch (error) {
            console.error('Error creating course:', error);
            this.showToast('Error creating course', 'error');
        }
    }

    /**
     * Handle save lesson
     */
    handleSaveLesson(e) {
        e.preventDefault();

        if (!this.currentCourseId && !this.currentLessonId) {
            this.showToast('Invalid course or lesson', 'error');
            return;
        }

        const title = document.getElementById('lesson-title').value;
        const description = document.getElementById('lesson-description').value;
        const youtubeUrl = document.getElementById('lesson-youtube').value;
        const alphaTex = document.getElementById('lesson-alphatex').value;
        const notes = document.getElementById('lesson-notes').value;
        const rating = parseFloat(document.getElementById('lesson-rating').value) || 0;

        if (!title) {
            this.showToast('Lesson title is required', 'error');
            return;
        }

        try {
            if (this.currentLessonId) {
                // Update lesson
                lessonManager.updateLesson(this.currentLessonId, {
                    title,
                    description,
                    youtubeUrl,
                    alphaTex,
                    notes
                });
                
                // Update progress
                progressTracker.updateLessonRating(this.currentLessonId, rating);
                
                this.showToast('Lesson updated successfully', 'success');
            } else {
                // Create lesson
                lessonManager.createLesson(this.currentCourseId, {
                    title,
                    description,
                    youtubeUrl,
                    alphaTex,
                    notes,
                    rating
                });
                
                this.showToast('Lesson created successfully', 'success');
            }

            this.showCourseDetail(this.currentCourseId);
        } catch (error) {
            console.error('Error saving lesson:', error);
            this.showToast('Error saving lesson', 'error');
        }
    }

    /**
     * Handle delete lesson
     */
    handleDeleteLesson() {
        if (!this.currentLessonId) return;

        if (confirm('Are you sure you want to delete this lesson?')) {
            try {
                lessonManager.deleteLesson(this.currentLessonId);
                this.showToast('Lesson deleted successfully', 'success');
                this.showCourseDetail(this.currentCourseId);
            } catch (error) {
                console.error('Error deleting lesson:', error);
                this.showToast('Error deleting lesson', 'error');
            }
        }
    }

    /**
     * Handle export data
     */
    handleExportData() {
        try {
            const data = dataManager.exportData();
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `solo-music-export-${timestamp}.json`;

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error exporting data', 'error');
        }
    }

    /**
     * Handle import data
     */
    handleImportData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    if (dataManager.importData(jsonData)) {
                        this.updateDashboard();
                        this.showToast('Data imported successfully', 'success');
                    } else {
                        this.showToast('Invalid data format', 'error');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    this.showToast('Error importing data', 'error');
                }
            };
            reader.readAsText(file);
        });

        input.click();
    }

    /**
     * Handle Google Drive connect
     */
    handleGoogleConnect() {
        if (!googleDriveSyncManager.getClientId()) {
            this.showToast('Please configure Google Client ID first', 'error');
            return;
        }

        try {
            googleDriveSyncManager.initiateOAuthFlow();
        } catch (error) {
            console.error('Error connecting to Google Drive:', error);
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    /**
     * Update Google Drive status
     */
    updateGoogleDriveStatus() {
        const statusText = document.getElementById('google-status-text');
        const connectBtn = document.getElementById('btn-google-connect');
        const syncBtn = document.getElementById('btn-google-sync');
        const listBackupsBtn = document.getElementById('btn-google-list-backups');
        const disconnectBtn = document.getElementById('btn-google-disconnect');

        if (googleDriveSyncManager.isAuthenticated()) {
            if (statusText) statusText.textContent = '✓ Connected to Google Drive';
            if (connectBtn) connectBtn.style.display = 'none';
            if (syncBtn) syncBtn.style.display = 'inline-block';
            if (listBackupsBtn) listBackupsBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
        } else {
            if (statusText) statusText.textContent = 'Not connected';
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (syncBtn) syncBtn.style.display = 'none';
            if (listBackupsBtn) listBackupsBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
        }
    }

    /**
     * Handle Google Drive sync
     */
    async handleGoogleSync() {
        if (!googleDriveSyncManager.isAuthenticated()) {
            this.showToast('Not connected to Google Drive', 'error');
            return;
        }

        try {
            // First, ensure backup folder exists
            await googleDriveSyncManager.getOrCreateBackupFolder();
            
            // Then sync the data
            const success = await googleDriveSyncManager.syncToGoogleDrive();
            if (success) {
                this.showToast('Data synced to Google Drive', 'success');
            } else {
                this.showToast('Error syncing data', 'error');
            }
        } catch (error) {
            console.error('Error syncing:', error);
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    /**
     * Handle Google Drive disconnect
     */
    handleGoogleDisconnect() {
        if (confirm('Are you sure you want to disconnect from Google Drive?')) {
            googleDriveSyncManager.disconnect();
            this.updateGoogleDriveStatus();
            this.showToast('Google Drive disconnected', 'success');
        }
    }

    /**
     * Handle listing backup files
     */
    async handleGoogleListBackups() {
        if (!googleDriveSyncManager.isAuthenticated()) {
            this.showToast('Not connected to Google Drive', 'error');
            return;
        }

        try {
            this.showToast('Loading backups...', 'info');
            const files = await googleDriveSyncManager.listBackupFiles();
            this.displayBackupFiles(files);
        } catch (error) {
            console.error('Error listing backups:', error);
            this.showToast('Error loading backups: ' + error.message, 'error');
        }
    }

    /**
     * Display backup files list
     */
    displayBackupFiles(files) {
        const section = document.getElementById('backup-files-section');
        const list = document.getElementById('backup-files-list');

        if (!files || files.length === 0) {
            list.innerHTML = '<p style="padding: 1rem; text-align: center; color: #999;">No backups found</p>';
            if (section) section.style.display = 'block';
            return;
        }

        list.innerHTML = files.map(file => `
            <div style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 500;">${this.escapeHtml(file.name)}</div>
                    <div style="font-size: 0.875rem; color: #666;">
                        ${new Date(file.createdTime).toLocaleString()}
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-primary" onclick="uiManager.handleGoogleLoadBackup('${file.id}', '${this.escapeHtml(file.name)}')">
                        Load
                    </button>
                </div>
            </div>
        `).join('');

        if (section) section.style.display = 'block';
    }

    /**
     * Handle loading a backup file
     */
    async handleGoogleLoadBackup(fileId, fileName) {
        if (!confirm(`Load backup from "${fileName}"? This will replace all current data.`)) {
            return;
        }

        try {
            this.showToast('Loading backup...', 'info');
            const success = await dataManager.loadFromGoogleDrive(fileId);
            if (success) {
                this.showToast('Backup loaded successfully', 'success');
                this.updateDashboard();
                // Refresh the backup list
                await this.handleGoogleListBackups();
            } else {
                this.showToast('Error loading backup', 'error');
            }
        } catch (error) {
            console.error('Error loading backup:', error);
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Create toast container
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Show edit course modal
     */
    showEditCourseModal(courseId) {
        const course = courseManager.getCourseById(courseId);
        if (!course) return;

        const modal = document.getElementById('edit-course-modal');
        if (!modal) {
            console.error('Edit course modal not found');
            return;
        }

        document.getElementById('edit-course-id').value = courseId;
        document.getElementById('edit-course-title').value = course.title;
        document.getElementById('edit-course-description').value = course.description;

        this.openModal('edit-course-modal');
    }

    /**
     * Handle save edit course
     */
    handleSaveEditCourse() {
        const courseId = document.getElementById('edit-course-id').value;
        const title = document.getElementById('edit-course-title').value.trim();
        const description = document.getElementById('edit-course-description').value.trim();

        if (!title) {
            this.showToast('Course title is required', 'error');
            return;
        }

        try {
            courseManager.updateCourse(courseId, { title, description });
            this.showToast('Course updated successfully', 'success');
            this.closeModal('edit-course-modal');
            this.showCourseDetail(courseId);
        } catch (error) {
            this.showToast('Error updating course', 'error');
        }
    }

    /**
     * Confirm delete course (2-step confirmation)
     */
    confirmDeleteCourse(courseId) {
        const course = courseManager.getCourseById(courseId);
        if (!course) return;

        const confirmed = confirm(`Delete course "${this.escapeHtml(course.title)}"?\n\nClick OK to confirm. You'll be asked to confirm once more.`);
        if (!confirmed) return;

        const finalConfirmed = confirm(`Are you sure? This will delete the course and all its lessons.\n\nThis action cannot be undone.`);
        if (!finalConfirmed) return;

        this.handleDeleteCourse(courseId);
    }

    /**
     * Handle delete course
     */
    handleDeleteCourse(courseId) {
        try {
            courseManager.deleteCourse(courseId);
            this.showToast('Course deleted successfully', 'success');
            this.displayAllCourses();
            this.showView('courses');
        } catch (error) {
            this.showToast('Error deleting course', 'error');
        }
    }

    /**
     * Confirm delete lesson (2-step confirmation)
     */
    confirmDeleteLesson(lessonId, courseId) {
        const lesson = lessonManager.getLessonDetails(lessonId);
        if (!lesson) return;

        const confirmed = confirm(`Delete lesson "${this.escapeHtml(lesson.title)}"?\n\nClick OK to confirm. You'll be asked to confirm once more.`);
        if (!confirmed) return;

        const finalConfirmed = confirm(`Are you sure you want to delete this lesson?\n\nThis action cannot be undone.`);
        if (!finalConfirmed) return;

        this.handleDeleteLesson(lessonId, courseId);
    }

    /**
     * Handle delete lesson
     */
    handleDeleteLesson(lessonId, courseId) {
        try {
            lessonManager.deleteLesson(lessonId);
            this.showToast('Lesson deleted successfully', 'success');
            this.showCourseDetail(courseId);
        } catch (error) {
            this.showToast('Error deleting lesson', 'error');
        }
    }

    /**
     * Setup AlphaTex live preview
     */
    setupAlphaTaxLivePreview() {
        const alphaTaxInput = document.getElementById('lesson-alphatex');
        if (alphaTaxInput) {
            // Remove existing listener to avoid duplicates
            if (this._livePreviewHandler) {
                alphaTaxInput.removeEventListener('input', this._livePreviewHandler);
            }
            
            // Create handler
            let previewTimeout;
            this._livePreviewHandler = () => {
                clearTimeout(previewTimeout);
                previewTimeout = setTimeout(() => {
                    const alphaTex = alphaTaxInput.value;
                    if (alphaTex.trim()) {
                        alphaTabRenderer.renderAlphaTex(alphaTex, 'alphatab-container');
                    } else {
                        alphaTabRenderer.clear('alphatab-container');
                    }
                }, 500); // Wait 500ms after typing stops before rendering
            };
            
            // Attach listener
            alphaTaxInput.addEventListener('input', this._livePreviewHandler);
        }
    }
}

// Initialize UI Manager
const uiManager = new UIManager();
