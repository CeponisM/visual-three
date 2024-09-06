import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Image, Video, Music, ChevronRight, ChevronDown, Lock, Eye, EyeOff, PlusCircle, Maximize2, Minimize2 } from 'lucide-react';

const Timeline = ({ currentTime, onTimeUpdate, timelineMedia, onMediaUpdate, totalDuration, onTotalDurationChange }) => {
  const [expandedLayers, setExpandedLayers] = useState({});
  const [lockedLayers, setLockedLayers] = useState({});
  const [hiddenLayers, setHiddenLayers] = useState({});
  const [zoom, setZoom] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = useRef(null);
  const layersRef = useRef(null);

  const LAYER_NAME_WIDTH = 200;
  const LAYER_HEIGHT = 40;
  const EXPANDED_LAYER_HEIGHT = 80;
  const TIME_MARKER_HEIGHT = 30;

  const handlePlayheadDrag = useCallback((event, info) => {
    if (!timelineRef.current) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineWidth = (timelineRect.width - LAYER_NAME_WIDTH) * zoom;
    const relativeX = Math.max(0, Math.min(info.point.x - timelineRect.left - LAYER_NAME_WIDTH + scrollPosition, timelineWidth));
    const newTime = (relativeX / timelineWidth) * totalDuration;
    onTimeUpdate(newTime);
  }, [totalDuration, onTimeUpdate, zoom, scrollPosition]);

  const handleMediaDrag = useCallback((layerIndex, event, info) => {
    if (!timelineRef.current || lockedLayers[layerIndex]) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineWidth = (timelineRect.width - LAYER_NAME_WIDTH) * zoom;
    const relativeX = Math.max(0, Math.min(info.point.x - timelineRect.left - LAYER_NAME_WIDTH + scrollPosition, timelineWidth));
    const item = timelineMedia[layerIndex];
    if (!item) return;
    const newStart = Math.max(0, Math.min((relativeX / timelineWidth) * totalDuration, totalDuration - (item.duration || 0)));
    const newMedia = timelineMedia.map((media, index) =>
      index === layerIndex ? { ...media, start: newStart } : media
    );
    onMediaUpdate(newMedia);
  }, [timelineMedia, totalDuration, onMediaUpdate, lockedLayers, zoom, scrollPosition]);

  const handleMediaResize = useCallback((layerIndex, isStart, event, info) => {
    if (!timelineRef.current || lockedLayers[layerIndex]) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineWidth = (timelineRect.width - LAYER_NAME_WIDTH) * zoom;
    const relativeX = Math.max(0, Math.min(info.point.x - timelineRect.left - LAYER_NAME_WIDTH + scrollPosition, timelineWidth));
    const item = timelineMedia[layerIndex];
    if (!item) return;
    const newTime = (relativeX / timelineWidth) * totalDuration;
    let newStart = item.start;
    let newDuration = item.duration;
    if (isStart) {
      newStart = Math.max(0, Math.min(newTime, item.start + item.duration - 0.5));
      newDuration = (item.start + item.duration) - newStart;
    } else {
      newDuration = Math.max(0.5, Math.min(newTime - item.start, totalDuration - item.start));
    }
    const newMedia = timelineMedia.map((media, index) =>
      index === layerIndex ? { ...media, start: newStart, duration: newDuration } : media
    );
    onMediaUpdate(newMedia);
  }, [timelineMedia, totalDuration, onMediaUpdate, lockedLayers, zoom, scrollPosition]);

  const handleDrop = useCallback((e, layerIndex) => {
    e.preventDefault();
    if (lockedLayers[layerIndex]) return;
    const mediaItemData = e.dataTransfer.getData('application/json');
    if (mediaItemData) {
      const mediaItem = JSON.parse(mediaItemData);
      const newStart = 0;
      const newDuration = estimateDuration(mediaItem.file);
      const newMediaItem = {
        ...mediaItem,
        start: newStart,
        duration: newDuration
      };
      const newMedia = [...timelineMedia];
      newMedia[layerIndex] = newMediaItem;
      onMediaUpdate(newMedia);
    }
  }, [timelineMedia, onMediaUpdate, lockedLayers]);

  const estimateDuration = useCallback((file) => {
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      return Math.min(30, totalDuration);
    }
    return Math.min(5, totalDuration);
  }, [totalDuration]);

  const handleAddLayer = useCallback(() => {
    onMediaUpdate([...timelineMedia, { id: Date.now(), file: null, start: 0, duration: 0 }]);
  }, [timelineMedia, onMediaUpdate]);

  const getMediaIcon = useCallback((item) => {
    if (!item || !item.file) return null;
    if (item.file.type.startsWith('image/')) return <Image size={16} />;
    if (item.file.type.startsWith('video/')) return <Video size={16} />;
    if (item.file.type.startsWith('audio/')) return <Music size={16} />;
    return null;
  }, []);

  const handleDeleteLayer = useCallback((layerIndex) => {
    const newMedia = timelineMedia.filter((_, index) => index !== layerIndex);
    onMediaUpdate(newMedia);
  }, [timelineMedia, onMediaUpdate]);

  const toggleLayerExpansion = useCallback((layerIndex) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layerIndex]: !prev[layerIndex]
    }));
  }, []);

  const toggleLayerLock = useCallback((layerIndex) => {
    setLockedLayers(prev => ({
      ...prev,
      [layerIndex]: !prev[layerIndex]
    }));
  }, []);

  const toggleLayerVisibility = useCallback((layerIndex) => {
    setHiddenLayers(prev => ({
      ...prev,
      [layerIndex]: !prev[layerIndex]
    }));
  }, []);

  const handleZoomChange = useCallback((e) => {
    setZoom(parseFloat(e.target.value));
  }, []);

  const handleScroll = useCallback((e) => {
    setScrollPosition(e.target.scrollLeft);
  }, []);

  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  }, []);

  const renderTimeMarkers = useMemo(() => {
    const markers = [];
    const step = Math.max(1, Math.floor(totalDuration / 10));
    for (let i = 0; i <= totalDuration; i += step) {
      const position = (i / totalDuration) * 100;
      markers.push(
        <div key={i} className="absolute top-0 h-full" style={{ left: `${position}%` }}>
          <div className="h-3 border-l border-gray-600"></div>
          <div className="text-xs text-gray-400">{formatTime(i)}</div>
        </div>
      );
    }
    return markers;
  }, [totalDuration, formatTime]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Timeline</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="zoom" className="text-white mr-2">Zoom:</label>
            <input
              id="zoom"
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              className="w-32"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="timeline-length" className="text-white mr-2">Duration:</label>
            <input
              id="timeline-length"
              type="text"
              value={formatTime(totalDuration)}
              onChange={(e) => {
                const [minutes, seconds, milliseconds] = e.target.value.split(':').map(Number);
                const newDuration = minutes * 60 + seconds + milliseconds / 100;
                onTotalDurationChange(newDuration);
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded w-24"
            />
          </div>
        </div>
      </div>
      <div className="relative" ref={timelineRef}>
        <div className="absolute top-0 left-0 bottom-0 w-[200px] bg-gray-700 z-10">
          <div className="h-[30px] bg-gray-600 border-b border-gray-500"></div>
          {timelineMedia.map((_, layerIndex) => (
            <div
              key={layerIndex}
              className={`flex items-center justify-between px-2 text-gray-400 ${expandedLayers[layerIndex] ? 'h-20' : 'h-10'
                } border-b border-gray-600`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => toggleLayerExpansion(layerIndex)}
                  className="mr-2 text-gray-400 hover:text-white"
                >
                  {expandedLayers[layerIndex] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <span>Layer {layerIndex + 1}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleLayerVisibility(layerIndex)}
                  className={`text-gray-400 hover:text-white ${hiddenLayers[layerIndex] ? 'opacity-50' : ''}`}
                >
                  {hiddenLayers[layerIndex] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => toggleLayerLock(layerIndex)}
                  className={`text-gray-400 hover:text-white ${lockedLayers[layerIndex] ? 'text-yellow-500' : ''}`}
                >
                  <Lock size={16} />
                </button>
                <button
                  onClick={() => handleDeleteLayer(layerIndex)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleAddLayer}
            className="flex items-center justify-center w-full h-10 bg-gray-600 text-white hover:bg-gray-500"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Layer
          </button>
        </div>

        <div className="ml-[200px] overflow-x-auto" onScroll={handleScroll}>
          <div className="relative" style={{ width: `${100 * zoom}%`, minWidth: '100%' }}>
            <div className="h-[30px] bg-gray-600 relative">
              {renderTimeMarkers}
            </div>
            <div ref={layersRef} className="relative">
              {timelineMedia.map((item, layerIndex) => (
                <div
                  key={layerIndex}
                  className={`relative mb-px ${expandedLayers[layerIndex] ? 'h-20' : 'h-10'} ${hiddenLayers[layerIndex] ? 'opacity-50' : ''
                    }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, layerIndex)}
                >
                  {item && item.file ? (
                    <motion.div
                      className={`absolute top-0 h-full rounded cursor-move overflow-hidden ${item.file.type.startsWith('image/') ? 'bg-green-500' :
                          item.file.type.startsWith('video/') ? 'bg-blue-500' :
                            item.file.type.startsWith('audio/') ? 'bg-yellow-500' : 'bg-gray-500'
                        } ${lockedLayers[layerIndex] ? 'cursor-not-allowed' : ''}`}
                      style={{
                        left: `${(item.start / totalDuration) * 100}%`,
                        width: `${(item.duration / totalDuration) * 100}%`
                      }}
                      drag={lockedLayers[layerIndex] ? false : "x"}
                      dragMomentum={false}
                      dragConstraints={layersRef}
                      onDrag={(event, info) => handleMediaDrag(layerIndex, event, info)}
                    >
                      <div className="p-1 flex items-center h-full">
                        {getMediaIcon(item)}
                        <span className="ml-1 text-xs truncate">{item.file.name}</span>
                      </div>
                      {expandedLayers[layerIndex] && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                          <p className="text-xs">{formatTime(item.duration)}</p>
                        </div>
                      )}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-2 bg-white bg-opacity-50 cursor-ew-resize"
                        drag="x"
                        dragMomentum={false}
                        dragConstraints={{ left: 0, right: 0 }}
                        onDrag={(event, info) => handleMediaResize(layerIndex, true, event, info)}
                      />
                      <motion.div
                        className="absolute right-0 top-0 bottom-0 w-2 bg-white bg-opacity-50 cursor-ew-resize"
                        drag="x"
                        dragMomentum={false}
                        dragConstraints={{ left: 0, right: 0 }}
                        onDrag={(event, info) => handleMediaResize(layerIndex, false, event, info)}
                      />
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 border border-dashed border-gray-600 rounded">
                      Drag media here
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          className="absolute top-[30px] w-0.5 bg-red-500 cursor-ew-resize z-20"
          style={{
            left: `calc(${(currentTime / totalDuration) * 100 * zoom}% + ${LAYER_NAME_WIDTH}px)`,
            height: `${timelineMedia.length * LAYER_HEIGHT + LAYER_HEIGHT}px`
          }}
          drag="x"
          dragMomentum={false}
          dragConstraints={{
            left: LAYER_NAME_WIDTH,
            right: timelineRef.current ? timelineRef.current.offsetWidth : LAYER_NAME_WIDTH
          }}
          onDrag={handlePlayheadDrag}
        >
          <div className="absolute top-[-30px] left-[-12px] bg-red-500 text-white text-xs px-1 py-0.5 rounded">
            {formatTime(currentTime)}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Timeline;
