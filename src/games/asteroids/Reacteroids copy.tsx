import { Component, createRef, RefObject } from "react";
import Ship from "./Ship";
import Asteroid from "./Asteroid";
import { randomNumBetweenExcluding } from "../../utils/asteroids";
import Bullet from "./Bullet";
import Particle from "./Particle";

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
};

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
  context: CanvasRenderingContext2D | null;
  keys: KeysState;
  asteroidCount: number;
  currentScore: number;
  topScore: string;
  inGame: boolean;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface IShip {
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  inertia: number;
  radius: number;
  lastShot: number;
  delete: boolean;
  destroy: () => void;
  create: (particle: Particle | Bullet, text: string) => void;
  render: (state: GameState) => void;
}

export interface IParticle {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  lifeSpan: number;
  inertia: number;
  delete: boolean;
  render: (state: GameState) => void;
}

export interface IAsteroid {
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  rotationSpeed: number;
  radius: number;
  score: number;
  vertices: Vector2[];
  delete: boolean;
  destroy: () => void;
  render: (state: GameState) => void;
}

type Props = Record<string, never>;

export class Reacteroids extends Component {
  private canvasRef: RefObject<HTMLCanvasElement> = createRef();
  private containerRef: RefObject<HTMLDivElement> = createRef();
  private resizeObserver: ResizeObserver | null = null;

  bullets: Bullet[];
  ship: Ship[];
  asteroids: Asteroid[];
  particles: Particle[];
  state: GameState;

  private onKeyDown = (e: globalThis.KeyboardEvent) => this.handleKeys(true, e);
  private onKeyUp = (e: globalThis.KeyboardEvent) => this.handleKeys(false, e);

  constructor(props: Props) {
    super(props);
    this.state = {
      screen: {
        width: 800, // Valor padrão
        height: 600, // Valor padrão
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys: {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
      },
      asteroidCount: 3,
      currentScore: 0,
      topScore: localStorage["topscore"] || "0",
      inGame: false,
    };
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
  }

  handleResize = (entries?: ResizeObserverEntry[]) => {
    if (this.containerRef.current) {
      const rect = this.containerRef.current.getBoundingClientRect();
      this.setState({
        screen: {
          width: rect.width,
          height: rect.height,
          ratio: window.devicePixelRatio || 1,
        },
      });
    }
  };

  handleKeys(value: boolean, e: KeyboardEvent) {
    const keys = { ...this.state.keys };
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;
    this.setState({
      keys: keys,
    });
  }

  componentDidMount() {
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("keydown", this.onKeyDown);

    const context = this.canvasRef.current?.getContext("2d");
    this.setState({ context: context });

    // Configurar ResizeObserver
    if (this.containerRef.current) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.containerRef.current);
      // Forçar uma atualização inicial
      setTimeout(() => this.handleResize(), 100);
    }

    this.startGame();
    requestAnimationFrame(() => {
      this.update();
    });
  }

  componentWillUnmount() {
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keydown", this.onKeyDown);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  update() {
    const context = this.state.context;
    if (!context) {
      requestAnimationFrame(() => this.update());
      return;
    }

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = "#000";
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    // Next set of asteroids
    if (!this.asteroids.length && this.ship.length > 0) {
      const count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count);
    }

    // Check for collisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.ship, this.asteroids);

    // Remove or render
    this.updateObjects(this.particles, "particles");
    this.updateObjects(this.asteroids, "asteroids");
    this.updateObjects(this.bullets, "bullets");
    this.updateObjects(this.ship, "ship");

    context.restore();

    // Next frame
    requestAnimationFrame(() => {
      this.update();
    });
  }

  addScore(points: number) {
    if (this.state.inGame) {
      this.setState({
        currentScore: this.state.currentScore + points,
      });
    }
  }

  startGame() {
    this.setState({
      inGame: true,
      currentScore: 0,
      asteroidCount: 3,
    });

    // Reset arrays
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
    this.ship = [];

    // Make ship - só criar se tiver dimensões válidas
    if (this.state.screen.width > 0 && this.state.screen.height > 0) {
      const ship = new Ship({
        position: {
          x: this.state.screen.width / 2,
          y: this.state.screen.height / 2,
        },
        create: this.createObject.bind(this),
        onDie: this.gameOver.bind(this),
      });
      this.createObject(ship, "ship");
    }

    // Make asteroids
    this.generateAsteroids(this.state.asteroidCount);
  }

  gameOver() {
    this.setState({
      inGame: false,
    });

    // Replace top score
    if (this.state.currentScore > Number(this.state.topScore)) {
      this.setState({
        topScore: this.state.currentScore.toString(),
      });
      localStorage["topscore"] = this.state.currentScore.toString();
    }
  }

  generateAsteroids(howMany: number) {
    if (this.ship.length === 0) return;

    const ship = this.ship[0];
    for (let i = 0; i < howMany; i++) {
      const asteroid = new Asteroid({
        size: 80,
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.state.screen.width,
            ship.position.x - 60,
            ship.position.x + 60
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.screen.height,
            ship.position.y - 60,
            ship.position.y + 60
          ),
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this),
      });
      this.createObject(asteroid, "asteroids");
    }
  }

  createObject(item: Bullet | Asteroid | Particle | Ship, group: string) {
    switch (group) {
      case "bullets":
        this.bullets.push(item as Bullet);
        break;
      case "asteroids":
        this.asteroids.push(item as Asteroid);
        break;
      case "particles":
        this.particles.push(item as Particle);
        break;
      case "ship":
        this.ship.push(item as Ship);
        break;
    }
  }

  updateObjects(items: any[], group: string) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.delete) {
        items.splice(i, 1);
      } else {
        item.render(this.state);
      }
    }
  }

  checkCollisionsWith(items1: any[], items2: any[]) {
    for (let a = items1.length - 1; a > -1; a--) {
      for (let b = items2.length - 1; b > -1; b--) {
        const item1 = items1[a];
        const item2 = items2[b];
        if (this.checkCollision(item1, item2)) {
          item1.destroy?.();
          item2.destroy?.();
        }
      }
    }
  }

  checkCollision(obj1: any, obj2: any) {
    if (!obj1 || !obj2) return false;

    const vx = obj1.position.x - obj2.position.x;
    const vy = obj1.position.y - obj2.position.y;
    const length = Math.sqrt(vx * vx + vy * vy);
    return length < (obj1.radius || 0) + (obj2.radius || 0);
  }

  render() {
    let endgame;
    let message;

    if (this.state.currentScore <= 0) {
      message = "0 points... So sad.";
    } else if (this.state.currentScore >= Number(this.state.topScore)) {
      message = "Top score with " + this.state.currentScore + " points. Woo!";
    } else {
      message = this.state.currentScore + " Points though :)";
    }

    if (!this.state.inGame) {
      endgame = (
        <div className="endgame">
          <p>Game over, man!</p>
          <p>{message}</p>
          <button onClick={() => this.startGame()}>try again?</button>
        </div>
      );
    }

    return (
      <div className="relative bg-black w-full p-5">
        {endgame}
        <div className="flex w-full justify-between items-center">
          <div>
            <button
              className="text-xl font-mono font-bold hover:opacity-80 transition-all duration-200 bg-transparent border-none cursor-pointer"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              BACK
            </button>
          </div>
          <img
            src={"../../../public/asteroids.png"}
            alt="Asteroids Logo"
            className="w-56 z-50"
          />
          <span
            style={{
              color: "#FFFFFF",
              fontFamily: "'Press Start 2P', monospace",
            }}
            className="text-white text-xl"
          >
            Score: {this.state.currentScore}
          </span>
        </div>

        <div
          ref={this.containerRef}
          className="canvas-container p-10 border-2 border-white w-full h-[900px] relative"
        >
          <canvas
            ref={this.canvasRef}
            width={this.state.screen.width * this.state.screen.ratio}
            height={this.state.screen.height * this.state.screen.ratio}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </div>
      </div>
    );
  }
}
