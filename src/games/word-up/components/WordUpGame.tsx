import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "../types";
import { getRandomWord, isValidWord } from "../wordList";
import { WordGrid } from "./WordGrid";
import { Keyboard } from "./Keyboard";
import { WordUpGameOver } from "./WordUpGameOver";
import { AppConfig, UserSession } from "@stacks/connect";
import { handleRecordActions } from "../../../utils/actions";

const INITIAL_STATE: GameState = {
  currentWord: "",
  targetWord: "",
  guesses: [],
  currentGuess: "",
  gameStatus: "playing",
  currentRow: 0,
  letterStates: {},
  score: 0,
  streak: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  isGameOver: false,
};

interface WordUpGameProps {
  isGamePaused?: boolean;
}

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export const WordUpGame: React.FC<WordUpGameProps> = ({
  isGamePaused = false,
}) => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [targetWord, setTargetWord] = useState("");
  const [message, setMessage] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<{
    [position: number]: string;
  }>({});

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

  // Initialize game
  const initializeGame = useCallback(() => {
    const newTargetWord = getRandomWord();
    setTargetWord(newTargetWord);

    // Load saved stats from localStorage
    const savedStats = localStorage.getItem("word-up-stats");
    const stats = savedStats
      ? JSON.parse(savedStats)
      : { gamesPlayed: 0, gamesWon: 0, streak: 0 };

    setGameState({
      ...INITIAL_STATE,
      targetWord: newTargetWord,
      gamesPlayed: stats.gamesPlayed,
      gamesWon: stats.gamesWon,
      streak: stats.streak,
    });

    setHintsUsed(0);
    setRevealedLetters({});
  }, []);

  // Start new game
  const startNewGame = useCallback(() => {
    const newTargetWord = getRandomWord();
    setTargetWord(newTargetWord);

    setGameState((prev) => ({
      ...INITIAL_STATE,
      targetWord: newTargetWord,
      gamesPlayed: prev.gamesPlayed,
      gamesWon: prev.gamesWon,
      streak: prev.streak,
    }));

    setMessage("");
    setHintsUsed(0);
    setRevealedLetters({});
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback(
    (stats: { gamesPlayed: number; gamesWon: number; streak: number }) => {
      localStorage.setItem("word-up-stats", JSON.stringify(stats));
    },
    []
  );

  // Handle hint button
  const handleHint = useCallback(() => {
    if (gameState.isGameOver || isGamePaused || hintsUsed >= 2) return;

    // Find positions that haven't been revealed yet
    const unrevealedPositions = [];
    for (let i = 0; i < 5; i++) {
      if (!revealedLetters[i]) {
        unrevealedPositions.push(i);
      }
    }

    if (unrevealedPositions.length === 0) return;

    // Pick a random unrevealed position
    const randomPosition =
      unrevealedPositions[
        Math.floor(Math.random() * unrevealedPositions.length)
      ];
    const letter = targetWord[randomPosition];

    setRevealedLetters((prev) => ({
      ...prev,
      [randomPosition]: letter,
    }));

    setHintsUsed((prev) => prev + 1);
    setMessage(`Hint: Position ${randomPosition + 1} is "${letter}"`);
    setTimeout(() => setMessage(""), 3000);
  }, [
    gameState.isGameOver,
    isGamePaused,
    hintsUsed,
    revealedLetters,
    targetWord,
  ]);
  // Handle key press
  const handleKeyPress = useCallback(
    (key: string) => {
      if (!hot || !userAddress) return;

      if (gameState.isGameOver || isGamePaused) return;

      setGameState((prev) => {
        if (key === "ENTER") {
          if (prev.currentGuess.length !== 5) {
            setMessage("Word must be 5 letters!");
            setTimeout(() => setMessage(""), 2000);
            return prev;
          }

          if (!isValidWord(prev.currentGuess)) {
            setMessage("Not a valid word!");
            setTimeout(() => setMessage(""), 2000);
            return prev;
          }

          const newGuesses = [...prev.guesses, prev.currentGuess];
          const newLetterStates = { ...prev.letterStates };

          // Update letter states
          for (let i = 0; i < prev.currentGuess.length; i++) {
            const letter = prev.currentGuess[i];
            if (targetWord[i] === letter) {
              newLetterStates[letter] = "correct";
            } else if (
              targetWord.includes(letter) &&
              newLetterStates[letter] !== "correct"
            ) {
              newLetterStates[letter] = "present";
            } else if (!targetWord.includes(letter)) {
              newLetterStates[letter] = "absent";
            }
          }

          const isWin = prev.currentGuess === targetWord;
          const isLoss = newGuesses.length >= 6 && !isWin;
          const newGameStatus = isWin ? "won" : isLoss ? "lost" : "playing";

          let newStats = {
            gamesPlayed: prev.gamesPlayed,
            gamesWon: prev.gamesWon,
            streak: prev.streak,
          };

          if (isWin || isLoss) {
            newStats.gamesPlayed += 1;
            if (isWin) {
              newStats.gamesWon += 1;

              handleRecordActions(userAddress);

              newStats.streak += 1;
            } else {
              newStats.streak = 0;
            }
            saveStats(newStats);
          }

          return {
            ...prev,
            guesses: newGuesses,
            currentGuess: "",
            currentRow: prev.currentRow + 1,
            letterStates: newLetterStates,
            gameStatus: newGameStatus,
            isGameOver: isWin || isLoss,
            gamesPlayed: newStats.gamesPlayed,
            gamesWon: newStats.gamesWon,
            streak: newStats.streak,
          };
        } else if (key === "BACKSPACE") {
          return {
            ...prev,
            currentGuess: prev.currentGuess.slice(0, -1),
          };
        } else if (key.length === 1 && /[A-Z]/.test(key)) {
          if (prev.currentGuess.length < 5) {
            return {
              ...prev,
              currentGuess: prev.currentGuess + key,
            };
          }
        }

        return prev;
      });
    },
    [gameState.isGameOver, isGamePaused, targetWord, saveStats, hot, userAddress]
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.isGameOver || isGamePaused) return;

      const key = event.key.toUpperCase();

      if (key === "ENTER") {
        handleKeyPress("ENTER");
      } else if (key === "BACKSPACE") {
        handleKeyPress("BACKSPACE");
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, gameState.isGameOver, isGamePaused]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-2 relative overflow-hidden">
      {/* Header with stats */}
      <div className="mb-2 text-center flex-shrink-0">
        <div className="flex items-center justify-center space-x-6 mb-2">
          <div className="text-center">
            <div
              className="text-xs font-mono"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              STREAK
            </div>
            <div
              className="text-xl font-mono font-bold"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {gameState.streak}
            </div>
          </div>

          <div className="text-center">
            <div
              className="text-xs font-mono"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              PLAYED
            </div>
            <div
              className="text-xl font-mono font-bold"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {gameState.gamesPlayed}
            </div>
          </div>

          <div className="text-center">
            <div
              className="text-xs font-mono"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              WON
            </div>
            <div
              className="text-xl font-mono font-bold"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {gameState.gamesWon}
            </div>
          </div>

          <div className="text-center">
            <div
              className="text-xs font-mono"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              HINTS
            </div>
            <div
              className="text-xl font-mono font-bold"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              {2 - hintsUsed}
            </div>
          </div>
        </div>

        {message && (
          <div
            className="text-red-400 font-mono text-xs mb-2"
            style={{
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            {message}
          </div>
        )}

        {/* Hint Button */}
        <div className="mb-1">
          <button
            onClick={handleHint}
            disabled={gameState.isGameOver || isGamePaused || hintsUsed >= 2}
            className={`px-4 py-1 border-2 font-mono font-bold text-xs transition-all duration-200 transform hover:scale-105 ${
              gameState.isGameOver || isGamePaused || hintsUsed >= 2
                ? "opacity-50 cursor-not-allowed border-gray-600 text-gray-600"
                : "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            }`}
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            💡 HINT ({2 - hintsUsed} LEFT)
          </button>
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center min-h-0 mb-1">
        <WordGrid
          guesses={gameState.guesses}
          currentGuess={gameState.currentGuess}
          currentRow={gameState.currentRow}
          targetWord={targetWord}
          revealedLetters={revealedLetters}
        />
      </div>

      {/* Keyboard */}
      <div className="flex-shrink-0">
        <Keyboard
          onKeyPress={handleKeyPress}
          letterStates={gameState.letterStates}
          disabled={gameState.isGameOver || isGamePaused}
        />
      </div>

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <WordUpGameOver
          gameState={gameState}
          onRestart={startNewGame}
          targetWord={targetWord}
        />
      )}
    </div>
  );
};
