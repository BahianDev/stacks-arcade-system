export class GameState {
  public hasGameStarted: boolean = false;
  public wave: number = 1;
  public alienCount: number = 0;
  public alienDirection: number = -1;
  public alienYDown: number = 0;
  public updateAlienLogic: boolean = false;
  public lastTime: number = 0;

  public reset(): void {
    this.hasGameStarted = false;
    this.wave = 1;
    this.alienCount = 0;
    this.alienDirection = -1;
    this.alienYDown = 0;
    this.updateAlienLogic = false;
    this.lastTime = 0;
  }
}