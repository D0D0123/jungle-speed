export interface Player {
  id: string;
  name: string;
  drawDeckCount: number;
  usedStackCount: number;
  activeCard: string | null;
}

export interface GameState {
  gameState: 'waiting' | 'playing' | 'finished';
  players: Player[];
  currentPlayerIndex: number;
  bankCount: number;
  canGrabBottle: boolean;
  bottleGrabCooldown: boolean;
}

export interface DrawResult {
  success: boolean;
  reason?: string;
  winner?: string;
}

export interface GrabResult {
  success: boolean;
  reason?: string;
  type?: 'correct' | 'penalty';
}