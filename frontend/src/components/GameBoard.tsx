import React from 'react';
import { GameState } from '../types/game';
import PlayerCard from './PlayerCard';
import { useKeyboard } from '../hooks/useKeyboard';
import './GameBoard.css';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  onDrawCard: () => void;
  onGrabBottle: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  playerId,
  onDrawCard,
  onGrabBottle
}) => {
  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const currentPlayerIndex = gameState.players.findIndex(p => p.id === playerId);
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;
  const canDraw = gameState.gameState === 'playing' && isCurrentTurn && !gameState.bottleGrabCooldown;
  const gameActive = gameState.gameState === 'playing';

  const { shortcuts } = useKeyboard({
    onDrawCard,
    onGrabBottle,
    canDraw,
    gameActive
  });

  return (
    <div className="game-board">
      <div className="game-status">
        <h2>Jungle Speed</h2>
        <p>Status: {gameState.gameState}</p>
        {gameState.gameState === 'playing' && (
          <div className="turn-indicator">
            <span className="turn-label">Turn:</span>
            <span className="turn-player">{gameState.players[gameState.currentPlayerIndex]?.name}</span>
          </div>
        )}
      </div>

      {gameActive && currentPlayer && (
        <div className="keyboard-shortcuts">
          <div className="player-name-header">{currentPlayer.name}</div>
          <div className="shortcuts-title">Keyboard Shortcuts:</div>
          <div className="shortcut-item">
            <span className="shortcut-key">{shortcuts.drawCard}</span>
            <span className="shortcut-action">Draw Card</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">{shortcuts.grabBottle}</span>
            <span className="shortcut-action">Grab Bottle</span>
          </div>
        </div>
      )}

      <div className="players-circle">
        {gameState.players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            position={index}
            totalPlayers={gameState.players.length}
            isCurrentPlayer={player.id === playerId}
            isCurrentTurn={index === gameState.currentPlayerIndex}
            currentPlayerIndex={currentPlayerIndex}
          />
        ))}
      </div>

      <div className="center-area">
        <div className="bottle-container">
          <button
            className={`bottle ${gameState.canGrabBottle ? 'grabbable' : ''}`}
            onClick={onGrabBottle}
            disabled={gameState.gameState !== 'playing'}
            title="Press G or B to grab bottle"
          >
            🍾
          </button>
          {gameState.bankCount > 0 && (
            <div className="bank">
              Bank: {gameState.bankCount} cards
            </div>
          )}
        </div>
      </div>

      {currentPlayer && (
        <div className="player-controls">
          <button
            className="draw-button"
            onClick={onDrawCard}
            disabled={!canDraw}
            title="Press Space or Enter to draw"
          >
            Draw Card <span className="button-shortcut">(Space/Enter)</span>
          </button>
          <div className="player-info">
            <p>Draw Deck: {currentPlayer.drawDeckCount} cards</p>
            <p>Used Stack: {currentPlayer.usedStackCount} cards</p>
          </div>
        </div>
      )}

      {gameState.bottleGrabCooldown && (
        <div className="cooldown-indicator">
          Bottle grab cooldown active...
        </div>
      )}
    </div>
  );
};

export default GameBoard;