# AlphaTex Tools

A collection of tools for editing and rendering AlphaTex notation.

## Applications

### 1. AlphaTex Editor (`index.html`)
A full-featured editor for writing and previewing AlphaTex notation locally.

**Features:**
- **Live Editor**: Write AlphaTex notation with syntax highlighting support
- **Real-time Preview**: See changes rendered instantly (with 500ms debounce)
- **Playback Controls**: Play, stop, and loop the rendered notation
- **Example Loader**: Load a sample guitar warm-up exercise
- **Quick Clear**: Reset the editor and start fresh
- **Character Counter**: Track the size of your notation

**Usage:**
1. Open `index.html` in a web browser
2. Enter AlphaTex notation in the left panel
3. The preview automatically renders on the right side
4. Use the controls to play/stop/loop the music notation

---

### 2. WebSocket Renderer (`render.html`)
A real-time alphatex renderer that receives notation data from a WebSocket backend.

**Features:**
- **WebSocket Integration**: Receives AlphaTex notation from `ws://localhost:8080`
- **Real-time Rendering**: Automatically renders new notation as it arrives
- **Playback Controls**: Play/pause/stop/loop the rendered notation
- **Status Monitoring**: Visual connection status and message statistics
- **Error Handling**: Displays errors and auto-reconnects on disconnect
- **Info Panel**: Shows WebSocket status, message count, and last update time

**Usage:**
1. In your Java backend, establish a WebSocket server on port 8080
2. Open `render.html` in a web browser
3. The app will automatically connect to the WebSocket
4. Send AlphaTex notation data through the WebSocket
5. Notation will render in real-time

**WebSocket Message Format:**
The backend should send AlphaTex notation as plain text messages:
```
:8 1.6 2.6 | :4 3.0 | :2 2.0
```

The renderer will automatically wrap it with metadata if needed:
```
\title "Live Performance" . \track "Drums" \instrument percussion :8 1.6 2.6 | ...
```

---

## AlphaTex Syntax Reference

Basic structure:
```
\title "Song Name"
\tempo 120
.
\track "Instrument Name"
\instrument instrument-name
:duration note.fret note.fret | ...
```

**Examples:**
- `:8 1.6 2.6` - Eighth notes on frets 6 and 5 of strings 1 and 2
- `:4 3.0` - Quarter note on open string 3
- `|` - Bar separator

## Files

- `index.html` - AlphaTex Editor UI
- `editor.js` - Editor logic and AlphaTab integration
- `render.html` - WebSocket-based notation renderer
- `ws-renderer.js` - WebSocket connection and AlphaTab integration

## Dependencies

- **AlphaTab** - Music notation rendering (via CDN)
- **Font Awesome** - Icons (via CDN)

No local dependencies needed - everything loads from CDN.

## Configuration

### WebSocket URL
To connect to a different WebSocket server, edit the `wsUrl` in `ws-renderer.js`:
```javascript
this.wsUrl = 'ws://localhost:8080'; // Change this URL
```

## Standalone

This editor is completely independent - no changes were made to existing files. You can integrate the alphaTex content into your main application by exporting or copying from this editor.
