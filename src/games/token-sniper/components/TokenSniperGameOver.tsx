import React from 'react';
import { Target, RotateCcw, Trophy } from 'lucide-react';

interface GameState {
  tokens: any[];
  score: number;
  level: number;
  lives: number;
  isGameOver: boolean;
  isPlaying: boolean;
  tokensShot: number;
  tokensDropped: number;
  accuracy: number;
  shotsFired: number;
  timeLeft: number;
  isLevelTransition: boolean;
}

interface TokenSniperGameOverProps {
  gameState: GameState;
  onRestart: () => void;
}

export const TokenSniperGameOver: React.FC<TokenSniperGameOverProps> = ({ gameState, onRestart }) => {
  const finalStats = {
    score: gameState.score,
    level: gameState.level,
    tokensShot: gameState.tokensShot,
    accuracy: gameState.accuracy,
    shotsFired: gameState.shotsFired,
    tokensDropped: gameState.tokensDropped,
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95">
      <div className="text-center space-y-6 p-8 border-4 border-green-400 bg-black max-w-md mx-4">
        {/* Game Over Title */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Target className="w-12 h-12 text-green-400" />
          <h1 className="text-5xl font-mono font-bold text-green-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            GAME OVER
          </h1>
          <Target className="w-12 h-12 text-green-400" />
        </div>

        {/* Final Stats */}
        <div className="space-y-4 border-2 border-green-400 p-4 bg-black">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-mono font-bold text-green-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>FINAL STATS</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm font-mono text-green-400 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>Final Score</div>
              <div className="text-2xl font-mono font-bold text-green-300" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {finalStats.score.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-mono text-green-400 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>Level Reached</div>
              <div className="text-2xl font-mono font-bold text-green-300" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {finalStats.level}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-mono text-green-400 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>Tokens Shot</div>
              <div className="text-2xl font-mono font-bold text-green-300" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {finalStats.tokensShot}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-mono text-green-400 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>Accuracy</div>
              <div className={`text-2xl font-mono font-bold ${
                finalStats.accuracy >= 80 ? 'text-green-300' : 
                finalStats.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {finalStats.accuracy}%
              </div>
            </div>
          </div>

          {/* Additional stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-sm font-mono text-green-400 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>Total Shots</div>
              <div className="text-xl font-mono font-bold text-green-300" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {finalStats.shotsFired}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-mono text-green-400 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>Tokens Dropped</div>
              <div className="text-xl font-mono font-bold text-green-300" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {finalStats.tokensDropped}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational message */}
        <div className="text-center space-y-2">
          {finalStats.score >= 1000 && (
            <p className="text-green-400 font-mono text-lg" style={{ fontFamily: "'Press Start 2P', monospace" }}>🎯 SHARPSHOOTER! 🎯</p>
          )}
          {finalStats.level >= 5 && (
            <p className="text-green-300 font-mono" style={{ fontFamily: "'Press Start 2P', monospace" }}>⚡ SPEED DEMON! ⚡</p>
          )}
          {finalStats.accuracy >= 90 && (
            <p className="text-green-400 font-mono" style={{ fontFamily: "'Press Start 2P', monospace" }}>🏆 PRECISION MASTER! 🏆</p>
          )}
          {finalStats.accuracy >= 80 && finalStats.accuracy < 90 && (
            <p className="text-green-300 font-mono" style={{ fontFamily: "'Press Start 2P', monospace" }}>🎯 EXCELLENT AIM! 🎯</p>
          )}
          {finalStats.tokensShot >= 50 && (
            <p className="text-green-400 font-mono" style={{ fontFamily: "'Press Start 2P', monospace" }}>💥 TOKEN HUNTER! 💥</p>
          )}
          {finalStats.shotsFired >= 100 && (
            <p className="text-green-300 font-mono" style={{ fontFamily: "'Press Start 2P', monospace" }}>🔫 TRIGGER HAPPY! 🔫</p>
          )}
        </div>

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="flex items-center justify-center space-x-2 text-xl font-mono font-bold text-green-400 hover:text-green-300 transform hover:scale-105 transition-all duration-200 mx-auto bg-transparent border-none cursor-pointer token-sniper-ui-element"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <RotateCcw className="w-6 h-6" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};