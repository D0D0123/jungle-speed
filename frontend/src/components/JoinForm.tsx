import React, { useState } from 'react';
import './JoinForm.css';

interface JoinFormProps {
  onJoin: (playerName: string) => void;
  error: string;
  connected: boolean;
}

const JoinForm: React.FC<JoinFormProps> = ({ onJoin, error, connected }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && connected) {
      onJoin(playerName.trim());
    }
  };

  return (
    <div className="join-form-container">
      <div className="join-form">
        <h1>🌴 Jungle Speed 🌴</h1>
        <p>Fast-paced multiplayer card game</p>
        
        {!connected && (
          <div className="connection-status">
            Connecting to server...
          </div>
        )}
        
        {connected && (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="playerName">Enter your name:</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player name"
                maxLength={20}
                required
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={!playerName.trim() || !connected}
              className="join-button"
            >
              Join Game
            </button>
          </form>
        )}
        
        <div className="game-rules">
          <h3>How to Play:</h3>
          <ul>
            <li>Each player draws cards in turns</li>
            <li>When two active cards match, race to grab the bottle!</li>
            <li>Jack/Joker cards trigger a bottle grab opportunity</li>
            <li>Wrong grabs result in penalties</li>
            <li>First player to empty their deck wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinForm;