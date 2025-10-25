import React from 'react';
import { GameState } from '../types';

interface WordUpGameOverProps {
  gameState: GameState;
  onRestart: () => void;
  targetWord: string;
}

export const WordUpGameOver: React.FC<WordUpGameOverProps> = ({
  gameState,
  onRestart,
  targetWord
}) => {
  const isWin = gameState === 'won';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 border-2 border-green-400 p-8 rounded-lg text-center max-w-md w-full mx-4">
        <div className="mb-6">
          <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
            {isWin ? (
              <span className="text-green-400">VICTORY!</span>
            ) : (
              <span className="text-red-400">DEFEAT!</span>
            )}
          </h2>
          
          {!isWin && (
            <p className="text-green-400 text-lg" style={{ fontFamily: 'monospace' }}>
              The word was "{targetWord}"
            </p>
          )}
        </div>

        <div className="mb-6 p-4 border border-green-400 rounded">
          <h3 className="text-green-400 text-xl mb-4 flex items-center justify-center gap-2" style={{ fontFamily: 'monospace' }}>
            📊 🏆 FINAL STATS
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-green-400" style={{ fontFamily: 'monospace' }}>
            <div>
              <div className="text-sm">GAMES</div>
              <div className="text-sm">PLAYED</div>
              <div className="text-2xl font-bold">1</div>
            </div>
            
            <div>
              <div className="text-sm">GAMES WON</div>
              <div className="text-2xl font-bold">{isWin ? '1' : '0'}</div>
            </div>
            
            <div>
              <div className="text-sm">WIN RATE</div>
              <div className="text-2xl font-bold">{isWin ? '100%' : '0%'}</div>
            </div>
            
            <div>
              <div className="text-sm">CURRENT</div>
              <div className="text-sm">STREAK</div>
              <div className="text-2xl font-bold">{isWin ? '1' : '0'}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          style={{ fontFamily: 'monospace' }}
        >
          ↻ PLAY AGAIN
        </button>
      </div>
    </div>
  );
};