const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const CARDS = [
  'AS', 'AC', 'AD', 'AH',
  '2S', '2C', '2D', '2H',
  '3S', '3C', '3D', '3H',
  '4S', '4C', '4D', '4H',
  '5S', '5C', '5D', '5H',
  '6S', '6C', '6D', '6H',
  '7S', '7C', '7D', '7H',
  '8S', '8C', '8D', '8H',
  '9S', '9C', '9D', '9H',
  'TS', 'TC', 'TD', 'TH',
  'JS', 'JC', 'JD', 'JH',
  'QS', 'QC', 'QD', 'QH',
  'KS', 'KC', 'KD', 'KH'
];

class JungleSpeedGame {
  constructor() {
    this.players = [];
    this.gameState = 'waiting';
    this.currentPlayerIndex = 0;
    this.bank = [];
    this.canGrabBottle = false;
    this.bottleGrabCooldown = false;
    this.activeCards = new Map();
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  addPlayer(playerId, playerName) {
    if (this.players.length >= 4) return false;
    
    const player = {
      id: playerId,
      name: playerName,
      drawDeck: [],
      usedStack: [],
      activeCard: null
    };
    
    this.players.push(player);
    return true;
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    if (this.players.length < 2 && this.gameState === 'playing') {
      this.gameState = 'waiting';
    }
  }

  startGame() {
    if (this.players.length < 2) return false;
    
    const shuffledCards = [...CARDS].sort(() => Math.random() - 0.5);
    const cardsPerPlayer = Math.floor(shuffledCards.length / this.players.length);
    
    this.players.forEach((player, index) => {
      player.drawDeck = shuffledCards.slice(
        index * cardsPerPlayer,
        (index + 1) * cardsPerPlayer
      );
      player.usedStack = [];
      player.activeCard = null;
    });
    
    this.gameState = 'playing';
    this.currentPlayerIndex = 0;
    this.bank = [];
    this.activeCards.clear();
    return true;
  }

  drawCard(playerId) {
    if (this.gameState !== 'playing') return { success: false, reason: 'Game not in progress' };
    if (this.bottleGrabCooldown) return { success: false, reason: 'Bottle grab cooldown active' };
    
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return { success: false, reason: 'Not your turn' };
    if (currentPlayer.drawDeck.length === 0) return { success: false, reason: 'No cards left' };
    
    const drawnCard = currentPlayer.drawDeck.pop();
    
    if (currentPlayer.activeCard) {
      currentPlayer.usedStack.push(currentPlayer.activeCard);
    }
    
    currentPlayer.activeCard = drawnCard;
    this.activeCards.set(currentPlayer.id, drawnCard);
    
    this.canGrabBottle = this.checkForMatches() || this.isJoker(drawnCard);
    
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    if (currentPlayer.drawDeck.length === 0 && currentPlayer.usedStack.length === 0) {
      this.gameState = 'finished';
      return { success: true, winner: currentPlayer.id };
    }
    
    return { success: true };
  }

  grabBottle(playerId) {
    if (this.gameState !== 'playing') return { success: false, reason: 'Game not in progress' };
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, reason: 'Player not found' };
    
    // Set cooldown temporarily
    this.bottleGrabCooldown = true;
    
    if (this.canGrabBottle) {
      if (this.isJokerActive()) {
        this.bank.push(...player.usedStack);
        player.usedStack = [];
      } else {
        const matchingPlayers = this.getMatchingPlayers();
        const opponent = matchingPlayers.find(p => p.id !== playerId);
        
        if (opponent) {
          player.drawDeck.unshift(...opponent.usedStack);
          opponent.usedStack = [];
          
          if (this.bank.length > 0) {
            player.drawDeck.unshift(...this.bank);
            this.bank = [];
          }
        }
      }
      
      // Reset bottle grab state after successful grab
      this.canGrabBottle = false;
      this.resetBottleState();
      return { success: true, type: 'correct' };
    } else {
      // Penalty: collect all other players' used stacks
      this.players.forEach(p => {
        if (p.id !== playerId) {
          player.drawDeck.unshift(...p.usedStack);
          p.usedStack = [];
        }
      });
      
      this.resetBottleState();
      return { success: true, type: 'penalty' };
    }
  }

  resetBottleState() {
    // Clear cooldown and reset bottle grab opportunity after 2 seconds
    setTimeout(() => {
      this.bottleGrabCooldown = false;
      // Check if there are still matches after the cooldown
      this.canGrabBottle = this.checkForMatches() || this.isJokerActive();
      // Emit updated state to all clients after cooldown
      if (this.io) {
        this.io.emit('game-state', this.getGameState());
      }
    }, 2000);
  }

  checkForMatches() {
    const activeCardValues = Array.from(this.activeCards.values());
    const cardCounts = {};
    
    activeCardValues.forEach(card => {
      const value = card.charAt(0);
      cardCounts[value] = (cardCounts[value] || 0) + 1;
    });
    
    return Object.values(cardCounts).some(count => count > 1);
  }

  getMatchingPlayers() {
    const matches = new Map();
    
    this.activeCards.forEach((card, playerId) => {
      const value = card.charAt(0);
      if (!matches.has(value)) {
        matches.set(value, []);
      }
      matches.get(value).push(this.players.find(p => p.id === playerId));
    });
    
    for (const [value, players] of matches) {
      if (players.length > 1) {
        return players;
      }
    }
    
    return [];
  }

  isJoker(card) {
    return card && card.charAt(0) === 'J';
  }

  isJokerActive() {
    return Array.from(this.activeCards.values()).some(card => this.isJoker(card));
  }

  getGameState() {
    return {
      gameState: this.gameState,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        drawDeckCount: p.drawDeck.length,
        usedStackCount: p.usedStack.length,
        activeCard: p.activeCard
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      bankCount: this.bank.length,
      canGrabBottle: this.canGrabBottle,
      bottleGrabCooldown: this.bottleGrabCooldown
    };
  }
}

const game = new JungleSpeedGame();
game.setIO(io);

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-game', (playerName) => {
    const success = game.addPlayer(socket.id, playerName);
    if (success) {
      socket.emit('joined-game', { playerId: socket.id });
      io.emit('game-state', game.getGameState());
    } else {
      socket.emit('join-failed', 'Game is full');
    }
  });

  socket.on('start-game', () => {
    if (game.startGame()) {
      io.emit('game-started');
      io.emit('game-state', game.getGameState());
    }
  });

  socket.on('draw-card', () => {
    const result = game.drawCard(socket.id);
    socket.emit('draw-result', result);
    io.emit('game-state', game.getGameState());
  });

  socket.on('grab-bottle', () => {
    const result = game.grabBottle(socket.id);
    socket.emit('grab-result', result);
    io.emit('game-state', game.getGameState());
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    game.removePlayer(socket.id);
    io.emit('game-state', game.getGameState());
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});