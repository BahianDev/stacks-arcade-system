import { useCallback, useEffect, useRef, useState } from "react";
import Ship from "./Ship";
import Asteroid from "./Asteroid";
import { randomNumBetweenExcluding } from "../../utils/asteroids";
import Bullet from "./Bullet";
import Particle from "./Particle";
import { QuitConfirmation } from "../shared/components/QuitConfirmation";
import { useNavigate } from "react-router-dom";

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

export default function Reacteroids() {
  const navigate = useNavigate();

  // Refs de DOM
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs para o loop e observer
  const frameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Refs para contexto 2D e entidades do jogo
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const shipRef = useRef<Ship[]>([]);

  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  // Estado do jogo
  const [game, setGame] = useState<GameState>(() => ({
    screen: {
      width:
        typeof window !== "undefined"
          ? Math.max(800, Math.floor(window.innerWidth * 0.8))
          : 800,
      height:
        typeof window !== "undefined"
          ? Math.max(600, Math.floor(window.innerHeight * 0.7))
          : 600,
      ratio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    },
    context: null,
    keys: { left: false, right: false, up: false, down: false, space: false },
    asteroidCount: 3,
    currentScore: 0,
    topScore:
      (typeof window !== "undefined" && localStorage["topscore"]) || "0",
    inGame: false,
  }));

  // Ref espelho do estado para evitar closure "stale" no loop
  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Helpers tipados
  const updateObjects = (
    items: Ship[] | Particle[] | Bullet[] | Asteroid[],
    state: GameState
  ) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.delete) {
        items.splice(i, 1);
      } else {
        const newState = {
          ...state,
          context: state.context as CanvasRenderingContext2D,
        };
        item.render(newState);
      }
    }
  };

  const checkCollision = (a: Bullet | Ship, b: Asteroid) => {
    if (!a || !b || !a.position || !b.position) return false;
    const vx = a.position.x - b.position.x;
    const vy = a.position.y - b.position.y;
    const length = Math.sqrt(vx * vx + vy * vy);
    const ra = a.radius || 0;
    const rb = b.radius || 0;
    return length < ra + rb;
  };

  const checkCollisionsWith = (
    items1: Bullet[] | Ship[],
    items2: Asteroid[]
  ) => {
    console.log(items1, "b");

    for (let i = items1.length - 1; i > -1; i--) {
      for (let j = items2.length - 1; j > -1; j--) {
        const a = items1[i];
        const b = items2[j];
        if (checkCollision(a, b)) {
          a.destroy?.();
          b.destroy?.();
        }
      }
    }
  };

  // Mutadores do jogo
  const addScore = useCallback((points: number) => {
    setGame((g) =>
      g.inGame ? { ...g, currentScore: g.currentScore + points } : g
    );
  }, []);

  const createObject = useCallback(
    (item: Bullet | Asteroid | Particle | Ship, group: string) => {
      switch (group) {
        case "bullets":
          bulletsRef.current.push(item as Bullet);
          break;
        case "asteroids":
          asteroidsRef.current.push(item as Asteroid);
          break;
        case "particles":
          particlesRef.current.push(item as Particle);
          break;
        case "ship":
          shipRef.current.push(item as Ship);
          break;
      }
    },
    []
  );

  const gameOver = useCallback(() => {
    setGame((g) => {
      const isTop = g.currentScore > Number(g.topScore);
      const top = isTop ? String(g.currentScore) : g.topScore;
      try {
        if (isTop) localStorage["topscore"] = top;
      } catch {
        console.log();
      }
      return { ...g, inGame: false, topScore: top };
    });
  }, []);

  const generateAsteroids = useCallback(
    (howMany: number) => {
      if (shipRef.current.length === 0) return;
      const ship = shipRef.current[0];

      for (let i = 0; i < howMany; i++) {
        const asteroid = new Asteroid({
          size: 80,
          position: {
            x: randomNumBetweenExcluding(
              0,
              gameRef.current.screen.width,
              ship.position.x - 60,
              ship.position.x + 60
            ),
            y: randomNumBetweenExcluding(
              0,
              gameRef.current.screen.height,
              ship.position.y - 60,
              ship.position.y + 60
            ),
          },
          create: createObject,
          addScore,
        });
        createObject(asteroid, "asteroids");
      }
    },
    [addScore, createObject]
  );

  const startGame = useCallback(() => {
    // Reset coleções
    asteroidsRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    shipRef.current = [];

    setGame((g) => ({
      ...g,
      inGame: true,
      currentScore: 0,
      asteroidCount: 3,
    }));

    // Cria a nave (apenas se tiver dimensões válidas)
    const { width, height } = gameRef.current.screen;
    if (width > 0 && height > 0) {
      const ship = new Ship({
        position: { x: width / 2, y: height / 2 },
        create: createObject,
        onDie: gameOver,
      });
      createObject(ship, "ship");
    }

    // Cria asteroides iniciais
    generateAsteroids(gameRef.current.asteroidCount);
  }, [createObject, gameOver, generateAsteroids]);

  // Teclado
  const handleKeys = useCallback((value: boolean, e: KeyboardEvent) => {
    setGame((g) => {
      const keys = { ...g.keys };
      if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
      if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
      if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
      if (e.keyCode === KEY.SPACE) keys.space = value;
      return { ...g, keys };
    });
  }, []);

  useEffect(() => {
    const BLOCK = new Set([
      KEY.LEFT,
      KEY.RIGHT,
      KEY.UP,
      KEY.A,
      KEY.D,
      KEY.W,
      KEY.SPACE,
    ]);

    const onKeyDown = (e: KeyboardEvent) => {
      if (BLOCK.has(e.keyCode)) e.preventDefault();
      handleKeys(true, e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (BLOCK.has(e.keyCode)) e.preventDefault();
      handleKeys(false, e);
    };

    // usar capture:true evita que o default (scroll/click em botão focado) dispare antes
    const opts: AddEventListenerOptions = { capture: true };
    window.addEventListener("keydown", onKeyDown, opts);
    window.addEventListener("keyup", onKeyUp, opts);
    return () => {
      window.removeEventListener("keydown", onKeyDown, opts);
      window.removeEventListener("keyup", onKeyUp, opts);
    };
  }, [handleKeys]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => handleKeys(true, e);
    const onKeyUp = (e: KeyboardEvent) => handleKeys(false, e);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleKeys]);

  // Contexto 2D
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d") || null;
    ctxRef.current = ctx;
    setGame((g) => ({ ...g, context: ctx }));
  }, []);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      setGame((g) => ({
        ...g,
        screen: { width: rect.width, height: rect.height, ratio },
      }));
    };

    const obs = new ResizeObserver(measure);
    resizeObserverRef.current = obs;
    obs.observe(containerRef.current);

    // Força uma medição inicial
    measure();

    return () => {
      obs.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  // Game loop
  const updateFrame = useCallback(() => {
    const ctx = ctxRef.current;
    const { screen } = gameRef.current;

    if (!ctx) {
      frameRef.current = requestAnimationFrame(updateFrame);
      return;
    }

    // Configura canvas para HiDPI
    ctx.save();
    ctx.scale(screen.ratio, screen.ratio);

    // Motion trail
    ctx.fillStyle = "#000";
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, screen.width, screen.height);
    ctx.globalAlpha = 1;

    // Próxima leva de asteroides
    if (!asteroidsRef.current.length && shipRef.current.length > 0) {
      const next = gameRef.current.asteroidCount + 1;
      setGame((g) => ({ ...g, asteroidCount: next }));
      generateAsteroids(next);
    }

    // Colisões
    checkCollisionsWith(bulletsRef.current, asteroidsRef.current);
    checkCollisionsWith(shipRef.current, asteroidsRef.current);

    // Render/update de objetos
    const stateToPass: GameState = { ...gameRef.current, context: ctx };
    updateObjects(particlesRef.current, stateToPass);
    updateObjects(asteroidsRef.current, stateToPass);
    updateObjects(bulletsRef.current, stateToPass);
    updateObjects(shipRef.current, stateToPass);

    ctx.restore();

    // Proximo frame
    frameRef.current = requestAnimationFrame(updateFrame);
  }, [generateAsteroids]);

  useEffect(() => {
    // Inicia o jogo e o loop
    startGame();
    frameRef.current = requestAnimationFrame(updateFrame);
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [startGame, updateFrame]);

  // UI de fim de jogo
  let endgame: JSX.Element | null = null;
  let message: string;

  if (game.currentScore <= 0) {
    message = "0 points... So sad.";
  } else if (game.currentScore >= Number(game.topScore)) {
    message = `Top score with ${game.currentScore} points. Woo!`;
  } else {
    message = `${game.currentScore} Points though :)`;
  }

  if (!game.inGame) {
    endgame = (
      <div className="endgame">
        <p>Game over, man!</p>
        <p>{message}</p>
        <button onClick={startGame}>try again?</button>
      </div>
    );
  }

  const handleBackClick = () => {
    setShowQuitConfirmation(true);
  };
  const handleQuitConfirm = () => {
    navigate("/");
  };

  const handleQuitCancel = () => {
    setShowQuitConfirmation(false);
  };

  return (
    <div className="relative bg-black w-full p-5">
      {endgame}
      <QuitConfirmation
        isOpen={showQuitConfirmation}
        onConfirm={handleQuitConfirm}
        onCancel={handleQuitCancel}
      />

      <div className="flex w-full justify-between items-center">
        <div>
          <button
            onClick={handleBackClick}
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
          Score: {game.currentScore}
        </span>
      </div>

      <div
        ref={containerRef}
        className="canvas-container p-10 border-2 border-white w-full h-[900px] relative"
      >
        <canvas
          ref={canvasRef}
          width={game.screen.width * game.screen.ratio}
          height={game.screen.height * game.screen.ratio}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}
