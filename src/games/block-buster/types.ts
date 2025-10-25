export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface GameState {
  snake: Position[];
  food: Position;
  dangerBlocks: DangerBlock[];
  direction: Direction;
  score: number;
  isGameOver: boolean;
  isPlaying: boolean;
  highScore: number;
}

export interface DangerBlock {
  id: string;
  position: Position;
  timeRemaining: number;
}

export interface GameConfig {
  gridSize: number;
  tileSize: number;
  gameSpeed: number;
}