export interface GameState {
  currentWord: string;
  targetWord: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
  letterStates: { [key: string]: 'correct' | 'present' | 'absent' | 'unused' };
  score: number;
  streak: number;
  gamesPlayed: number;
  gamesWon: number;
  isGameOver: boolean;
}

export interface LetterState {
  letter: string;
  state: 'correct' | 'present' | 'absent' | 'empty';
}

export interface WordValidation {
  isValid: boolean;
  message?: string;
}