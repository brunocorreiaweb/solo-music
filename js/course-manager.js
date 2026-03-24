/**
 * Course Manager
 * Handles course-related operations
 */

class CourseManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Get all courses
     */
    getAllCourses() {
        return this.dataManager.getCourses();
    }

    /**
     * Get course by ID
     */
    getCourseById(courseId) {
        return this.dataManager.getCourseById(courseId);
    }

    /**
     * Get course by ID with lesson details
     */
    getCourseWithLessons(courseId) {
        const course = this.dataManager.getCourseById(courseId);
        if (!course) return null;

        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();
        
        const lessonsWithProgress = lessons.map(lesson => {
            const lessonProgress = progress.find(p => p.lessonId === lesson.id);
            return {
                ...lesson,
                completed: lessonProgress?.completed || false,
                rating: lessonProgress?.rating || lesson.rating
            };
        });

        return {
            ...course,
            lessons: lessonsWithProgress,
            stats: this.getCourseStats(courseId)
        };
    }

    /**
     * Get course statistics
     */
    getCourseStats(courseId) {
        const lessons = this.dataManager.getLessons(courseId);
        const progress = this.dataManager.getProgress();

        const completedLessons = lessons.filter(lesson => 
            progress.some(p => p.lessonId === lesson.id && p.completed)
        ).length;

        return {
            totalLessons: lessons.length,
            completedLessons: completedLessons,
            progressPercentage: lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0,
            averageRating: this.calculateAverageRating(lessons, progress)
        };
    }

    /**
     * Calculate average rating for a course
     */
    calculateAverageRating(lessons, progress) {
        const ratings = lessons
            .map(lesson => progress.find(p => p.lessonId === lesson.id)?.rating || 0)
            .filter(rating => rating > 0);

        if (ratings.length === 0) return 0;
        return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    }

    /**
     * Create new course
     */
    createCourse(courseData) {
        return this.dataManager.createCourse(courseData);
    }

    /**
     * Update course
     */
    updateCourse(courseId, courseData) {
        return this.dataManager.updateCourse(courseId, courseData);
    }

    /**
     * Delete course
     */
    deleteCourse(courseId) {
        // Delete all lessons in this course
        const lessons = this.dataManager.getLessons(courseId);
        lessons.forEach(lesson => this.dataManager.deleteLesson(lesson.id));
        
        // Delete the course
        this.dataManager.deleteCourse(courseId);
    }

    /**
     * Add lesson to course
     */
    addLessonToCourse(courseId, lessonData) {
        return this.dataManager.createLesson(courseId, lessonData);
    }

    /**
     * Get course progress summary
     */
    getProgressSummary() {
        const stats = this.dataManager.getStatistics();
        return {
            totalCourses: stats.totalCourses,
            totalLessons: stats.totalLessons,
            completedLessons: stats.completedLessons,
            overallProgress: stats.overallProgress,
            courseBreakdown: stats.courseBreakdown
        };
    }

    /**
     * Search courses
     */
    searchCourses(query) {
        const courses = this.getAllCourses();
        const lowerQuery = query.toLowerCase();
        
        return courses.filter(course =>
            course.title.toLowerCase().includes(lowerQuery) ||
            course.description.toLowerCase().includes(lowerQuery) ||
            course.instrument.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Sort courses by field
     */
    sortCourses(courses, sortBy = 'createdAt', order = 'desc') {
        const sorted = [...courses].sort((a, b) => {
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
     * Get courses by instrument
     */
    getCoursesByInstrument(instrument) {
        const courses = this.getAllCourses();
        return courses.filter(c => c.instrument === instrument);
    }

    /**
     * Get recently updated courses
     */
    getRecentCourses(limit = 5) {
        const courses = this.getAllCourses();
        return this.sortCourses(courses, 'updatedAt', 'desc').slice(0, limit);
    }
}

// Initialize course manager
const courseManager = new CourseManager(dataManager);
