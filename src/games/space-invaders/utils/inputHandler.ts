export class InputHandler {
  private keyStates: boolean[] = [];
  private prevKeyStates: boolean[] = [];

  public onKeyDown(e: KeyboardEvent): void {
    e.preventDefault();
    this.keyStates[e.keyCode] = true;
  }

  public onKeyUp(e: KeyboardEvent): void {
    e.preventDefault();
    this.keyStates[e.keyCode] = false;
  }

  public isKeyDown(key: number): boolean {
    return this.keyStates[key];
  }

  public wasKeyPressed(key: number): boolean {
    return !this.prevKeyStates[key] && this.keyStates[key];
  }

  public update(): void {
    this.prevKeyStates = [...this.keyStates];
  }

  public resetKey(key: number): void {
    this.keyStates[key] = false;
    this.prevKeyStates[key] = false;
  }
}