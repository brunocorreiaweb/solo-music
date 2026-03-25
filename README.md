# 🎸 Solo Music

**Personal Instrumental Learning Management System**

A comprehensive web application for managing music lessons and tracking practice progress across multiple instruments (guitar, drums, and bass). Built with vanilla HTML, CSS, and JavaScript for maximum portability and ease of use.

---

## 📋 Quick Start

1. **Open the application:**
   - Simply open `index.html` in your web browser
   - No installation or build process required
   - Works both online and offline (data stored locally)

2. **Create your first course:**
   - Click "Dashboard" → "+ New Course"
   - Fill in course details and select instrument
   - Click "Create Course"

3. **Add lessons to your course:**
   - Navigate to your course
   - Click "+ Add Lesson"
   - Fill in lesson details, AlphaTex notation, and YouTube links
   - Click "Save Lesson"

4. **Track progress:**
   - Mark lessons as completed
   - Add ratings and notes
   - Monitor progress on the dashboard

---

## 🎯 Features

### Core Features
✅ **Course & Lesson Management**
- Create and organize courses across multiple instruments
- Add structured lessons with detailed content
- Edit and delete courses and lessons
- Search and filter lessons

✅ **Lesson Content**
- Title and comprehensive descriptions
- YouTube video links
- AlphaTex notation (rendered via AlphaTab)
- Additional notes and practice tips
- Media asset links

✅ **Progress Tracking**
- Mark lessons as completed
- Rate lesson difficulty and effectiveness (0-5)
- Track completion percentage per course
- View overall learning statistics
- Learning streak calculation

✅ **AlphaTab Integration**
- Live rendering of tablature and sheet music
- Interactive playback of notation
- Visual representation of guitar tabs, drum notation, etc.
- Zoom and playback controls

✅ **Data Management**
- LocalStorage for personal data persistence
- Export data as JSON
- Import data from JSON backups
- Clear all data option

### Advanced Features (Ready to Integrate)
🔄 **Google Drive Sync** (partially implemented)
- Back up lessons and progress to Google Drive
- Download and restore from backups
- Automatic sync capability

---

## 📁 Project Structure

```
solo-music/
├── index.html                 # Main application entry point
├── css/
│   ├── style.css             # Global styles and layout
│   ├── components.css        # Component-specific styles
│   └── responsive.css        # Mobile and responsive design
├── js/
│   ├── app.js               # Main app initialization
│   ├── data-manager.js      # LocalStorage & Google Drive management
│   ├── course-manager.js    # Course operations
│   ├── lesson-manager.js    # Lesson operations
│   ├── alphatab-renderer.js # AlphaTab rendering
│   ├── progress-tracker.js  # Progress tracking logic
│   ├── google-drive-sync.js # Google Drive integration
│   └── ui-manager.js        # DOM manipulation & events
├── assets/
│   ├── icons/               # App icons (future)
│   └── fonts/               # Custom fonts (future)
└── README.md                # This file
```

---

## 🗂️ Data Model

### Course
```javascript
{
  id: "course_001",
  title: "Guitar Basics",
  description: "Fundamental guitar techniques",
  instrument: "guitar|drums|bass",
  lessons: ["lesson_001", "lesson_002"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Lesson
```javascript
{
  id: "lesson_001",
  courseId: "course_001",
  title: "Basic Chords",
  description: "Learn major and minor chords",
  alphaTex: "...", // AlphaTex notation content
  youtubeUrl: "https://youtube.com/...",
  mediaLinks: [{ url, type, title }],
  notes: "Additional teaching notes",
  completed: false,
  rating: 0,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

### Progress
```javascript
{
  lessonId: "lesson_001",
  completed: true,
  completedAt: "2024-01-01T00:00:00Z",
  rating: 4,
  notes: "Performed well on chord transitions"
}
```

---

## 🎮 How to Use

### Dashboard
- **Overview of your progress** with quick statistics
- **Recent courses** for quick access
- **Completion metrics** across all instruments

### Courses View
- **All your courses** in a grid layout
- **Progress bars** showing completion percentage
- **Instrument badges** for quick identification
- **Click to view** course details

### Course Detail
- **Lesson list** with completion status
- **Add new lessons** button
- **Course statistics** (completion %, average rating)
- **Edit/View** individual lessons

### Lesson Editor
- **Title and description** fields
- **YouTube URL** input
- **AlphaTex notation** textarea
- **Live preview** of rendered notation
- **Rating and notes** fields
- **Auto-saves** to localStorage

### Progress Tracking
- **Mark lessons complete** with rating
- **Add performance notes**
- **View learning statistics**
- **Track completion streaks**

### Settings
- **AI Chat Configuration** - Set your preferred AI chat URL
- **Google Drive Integration** - Connect and sync (when fully implemented)
- **Data Export/Import** - Backup and restore your data
- **Clear Data** - Reset the application

---

## 🔧 JavaScript API

### DataManager
```javascript
dataManager.getCourses()
dataManager.getCourseById(id)
dataManager.createCourse(data)
dataManager.updateCourse(id, data)
dataManager.deleteCourse(id)
dataManager.getLessons(courseId)
dataManager.getLessonById(id)
dataManager.createLesson(courseId, data)
dataManager.updateLesson(id, data)
dataManager.deleteLesson(id)
dataManager.getProgress()
dataManager.updateProgress(lessonId, data)
dataManager.exportData()
dataManager.importData(jsonData)
dataManager.clearAll()
```

### CourseManager
```javascript
courseManager.getAllCourses()
courseManager.getCourseWithLessons(courseId)
courseManager.getCourseStats(courseId)
courseManager.createCourse(data)
courseManager.updateCourse(id, data)
courseManager.deleteCourse(id)
courseManager.searchCourses(query)
courseManager.getCoursesByInstrument(instrument)
```

### LessonManager
```javascript
lessonManager.getAllLessons()
lessonManager.getLessonsByCourse(courseId)
lessonManager.getLessonDetails(id)
lessonManager.createLesson(courseId, data)
lessonManager.updateLesson(id, data)
lessonManager.deleteLesson(id)
lessonManager.searchLessons(query, courseId)
lessonManager.duplicateLesson(id)
```

### ProgressTracker
```javascript
progressTracker.markLessonCompleted(lessonId, rating, notes)
progressTracker.updateLessonRating(lessonId, rating)
progressTracker.getCourseProgress(courseId)
progressTracker.getOverallProgress()
progressTracker.getLearningStreak(courseId)
progressTracker.exportProgressReport(courseId)
```

### AlphaTabRenderer
```javascript
alphaTabRenderer.renderAlphaTex(alphaTex, containerId)
alphaTabRenderer.play()
alphaTabRenderer.pause()
alphaTabRenderer.stop()
alphaTabRenderer.setZoom(scale)
alphaTabRenderer.getScoreInfo()
```

### UIManager
```javascript
uiManager.showView(viewName)
uiManager.showCourseDetail(courseId)
uiManager.showLessonEditor(lessonId, courseId)
uiManager.displayAllCourses()
uiManager.updateDashboard()
uiManager.showToast(message, type)
```

---

## 🌐 Browser Support

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Full support
- **Mobile browsers** - Full responsive design

Requires:
- JavaScript enabled
- LocalStorage support
- Modern CSS Grid/Flexbox

---

## 🔌 Third-Party Libraries

- **AlphaTab** - Guitar/bass tablature and music notation rendering
  - CDN: `https://cdn.jsdelivr.net/npm/alphatab@latest/dist/alphatab.js`
  - Docs: https://www.alphatab.net/

- **Google APIs** - For Drive integration and Sign-In
  - Drive API: https://developers.google.com/drive
  - Sign-In: https://accounts.google.com/gsi/client

---

## 💾 LocalStorage

All data is stored in browser's LocalStorage under the key `soloMusicAppData`. Maximum typically 5-10MB per domain.

**To clear data:**
1. Settings → "Clear All Data"
2. Or manually: `localStorage.removeItem('soloMusicAppData')`

---

## 🔐 Privacy & Data

- **All data stored locally** on your device
- **No server submissions** required
- **Export/backup** feature for data portability
- **Optional Google Drive sync** for cloud backup
- **No tracking** or analytics

---

## 🚀 Future Enhancements

- [ ] Complete Google Drive implementation
- [ ] PDF export of lessons and progress reports
- [ ] Custom themes (dark mode, etc.)
- [ ] Keyboard shortcuts
- [ ] Lesson sequencing and prerequisites
- [ ] Community lesson library
- [ ] Mobile app (React Native)
- [ ] Performance metrics dashboard
- [ ] Video upload integration
- [ ] Spaced repetition algorithm

---

## 🐛 Debugging

Access debug tools in browser console:

```javascript
// Get app instance
window.app

// Get statistics
debug.getStatistics()

// Export data
data = debug.exportData()

// Clear all data
debug.clearAllData()

// Access managers
dataManager
courseManager
lessonManager
progressTracker
alphaTabRenderer
uiManager
```

---

## 📝 License

Free to use for personal learning purposes.

---

## 🤝 Contributing

This is a personal learning management system. Feel free to fork and customize for your needs!

---

## 📖 Getting Started Tips

1. **Start Small** - Create 1-2 courses for different instruments
2. **Use Templates** - Model lessons after existing online resources
3. **Regular Updates** - Add notes after each practice session
4. **Track Progress** - Rate each lesson completion
5. **Backup Data** - Export regularly or use Google Drive sync

---

## 🎵 Enjoy Learning!

Solo Music is designed to make your self-guided musical journey organized, trackable, and enjoyable. Whether you're learning guitar, drums, or bass, keep practicing and growing! 🎸🥁🎸

For questions or suggestions, refer to the code documentation or console debugging tools.

---

**Last Updated:** March 23, 2026
**Version:** 1.0.0
