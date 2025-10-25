import React, { useState, useCallback, useEffect } from "react";
import { Snake } from "./Snake";
import { Food } from "./Food";
import { Direction, GameState, DangerBlock } from "./types";
import {
  GRID_SIZE,
  TILE_SIZE,
  INITIAL_GAME_SPEED,
  getHighScore,
  setHighScore,
  calculateGameSpeed,
  shouldSpawnDangerBlock,
  generateDangerBlockPosition,
} from "./utils";
import { useKeyboardControls } from "./useKeyboardControls";
import { useGameLoop } from "./useGameLoop";
import { gameStyles } from "./styles";
import { handleRecordActions } from "../../utils/actions";
import { AppConfig, UserSession } from "@stacks/connect";

const INITIAL_SNAKE_POSITION = { x: 10, y: 10 };
const INITIAL_FOOD_POSITION = { x: 15, y: 15 };

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export const Game: React.FC = () => {
  const [snake] = useState(() => new Snake(INITIAL_SNAKE_POSITION));
  const [food] = useState(() => new Food(INITIAL_FOOD_POSITION));
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);
  const [gameState, setGameState] = useState<GameState>({
    snake: snake.getBody(),
    food: food.getPosition(),
    dangerBlocks: [],
    direction: Direction.RIGHT,
    score: 0,
    isGameOver: false,
    isPlaying: false,
    highScore: getHighScore(),
  });

  const [userAddress, setUserAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  const hot = localStorage.getItem("hotWallet");

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setIsConnected(true);
      setUserAddress(userData.profile.stxAddress.testnet);
    }
  }, []);

  const startGame = useCallback(() => {
    snake.reset(INITIAL_SNAKE_POSITION);
    food.respawn(snake.getBody(), GRID_SIZE);
    setGameSpeed(INITIAL_GAME_SPEED);

    setGameState({
      snake: snake.getBody(),
      food: food.getPosition(),
      dangerBlocks: [],
      direction: Direction.RIGHT,
      score: 0,
      isGameOver: false,
      isPlaying: true,
      highScore: getHighScore(),
    });
  }, [snake, food]);

  const gameOver = useCallback(() => {
    setHighScore(gameState.score);
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
      isPlaying: false,
      highScore: Math.max(prev.highScore, prev.score),
    }));
  }, [gameState.score]);

  const gameTick = useCallback(() => {
    if (!hot || !userAddress) return;

    if (!gameState.isPlaying || gameState.isGameOver) return;

    // Check if food is eaten before moving
    const willEatFood = food.isEaten(snake.getHead());

    // Move snake
    snake.move(willEatFood);

    // Check collisions after moving
    const snakeHead = snake.getHead();

    // Check wall and self collision
    if (snake.checkWallCollision(GRID_SIZE) || snake.checkSelfCollision()) {
      gameOver();
      return;
    }

    // Check danger block collision
    const hitDangerBlock = gameState.dangerBlocks.some(
      (block) =>
        block.position.x === snakeHead.x && block.position.y === snakeHead.y
    );

    if (hitDangerBlock) {
      gameOver();
      return;
    }

    let newScore = gameState.score;
    let newDangerBlocks = [...gameState.dangerBlocks];

    // Handle food consumption
    if (willEatFood) {
      newScore += 10;

      handleRecordActions(userAddress);

      food.respawn(snake.getBody(), GRID_SIZE);

      // Update game speed based on new score
      const newSpeed = calculateGameSpeed(newScore);
      setGameSpeed(newSpeed);

      // Maybe spawn a danger block
      if (shouldSpawnDangerBlock(newScore)) {
        const dangerPosition = generateDangerBlockPosition(
          snake.getBody(),
          food.getPosition(),
          newDangerBlocks.map((block) => block.position),
          GRID_SIZE
        );

        const newDangerBlock: DangerBlock = {
          id: `danger-${Date.now()}`,
          position: dangerPosition,
          timeRemaining: 30000, // 30 seconds in milliseconds
        };

        newDangerBlocks.push(newDangerBlock);
      }

      // Play eat sound (simple beep)
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "square";
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        // Audio not supported, continue silently
      }
    }

    // Update danger blocks (decrease time remaining)
    newDangerBlocks = newDangerBlocks.map((block) => ({
      ...block,
      timeRemaining: block.timeRemaining - 16, // Subtract frame time (16ms for 60fps)
    }));

    setGameState((prev) => ({
      ...prev,
      snake: snake.getBody(),
      food: food.getPosition(),
      dangerBlocks: newDangerBlocks,
      score: newScore,
      direction: snake.getDirection(),
    }));
  }, [
    gameState.isPlaying,
    gameState.isGameOver,
    gameState.score,
    snake,
    food,
    gameOver,
    hot,
    userAddress,
  ]);

  const handleDirectionChange = useCallback(
    (newDirection: Direction) => {
      snake.setDirection(newDirection);
    },
    [snake]
  );

  // Keyboard controls
  useKeyboardControls({
    onDirectionChange: handleDirectionChange,
    currentDirection: gameState.direction,
    isGameActive: gameState.isPlaying && !gameState.isGameOver,
  });

  // Game loop
  useGameLoop({
    onTick: gameTick,
    isActive: gameState.isPlaying && !gameState.isGameOver,
    speed: gameSpeed,
  });

  // Auto-start game on mount
  useEffect(() => {
    startGame();
  }, [startGame]);

  const boardSize = GRID_SIZE * TILE_SIZE;

  return (
    <div style={gameStyles.container}>
      {/* Game UI */}
      <div style={gameStyles.ui}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div>SCORE: {gameState.score.toString().padStart(4, "0")}</div>
          <div>HIGH: {gameState.highScore.toString().padStart(4, "0")}</div>
        </div>

        {/* Speed indicator */}
        <div
          style={{ fontSize: "14px", color: "#FFFFFF", marginBottom: "10px" }}
        >
          SPEED: {Math.round((INITIAL_GAME_SPEED - gameSpeed) / 20) + 1}
        </div>

        {!gameState.isPlaying && !gameState.isGameOver && (
          <div style={gameStyles.instructions}>
            USE ARROW KEYS TO CONTROL THE SNAKE
            <br />
            EAT THE GOLDEN BLOCKS TO GROW
            <br />
            AVOID WALLS, YOUR TAIL, AND RED DANGER BLOCKS
          </div>
        )}
      </div>

      {/* Game Board */}
      <div
        style={{
          ...gameStyles.gameBoard,
          width: boardSize,
          height: boardSize,
        }}
      >
        {/* Snake */}
        {gameState.snake.map((segment, index) => (
          <div
            key={`snake-${index}`}
            style={{
              ...gameStyles.snakeSegment,
              left: segment.x * TILE_SIZE,
              top: segment.y * TILE_SIZE,
              width: TILE_SIZE - 1,
              height: TILE_SIZE - 1,
              backgroundColor: "#FFFFFF", // Head is brighter
            }}
          />
        ))}

        {/* Food */}
        <div
          style={{
            ...gameStyles.food,
            left: gameState.food.x * TILE_SIZE,
            top: gameState.food.y * TILE_SIZE,
            width: TILE_SIZE - 2,
            height: TILE_SIZE - 2,
          }}
        />

        {/* Danger Blocks */}
        {gameState.dangerBlocks.map((block) => (
          <div
            key={block.id}
            style={{
              ...gameStyles.dangerBlock,
              left: block.position.x * TILE_SIZE,
              top: block.position.y * TILE_SIZE,
              width: TILE_SIZE - 1,
              height: TILE_SIZE - 1,
              opacity: block.timeRemaining < 5000 ? 0.5 : 1, // Flash when about to disappear
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
            <div
              className="text-center space-y-6 p-8 border-4 bg-black max-w-lg mx-4"
              style={{ borderColor: "#FFFFFF" }}
            >
              {/* Game Over Title */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div
                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
                  style={{ borderColor: "#FFFFFF" }}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: "#FFFFFF" }}
                  ></div>
                </div>
                <h1
                  className="text-5xl font-mono font-bold tracking-wider"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "'Press Start 2P', monospace",
                    textShadow: "0 0 10px #FFFFFF",
                  }}
                >
                  GAME OVER
                </h1>
                <div
                  className="w-12 h-12 rounded-full border-4 flex items-center justify-center"
                  style={{ borderColor: "#FFFFFF" }}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: "#FFFFFF" }}
                  ></div>
                </div>
              </div>

              {/* Final Stats */}
              <div
                className="space-y-6 border-2 p-6 bg-black"
                style={{ borderColor: "#FFFFFF" }}
              >
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div
                    className="text-xl font-mono font-bold"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Press Start 2P', monospace",
                      textShadow: "0 0 5px #FFFFFF",
                    }}
                  >
                    🏆 FINAL STATS
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div
                      className="text-base font-mono uppercase tracking-wider"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      Final Score
                    </div>
                    <div
                      className="text-4xl font-mono font-bold mt-2"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      {gameState.score}
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className="text-base font-mono uppercase tracking-wider"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      Snake Length
                    </div>
                    <div
                      className="text-4xl font-mono font-bold mt-2"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      {gameState.snake.length}
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className="text-base font-mono uppercase tracking-wider"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      High Score
                    </div>
                    <div
                      className="text-4xl font-mono font-bold mt-2"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      {gameState.highScore}
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className="text-base font-mono uppercase tracking-wider"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      Speed Level
                    </div>
                    <div
                      className="text-4xl font-mono font-bold mt-2"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                      }}
                    >
                      {Math.round((INITIAL_GAME_SPEED - gameSpeed) / 20) + 1}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivational message */}
              <div className="text-center space-y-3 mt-6">
                {gameState.score >= 100 && (
                  <p
                    className="font-mono text-xl"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Press Start 2P', monospace",
                      textShadow: "0 0 5px #FFFFFF",
                    }}
                  >
                    🐍 SNAKE MASTER! 🐍
                  </p>
                )}
                {gameState.snake.length >= 10 && (
                  <p
                    className="font-mono text-lg"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Press Start 2P', monospace",
                      textShadow: "0 0 5px #FFFFFF",
                    }}
                  >
                    ⚡ GROWTH CHAMPION! ⚡
                  </p>
                )}
                {gameState.score >= 200 && (
                  <p
                    className="font-mono text-lg"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Press Start 2P', monospace",
                      textShadow: "0 0 5px #FFFFFF",
                    }}
                  >
                    🏆 HIGH SCORER! 🏆
                  </p>
                )}
                {gameState.score === gameState.highScore &&
                  gameState.score > 0 && (
                    <p
                      className="font-mono text-xl"
                      style={{
                        color: "#FFFFFF",
                        fontFamily: "'Press Start 2P', monospace",
                        textShadow: "0 0 10px #FFFFFF",
                      }}
                    >
                      🌟 NEW HIGH SCORE! 🌟
                    </p>
                  )}
              </div>

              {/* Play Again Button */}
              <div className="mt-8">
                <button
                  onClick={startGame}
                  className="flex items-center justify-center space-x-3 text-2xl font-mono font-bold hover:opacity-90 transform hover:scale-105 transition-all duration-200 mx-auto bg-transparent border-none cursor-pointer"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "'Press Start 2P', monospace",
                    textShadow: "0 0 5px #FFFFFF",
                  }}
                >
                  <span>🔄</span>
                  <span>PLAY AGAIN</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Info */}
      <div style={{ ...gameStyles.instructions, marginTop: "15px" }}>
        {gameState.isPlaying
          ? "ARROW KEYS TO MOVE • AVOID RED BLOCKS!"
          : "PRESS PLAY AGAIN TO START"}
      </div>
    </div>
  );
};
