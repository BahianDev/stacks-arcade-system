import { useEffect } from 'react';
import { Direction } from './types';
import { isOppositeDirection } from './utils';

interface UseKeyboardControlsProps {
  onDirectionChange: (direction: Direction) => void;
  currentDirection: Direction;
  isGameActive: boolean;
}

export const useKeyboardControls = ({
  onDirectionChange,
  currentDirection,
  isGameActive
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    if (!isGameActive) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      let newDirection: Direction | null = null;

      switch (event.key) {
        case 'ArrowUp':
          newDirection = Direction.UP;
          break;
        case 'ArrowDown':
          newDirection = Direction.DOWN;
          break;
        case 'ArrowLeft':
          newDirection = Direction.LEFT;
          break;
        case 'ArrowRight':
          newDirection = Direction.RIGHT;
          break;
        default:
          return;
      }

      // Prevent default arrow key behavior (scrolling)
      event.preventDefault();

      // Don't allow opposite direction (would cause immediate collision)
      if (newDirection && !isOppositeDirection(currentDirection, newDirection)) {
        onDirectionChange(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onDirectionChange, currentDirection, isGameActive]);
};