# 🌴 Jungle Speed - Multiplayer Web Game

A real-time multiplayer implementation of the classic Jungle Speed card game built with React and Node.js.

## Game Overview

Jungle Speed is a fast-paced card game where players race to grab a bottle when certain conditions are met. The goal is to be the first player to get rid of all your cards.

### Game Rules

1. **Setup**: Players sit in a circle around a bottle. Each player gets a deck of cards.
2. **Turns**: Players take turns drawing the top card from their deck and placing it face-up.
3. **Matching**: When two active cards match (same value), those players race to grab the bottle.
4. **Jokers**: When a Jack/Joker is drawn, any player can grab the bottle.
5. **Winning**: The winner of a bottle grab gives their used stack to opponents.
6. **Penalties**: Wrong grabs result in collecting all other players' used stacks.
7. **Victory**: First player to empty their draw deck and have no active card wins.

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, TypeScript, Socket.IO Client
- **Real-time**: WebSocket communication for instant multiplayer updates

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Client runs on http://localhost:3000

## How to Play

1. **Join Game**: Enter your name and join the lobby
2. **Wait for Players**: Game requires 2-4 players
3. **Start Game**: Any player can start when ready
4. **Draw Cards**: Click "Draw Card" when it's your turn
5. **Grab Bottle**: Click the bottle when cards match or jokers appear
6. **Win**: Empty your deck first to win!

## Features

- Real-time multiplayer gameplay
- Visual card representation with suits and colors
- Circular player layout mimicking physical game
- Turn-based drawing with visual indicators
- Bottle grab mechanics with cooldown
- Penalty system for incorrect grabs
- Win condition detection

## Game Components

### Backend (`/backend`)
- `server.js`: Main server with Socket.IO and game logic
- Game state management
- Real-time event handling
- Rule validation and enforcement

### Frontend (`/frontend/src`)
- `App.tsx`: Main application component
- `components/`: Game UI components
  - `GameBoard.tsx`: Main game area
  - `PlayerCard.tsx`: Individual player display
  - `JoinForm.tsx`: Initial join screen
  - `Lobby.tsx`: Pre-game waiting area
- `hooks/useSocket.ts`: Socket.IO connection management
- `types/game.ts`: TypeScript type definitions

## Development

The game uses a client-server architecture where:
- Server maintains authoritative game state
- Clients send actions (draw card, grab bottle)
- Server validates and broadcasts state updates
- All clients stay synchronized in real-time

## Future Enhancements

- Room/lobby system for multiple games
- Spectator mode
- Game replay system
- Enhanced graphics and animations
- Mobile responsiveness improvements