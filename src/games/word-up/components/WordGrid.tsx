import React from 'react';
import { LetterState } from '../types';

interface WordGridProps {
  guesses: string[];
  currentGuess: string;
  currentRow: number;
  targetWord: string;
  revealedLetters?: { [position: number]: string };
}

const getLetterState = (letter: string, position: number, word: string, targetWord: string): 'correct' | 'present' | 'absent' | 'empty' => {
  if (!letter) return 'empty';
  
  if (targetWord[position] === letter) {
    return 'correct';
  } else if (targetWord.includes(letter)) {
    return 'present';
  } else {
    return 'absent';
  }
};

export const WordGrid: React.FC<WordGridProps> = ({ guesses, currentGuess, currentRow, targetWord, revealedLetters = {} }) => {
  const rows = 6;
  const cols = 5;

  const renderRow = (rowIndex: number) => {
    let word = '';
    
    if (rowIndex < guesses.length) {
      word = guesses[rowIndex];
    } else if (rowIndex === currentRow) {
      word = currentGuess.padEnd(5, ' ');
    } else {
      word = '     ';
    }

    return (
      <div key={rowIndex} className="flex justify-center space-x-2 mb-2">
        {Array.from({ length: cols }, (_, colIndex) => {
          const letter = word[colIndex] || '';
          const isSubmitted = rowIndex < guesses.length;
          const isCurrentRow = rowIndex === currentRow;
          const isHintRevealed = !isSubmitted && !isCurrentRow && revealedLetters[colIndex];
          const state = isSubmitted ? getLetterState(letter, colIndex, word, targetWord) : 'empty';
          
          let bgColor = 'bg-black';
          let borderColor = 'border-green-400';
          let textColor = 'text-green-400';
          
          if (isSubmitted) {
            switch (state) {
              case 'correct':
                bgColor = 'bg-green-400';
                textColor = 'text-black';
                borderColor = 'border-green-400';
                break;
              case 'present':
                bgColor = 'bg-yellow-400';
                textColor = 'text-black';
                borderColor = 'border-yellow-400';
                break;
              case 'absent':
                bgColor = 'bg-gray-700';
                textColor = 'text-gray-400';
                borderColor = 'border-gray-700';
                break;
            }
          } else if (isHintRevealed) {
            bgColor = 'bg-blue-900';
            textColor = 'text-blue-300';
            borderColor = 'border-blue-400';
          } else if (letter && letter !== ' ') {
            bgColor = 'bg-green-900';
            textColor = 'text-green-300';
          }

          const displayLetter = isHintRevealed ? revealedLetters[colIndex] : (letter !== ' ' ? letter : '');
          return (
            <div
              key={colIndex}
              className={`w-12 h-12 border-2 ${bgColor} ${borderColor} ${textColor} flex items-center justify-center font-mono font-bold text-xl transition-all duration-300`}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                boxShadow: isSubmitted && state === 'correct' ? '0 0 10px #FFFFFF' : 
                          isSubmitted && state === 'present' ? '0 0 10px #FCD34D' : 'none'
              }}
            >
              {displayLetter}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mb-2">
      {Array.from({ length: rows }, (_, index) => renderRow(index))}
    </div>
  );
};