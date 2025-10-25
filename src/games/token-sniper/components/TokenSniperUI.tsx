import React from 'react';
import { Target, Clock, Heart, Zap, TrendingUp } from 'lucide-react';

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
  tokensRemaining: number;
  totalTokensForLevel: number;
  hasMultiplier: boolean;
  multiplierActive: boolean;
}

interface TokenSniperUIProps {
  gameState: GameState;
}

export const TokenSniperUI: React.FC<TokenSniperUIProps> = ({ gameState }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-black border-b-2 border-white">
      <div className="flex items-center justify-between ml-40">
        {/* Left side - Score */}
        <div className="flex items-center space-x-8 ml-6">
          <div className="text-center">
            <div className="text-sm font-mono text-white uppercase tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>Score</div>
            <div className="text-3xl font-mono font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {gameState.score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Center - Game Stats */}
        <div className="flex items-center space-x-6">
          {/* Level */}
          <div className="text-center">
            <div className="text-sm font-mono text-white uppercase tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>Level</div>
            <div className="text-2xl font-mono font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {gameState.level}
            </div>
          </div>

          {/* Time Left */}
          <div className="text-center">
            <div className="text-sm font-mono text-white uppercase tracking-wider flex items-center justify-center space-x-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {gameState.level <= 3 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Timer</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Remaining</span>
                </>
              )}
            </div>
            <div className={`text-2xl font-mono font-bold ${
              gameState.level <= 3 
                ? gameState.timeLeft <= 3 
                  ? 'text-red-400 animate-pulse' 
                  : 'text-white'
                : 'text-white'
            }`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {gameState.level <= 3 ? Math.ceil(gameState.timeLeft) : gameState.tokensRemaining}
            </div>
          </div>

          {/* Accuracy */}
          <div className="text-center">
            <div className="text-sm font-mono text-white uppercase tracking-wider flex items-center justify-center space-x-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <Target className="w-4 h-4" />
              <span>Accuracy</span>
            </div>
            <div className={`text-xl font-mono font-bold ${
              gameState.accuracy >= 80 ? 'text-white' : 
              gameState.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`} style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {gameState.accuracy}%
            </div>
          </div>

          {/* Tokens Shot */}
          <div className="text-center">
            <div className="text-sm font-mono text-white uppercase tracking-wider flex items-center justify-center space-x-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <Zap className="w-4 h-4" />
              <span>Hits</span>
            </div>
            <div className="text-xl font-mono font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              {gameState.tokensShot}
            </div>
          </div>
        </div>

        {/* Right side - Lives */}
        <div className="text-center">
          <div className="text-sm font-mono text-white uppercase tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>Lives</div>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${
                  i < gameState.lives
                    ? 'text-white fill-current'
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Level-specific indicators */}
      {gameState.isPlaying && (
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="text-xs font-mono text-white text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            {gameState.level <= 3
              ? `Level ${gameState.level} - Static Targets (${Math.ceil(gameState.timeLeft)}s)`
              : gameState.level <= 3 
              ? `Level ${gameState.level} - Static Targets`
              : gameState.level <= 4
                ? `Level ${gameState.level} - Slow Motion`
              : gameState.hasMultiplier
                ? `Level ${gameState.level} - 2X Multiplier Available`
                : `Level ${gameState.level} - Moving Targets`}
          </div>
          
          {gameState.multiplierActive && (
            <div className="text-xs font-mono text-yellow-400 animate-pulse" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              2X ACTIVE!
            </div>
          )}
          
          <div className="text-xs font-mono text-white flex items-center space-x-1" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            <TrendingUp className="w-3 h-3" />
            <span>Shots: {gameState.shotsFired}</span>
          </div>
          
          <div className="text-xs font-mono text-white" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            Progress: {gameState.totalTokensForLevel - gameState.tokensRemaining}/{gameState.totalTokensForLevel}
          </div>
        </div>
      )}
    </div>
  );
};