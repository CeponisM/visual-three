# Visual Three

A modern web-based visual video editor built with React, Three.js, and Tailwind CSS. Visual Three provides an intuitive interface for creating multimedia compositions with drag-and-drop functionality, timeline editing, and real-time preview.

## Features

### 🎬 Media Management
- **Drag & Drop Upload**: Support for images, videos, and audio files
- **Media Library**: Grid-based library with file previews and metadata
- **File Type Support**: Images, videos, and audio files with appropriate icons

### 🎯 Timeline Editor
- **Multi-Layer Timeline**: Professional timeline with expandable layers
- **Layer Controls**: Lock, hide, and delete layers with individual controls
- **Media Positioning**: Drag and resize media clips on the timeline
- **Time Markers**: Precise time indicators with customizable zoom levels
- **Duration Control**: Adjustable total timeline duration

### 🎮 Real-time Player
- **Live Preview**: Real-time rendering of timeline composition
- **Playback Controls**: Play, pause, skip forward/backward
- **Interactive Media**: Drag and resize media elements in the preview
- **Three.js Integration**: Hardware-accelerated rendering with WebGL

### 🎨 User Interface
- **Dark Theme**: Modern dark interface optimized for video editing
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Framer Motion powered interactions
- **Professional Layout**: Industry-standard video editor layout

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **Three.js** - 3D graphics and WebGL rendering
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation and gesture library
- **React Dropzone** - File upload with drag and drop
- **React RnD** - Resizable and draggable components
- **Lucide React** - Beautiful SVG icons

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/visual-three.git
cd visual-three
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open your browser to `http://localhost:3000`

## Usage

### Adding Media
1. **Upload Files**: Drag and drop media files into the Media Library or click to browse
2. **Supported Formats**: 
   - Images: JPG, PNG, GIF, WebP
   - Videos: MP4, WebM, MOV
   - Audio: MP3, WAV, OGG

### Creating a Timeline
1. **Add Layers**: Click "Add Layer" to create new timeline layers
2. **Drag Media**: Drag media from the library to timeline layers
3. **Position Clips**: Drag clips horizontally to adjust timing
4. **Resize Duration**: Drag clip edges to adjust duration
5. **Layer Controls**: Use eye, lock, and delete buttons for layer management

### Playback and Preview
1. **Play/Pause**: Use the play button or spacebar to control playback
2. **Scrubbing**: Drag the red playhead to seek to specific times
3. **Skip Controls**: Use skip buttons to jump forward/backward 5 seconds
4. **Media Positioning**: Drag and resize media in the preview window

### Timeline Controls
- **Zoom**: Adjust timeline zoom level for precision editing
- **Duration**: Set total timeline duration
- **Expand Layers**: Click chevron to expand/collapse layer details
- **Time Format**: Times displayed as MM:SS:MS

## Component Architecture

### App.js
- Main application state management
- Coordinates between Media, Timeline, and Player components
- Handles time synchronization and media updates

### Media.js
- File upload and drag-and-drop functionality
- Media library grid display
- File preview generation and management

### Timeline.js
- Multi-layer timeline interface
- Media clip positioning and duration editing
- Layer controls (expand, lock, hide, delete)
- Playhead scrubbing and time markers

### Player.js
- Three.js scene setup and rendering
- Real-time media composition preview
- Interactive media positioning and resizing
- Playback controls and time management

## Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production  
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App

### Code Style
- ESLint configuration for React
- Functional components with hooks
- Tailwind CSS for styling
- Consistent naming conventions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: Requires WebGL support for Three.js rendering

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Roadmap

### Upcoming Features
- [ ] Export functionality (MP4, GIF)
- [ ] Audio waveform visualization
- [ ] Keyframe animation system
- [ ] Video effects and filters
- [ ] Multi-track audio mixing
- [ ] Collaboration features
- [ ] Cloud storage integration

### Performance Improvements
- [ ] Video thumbnail generation
- [ ] Lazy loading for large media files
- [ ] WebAssembly for video processing
- [ ] GPU-accelerated effects

## Acknowledgments

- Three.js community for excellent 3D rendering capabilities
- React team for the robust component framework
- Tailwind CSS for the utility-first styling approach
- Framer Motion for smooth animations

---

**Visual Three** - Making video editing accessible and intuitive on the web.