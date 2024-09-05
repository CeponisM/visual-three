import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Image, Video, Music, Minimize2, Maximize2, PlusCircle } from 'lucide-react';

const Timeline = ({ currentTime, onTimeUpdate, timelineMedia, onMediaUpdate, totalDuration, onTotalDurationChange }) => {
  const [expandedLayers, setExpandedLayers] = useState({});
  const timelineRef = useRef(null);
  const layersRef = useRef(null);

  const LAYER_NAME_WIDTH = 180;
  const LAYER_HEIGHT = 48;
  const EXPANDED_LAYER_HEIGHT = 96;

  const handlePlayheadDrag = useCallback((event, info) => {
    if (!timelineRef.current) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineWidth = timelineRect.width - LAYER_NAME_WIDTH;
    const relativeX = Math.max(0, Math.min(info.point.x - timelineRect.left - LAYER_NAME_WIDTH, timelineWidth));
    const newTime = (relativeX / timelineWidth) * totalDuration;
    onTimeUpdate(newTime);
  }, [totalDuration, onTimeUpdate]);

  const handleMediaDrag = useCallback((layerIndex, event, info) => {
    if (!timelineRef.current) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineWidth = timelineRect.width - LAYER_NAME_WIDTH;
    const relativeX = Math.max(0, Math.min(info.point.x - timelineRect.left - LAYER_NAME_WIDTH, timelineWidth));
    const item = timelineMedia[layerIndex];
    if (!item) return;
    const newStart = Math.max(0, Math.min((relativeX / timelineWidth) * totalDuration, totalDuration - (item.duration || 0)));
    const newMedia = timelineMedia.map((media, index) =>
      index === layerIndex ? { ...media, start: newStart } : media
    );
    onMediaUpdate(newMedia);
  }, [timelineMedia, totalDuration, onMediaUpdate]);

  const handleMediaResize = useCallback((layerIndex, event, info) => {
    if (!timelineRef.current) return;
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const timelineWidth = timelineRect.width - LAYER_NAME_WIDTH;
    const relativeX = Math.max(0, Math.min(info.point.x - timelineRect.left - LAYER_NAME_WIDTH, timelineWidth));
    const item = timelineMedia[layerIndex];
    if (!item) return;
    const newDuration = Math.max(0.5, Math.min((relativeX / timelineWidth) * totalDuration - (item.start || 0), totalDuration - (item.start || 0)));
    const newMedia = timelineMedia.map((media, index) =>
      index === layerIndex ? { ...media, duration: newDuration } : media
    );
    onMediaUpdate(newMedia);
  }, [timelineMedia, totalDuration, onMediaUpdate]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, layerIndex) => {
    e.preventDefault();
    const mediaItemData = e.dataTransfer.getData('application/json');
    if (mediaItemData) {
      const mediaItem = JSON.parse(mediaItemData);
      const newStart = 0;
      const newDuration = Math.min(5, totalDuration);
      const newMediaItem = {
        ...mediaItem,
        start: newStart,
        duration: newDuration
      };
      const newMedia = [...timelineMedia];
      newMedia[layerIndex] = newMediaItem;
      onMediaUpdate(newMedia);
    }
  }, [timelineMedia, totalDuration, onMediaUpdate]);

  const handleDeleteLayer = useCallback((layerIndex) => {
    const newMedia = timelineMedia.filter((_, index) => index !== layerIndex);
    onMediaUpdate(newMedia);
  }, [timelineMedia, onMediaUpdate]);

  const handleLengthChange = useCallback((event) => {
    const [minutes, seconds] = event.target.value.split(':').map(Number);
    const newDuration = minutes * 60 + seconds;
    onTotalDurationChange(newDuration);
  }, [onTotalDurationChange]);

  const formatDuration = useCallback((duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getMediaIcon = useCallback((type) => {
    if (type?.startsWith('image/')) return <Image size={16} />;
    if (type?.startsWith('video/')) return <Video size={16} />;
    if (type?.startsWith('audio/')) return <Music size={16} />;
    return null;
  }, []);

  const toggleLayerExpansion = useCallback((layerIndex) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layerIndex]: !prev[layerIndex]
    }));
  }, []);

  const handleAddLayer = useCallback(() => {
    onMediaUpdate([...timelineMedia, null]);
  }, [timelineMedia, onMediaUpdate]);

  const memoizedLayers = useMemo(() => {
    return timelineMedia.map((item, layerIndex) => (
      <div 
        key={layerIndex} 
        className={`bg-gray-700 rounded relative mb-2 ${
          expandedLayers[layerIndex] ? 'h-24' : 'h-12'
        }`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, layerIndex)}
      >
        {item && item.file ? (
          <motion.div
            className={`absolute top-0 h-full rounded cursor-move overflow-hidden ${
              item.file.type?.startsWith('image/') ? 'bg-green-500' :
              item.file.type?.startsWith('video/') ? 'bg-blue-500' :
              item.file.type?.startsWith('audio/') ? 'bg-yellow-500' : 'bg-gray-500'
            }`}
            style={{
              left: `${((item.start || 0) / totalDuration) * 100}%`,
              width: `${((item.duration || 0) / totalDuration) * 100}%`
            }}
            drag="x"
            dragMomentum={false}
            dragConstraints={layersRef}
            onDrag={(event, info) => handleMediaDrag(layerIndex, event, info)}
          >
            <div className="p-1 flex items-center h-full">
              {getMediaIcon(item.file.type)}
              <span className="ml-1 text-xs truncate">{item.file.name}</span>
            </div>
            {expandedLayers[layerIndex] && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                <p className="text-xs">{formatDuration(item.duration || 0)}</p>
                {item.file.type?.startsWith('video/') && item.file.width && item.file.height && (
                  <p className="text-xs">{item.file.width}x{item.file.height}</p>
                )}
              </div>
            )}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-2 bg-white bg-opacity-50 cursor-ew-resize"
              drag="x"
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0 }}
              onDrag={(event, info) => handleMediaResize(layerIndex, event, info)}
            />
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Drag media here
          </div>
        )}
      </div>
    ));
  }, [timelineMedia, expandedLayers, totalDuration, handleDragOver, handleDrop, handleMediaDrag, getMediaIcon, formatDuration, handleMediaResize]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Timeline</h2>
        <div className="flex items-center">
          <label htmlFor="timeline-length" className="text-white mr-2">Length:</label>
          <input
            id="timeline-length"
            type="text"
            value={formatDuration(totalDuration)}
            onChange={handleLengthChange}
            className="bg-gray-700 text-white px-2 py-1 rounded"
            pattern="[0-9]{2}:[0-9]{2}"
            title="Enter time in MM:SS format"
          />
        </div>
      </div>
      <div className="relative" ref={timelineRef}>
        <div className="absolute top-0 left-0 bottom-0 w-[180px] bg-gray-700 z-10">
          {timelineMedia.map((_, layerIndex) => (
            <div 
              key={layerIndex}
              className={`flex items-center justify-between px-2 text-gray-400 ${
                expandedLayers[layerIndex] ? 'h-24' : 'h-12'
              }`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => toggleLayerExpansion(layerIndex)}
                  className="mr-2 text-gray-400 hover:text-white"
                >
                  {expandedLayers[layerIndex] ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <span>Layer {layerIndex + 1}</span>
              </div>
              <button
                onClick={() => handleDeleteLayer(layerIndex)}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddLayer}
            className="flex items-center justify-center w-full h-12 bg-gray-600 text-white hover:bg-gray-500"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Layer
          </button>
        </div>

        <div 
          ref={layersRef} 
          className="relative ml-[180px]"
        >
          {memoizedLayers}
        </div>
        
        <motion.div
          className="absolute top-0 w-1 bg-red-500 cursor-ew-resize z-20"
          style={{ 
            left: `calc(${(currentTime / totalDuration) * 100}% + ${LAYER_NAME_WIDTH}px)`,
            height: `${timelineMedia.length * LAYER_HEIGHT + LAYER_HEIGHT}px`
          }}
          drag="x"
          dragMomentum={false}
          dragConstraints={{
            left: LAYER_NAME_WIDTH,
            right: timelineRef.current ? timelineRef.current.offsetWidth : LAYER_NAME_WIDTH
          }}
          onDrag={handlePlayheadDrag}
        />
        
        <div 
          className="absolute left-[180px] h-1 bg-blue-500 rounded-full" 
          style={{ 
            width: `${(currentTime / totalDuration) * 100}%`,
            top: `${timelineMedia.length * LAYER_HEIGHT + LAYER_HEIGHT}px`
          }} 
        />
      </div>
    </div>
  );
};

export default Timeline;
