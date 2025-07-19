import React from 'react';
import { Player } from '../types/game';
import './PlayerCard.css';

interface PlayerCardProps {
  player: Player;
  position: number;
  totalPlayers: number;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  currentPlayerIndex: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  position,
  totalPlayers,
  isCurrentPlayer,
  isCurrentTurn,
  currentPlayerIndex
}) => {
  const getCardPosition = () => {
    // Calculate relative position so current player is always at bottom (position 0)
    let relativePosition = position - currentPlayerIndex;
    if (relativePosition < 0) {
      relativePosition += totalPlayers;
    }
    
    // Adjust angle so position 0 is at bottom (90 degrees)
    const angle = (relativePosition * 360) / totalPlayers + 90;
    const radius = 200;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    return {
      transform: `translate(${x}px, ${y}px)`
    };
  };

  const renderCard = (card: string | null) => {
    if (!card) return <div className="card empty">No Card</div>;
    
    const suit = card.charAt(1);
    const value = card.charAt(0);
    const isRed = suit === 'H' || suit === 'D';
    
    return (
      <div className={`card ${isRed ? 'red' : 'black'}`}>
        <span className="card-value">{value}</span>
        <span className="card-suit">{getSuitSymbol(suit)}</span>
      </div>
    );
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      case 'S': return '♠';
      default: return suit;
    }
  };

  return (
    <div 
      className={`player-card ${isCurrentPlayer ? 'current-player' : ''} ${isCurrentTurn ? 'current-turn' : ''}`}
      style={getCardPosition()}
    >
      <div className="player-info">
        <h3>{player.name}</h3>
        <p>Draw: {player.drawDeckCount}</p>
        <p>Used: {player.usedStackCount}</p>
      </div>
      
      <div className="active-card-area">
        {renderCard(player.activeCard)}
      </div>
      
      {player.usedStackCount > 0 && (
        <div className="used-stack">
          <div className="stack-indicator">
            {player.usedStackCount} cards
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;