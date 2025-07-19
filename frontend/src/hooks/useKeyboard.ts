import { useEffect, useCallback } from 'react';

interface UseKeyboardProps {
  onDrawCard: () => void;
  onGrabBottle: () => void;
  canDraw: boolean;
  gameActive: boolean;
}

export const useKeyboard = ({ onDrawCard, onGrabBottle, canDraw, gameActive }: UseKeyboardProps) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Prevent keyboard actions if typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Only handle keys during active gameplay
    if (!gameActive) return;

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'enter':
        // Spacebar or Enter to draw card
        event.preventDefault();
        if (canDraw) {
          onDrawCard();
        }
        break;
      case 'g':
      case 'b':
        // G key or B key to grab bottle
        event.preventDefault();
        onGrabBottle();
        break;
      default:
        break;
    }
  }, [onDrawCard, onGrabBottle, canDraw, gameActive]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    shortcuts: {
      drawCard: 'Space / Enter',
      grabBottle: 'G / B'
    }
  };
};