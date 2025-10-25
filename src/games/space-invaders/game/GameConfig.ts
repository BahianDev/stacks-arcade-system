import { InvadersOptions } from '../types';

export class GameConfig {
  public readonly canvasWidth: number;
  public readonly canvasHeight: number;
  public readonly selector: string;
  public readonly autoPlay: boolean;
  public readonly options: InvadersOptions;

  constructor(options: InvadersOptions = {}) {
    this.options = options;
    this.canvasWidth = options.width || 640;
    this.canvasHeight = options.height || 640;
    this.selector = options.selector || "#invaders";
    this.autoPlay = options.autoPlay || false;
  }
}