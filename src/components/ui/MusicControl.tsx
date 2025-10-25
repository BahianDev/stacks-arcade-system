import React from 'react';

interface MusicControlProps {
  isMusicPlaying: boolean;
  onToggle: (e: React.MouseEvent) => void;
  position?: 'top-right' | 'bottom-right';
}

export const MusicControl: React.FC<MusicControlProps> = ({ 
  isMusicPlaying, 
  onToggle, 
  position = 'top-right' 
}) => {
  const positionClasses = {
    'top-right': 'top-6 right-6',
    'bottom-right': 'fixed bottom-6 right-6'
  };

  return (
    <div className={`${positionClasses[position]} z-40`}>
      <button
        onClick={onToggle}
        className="transition-all duration-300 transform hover:scale-110 bg-transparent border-none cursor-pointer"
      >
        {/* Pixel Speaker Icon */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          {isMusicPlaying ? (
            // Speaker with sound waves (playing)
            <div className="relative">
              {/* Speaker body */}
              <div className="w-5 h-6 bg-green-400"></div>
              <div className="absolute -left-2 top-1.5 w-3 h-3 bg-green-400"></div>
              
              {/* Sound waves */}
              <div className="absolute -right-2 top-0 w-2 h-2 bg-green-400 animate-pulse"></div>
              <div className="absolute -right-4 top-1 w-2 h-2 bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute -right-2 bottom-0 w-2 h-2 bg-green-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="absolute -right-4 bottom-1 w-2 h-2 bg-green-400 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              
              {/* Additional outer sound waves */}
              <div className="absolute -right-6 top-2 w-1 h-1 bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute -right-6 bottom-2 w-1 h-1 bg-green-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          ) : (
            // Speaker with X (muted)
            <div className="relative">
              {/* Speaker body */}
              <div className="w-5 h-6 bg-green-400 opacity-60"></div>
              <div className="absolute -left-2 top-1.5 w-3 h-3 bg-green-400 opacity-60"></div>
              
              {/* X mark */}
              <div className="absolute -right-3 top-1 w-4 h-4">
                <div className="absolute top-0 left-1.5 w-1 h-4 bg-red-400 transform rotate-45"></div>
                <div className="absolute top-0 left-1.5 w-1 h-4 bg-red-400 transform -rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};