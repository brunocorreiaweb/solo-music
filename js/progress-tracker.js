/**
 * Progress Tracker
 * Handles progress tracking and evaluation
 */

class ProgressTracker {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Mark lesson as completed
     */
    markLessonCompleted(lessonId, rating = 0, notes = '') {
        return this.dataManager.updateProgress(lessonId, {
            completed: true,
            rating: Math.max(0, Math.min(5, rating)),
            notes: notes
        });
    }

    /**
     * Mark lesson as not completed
     */
    markLessonIncomplete(lessonId) {
        return this.dataManager.updateProgress(lessonId, {
            completed: false,
            rating: 0,
            notes: ''
        });
    }

    /**
     * Update lesson rating
     */
    updateLessonRating(lessonId, rating) {
        const progress = this.dataManager.getProgressByLesson(lessonId);
        return this.dataManager.updateProgress(lessonId, {
            completed: progress?.completed || false,
            rating: Math.max(0, Math.min(5, rating)),
            notes: progress?.notes || ''
        });
    }

    /**
     * Update lesson notes
     */
    updateLessonNotes(lessonId, notes) {
        const progress = this.dataManager.getProgressByLesson(lessonId);
        return this.dataManager.updateProgress(lessonId, {
            completed: progress?.completed || false,
            rating: progress?.rating || 0,
            notes: notes
        });
    }

    /**
     * Get course progress
     */
    getCourseProgress(courseId) {
        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();

        const totalLessons = lessons.length;
        const completedLessons = lessons.filter(lesson =>
            progress.some(p => p.lessonId === lesson.id && p.completed)
        ).length;

        const averageRating = this.calculateAverageRating(lessons, progress);
        const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
            courseId,
            totalLessons,
            completedLessons,
            pendingLessons: totalLessons - completedLessons,
            completionPercentage: Math.round(completionPercentage),
            averageRating: parseFloat(averageRating).toFixed(1),
            lessons: lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                completed: progress.some(p => p.lessonId === lesson.id && p.completed),
                rating: progress.find(p => p.lessonId === lesson.id)?.rating || 0,
                completedAt: progress.find(p => p.lessonId === lesson.id)?.completedAt
            }))
        };
    }

    /**
     * Get overall progress
     */
    getOverallProgress() {
        const stats = this.dataManager.getStatistics();
        return {
            totalCourses: stats.totalCourses,
            totalLessons: stats.totalLessons,
            completedLessons: stats.completedLessons,
            pendingLessons: stats.totalLessons - stats.completedLessons,
            overallProgressPercentage: stats.overallProgress,
            courseBreakdown: stats.courseBreakdown.map(course => ({
                courseId: course.courseId,
                title: course.title,
                completed: course.completedLessons,
                total: course.totalLessons,
                progressPercentage: Math.round(course.progress)
            }))
        };
    }

    /**
     * Get lessons by completion status
     */
    getLessonsByStatus(courseId, status) {
        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();

        if (status === 'completed') {
            return lessons.filter(lesson =>
                progress.some(p => p.lessonId === lesson.id && p.completed)
            );
        } else if (status === 'pending') {
            return lessons.filter(lesson =>
                !progress.some(p => p.lessonId === lesson.id && p.completed)
            );
        }

        return lessons;
    }

    /**
     * Get lessons needing review (high rating)
     */
    getHigherRatedLessons(minRating = 4) {
        const lessons = this.dataManager.getLessons();
        const progress = this.dataManager.getProgress();

        return lessons.filter(lesson => {
            const lessonProgress = progress.find(p => p.lessonId === lesson.id);
            return lessonProgress && lessonProgress.rating >= minRating;
        });
    }

    /**
     * Calculate average rating
     */
    calculateAverageRating(lessons, progress) {
        const ratings = lessons
            .map(lesson => progress.find(p => p.lessonId === lesson.id)?.rating || 0)
            .filter(rating => rating > 0);

        if (ratings.length === 0) return 0;
        return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    }

    /**
     * Get learning streak
     */
    getLearningStreak(courseId = null) {
        const progress = this.dataManager.getProgress();
        let relevantProgress = progress.filter(p => p.completed);

        if (courseId) {
            const lessons = this.dataManager.getLessons(courseId);
            const lessonIds = lessons.map(l => l.id);
            relevantProgress = relevantProgress.filter(p => lessonIds.includes(p.lessonId));
        }

        // Sort by completion date
        const sorted = relevantProgress
            .filter(p => p.completedAt)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        if (sorted.length === 0) return 0;

        // Calculate consecutive days
        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastDate = new Date(sorted[0].completedAt);
        lastDate.setHours(0, 0, 0, 0);

        const daysDifference = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 1) return 0; // Streak broken

        for (let i = 1; i < sorted.length; i++) {
            const currentDate = new Date(sorted[i].completedAt);
            currentDate.setHours(0, 0, 0, 0);
            
            const diff = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
                streak++;
                lastDate = currentDate;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get time invested in course
     */
    getTimeInvested(courseId) {
        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();

        const completedLessons = lessons.filter(lesson =>
            progress.some(p => p.lessonId === lesson.id && p.completed)
        );

        // Assume average 30 minutes per completed lesson
        const estimatedMinutes = completedLessons.length * 30;
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = estimatedMinutes % 60;

        return {
            estimatedMinutes,
            estimatedHours: hours,
            estimatedMinutesRemainder: minutes,
            formattedTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        };
    }

    /**
     * Export progress report
     */
    exportProgressReport(courseId = null) {
        const timestamp = new Date().toISOString();
        let courseName = 'All Lessons';
        let progressData = this.getOverallProgress();

        if (courseId) {
            const course = this.dataManager.getCourseById(courseId);
            courseName = course?.title || 'Unknown Course';
            progressData = this.getCourseProgress(courseId);
        }

        return {
            reportGeneratedAt: timestamp,
            courseName,
            progressData,
            learningStreak: this.getLearningStreak(courseId),
            timeInvested: courseId ? this.getTimeInvested(courseId) : null
        };
    }

    /**
     * Get next lesson to complete
     */
    getNextLessonToComplete(courseId) {
        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();

        return lessons.find(lesson =>
            !progress.some(p => p.lessonId === lesson.id && p.completed)
        ) || null;
    }

    /**
     * Reset progress for a lesson
     */
    resetLessonProgress(lessonId) {
        return this.dataManager.updateProgress(lessonId, {
            completed: false,
            completedAt: null,
            rating: 0,
            notes: ''
        });
    }

    /**
     * Reset all progress for a course
     */
    resetCourseProgress(courseId) {
        const lessons = this.dataManager.getLessons(courseId);
        lessons.forEach(lesson => this.resetLessonProgress(lesson.id));
    }
}

// Initialize progress tracker
const progressTracker = new ProgressTracker(dataManager);
