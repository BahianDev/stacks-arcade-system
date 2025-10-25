import { rotatePoint } from "../../utils/asteroids";

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ship {
  position: Vector2;
  velocity: Vector2;
  rotation: number; 
  rotationSpeed: number; 
  speed: number; 
  inertia: number;
  radius: number; 
  lastShot: number; 
  delete: boolean;
}

export interface Screen {
  width: number;
  height: number;
  ratio: number;
}

export interface KeysState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean; 
  space: boolean;
}

export interface GameState {
  screen: Screen;
  context: CanvasRenderingContext2D;
  keys: KeysState;
  asteroidCount: number;
  currentScore: number;
  topScore: string; 
  inGame: boolean;
}


export default class Bullet {
  position: { x: number; y: number; };
  rotation: number;
  velocity: { x: number; y: number; };
  radius: number;
  delete: boolean;
  constructor(args: { ship: Ship }) {
    const posDelta = rotatePoint(
      { x: 0, y: -20 },
      { x: 0, y: 0 },
      (args.ship.rotation * Math.PI) / 180
    );
    this.position = {
      x: args.ship.position.x + posDelta.x,
      y: args.ship.position.y + posDelta.y,
    };
    this.rotation = args.ship.rotation;
    this.velocity = {
      x: posDelta.x / 2,
      y: posDelta.y / 2,
    };
    this.radius = 2;
    this.delete = false;
  }

  destroy() {
    this.delete = true;
  }

  render(state: GameState) {
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Delete if it goes out of bounds
    if (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x > state.screen.width ||
      this.position.y > state.screen.height
    ) {
      this.destroy();
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.fillStyle = "#FFF";
    context.beginPath();
    context.arc(0, 0, 2, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
