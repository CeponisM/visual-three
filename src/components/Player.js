import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Rnd } from 'react-rnd';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const Player = ({ currentTime, media, onTimeUpdate, totalDuration }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);
  const [activeMedia, setActiveMedia] = useState([]);
  const [mediaPositions, setMediaPositions] = useState({});

  useEffect(() => {
    if (!mountRef.current) return;

    // Set up scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const active = media.filter(item => currentTime >= item.start && currentTime < item.start + item.duration);
    setActiveMedia(active);

    // Initialize positions for new media items
    active.forEach(item => {
      if (!mediaPositions[item.id]) {
        setMediaPositions(prev => ({
          ...prev,
          [item.id]: { x: 0, y: 0, width: '30%', height: '30%' }
        }));
      }
    });
  }, [currentTime, media, mediaPositions]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      if (isPlaying) {
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        onTimeUpdate(prevTime => Math.min(prevTime + deltaTime, totalDuration));
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, onTimeUpdate, totalDuration]);

  const handleSkipBack = () => {
    onTimeUpdate(prevTime => Math.max(prevTime - 5, 0));
  };

  const handleSkipForward = () => {
    onTimeUpdate(prevTime => Math.min(prevTime + 5, totalDuration));
  };

  const handleMediaDragStop = (id, d) => {
    setMediaPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], x: d.x, y: d.y }
    }));
  };

  const handleMediaResize = (id, ref, position) => {
    setMediaPositions(prev => ({
      ...prev,
      [id]: { ...prev[id], width: ref.style.width, height: ref.style.height }
    }));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div ref={mountRef} className="w-full h-64 bg-black rounded-lg overflow-hidden relative">
        {activeMedia.map((item) => (
          <Rnd
            key={item.id}
            default={mediaPositions[item.id] || { x: 0, y: 0, width: '30%', height: '30%' }}
            position={{ x: mediaPositions[item.id]?.x || 0, y: mediaPositions[item.id]?.y || 0 }}
            size={{ width: mediaPositions[item.id]?.width || '30%', height: mediaPositions[item.id]?.height || '30%' }}
            minWidth={100}
            minHeight={100}
            bounds="parent"
            onDragStop={(e, d) => handleMediaDragStop(item.id, d)}
            onResize={(e, direction, ref, delta, position) => handleMediaResize(item.id, ref, position)}
          >
            <div className="w-full h-full bg-blue-500 opacity-50 flex items-center justify-center text-white">
              {item.file.type.startsWith('image/') && (
                <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
              )}
              {item.file.type.startsWith('video/') && (
                <video src={item.preview} className="w-full h-full object-cover" autoPlay loop muted />
              )}
              {item.file.type.startsWith('audio/') && (
                <div className="w-full h-full flex items-center justify-center bg-gray-600">
                  <span>Audio: {item.file.name}</span>
                </div>
              )}
            </div>
          </Rnd>
        ))}
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button onClick={handleSkipBack} className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200">
          <SkipBack className="w-6 h-6" />
        </button>
        {isPlaying ? (
          <button onClick={handlePause} className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200">
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button onClick={handlePlay} className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200">
            <Play className="w-6 h-6" />
          </button>
        )}
        <button onClick={handleSkipForward} className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors duration-200">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Player;
