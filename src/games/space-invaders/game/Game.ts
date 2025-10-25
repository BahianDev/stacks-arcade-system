import { GameConfig } from './GameConfig';
import { GameState } from './GameState';
import { InputHandler } from '../utils/inputHandler';
import { preDrawBulletImage } from '../utils/canvasUtils';
import { 
  SPRITE_SHEET_SRC, 
  PLAYER_CLIP_RECT, 
  ALIEN_BOTTOM_ROW, 
  ALIEN_MIDDLE_ROW, 
  ALIEN_TOP_ROW 
} from '../constants/Sprites';
import { 
  LEFT_KEY, 
  RIGHT_KEY, 
  SHOOT_KEY, 
  ENTER_KEY 
} from '../constants/KeyCodes';
import { 
  TEXT_BLINK_FREQ, 
  ALIEN_X_MARGIN, 
  ALIEN_SQUAD_WIDTH 
} from '../constants/GameConstants';
import { ClipRect, AlienUpdateParams, InvadersOptions } from '../types';
import { playInvaderKilledSound } from '../sound';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import ParticleExplosion from '../entities/ParticleExplosion';
import { checkRectCollision } from '../../../utils/space-invaders';

export class Game {
  private config: GameConfig;
  private state: GameState;
  private inputHandler: InputHandler;
  
  // Inicializar com valores padrão ou usar operador de afirmação
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private spriteSheetImg!: HTMLImageElement;
  private bulletImg!: HTMLImageElement;
  
  private player!: Player;
  private aliens: Enemy[] = [];
  private particleManager!: ParticleExplosion;

  private IS_CHROME: boolean;

  constructor(options: InvadersOptions = {}) {
    this.config = new GameConfig(options);
    this.state = new GameState();
    this.inputHandler = new InputHandler();
    this.IS_CHROME = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    // Inicializar algumas propriedades no construtor
    this.spriteSheetImg = new Image();
    this.spriteSheetImg.src = SPRITE_SHEET_SRC;
    this.bulletImg = preDrawBulletImage();
  }

  public start(): void {
    this.initCanvas();
    this.setupEventListeners();
    this.resize();
    
    if (this.config.autoPlay) {
      this.initGame();
      this.state.hasGameStarted = true;
    }
    
    this.animate();
  }

  private initCanvas(): void {
    if (this.config.options.canvas) {
      this.canvas = this.config.options.canvas;
    } else {
      const el = document.querySelector(this.config.selector) || document.body;
      this.canvas = document.createElement("canvas");
      el.appendChild(this.canvas);
    }

    this.canvas.width = this.config.canvasWidth;
    this.canvas.height = this.config.canvasHeight;

    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  private initGame(): void {
    this.aliens = [];
    
    this.player = new Player(
      this.ctx,
      this.spriteSheetImg,
      PLAYER_CLIP_RECT,
      this.config.canvasWidth,
      this.config.canvasHeight,
      this.bulletImg,
      (key) => this.inputHandler.isKeyDown(key),
      (key) => this.inputHandler.wasKeyPressed(key),
      { left: LEFT_KEY, right: RIGHT_KEY, shoot: SHOOT_KEY }
    );
    
    this.particleManager = new ParticleExplosion(this.ctx);
    this.setupAlienFormation();
  }

  private setupAlienFormation(): void {
    this.state.alienCount = 0;
    for (let i = 0, len = 5 * 11; i < len; i++) {
      const gridX = i % 11;
      const gridY = Math.floor(i / 11);
      let clipRects: ClipRect[] = [];
      
      switch (gridY) {
        case 0:
        case 1:
          clipRects = ALIEN_BOTTOM_ROW;
          break;
        case 2:
        case 3:
          clipRects = ALIEN_MIDDLE_ROW;
          break;
        case 4:
          clipRects = ALIEN_TOP_ROW;
          break;
      }
      
      this.aliens.push(
        new Enemy(
          this.ctx,
          this.spriteSheetImg,
          this.bulletImg,
          clipRects,
          this.config.canvasWidth / 2 -
            ALIEN_SQUAD_WIDTH / 2 +
            ALIEN_X_MARGIN / 2 +
            gridX * ALIEN_X_MARGIN,
          this.config.canvasHeight / 3.25 - gridY * 40
        )
      );
      this.state.alienCount++;
    }
  }

  private reset(): void {
    this.aliens = [];
    this.setupAlienFormation();
    this.player.reset();
  }

  private update(dt: number): void {
    if (this.inputHandler.wasKeyPressed(ENTER_KEY) && !this.state.hasGameStarted) {
      this.initGame();
      this.state.hasGameStarted = true;
    }

    if (this.state.hasGameStarted) {
      this.player.handleInput();
      this.inputHandler.update();
      this.player.update(dt);
      this.updateAliens(dt);
      this.resolveCollisions();
    }
  }

  private updateAliens(dt: number): void {
    if (this.state.updateAlienLogic) {
      this.state.updateAlienLogic = false;
      this.state.alienDirection = -this.state.alienDirection;
      this.state.alienYDown = 25;
    }

    for (let i = this.aliens.length - 1; i >= 0; i--) {
      let alien: Enemy | undefined = this.aliens[i];
      if (!alien.alive) {
        this.aliens.splice(i, 1);
        alien = undefined;
        this.state.alienCount--;
        if (this.state.alienCount < 1) {
          this.state.wave++;
          this.setupAlienFormation();
        }
        return;
      }

      alien.stepDelay = (this.state.alienCount * 20 - this.state.wave * 10) / 1000;
      if (alien.stepDelay <= 0.05) {
        alien.stepDelay = 0.05;
      }
      
      const updateParams: AlienUpdateParams = {
        alienDirection: this.state.alienDirection,
        setUpdateAlienLogic: () => {
          this.state.updateAlienLogic = true;
        },
        canvasWidth: this.config.canvasWidth,
        reset: () => this.reset(),
        alienYDown: this.state.alienYDown
      };

      alien.update(dt, updateParams);

      if (alien.doShoot) {
        alien.doShoot = false;
        alien.shoot();
      }
    }
    this.state.alienYDown = 0;
  }

  private resolveBulletEnemyCollisions(): void {
    const bullets = this.player.bullets;

    for (let i = 0, len = bullets.length; i < len; i++) {
      const bullet = bullets[i];
      for (let j = 0, alen = this.aliens.length; j < alen; j++) {
        const alien = this.aliens[j];
        if (checkRectCollision(bullet.bounds, alien.bounds)) {
          playInvaderKilledSound();
          alien.alive = bullet.alive = false;
          this.particleManager.createExplosion(
            alien.position.x,
            alien.position.y,
            "white",
            70,
            5,
            5,
            3,
            0.15,
            50
          );
          this.player.score += 25;
        }
      }
    }
  }

  private resolveBulletPlayerCollisions(): void {
    for (let i = 0, len = this.aliens.length; i < len; i++) {
      const alien = this.aliens[i];
      if (
        alien.bullet &&
        checkRectCollision(alien.bullet.bounds, this.player.bounds)
      ) {
        if (this.player.lives === 0) {
          this.state.hasGameStarted = false;
        } else {
          alien.bullet.alive = false;
          this.particleManager.createExplosion(
            this.player.position.x,
            this.player.position.y,
            "green",
            100,
            8,
            8,
            6,
            0.001,
            40
          );
          this.player.position.set(this.config.canvasWidth / 2, this.config.canvasHeight - 70);
          this.player.lives--;
          break;
        }
      }
    }
  }

  private resolveCollisions(): void {
    this.resolveBulletEnemyCollisions();
    this.resolveBulletPlayerCollisions();
  }

  private fillText(
    text: string,
    x: number,
    y: number,
    color?: string,
    fontSize?: number
  ): void {
    if (typeof color !== "undefined") this.ctx.fillStyle = color;
    if (typeof fontSize !== "undefined") this.ctx.font = `${fontSize}px Play`;
    this.ctx.fillText(text, x, y);
  }

  private fillCenteredText(
    text: string,
    x: number,
    y: number,
    color?: string,
    fontSize?: number
  ): void {
    const metrics = this.ctx.measureText(text);
    this.fillText(text, x - metrics.width / 2, y, color, fontSize);
  }

  private fillBlinkingText(
    text: string,
    x: number,
    y: number,
    blinkFreq: number,
    color?: string,
    fontSize?: number
  ): void {
    if (~~(0.5 + Date.now() / blinkFreq) % 2) {
      this.fillCenteredText(text, x, y, color, fontSize);
    }
  }

  private drawBottomHud(): void {
    this.ctx.fillStyle = "#02ff12";
    this.ctx.fillRect(0, this.config.canvasHeight - 30, this.config.canvasWidth, 2);
    
    this.fillText(`${this.player.lives} x `, 10, this.config.canvasHeight - 7.5, "white", 20);
    
    this.ctx.drawImage(
      this.spriteSheetImg,
      this.player.clipRect.x,
      this.player.clipRect.y,
      this.player.clipRect.w,
      this.player.clipRect.h,
      45,
      this.config.canvasHeight - 23,
      this.player.clipRect.w * 0.5,
      this.player.clipRect.h * 0.5
    );
    
    this.fillText("CREDIT: ", this.config.canvasWidth - 115, this.config.canvasHeight - 7.5);
    this.fillCenteredText(`SCORE: ${this.player.score}`, this.config.canvasWidth / 2, 20);
    this.fillBlinkingText(
      "00",
      this.config.canvasWidth - 25,
      this.config.canvasHeight - 7.5,
      TEXT_BLINK_FREQ
    );
  }

  private drawAliens(): void {
    for (let i = 0; i < this.aliens.length; i++) {
      const alien = this.aliens[i];
      alien.draw();
    }
  }

  private drawGame(): void {
    this.player.draw();
    this.drawAliens();
    this.particleManager.draw();
    this.drawBottomHud();
  }

  private drawStartScreen(): void {
    this.fillBlinkingText(
      "Press enter to play!",
      this.config.canvasWidth / 2,
      this.config.canvasHeight / 2,
      500,
      "#FFFFFF",
      36
    );
  }

  private draw(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    
    if (this.state.hasGameStarted) {
      this.drawGame();
    } else {
      this.drawStartScreen();
    }
  }

  private animate(): void {
    const now = window.performance.now();
    let dt = now - this.state.lastTime;
    if (dt > 100) dt = 100;

    this.update(dt / 1000);
    this.draw();

    this.state.lastTime = now;
    requestAnimationFrame(() => this.animate());
  }

  private setupEventListeners(): void {
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("keydown", (e) => this.inputHandler.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.inputHandler.onKeyUp(e));
    
    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    let touchStart: { x: number; y: number } = { x: 0, y: 0 };

    document.addEventListener("touchstart", (e) => {
      touchStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      if (this.state.hasGameStarted) {
        this.player.shoot();
      } else {
        this.initGame();
        this.state.hasGameStarted = true;
      }
    });

    document.addEventListener("touchmove", (e) => {
      const touchCurrent = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      const deltaX = touchCurrent.x - touchStart.x;
      if (deltaX > 0) {
        this.inputHandler.resetKey(LEFT_KEY);
        // Simular keydown para a direita
        this.inputHandler.onKeyDown({ keyCode: RIGHT_KEY, preventDefault: () => {} } as unknown as KeyboardEvent);
      } else if (deltaX < 0) {
        this.inputHandler.resetKey(RIGHT_KEY);
        // Simular keydown para a esquerda
        this.inputHandler.onKeyDown({ keyCode: LEFT_KEY, preventDefault: () => {} } as unknown as KeyboardEvent);
      }
    });

    document.addEventListener("touchend", () => {
      this.inputHandler.resetKey(LEFT_KEY);
      this.inputHandler.resetKey(RIGHT_KEY);
    });
  }

  private resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const scaleFactor = Math.min(w / this.config.canvasWidth, h / this.config.canvasHeight);

    if (this.IS_CHROME) {
      this.canvas.width = this.config.canvasWidth * scaleFactor;
      this.canvas.height = this.config.canvasHeight * scaleFactor;
      this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
    } else {
      this.canvas.style.width = this.config.canvasWidth * scaleFactor + "px";
      this.canvas.style.height = this.config.canvasHeight * scaleFactor + "px";
    }
  }
}