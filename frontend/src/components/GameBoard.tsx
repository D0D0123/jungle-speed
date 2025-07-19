import React from 'react';
import { GameState } from '../types/game';
import PlayerCard from './PlayerCard';
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
  const isCurrentTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;
  const canDraw = gameState.gameState === 'playing' && isCurrentTurn && !gameState.bottleGrabCooldown;

  return (
    <div className="game-board">
      <div className="game-status">
        <h2>Jungle Speed</h2>
        <p>Status: {gameState.gameState}</p>
        {gameState.gameState === 'playing' && (
          <p>Current Turn: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
        )}
      </div>

      <div className="players-circle">
        {gameState.players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            position={index}
            totalPlayers={gameState.players.length}
            isCurrentPlayer={player.id === playerId}
            isCurrentTurn={index === gameState.currentPlayerIndex}
          />
        ))}
      </div>

      <div className="center-area">
        <div className="bottle-container">
          <button
            className={`bottle ${gameState.canGrabBottle ? 'grabbable' : ''}`}
            onClick={onGrabBottle}
            disabled={gameState.gameState !== 'playing'}
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
          >
            Draw Card
          </button>
          <div className="player-info">
            <p>Your Draw Deck: {currentPlayer.drawDeckCount} cards</p>
            <p>Your Used Stack: {currentPlayer.usedStackCount} cards</p>
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