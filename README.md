# Texas Hold'em Poker AI Arena
A React-based poker game with OpenAI-powered opponent

## 📁 Project Structure & Technical Documentation

```
/poker-ai-arena-react
│── /public
│── /src
│   ├── /components
│   │   ├── GameControls.jsx    # Betting interface controls
│   │   └── PlayerBox.jsx       # Player information display
│   ├── /hooks
│   │   └── useGameState.js     # Central game state management
│   ├── /utils
│   │   ├── AIManager.js        # AI decision making logic
│   │   ├── pokerLogic.js       # Core poker game utilities
│   │   └── PokerEvaluator.js   # Hand evaluation logic
│   ├── App.jsx                 # Main application component
│   └── index.css              # Global styles
```

## 🎮 Core Game Logic

### useGameState.js
Central game state management hook that coordinates all game actions.

**Key Functions:**
- `startNewHand()`: Initializes new round, deals cards, sets blinds
- `placeBet(amount)`: Handles betting actions
- `callBet()`: Matches current bet amount
- `fold()`: Handles player folding
- `progressGame()`: Advances game phases (flop, turn, river)
- `determineWinner()`: Evaluates hands at showdown
- `getAIMoveDecision()`: Triggers AI decision making

**State Management:**
```javascript
{
  deck: [],                    // Current deck of cards
  players: [],                 // Player information including chips and cards
  communityCards: [],          // Shared community cards
  currentPot: 0,              // Total pot amount
  phase: "INIT",              // Current game phase
  currentTurn: null,          // Tracks active player
  currentBetAmount: 0,        // Highest bet amount
  winner: null                // Winner information
}
```

### AIManager.js
Handles AI opponent decision making through OpenAI integration.

**Key Functions:**
- `getAIMove(gameState)`: Sends game state to OpenAI API
- Response processing for fold/call/raise decisions
- Hand strength evaluation for AI decisions

### PokerEvaluator.js
Poker hand evaluation logic.

**Key Functions:**
- `bestHandEvaluation(cards)`: Determines best 5-card hand
- `HAND_RANKINGS`: Enumerated hand rankings
- Helper functions for identifying:
  - Straight flushes
  - Four of a kind
  - Full houses
  - Flushes
  - Straights
  - Three of a kind
  - Two pair
  - Pairs

### pokerLogic.js
Core game utilities and helper functions.

**Key Functions:**
- `initializeDeck()`: Creates and shuffles deck
- `checkBettingRoundComplete()`: Verifies betting round completion
- Card manipulation utilities

## 🎨 Components

### App.jsx
Main application component that orchestrates the game flow.

**Features:**
- Game state integration via useGameState
- Player/AI hand display
- Community card display
- Game controls integration
- Move history tracking
- Game phase progression

### GameControls.jsx
User interface for betting actions.

**Features:**
- Bet amount input
- Call/Raise/Fold buttons
- Dynamic enabling/disabling based on game state
- Current bet display

## 🔄 Game Flow

1. **Game Initialization**
   - Deck shuffled
   - Players assigned positions
   - Blinds posted

2. **Betting Rounds**
   - Pre-flop
   - Flop
   - Turn
   - River

3. **Player Actions**
   - Check/Call
   - Bet/Raise
   - Fold

4. **AI Integration**
   - Game state evaluation
   - OpenAI API consultation
   - Decision execution

5. **Showdown**
   - Hand evaluation
   - Winner determination
   - Pot distribution

## 🤖 AI Decision Making

The AI opponent uses OpenAI's GPT model to make decisions based on:
- Current hand strength
- Pot odds
- Position
- Betting patterns
- Community cards

## 🎯 Implementation Details

### State Updates
All state updates are handled through the `setState` function in useGameState:
```javascript
setState((prev) => ({
  ...prev,
  // Specific updates
}));
```

### Betting Logic
Managed through a combination of:
- Current bet tracking
- Pot size management
- Player chip tracking
- All-in situations

### Hand Evaluation
Implements standard poker hand rankings:
1. Royal Flush
2. Straight Flush
3. Four of a Kind
4. Full House
5. Flush
6. Straight
7. Three of a Kind
8. Two Pair
9. One Pair
10. High Card

## 🚀 Future Improvements

1. Multiple AI opponents
2. Advanced betting strategies
3. Hand history analysis
4. Player statistics tracking
5. Tournament mode
6. Multiplayer support

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```