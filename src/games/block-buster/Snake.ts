import { Position, Direction } from './types';
import { getNextPosition, checkCollision, checkWallCollision } from './utils';

export class Snake {
  private body: Position[];
  private direction: Direction;
  private nextDirection: Direction;

  constructor(initialPosition: Position, initialDirection: Direction = Direction.RIGHT) {
    this.body = [initialPosition];
    this.direction = initialDirection;
    this.nextDirection = initialDirection;
  }

  getBody(): Position[] {
    return [...this.body];
  }

  getHead(): Position {
    return this.body[0];
  }

  getDirection(): Direction {
    return this.direction;
  }

  setDirection(newDirection: Direction): void {
    this.nextDirection = newDirection;
  }

  move(grow: boolean = false): void {
    // Update direction at the start of movement
    this.direction = this.nextDirection;
    
    const head = this.getHead();
    const newHead = getNextPosition(head, this.direction);
    
    // Add new head
    this.body.unshift(newHead);
    
    // Remove tail if not growing
    if (!grow) {
      this.body.pop();
    }
  }

  checkSelfCollision(): boolean {
    const head = this.getHead();
    const body = this.body.slice(1); // Exclude head from body check
    return checkCollision(head, body);
  }

  checkWallCollision(gridSize: number): boolean {
    const head = this.getHead();
    return checkWallCollision(head, gridSize);
  }

  reset(initialPosition: Position, initialDirection: Direction = Direction.RIGHT): void {
    this.body = [initialPosition];
    this.direction = initialDirection;
    this.nextDirection = initialDirection;
  }

  getLength(): number {
    return this.body.length;
  }
}