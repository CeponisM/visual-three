import React, { useState, useCallback } from 'react';
import Media from './components/Media';
import Timeline from './components/Timeline';
import Player from './components/Player';

const App = () => {
  const [timelineMedia, setTimelineMedia] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(300); // Default 5 minutes

  const handleMediaUpdate = useCallback((updatedMedia) => {
    setTimelineMedia(updatedMedia);
  }, []);

  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleTotalDurationChange = useCallback((newDuration) => {
    setTotalDuration(newDuration);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Visual Three</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Media Library</h2>
          <Media />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Timeline</h2>
          <Timeline 
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            timelineMedia={timelineMedia}
            onMediaUpdate={handleMediaUpdate}
            totalDuration={totalDuration}
            onTotalDurationChange={handleTotalDurationChange}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Player</h2>
        <Player 
          currentTime={currentTime} 
          media={timelineMedia} 
          onTimeUpdate={handleTimeUpdate}
          totalDuration={totalDuration}
        />
      </div>
    </div>
  );
};

export default App;
