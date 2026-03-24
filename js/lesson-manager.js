/**
 * Lesson Manager
 * Handles lesson-related operations
 */

class LessonManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Get all lessons
     */
    getAllLessons() {
        return this.dataManager.getLessons();
    }

    /**
     * Get lessons for a course
     */
    getLessonsByCourse(courseId) {
        return this.dataManager.getLessons(courseId);
    }

    /**
     * Get lesson with full details
     */
    getLessonDetails(lessonId) {
        const lesson = this.dataManager.getLessonById(lessonId);
        if (!lesson) return null;

        const progress = this.dataManager.getProgressByLesson(lessonId);
        const course = this.dataManager.getCourseById(lesson.courseId);

        return {
            ...lesson,
            course: course,
            progress: progress || {
                completed: false,
                rating: 0,
                notes: ''
            }
        };
    }

    /**
     * Create lesson
     */
    createLesson(courseId, lessonData) {
        return this.dataManager.createLesson(courseId, lessonData);
    }

    /**
     * Update lesson
     */
    updateLesson(lessonId, lessonData) {
        return this.dataManager.updateLesson(lessonId, lessonData);
    }

    /**
     * Delete lesson
     */
    deleteLesson(lessonId) {
        this.dataManager.deleteLesson(lessonId);
    }

    /**
     * Search lessons
     */
    searchLessons(query, courseId = null) {
        let lessons = this.dataManager.getLessons(courseId);
        const lowerQuery = query.toLowerCase();

        return lessons.filter(lesson =>
            lesson.title.toLowerCase().includes(lowerQuery) ||
            lesson.description.toLowerCase().includes(lowerQuery) ||
            lesson.notes.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get lessons by status
     */
    getLessonsByStatus(courseId, status) {
        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();

        if (status === 'completed') {
            return lessons.filter(l => progress.some(p => p.lessonId === l.id && p.completed));
        } else if (status === 'pending') {
            return lessons.filter(l => !progress.some(p => p.lessonId === l.id && p.completed));
        }

        return lessons;
    }

    /**
     * Sort lessons
     */
    sortLessons(lessons, sortBy = 'createdAt', order = 'asc') {
        const sorted = [...lessons].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * Get next lesson in course
     */
    getNextLesson(courseId, currentLessonId) {
        const lessons = this.getLessonsByCourse(courseId);
        const currentIndex = lessons.findIndex(l => l.id === currentLessonId);

        if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
            return lessons[currentIndex + 1];
        }

        return null;
    }

    /**
     * Get previous lesson in course
     */
    getPreviousLesson(courseId, currentLessonId) {
        const lessons = this.getLessonsByCourse(courseId);
        const currentIndex = lessons.findIndex(l => l.id === currentLessonId);

        if (currentIndex > 0) {
            return lessons[currentIndex - 1];
        }

        return null;
    }

    /**
     * Add media link to lesson
     */
    addMediaLink(lessonId, link) {
        const lesson = this.dataManager.getLessonById(lessonId);
        if (!lesson) return null;

        const mediaLinks = lesson.mediaLinks || [];
        mediaLinks.push({
            url: link.url,
            type: link.type || 'link',
            title: link.title || 'Link'
        });

        return this.updateLesson(lessonId, { mediaLinks });
    }

    /**
     * Remove media link from lesson
     */
    removeMediaLink(lessonId, linkUrl) {
        const lesson = this.dataManager.getLessonById(lessonId);
        if (!lesson) return null;

        const mediaLinks = (lesson.mediaLinks || []).filter(l => l.url !== linkUrl);
        return this.updateLesson(lessonId, { mediaLinks });
    }

    /**
     * Get lesson statistics
     */
    getLessonStats() {
        const lessons = this.getAllLessons();
        const progress = this.dataManager.getProgress();

        const totalLessons = lessons.length;
        const completedLessons = progress.filter(p => p.completed).length;
        const averageRating = this.calculateAverageRating(progress);

        return {
            total: totalLessons,
            completed: completedLessons,
            pending: totalLessons - completedLessons,
            completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
            averageRating: averageRating
        };
    }

    /**
     * Calculate average rating from progress data
     */
    calculateAverageRating(progress) {
        const ratings = progress.map(p => p.rating).filter(r => r > 0);
        if (ratings.length === 0) return 0;
        return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    }

    /**
     * Get lessons by rating
     */
    getLessonsByMinRating(minRating) {
        const lessons = this.getAllLessons();
        const progress = this.dataManager.getProgress();

        return lessons.filter(lesson => {
            const lessonProgress = progress.find(p => p.lessonId === lesson.id);
            return lessonProgress && lessonProgress.rating >= minRating;
        });
    }

    /**
     * Duplicate lesson
     */
    duplicateLesson(lessonId) {
        const lesson = this.dataManager.getLessonById(lessonId);
        if (!lesson) return null;

        const duplicatedLesson = {
            title: lesson.title + ' (Copy)',
            description: lesson.description,
            alphaTex: lesson.alphaTex,
            youtubeUrl: lesson.youtubeUrl,
            mediaLinks: [...(lesson.mediaLinks || [])],
            notes: lesson.notes
        };

        return this.createLesson(lesson.courseId, duplicatedLesson);
    }

    /**
     * Validate AlphaTex content
     */
    validateAlphaTex(alphaTex) {
        // Basic validation - check if it contains any content
        return alphaTex && alphaTex.trim().length > 0;
    }

    /**
     * Get lessons needing review (no rating)
     */
    getLessonsNeedingReview() {
        const lessons = this.getAllLessons();
        const progress = this.dataManager.getProgress();

        return lessons.filter(lesson => {
            const lessonProgress = progress.find(p => p.lessonId === lesson.id);
            return lessonProgress && lessonProgress.completed && lessonProgress.rating === 0;
        });
    }
}

// Initialize lesson manager
const lessonManager = new LessonManager(dataManager);
