import React, { useState, useEffect, useCallback, useRef } from "react";
import { Token } from "./Token";
import { Crosshair } from "./Crosshair";
import { TokenSniperUI } from "./TokenSniperUI";
import { TokenSniperGameOver } from "./TokenSniperGameOver";
import { audioManager } from "../../../utils/audio";
import toast from "react-hot-toast";
import { handleRecordActions } from "../../../utils/actions";
import { AppConfig, UserSession } from "@stacks/connect";

interface TokenType {
  id: string;
  x: number;
  y: number;
  speed: number;
  type: "token1" | "token2" | "token3" | "token4" | "multiplier";
  value: number;
  size: number;
  isStatic: boolean;
  isMultiplier?: boolean;
}

interface GameState {
  tokens: TokenType[];
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

const TOKEN_VALUES = [5, 10, 25, 50];
const TOKEN_SIZES = [80, 60, 40, 30];

const INITIAL_STATE: GameState = {
  tokens: [],
  score: 0,
  level: 1,
  lives: 3,
  isGameOver: false,
  isPlaying: false,
  tokensShot: 0,
  tokensDropped: 0,
  accuracy: 100,
  shotsFired: 0,
  timeLeft: 10,
  isLevelTransition: false,
  tokensRemaining: 0,
  totalTokensForLevel: 0,
  hasMultiplier: false,
  multiplierActive: false,
};

interface TokenSniperBoardProps {
  onGameStateChange?: (isPlaying: boolean) => void;
  isGamePaused?: boolean;
}

const getLevelConfig = (level: number) => {
  const config = {
    tokenCount: 10,
    hasMovement: false,
    spawnRate: 2000,
    tokenSpeed: 0,
    timeLimit: 10,
    allowedTokenTypes: [0],
    staticTokens: true,
    hasUpwardMovement: false,
    hasTimeLimit: true,
    hasMultiplier: false,
  };

  if (level === 1) {
    config.tokenCount = 10;
    config.hasMovement = false;
    config.staticTokens = true;
    config.allowedTokenTypes = [0];
    config.timeLimit = 10;
    config.hasTimeLimit = true;
    config.hasMultiplier = false;
  } else if (level === 2) {
    config.tokenCount = 10;
    config.hasMovement = false;
    config.staticTokens = true;
    config.allowedTokenTypes = [0, 1, 2, 3];
    config.timeLimit = 10;
    config.hasTimeLimit = true;
    config.hasMultiplier = false;
  } else if (level === 3) {
    config.tokenCount = 10;
    config.hasMovement = false;
    config.staticTokens = true;
    config.allowedTokenTypes = [0, 1, 2, 3];
    config.timeLimit = 8;
    config.hasTimeLimit = true;
    config.hasMultiplier = false;
  } else if (level === 4) {
    config.tokenCount = 8;
    config.hasMovement = true;
    config.staticTokens = false;
    config.tokenSpeed = 0.5;
    config.spawnRate = 3000;
    config.allowedTokenTypes = [0, 1];
    config.hasTimeLimit = false;
    config.hasMultiplier = false;
  } else if (level >= 5) {
    config.hasMultiplier = true;
    config.hasTimeLimit = false;
    config.hasMovement = true;
    config.staticTokens = false;

    if (level <= 8) {
      config.tokenCount = 8 + (level - 5) * 2;
      config.tokenSpeed = 0.8 + (level - 5) * 0.3;
      config.spawnRate = 2500 - (level - 5) * 200;
      config.allowedTokenTypes = [0, 1, 2];
      config.hasUpwardMovement = level >= 5;
    } else if (level <= 15) {
      config.tokenCount = 12 + (level - 9) * 2;
      config.tokenSpeed = 1.5 + (level - 9) * 0.4;
      config.spawnRate = Math.max(600, 1800 - (level - 9) * 150);
      config.allowedTokenTypes = [0, 1, 2, 3];
      config.hasUpwardMovement = true;
    } else if (level <= 22) {
      config.tokenCount = 15 + (level - 16) * 2;
      config.tokenSpeed = 3.0 + (level - 16) * 0.5;
      config.spawnRate = Math.max(400, 800 - (level - 16) * 50);
      config.allowedTokenTypes = [1, 2, 3];
      config.hasUpwardMovement = true;
    } else {
      config.tokenCount = 20 + (level - 23) * 3;
      config.tokenSpeed = 5.0 + (level - 23) * 0.8;
      config.spawnRate = Math.max(250, 500 - (level - 23) * 30);
      config.allowedTokenTypes = [2, 3];
      config.hasUpwardMovement = true;
    }
  }

  return config;
};

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export const TokenSniperBoard: React.FC<TokenSniperBoardProps> = ({
  onGameStateChange,
  isGamePaused = false,
}) => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [scanlineOffset, setScanlineOffset] = useState(0);
  const [isCrosshairActive, setIsCrosshairActive] = useState(false);
  const gameLoopRef = useRef<number>();
  const spawnTimerRef = useRef<number>();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const levelConfigRef = useRef(getLevelConfig(1));
  const multiplierSpawnedRef = useRef(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  const hot = localStorage.getItem("hotWallet");

  // Notify parent component of game state changes
  useEffect(() => {
    if (onGameStateChange) {
      const isActivelyPlaying =
        gameState.isPlaying &&
        !gameState.isGameOver &&
        !gameState.isLevelTransition;
      onGameStateChange(isActivelyPlaying);
    }
  }, [
    gameState.isPlaying,
    gameState.isGameOver,
    gameState.isLevelTransition,
    onGameStateChange,
  ]);

  // Apply crosshair cursor during active gameplay
  useEffect(() => {
    const isActivelyPlaying =
      gameState.isPlaying &&
      !gameState.isGameOver &&
      !gameState.isLevelTransition &&
      !isGamePaused;
    setIsCrosshairActive(isActivelyPlaying);
  }, [
    gameState.isPlaying,
    gameState.isGameOver,
    gameState.isLevelTransition,
    isGamePaused,
  ]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setIsConnected(true);
      setUserAddress(userData.profile.stxAddress.testnet);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanlineOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const shootAtPosition = useCallback(
    (x: number, y: number) => {
      if (!hot || !userAddress) return;

      audioManager.playShoot();

      // Adjust Y coordinate to match game board offset (top-20 = 80px)
      const gameArea = gameAreaRef.current;
      const adjustedY = gameArea ? y - gameArea.getBoundingClientRect().top : y;

      setGameState((prev) => {
        const newShotsFired = prev.shotsFired + 1;
        let hitToken = false;
        let scoreGained = 0;
        let hitMultiplier = false;

        const remainingTokens = prev.tokens.filter((token) => {
          const distance = Math.sqrt(
            Math.pow(token.x - x, 2) + Math.pow(token.y - adjustedY, 2)
          );

          if (distance <= token.size / 2 && !hitToken) {
            hitToken = true;

            handleRecordActions(userAddress);

            if (token.isMultiplier) {
              hitMultiplier = true;
              audioManager.playLevelComplete();
            } else {
              scoreGained = prev.multiplierActive
                ? token.value * 2
                : token.value;
              audioManager.playHit();
            }
            return false;
          }
          return true;
        });

        const newTokensShot =
          hitToken && !hitMultiplier ? prev.tokensShot + 1 : prev.tokensShot;
        const newAccuracy =
          newShotsFired > 0
            ? Math.round((newTokensShot / newShotsFired) * 100)
            : 100;
        const newTokensRemaining = Math.max(
          0,
          prev.tokensRemaining - (hitToken && !hitMultiplier ? 1 : 0)
        );
        const newMultiplierActive = hitMultiplier
          ? true
          : prev.multiplierActive;

        if (newTokensRemaining === 0 && hitToken && !hitMultiplier) {
          audioManager.playLevelComplete();

          if (prev.level >= 30) {
            return {
              ...prev,
              tokens: remainingTokens,
              score: prev.score + scoreGained + 500,
              tokensShot: newTokensShot,
              shotsFired: newShotsFired,
              accuracy: newAccuracy,
              tokensRemaining: newTokensRemaining,
              isGameOver: true,
              isPlaying: false,
              multiplierActive: false,
            };
          }

          setTimeout(() => {
            const nextLevel = prev.level + 1;
            const nextLevelConfig = getLevelConfig(nextLevel);
            levelConfigRef.current = nextLevelConfig;
            multiplierSpawnedRef.current = false;

            setGameState((prevState) => ({
              ...prevState,
              tokens: [],
              level: nextLevel,
              timeLeft: nextLevelConfig.timeLimit,
              isLevelTransition: false,
              tokensRemaining: nextLevelConfig.tokenCount,
              totalTokensForLevel: nextLevelConfig.tokenCount,
              hasMultiplier: nextLevelConfig.hasMultiplier,
              multiplierActive: false,
            }));
          }, 2000);

          return {
            ...prev,
            tokens: remainingTokens,
            score: prev.score + scoreGained + 100,
            tokensShot: newTokensShot,
            shotsFired: newShotsFired,
            accuracy: newAccuracy,
            tokensRemaining: newTokensRemaining,
            isLevelTransition: true,
            multiplierActive: false,
          };
        }

        return {
          ...prev,
          tokens: remainingTokens,
          score: prev.score + scoreGained,
          tokensShot: newTokensShot,
          shotsFired: newShotsFired,
          accuracy: newAccuracy,
          tokensRemaining: newTokensRemaining,
          multiplierActive: newMultiplierActive,
        };
      });
    },
    [hot, userAddress]
  );

  const spawnToken = useCallback(() => {
    if (
      !gameState.isPlaying ||
      gameState.isGameOver ||
      gameState.isLevelTransition ||
      isGamePaused
    )
      return;

    const config = levelConfigRef.current;

    if (
      config.hasMultiplier &&
      !multiplierSpawnedRef.current &&
      Math.random() < 0.15
    ) {
      multiplierSpawnedRef.current = true;

      const multiplierToken: TokenType = {
        id: `multiplier-${Date.now()}-${Math.random()}`,
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: -50,
        speed: config.tokenSpeed * 2.5,
        type: "multiplier",
        value: 0,
        size: 25,
        isStatic: false,
        isMultiplier: true,
      };

      setGameState((prev) => ({
        ...prev,
        tokens: [...prev.tokens, multiplierToken],
      }));
      return;
    }

    const allowedTypes = config.allowedTokenTypes;
    const randomTypeIndex =
      allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const tokenTypes: ("token1" | "token2" | "token3" | "token4")[] = [
      "token1",
      "token2",
      "token3",
      "token4",
    ];

    const shouldShootUpward = config.hasUpwardMovement && Math.random() < 0.3;

    let startY, speed;
    if (config.staticTokens) {
      startY = Math.random() * (window.innerHeight - 300) + 150;
      speed = 0;
    } else if (shouldShootUpward) {
      startY = window.innerHeight + 50;
      speed = -(config.tokenSpeed * 3 + Math.random() * 1.0);
    } else {
      startY = -50;
      speed = config.tokenSpeed + Math.random() * 0.5;
    }

    const newToken: TokenType = {
      id: `token-${Date.now()}-${Math.random()}`,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: startY,
      speed: speed,
      type: tokenTypes[randomTypeIndex],
      value: TOKEN_VALUES[randomTypeIndex],
      size: TOKEN_SIZES[randomTypeIndex],
      isStatic: config.staticTokens,
      isMultiplier: false,
    };

    setGameState((prev) => ({
      ...prev,
      tokens: [...prev.tokens, newToken],
    }));
  }, [
    gameState.isPlaying,
    gameState.isGameOver,
    gameState.isLevelTransition,
    isGamePaused,
  ]);

  const gameLoop = useCallback(() => {
    setGameState((prev) => {
      if (
        !prev.isPlaying ||
        prev.isGameOver ||
        prev.isLevelTransition ||
        isGamePaused
      )
        return prev;

      const config = levelConfigRef.current;

      const newTimeLeft = config.hasTimeLimit
        ? Math.max(0, prev.timeLeft - 1 / 60)
        : prev.timeLeft;

      const updatedTokens = prev.tokens
        .map((token) => ({
          ...token,
          y: token.isStatic ? token.y : token.y + token.speed,
          speed: token.isStatic
            ? token.speed
            : token.speed < 0 && token.y <= 50
            ? Math.abs(token.speed) * 0.4
            : token.speed,
        }))
        .filter(
          (token) =>
            token.isStatic ||
            (token.y < window.innerHeight + 50 && token.y > -100)
        );

      const droppedTokens =
        prev.tokens.filter((token) => !token.isStatic && !token.isMultiplier)
          .length -
        updatedTokens.filter((token) => !token.isStatic && !token.isMultiplier)
          .length;
      const newTokensDropped = prev.tokensDropped + droppedTokens;
      const newLives = Math.max(0, prev.lives - droppedTokens);

      if (newLives <= 0 || (config.hasTimeLimit && newTimeLeft <= 0)) {
        audioManager.playGameOver();
        return {
          ...prev,
          tokens: updatedTokens,
          lives: config.hasTimeLimit && newTimeLeft <= 0 ? prev.lives : 0,
          isGameOver: true,
          isPlaying: false,
          tokensDropped: newTokensDropped,
          timeLeft: newTimeLeft,
          multiplierActive: false,
        };
      }

      return {
        ...prev,
        tokens: updatedTokens,
        lives: newLives,
        tokensDropped: newTokensDropped,
        timeLeft: newTimeLeft,
      };
    });
  }, [isGamePaused]);

  const startGame = useCallback(() => {
    if (!isConnected) return toast.error("Please connect your wallet");
    const config = getLevelConfig(1);
    levelConfigRef.current = config;
    multiplierSpawnedRef.current = false;

    audioManager.startBackgroundMusic();

    setGameState(() => ({
      ...INITIAL_STATE,
      isPlaying: true,
      timeLeft: config.timeLimit,
      tokensRemaining: config.tokenCount,
      totalTokensForLevel: config.tokenCount,
      hasMultiplier: config.hasMultiplier,
    }));
  }, [isConnected]);

  const restartGame = useCallback(() => {
    const config = getLevelConfig(1);
    levelConfigRef.current = config;
    multiplierSpawnedRef.current = false;

    audioManager.startBackgroundMusic();

    setGameState(() => ({
      ...INITIAL_STATE,
      isPlaying: true,
      timeLeft: config.timeLimit,
      tokensRemaining: config.tokenCount,
      totalTokensForLevel: config.tokenCount,
      hasMultiplier: config.hasMultiplier,
    }));
  }, []);

  // Game loop effect
  useEffect(() => {
    if (
      gameState.isPlaying &&
      !gameState.isGameOver &&
      !gameState.isLevelTransition &&
      !isGamePaused
    ) {
      gameLoopRef.current = window.setInterval(gameLoop, 16);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [
    gameState.isPlaying,
    gameState.isGameOver,
    gameState.isLevelTransition,
    isGamePaused,
    gameLoop,
  ]);

  // Token spawning effect
  useEffect(() => {
    if (
      gameState.isPlaying &&
      !gameState.isGameOver &&
      !gameState.isLevelTransition &&
      !isGamePaused
    ) {
      const config = levelConfigRef.current;

      if (config.staticTokens && gameState.tokens.length === 0) {
        for (let i = 0; i < config.tokenCount; i++) {
          setTimeout(() => spawnToken(), i * 200);
        }
      } else if (!config.staticTokens) {
        spawnTimerRef.current = window.setInterval(
          spawnToken,
          config.spawnRate
        );

        return () => {
          if (spawnTimerRef.current) {
            clearInterval(spawnTimerRef.current);
          }
        };
      }
    }
  }, [
    gameState.isPlaying,
    gameState.isGameOver,
    gameState.isLevelTransition,
    isGamePaused,
    gameState.level,
    spawnToken,
    gameState.tokens.length,
  ]);

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-screen bg-black overflow-hidden token-sniper-playing"
    >
      {/* Floating digital particles */}
      <div className="absolute inset-0 z-5">
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 opacity-30 animate-ping"
            style={{
              backgroundColor: "#FFFFFF",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 2.5}s`,
            }}
          ></div>
        ))}
      </div>

      {/* 2X Multiplier Indicator */}
      {gameState.multiplierActive && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-40">
          <div
            className="text-4xl font-mono font-bold text-yellow-400 animate-pulse"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              textShadow: "0 0 20px #FFD700",
            }}
          >
            2X MULTIPLIER ACTIVE!
          </div>
        </div>
      )}

      {/* Game UI */}
      <TokenSniperUI gameState={gameState} />

      {/* Game Area */}
      <div className="absolute inset-0 top-20">
        {gameState.tokens.map((token) => (
          <Token key={token.id} token={token} />
        ))}
      </div>

      {/* Crosshair Component */}
      <Crosshair isActive={isCrosshairActive} onShoot={shootAtPosition} />

      {/* Level Transition Screen */}
      {gameState.isLevelTransition && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
          <div className="text-center space-y-4 border-2 border-white bg-black p-8">
            <h2
              className="text-4xl font-mono font-bold text-white"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              LEVEL {gameState.level} COMPLETE!
            </h2>
            <p
              className="text-xl font-mono text-white"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              Preparing Level {gameState.level + 1}...
            </p>
            <div
              className="animate-pulse text-white"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              ▓▓▓▓▓▓▓▓▓▓
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
          <div className="text-center space-y-6 max-w-4xl mx-4">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/token_sniper.png"
                alt="Token Sniper Logo"
                className="w-48 h-48 md:w-48 md:h-48 object-contain"
              />
            </div>

            <div
              className="relative p-8 mt-5 bg-transparent"
              style={{
                background: "transparent",
                boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white"></div>

              <div className="absolute inset-0 z-0">
                {Array.from({ length: 15 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 opacity-20 animate-ping"
                    style={{
                      backgroundColor: "#FFFFFF",
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${1.5 + Math.random() * 2.5}s`,
                    }}
                  ></div>
                ))}
              </div>

              <div
                className="absolute inset-0 pointer-events-none opacity-10 z-0"
                style={{
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    #FFFFFF 2px,
                    #FFFFFF 4px
                  )`,
                  transform: `translateY(${scanlineOffset}px)`,
                }}
              ></div>

              <div
                className="space-y-3 text-white font-mono text-lg relative z-10"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                <p>• Move mouse to aim</p>
                <p>• Click to shoot tokens</p>
                <p>• Level 1-3: Static targets with timer</p>
                <p>• Level 4+: Moving targets, no timer</p>
                <p>• Level 5+: 2X multiplier tokens appear</p>
                <p>• Hit 2X token to double all points</p>
                <p>• Smaller tokens = more points</p>
                <p>• 30 levels of increasing difficulty</p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="text-2xl font-mono font-bold text-white transform hover:scale-105 transition-all duration-200 bg-transparent border-none cursor-pointer token-sniper-ui-element"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <TokenSniperGameOver gameState={gameState} onRestart={restartGame} />
      )}
    </div>
  );
};
