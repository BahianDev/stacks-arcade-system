export interface Vector2 {
  x: number;
  y: number;
}

export interface IParticle {
  lifeSpan: number;
  size: number;
  position: Vector2;
  velocity: Vector2;
}

export interface Screen {
  width: number;
  height: number;
  ratio: number;
}

export interface KeysState {
  left: boolean;
  right: boolean;
  up: boolean 
  down: boolean 
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

export default class Particle {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  lifeSpan: number;
  inertia: number;
  delete: boolean;
  constructor(args: IParticle) {
    this.position = args.position;
    this.velocity = args.velocity;
    this.radius = args.size;
    this.lifeSpan = args.lifeSpan;
    this.inertia = 0.98;
    this.delete = false;
  }

  destroy() {
    this.delete = true;
  }

  render(state: GameState) {
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Shrink
    this.radius -= 0.1;
    if (this.radius < 0.1) {
      this.radius = 0.1;
    }
    if (this.lifeSpan-- < 0) {
      this.destroy();
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.fillStyle = "#ffffff";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -this.radius);
    context.arc(0, 0, this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
