import { RefObject, useEffect, useState } from "react";
import { startGame } from "../games/space-invaders/game/index";
import { InvadersOptions } from "../games/space-invaders/types";

export function useSpaceInvaders(
  canvasRef: RefObject<HTMLCanvasElement>,
  options: InvadersOptions = {}
) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !started) {
      startGame({ ...options, canvas: canvasRef.current });
      setStarted(true);
    }
  }, [canvasRef, started, options]);

  return started;
}
