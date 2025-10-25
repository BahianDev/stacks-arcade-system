import { Position, Direction } from './types';

export const GRID_SIZE = 20;
export const TILE_SIZE = 24;
export const INITIAL_GAME_SPEED = 200; // Start at moderate speed
export const MIN_GAME_SPEED = 80; // Fastest possible speed
export const SPEED_INCREASE_INTERVAL = 50; // Increase speed every 50 points

export const getRandomPosition = (gridSize: number): Position => {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
};

export const checkCollision = (head: Position, body: Position[]): boolean => {
  return body.some(segment => segment.x === head.x && segment.y === head.y);
};

export const checkWallCollision = (position: Position, gridSize: number): boolean => {
  return (
    position.x < 0 ||
    position.x >= gridSize ||
    position.y < 0 ||
    position.y >= gridSize
  );
};

export const getNextPosition = (head: Position, direction: Direction): Position => {
  switch (direction) {
    case Direction.UP:
      return { x: head.x, y: head.y - 1 };
    case Direction.DOWN:
      return { x: head.x, y: head.y + 1 };
    case Direction.LEFT:
      return { x: head.x - 1, y: head.y };
    case Direction.RIGHT:
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
};

export const isOppositeDirection = (current: Direction, new_: Direction): boolean => {
  const opposites = {
    [Direction.UP]: Direction.DOWN,
    [Direction.DOWN]: Direction.UP,
    [Direction.LEFT]: Direction.RIGHT,
    [Direction.RIGHT]: Direction.LEFT
  };
  return opposites[current] === new_;
};

export const generateFoodPosition = (snake: Position[], gridSize: number): Position => {
  let foodPosition: Position;
  do {
    foodPosition = getRandomPosition(gridSize);
  } while (checkCollision(foodPosition, snake));
  return foodPosition;
};

export const getHighScore = (): number => {
  const stored = localStorage.getItem('blockbuster-highscore');
  return stored ? parseInt(stored, 10) : 0;
};

export const setHighScore = (score: number): void => {
  const currentHigh = getHighScore();
  if (score > currentHigh) {
    localStorage.setItem('blockbuster-highscore', score.toString());
  }
};

export const calculateGameSpeed = (score: number): number => {
  const speedReduction = Math.floor(score / SPEED_INCREASE_INTERVAL) * 20;
  return Math.max(MIN_GAME_SPEED, INITIAL_GAME_SPEED - speedReduction);
};

export const shouldSpawnDangerBlock = (score: number): boolean => {
  // Start spawning danger blocks after score 30, with increasing frequency
  if (score < 30) return false;
  
  // Increase chance based on score: 5% at score 30, up to 15% at high scores
  const baseChance = 0.05;
  const bonusChance = Math.min(0.10, (score - 30) / 1000);
  const totalChance = baseChance + bonusChance;
  
  return Math.random() < totalChance;
};

export const generateDangerBlockPosition = (snake: Position[], food: Position, existingDangerBlocks: Position[], gridSize: number): Position => {
  let dangerPosition: Position;
  const occupiedPositions = [...snake, food, ...existingDangerBlocks];
  
  do {
    dangerPosition = getRandomPosition(gridSize);
  } while (checkCollision(dangerPosition, occupiedPositions));
  
  return dangerPosition;
};