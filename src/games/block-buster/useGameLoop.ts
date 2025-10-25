import { useEffect, useRef } from 'react';

interface UseGameLoopProps {
  onTick: () => void;
  isActive: boolean;
  speed: number;
}

export const useGameLoop = ({ onTick, isActive, speed }: UseGameLoopProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(onTick, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onTick, isActive, speed]);

  return intervalRef;
};