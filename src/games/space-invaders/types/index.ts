export interface ClipRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface InvadersOptions {
  selector?: string;
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  title?: string;
}

export interface AlienUpdateParams {
  alienDirection: number;
  setUpdateAlienLogic: () => void;
  canvasWidth: number;
  reset: () => void;
  alienYDown: number;
}