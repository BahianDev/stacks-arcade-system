import React from 'react';
import { audioManager } from '../../../utils/audio';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: { [key: string]: 'correct' | 'present' | 'absent' | 'unused' };
  disabled: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, letterStates, disabled }) => {
  const handleKeyClick = (key: string) => {
    if (disabled) return;
    
    // Play appropriate sound based on key type
    if (key === 'ENTER' || key === 'BACKSPACE') {
      audioManager.playKeyboardSpecial();
    } else {
      audioManager.playKeyboardClick();
    }
    
    onKeyPress(key);
  };

  const getKeyStyle = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return 'bg-gray-600 text-green-400 border-gray-500 hover:bg-gray-500';
    }

    const state = letterStates[key] || 'unused';
    
    switch (state) {
      case 'correct':
        return 'bg-green-400 text-black border-green-400';
      case 'present':
        return 'bg-yellow-400 text-black border-yellow-400';
      case 'absent':
        return 'bg-gray-700 text-gray-400 border-gray-700';
      default:
        return 'bg-black text-green-400 border-green-400 hover:bg-green-900';
    }
  };

  const getKeyWidth = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return 'w-16';
    }
    return 'w-10';
  };

  const getKeyText = (key: string) => {
    if (key === 'BACKSPACE') return '⌫';
    return key;
  };

  return (
    <div className="space-y-0.5">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-0.5">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              disabled={disabled}
              className={`
                ${getKeyWidth(key)} h-8 border-2 font-mono font-bold text-xs
                ${getKeyStyle(key)}
                transition-all duration-200 transform hover:scale-105
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: key === 'ENTER' || key === 'BACKSPACE' ? '6px' : '8px'
              }}
            >
              {getKeyText(key)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};