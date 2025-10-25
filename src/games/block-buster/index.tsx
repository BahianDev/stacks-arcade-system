import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from './Game';
import { QuitConfirmation } from '../shared/components/QuitConfirmation';

export const BlockBusterGame: React.FC = () => {
  const navigate = useNavigate();
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  // Focus the window for keyboard controls
  useEffect(() => {
    window.focus();
  }, []);

  const handleBackClick = () => {
    setShowQuitConfirmation(true);
  };

  const handleQuitConfirm = () => {
    navigate('/');
  };

  const handleQuitCancel = () => {
    setShowQuitConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Matrix-style background pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuNSIgZmlsbD0iIzgzRTgzRiIgb3BhY2l0eT0iMC4xIi8+CjxjaXJjbGUgY3g9IjEwIiBjeT0iOCIgcj0iMC4zIiBmaWxsPSIjODNFODNGIiBvcGFjaXR5PSIwLjE1Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTQiIHI9IjAuNCIgZmlsbD0iIzgzRTgzRiIgb3BhY2l0eT0iMC4xMiIvPgo8L3N2Zz4=')] opacity-20 z-0"></div>

      {/* Floating digital particles - Sparkling effect */}
      <div className="fixed inset-0 z-5">
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 opacity-40 animate-ping"
            style={{
              backgroundColor: '#FFFFFF',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="absolute top-4 left-4 z-40 text-xl font-mono font-bold hover:opacity-80 transition-all duration-200 bg-transparent border-none cursor-pointer"
        style={{
          color: '#FFFFFF',
          fontFamily: "'Press Start 2P', monospace"
        }}
      >
        BACK
      </button>

      {/* Game Title */}
      <div className="text-center mb-8 relative z-20">
        <img 
          src="../../..//public/block_chain.png"
          alt="Blockchain Logo"
          className="w-64 md:w-80 h-auto object-contain mx-auto"
        />
      </div>

      {/* Game Container */}
      <div className="flex-1 flex items-center justify-center relative z-5">
        <div 
          className="relative p-8 bg-black"
          style={{
            border: '2px solid #FFFFFF',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}
        >
          
          {/* Hover Glow Effect */}
          <div 
            className="absolute inset-0 border-2 opacity-30 animate-pulse pointer-events-none"
            style={{
              borderColor: '#FFFFFF',
            }}
          ></div>
          
          <Game />
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      <QuitConfirmation
        isOpen={showQuitConfirmation}
        onConfirm={handleQuitConfirm}
        onCancel={handleQuitCancel}
      />

      {/* Retro Grid Background - moved to lower z-index */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
};