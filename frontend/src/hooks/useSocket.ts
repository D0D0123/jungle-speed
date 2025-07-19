import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, DrawResult, GrabResult } from '../types/game';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('joined-game', (data: { playerId: string }) => {
      setPlayerId(data.playerId);
      setError('');
    });

    newSocket.on('join-failed', (message: string) => {
      setError(message);
    });

    newSocket.on('game-state', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('game-started', () => {
      console.log('Game started!');
    });

    newSocket.on('draw-result', (result: DrawResult) => {
      if (!result.success) {
        console.log('Draw failed:', result.reason);
      }
      if (result.winner) {
        console.log('Game won by:', result.winner);
      }
    });

    newSocket.on('grab-result', (result: GrabResult) => {
      if (result.success) {
        console.log('Bottle grab:', result.type);
      } else {
        console.log('Grab failed:', result.reason);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = useCallback((playerName: string) => {
    if (socket) {
      console.log(`Joining game as ${playerName}`)
      socket.emit('join-game', playerName);
    }
  }, [socket]);

  const startGame = useCallback(() => {
    if (socket) {
      socket.emit('start-game');
    }
  }, [socket]);

  const drawCard = useCallback(() => {
    if (socket) {
      socket.emit('draw-card');
    }
  }, [socket]);

  const grabBottle = useCallback(() => {
    if (socket) {
      socket.emit('grab-bottle');
    }
  }, [socket]);

  return {
    gameState,
    playerId,
    connected,
    error,
    joinGame,
    startGame,
    drawCard,
    grabBottle
  };
};