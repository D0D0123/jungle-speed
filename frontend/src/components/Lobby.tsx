import React from 'react';
import { GameState } from '../types/game';
import './Lobby.css';

interface LobbyProps {
  gameState: GameState;
  playerId: string;
  onStartGame: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, playerId, onStartGame }) => {
  const canStartGame = gameState.players.length >= 2;

  return (
    <div className="lobby-container">
      <div className="lobby">
        <h1>🌴 Jungle Speed Lobby 🌴</h1>
        
        <div className="players-section">
          <h2>Players ({gameState.players.length}/4)</h2>
          <div className="players-list">
            {gameState.players.map((player) => (
              <div 
                key={player.id}
                className={`player-item ${player.id === playerId ? 'current-player' : ''}`}
              >
                <span className="player-name">{player.name}</span>
                {player.id === playerId && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
          
          {gameState.players.length < 4 && (
            <p className="waiting-message">
              Waiting for more players to join...
            </p>
          )}
        </div>

        <div className="game-info">
          <h3>Game Rules Reminder:</h3>
          <ul>
            <li>Players take turns drawing cards</li>
            <li>When active cards match, race to grab the bottle!</li>
            <li>Jacks/Jokers trigger special bottle grab rounds</li>
            <li>Wrong grabs result in penalty cards</li>
            <li>First to empty their deck wins!</li>
          </ul>
        </div>

        <div className="lobby-controls">
          {canStartGame ? (
            <button 
              className="start-button"
              onClick={onStartGame}
            >
              Start Game
            </button>
          ) : (
            <div className="start-requirements">
              Need at least 2 players to start
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;