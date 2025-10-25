import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface QuitConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const QuitConfirmation: React.FC<QuitConfirmationProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative border-4 bg-black p-8 max-w-md mx-4" style={{ borderColor: '#FFFFFF' }}>
        {/* Warning Icon */}
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="w-16 h-16 animate-pulse" style={{ color: '#FFFFFF' }} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-mono font-bold text-center mb-4 tracking-wider" style={{ color: '#FFFFFF' }}>
          QUIT GAME?
        </h2>

        {/* Message */}
        <p className="font-mono text-center mb-8 leading-relaxed" style={{ color: '#FFFFFF' }}>
          ARE YOU SURE YOU WANT TO QUIT?<br />
          YOUR PROGRESS WILL BE LOST!
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center space-x-6">
          {/* Yes Button */}
          <button
            onClick={onConfirm}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 border-2 border-red-400 text-white font-mono font-bold hover:bg-red-500 hover:border-red-300 transition-all duration-200 transform hover:scale-105 token-sniper-ui-element"
          >
            <Check className="w-4 h-4" />
            <span>YES</span>
          </button>

          {/* No Button */}
          <button
            onClick={onCancel}
            className="flex items-center space-x-2 px-6 py-3 border-2 text-black font-mono font-bold hover:opacity-90 transition-all duration-200 transform hover:scale-105 token-sniper-ui-element"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#FFFFFF'
            }}
          >
            <X className="w-4 h-4" />
            <span>NO</span>
          </button>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2" style={{ borderColor: '#FFFFFF' }}></div>
        <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2" style={{ borderColor: '#FFFFFF' }}></div>
        <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2" style={{ borderColor: '#FFFFFF' }}></div>
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2" style={{ borderColor: '#FFFFFF' }}></div>

        {/* Glow Effect */}
        <div className="absolute inset-0 border-4 opacity-50 animate-pulse pointer-events-none" style={{ borderColor: '#FFFFFF' }}></div>
      </div>
    </div>
  );
};