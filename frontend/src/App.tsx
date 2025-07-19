import React from 'react';
import { useSocket } from './hooks/useSocket';
import JoinForm from './components/JoinForm';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import './App.css';

function App() {
  const {
    gameState,
    playerId,
    connected,
    error,
    joinGame,
    startGame,
    drawCard,
    grabBottle
  } = useSocket();

  if (!gameState || !playerId) {
    return (
      <JoinForm 
        onJoin={joinGame}
        error={error}
        connected={connected}
      />
    );
  }

  if (gameState.gameState === 'waiting') {
    return (
      <Lobby
        gameState={gameState}
        playerId={playerId}
        onStartGame={startGame}
      />
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      playerId={playerId}
      onDrawCard={drawCard}
      onGrabBottle={grabBottle}
    />
  );
}

export default App;
