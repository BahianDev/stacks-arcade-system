import { Game } from './Game';
import { InvadersOptions } from '../types';

export function startGame(options: InvadersOptions = {}): void {
  const styleEl = document.createElement("link");
  styleEl.rel = "stylesheet";
  styleEl.href = "https://fonts.googleapis.com/css?family=Play:400,700";
  document.head.appendChild(styleEl);

  const game = new Game(options);
  game.start();
}