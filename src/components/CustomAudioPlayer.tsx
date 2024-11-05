import React, { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
  src: string;
}

export default function CustomAudioPlayer({ src }: CustomAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const value = (audio.currentTime / audio.duration) * 100;
      setProgress(value);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    if (audioRef.current) {
      audioRef.current.currentTime = (percentage / 100) * audioRef.current.duration;
    }
  };

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <audio ref={audioRef} src={src} className="hidden" />
      
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none"
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        
        <div 
          className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

