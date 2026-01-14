
import React, { useState, useCallback } from 'react';
import VideoLibrary from './components/VideoLibrary';
import VideoPlayer from './components/VideoPlayer';
import { VideoFile } from './types';

const App: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);

  const handleAddVideos = useCallback((newVideos: VideoFile[]) => {
    setVideos(prev => [...prev, ...newVideos]);
  }, []);

  const handlePlayVideo = useCallback((index: number) => {
    setCurrentVideoIndex(index);
  }, []);

  const handleBackToLibrary = useCallback(() => {
    setCurrentVideoIndex(null);
  }, []);

  const handleNextVideo = useCallback(() => {
    if (currentVideoIndex !== null && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  }, [currentVideoIndex, videos.length]);

  const handlePrevVideo = useCallback(() => {
    if (currentVideoIndex !== null && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  }, [currentVideoIndex]);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex flex-col">
      {currentVideoIndex === null ? (
        <VideoLibrary 
          videos={videos} 
          onAddVideos={handleAddVideos} 
          onPlayVideo={handlePlayVideo} 
        />
      ) : (
        <VideoPlayer 
          video={videos[currentVideoIndex]} 
          onBack={handleBackToLibrary}
          onNext={handleNextVideo}
          onPrev={handlePrevVideo}
          hasNext={currentVideoIndex < videos.length - 1}
          hasPrev={currentVideoIndex > 0}
        />
      )}
    </div>
  );
};

export default App;
