/**
 * Data Manager
 * Handles all data operations with localStorage and Google Drive sync
 */

class DataManager {
    constructor() {
        this.storageKey = 'soloMusicAppData';
        this.googleAccessToken = null;
        this.googleFolderId = null;
        this.init();
    }

    init() {
        // Initialize data if it doesn't exist
        if (!this.getAll()) {
            this.setAll({
                courses: [],
                lessons: [],
                progress: [],
                settings: {
                    aiChatUrl: '',
                    lastSyncTime: null
                }
            });
        }
    }

    /**
     * Get all data
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    /**
     * Set all data
     */
    setAll(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error setting data:', error);
        }
    }

    /**
     * Get courses
     */
    getCourses() {
        const data = this.getAll();
        return data?.courses || [];
    }

    /**
     * Get course by ID
     */
    getCourseById(id) {
        const courses = this.getCourses();
        return courses.find(c => c.id === id);
    }

    /**
     * Create course
     */
    createCourse(courseData) {
        const courses = this.getCourses();
        const newCourse = {
            id: `course_${Date.now()}`,
            title: courseData.title,
            description: courseData.description,
            instrument: courseData.instrument,
            lessons: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        courses.push(newCourse);
        const allData = this.getAll();
        allData.courses = courses;
        this.setAll(allData);
        return newCourse;
    }

    /**
     * Update course
     */
    updateCourse(id, courseData) {
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = {
                ...courses[index],
                ...courseData,
                updatedAt: new Date().toISOString()
            };
            const allData = this.getAll();
            allData.courses = courses;
            this.setAll(allData);
            return courses[index];
        }
        return null;
    }

    /**
     * Delete course
     */
    deleteCourse(id) {
        let courses = this.getCourses();
        courses = courses.filter(c => c.id !== id);
        const allData = this.getAll();
        allData.courses = courses;
        this.setAll(allData);
    }

    /**
     * Get lessons
     */
    getLessons(courseId = null) {
        const data = this.getAll();
        let lessons = data?.lessons || [];
        if (courseId) {
            lessons = lessons.filter(l => l.courseId === courseId);
        }
        return lessons;
    }

    /**
     * Get lesson by ID
     */
    getLessonById(id) {
        const lessons = this.getLessons();
        return lessons.find(l => l.id === id);
    }

    /**
     * Create lesson
     */
    createLesson(courseId, lessonData) {
        const lessons = this.getLessons();
        const newLesson = {
            id: `lesson_${Date.now()}`,
            courseId: courseId,
            title: lessonData.title,
            description: lessonData.description,
            alphaTex: lessonData.alphaTex || '',
            youtubeUrl: lessonData.youtubeUrl || '',
            mediaLinks: lessonData.mediaLinks || [],
            notes: lessonData.notes || '',
            completed: false,
            rating: lessonData.rating || 0,
            aiChatConfig: lessonData.aiChatConfig || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        lessons.push(newLesson);
        
        // Add lesson ID to course's lessons array
        const courses = this.getCourses();
        const course = courses.find(c => c.id === courseId);
        if (course && !course.lessons.includes(newLesson.id)) {
            course.lessons.push(newLesson.id);
        }

        const allData = this.getAll();
        allData.lessons = lessons;
        allData.courses = courses;
        this.setAll(allData);
        return newLesson;
    }

    /**
     * Update lesson
     */
    updateLesson(id, lessonData) {
        const lessons = this.getLessons();
        const index = lessons.findIndex(l => l.id === id);
        if (index !== -1) {
            lessons[index] = {
                ...lessons[index],
                ...lessonData,
                updatedAt: new Date().toISOString()
            };
            const allData = this.getAll();
            allData.lessons = lessons;
            this.setAll(allData);
            return lessons[index];
        }
        return null;
    }

    /**
     * Delete lesson
     */
    deleteLesson(id) {
        let lessons = this.getLessons();
        const lesson = lessons.find(l => l.id === id);
        lessons = lessons.filter(l => l.id !== id);
        
        // Remove lesson ID from course's lessons array
        const courses = this.getCourses();
        const course = courses.find(c => c.id === lesson.courseId);
        if (course) {
            course.lessons = course.lessons.filter(lessonId => lessonId !== id);
        }

        const allData = this.getAll();
        allData.lessons = lessons;
        allData.courses = courses;
        this.setAll(allData);
    }

    /**
     * Get progress
     */
    getProgress() {
        const data = this.getAll();
        return data?.progress || [];
    }

    /**
     * Get progress for lesson
     */
    getProgressByLesson(lessonId) {
        const progress = this.getProgress();
        return progress.find(p => p.lessonId === lessonId);
    }

    /**
     * Update progress
     */
    updateProgress(lessonId, progressData) {
        let progress = this.getProgress();
        const index = progress.findIndex(p => p.lessonId === lessonId);
        
        const progressEntry = {
            lessonId: lessonId,
            completed: progressData.completed || false,
            completedAt: progressData.completed ? new Date().toISOString() : null,
            rating: progressData.rating || 0,
            notes: progressData.notes || '',
            updatedAt: new Date().toISOString()
        };

        if (index !== -1) {
            progress[index] = progressEntry;
        } else {
            progress.push(progressEntry);
        }

        const allData = this.getAll();
        allData.progress = progress;
        this.setAll(allData);
        
        // Also update lesson's completed status
        this.updateLesson(lessonId, { completed: progressData.completed });
        
        return progressEntry;
    }

    /**
     * Get settings
     */
    getSettings() {
        const data = this.getAll();
        return data?.settings || { aiChatUrl: '', lastSyncTime: null };
    }

    /**
     * Update settings
     */
    updateSettings(settings) {
        const allData = this.getAll();
        allData.settings = {
            ...allData.settings,
            ...settings
        };
        this.setAll(allData);
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const courses = this.getCourses();
        const lessons = this.getLessons();
        const progress = this.getProgress();

        const completedLessons = progress.filter(p => p.completed).length;
        const totalLessons = lessons.length;
        const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
            totalCourses: courses.length,
            totalLessons: totalLessons,
            completedLessons: completedLessons,
            overallProgress: Math.round(overallProgress),
            courseBreakdown: courses.map(course => {
                const courseLessons = lessons.filter(l => l.courseId === course.id);
                const completedCount = progress.filter(
                    p => p.completed && courseLessons.some(l => l.id === p.lessonId)
                ).length;
                return {
                    courseId: course.id,
                    title: course.title,
                    totalLessons: courseLessons.length,
                    completedLessons: completedCount,
                    progress: courseLessons.length > 0 ? (completedCount / courseLessons.length) * 100 : 0
                };
            })
        };
    }

    /**
     * Export data as JSON
     */
    exportData() {
        return this.getAll();
    }

    /**
     * Import data from JSON
     */
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (data.courses && data.lessons && data.progress !== undefined) {
                this.setAll(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        localStorage.removeItem(this.storageKey);
        this.init();
    }

    /**
     * Set Google access token
     */
    setGoogleAccessToken(token) {
        this.googleAccessToken = token;
    }

    /**
     * Set Google folder ID for syncing
     */
    setGoogleFolderId(folderId) {
        this.googleFolderId = folderId;
    }

    /**
     * Sync data to Google Drive
     */
    async syncToGoogleDrive() {
        if (!this.googleAccessToken || !this.googleFolderId) {
            throw new Error('Google Drive not connected');
        }

        const data = this.exportData();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
                        String(now.getMinutes()).padStart(2, '0') + ':' + 
                        String(now.getSeconds()).padStart(2, '0'); // hh:mm:ss
        const fileName = `solo-music-backup-${dateStr}-${timeStr}.json`;

        try {
            const fileContent = JSON.stringify(data, null, 2);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const timestamp = now.toISOString();
            
            // Check if file with same name already exists
            const existingFile = await this.findGoogleDriveFile(fileName);
            
            if (existingFile) {
                // Update existing file
                const response = await fetch(
                    `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${this.googleAccessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: fileContent
                    }
                );

                if (response.ok) {
                    const settings = this.getSettings();
                    this.updateSettings({
                        ...settings,
                        lastSyncTime: timestamp
                    });
                    return true;
                }
            } else {
                // Create new file
                const metadata = {
                    name: fileName,
                    mimeType: 'application/json',
                    parents: [this.googleFolderId]
                };

                const form = new FormData();
                form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                form.append('file', blob);

                const response = await fetch(
                    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.googleAccessToken}`
                        },
                        body: form
                    }
                );

                if (response.ok) {
                    const settings = this.getSettings();
                    this.updateSettings({
                        ...settings,
                        lastSyncTime: timestamp
                    });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error syncing to Google Drive:', error);
            return false;
        }
    }

    /**
     * Find a file in Google Drive by name
     */
    async findGoogleDriveFile(fileName) {
        if (!this.googleAccessToken || !this.googleFolderId) {
            return null;
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${this.googleFolderId}' in parents and name='${fileName}' and trashed=false&spaces=drive&pageSize=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.googleAccessToken}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.files && data.files.length > 0 ? data.files[0] : null;
            }
            return null;
        } catch (error) {
            console.error('Error finding file:', error);
            return null;
        }
    }

    /**
     * Load data from Google Drive
     */
    async loadFromGoogleDrive(fileId) {
        if (!this.googleAccessToken) {
            throw new Error('Google Drive not authenticated');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.googleAccessToken}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return this.importData(data);
            }
            return false;
        } catch (error) {
            console.error('Error loading from Google Drive:', error);
            return false;
        }
    }
}

// Initialize global data manager
const dataManager = new DataManager();
