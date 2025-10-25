import { Position } from './types';
import { generateFoodPosition } from './utils';

export class Food {
  private position: Position;

  constructor(initialPosition: Position) {
    this.position = initialPosition;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  setPosition(newPosition: Position): void {
    this.position = newPosition;
  }

  respawn(snakeBody: Position[], gridSize: number): void {
    this.position = generateFoodPosition(snakeBody, gridSize);
  }

  isEaten(snakeHead: Position): boolean {
    return this.position.x === snakeHead.x && this.position.y === snakeHead.y;
  }
}