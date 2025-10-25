import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenSniperBoard } from './components/TokenSniperBoard';
import { QuitConfirmation } from '../shared/components/QuitConfirmation';
import { audioManager } from '../../utils/audio';

export const TokenSniperGame: React.FC = () => {
  const navigate = useNavigate();
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Add/remove token-sniper-playing class based on gameplay state
  useEffect(() => {
    if (isPlaying) {
      document.body.classList.add('token-sniper-playing');
      document.documentElement.classList.add('token-sniper-playing');
    } else {
      document.body.classList.remove('token-sniper-playing');
      document.documentElement.classList.remove('token-sniper-playing');
    }
    
    return () => {
      document.body.classList.remove('token-sniper-playing');
      document.documentElement.classList.remove('token-sniper-playing');
    };
  }, [isPlaying]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('token-sniper-playing');
      document.documentElement.classList.remove('token-sniper-playing');
      document.body.style.cursor = 'default';
    };
  }, []);

  const handleBackClick = () => {
    setIsGamePaused(true);
    setShowQuitConfirmation(true);
  };

  const handleQuitConfirm = () => {
    setIsGamePaused(false);
    // Stop all game sounds and music
    audioManager.stopMusic();
    
    // Remove all token-sniper classes
    document.body.classList.remove('token-sniper-playing');
    document.documentElement.classList.remove('token-sniper-playing');
    document.body.style.cursor = 'default';
    
    // Navigate back to arcade homepage
    navigate('/');
  };

  const handleQuitCancel = () => {
    setIsGamePaused(false);
    setShowQuitConfirmation(false);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 z-40 text-xl font-mono font-bold hover:text-green-300 transition-all duration-200 bg-transparent border-none cursor-pointer token-sniper-ui-element"
        style={{
          color: '#FFFFFF',
          fontFamily: "'Press Start 2P', monospace"
        }}
      >
        BACK
      </button>

      {/* Game */}
      <TokenSniperBoard onGameStateChange={setIsPlaying} isGamePaused={isGamePaused} />

      {/* Quit Confirmation Modal */}
      <QuitConfirmation
        isOpen={showQuitConfirmation}
        onConfirm={handleQuitConfirm}
        onCancel={handleQuitCancel}
      />
    </div>
  );
};