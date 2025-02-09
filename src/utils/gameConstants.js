export const GAME_PHASES = {
  INIT: "INIT",
  PREFLOP_BETTING: "PREFLOP_BETTING",
  POSTFLOP_BETTING: "POSTFLOP_BETTING",
  POSTTURN_BETTING: "POSTTURN_BETTING",
  POSTRIVER_BETTING: "POSTRIVER_BETTING",
  SHOWDOWN: "SHOWDOWN"
};

export const PLAYER_ORDER = ["user", "openai", "claude"];

export const GAME_MESSAGES = {
  INIT: "Click 'Start Game' to begin a new hand",
  PREFLOP_BETTING: "Pre-flop betting round: Call, raise, or fold",
  POSTFLOP_BETTING: "Post-flop betting round: Call, raise, or fold",
  POSTTURN_BETTING: "Post-turn betting round: Call, raise, or fold",
  POSTRIVER_BETTING: "Final betting round: Call, raise, or fold",
  SHOWDOWN: "Showdown! Best hand wins"
};

export const INITIAL_STATE = {
  deck: [],
  players: [
    { id: "user", chips: 1000, holeCards: [], currentBet: 0, hasFolded: false, isAllIn: false },
    { id: "openai", chips: 1000, holeCards: [], currentBet: 0, hasFolded: false, isAllIn: false },
    { id: "claude", chips: 1000, holeCards: [], currentBet: 0, hasFolded: false, isAllIn: false }
  ],
  communityCards: [],
  dealerPosition: 0,
  smallBlindValue: 10,
  bigBlindValue: 20,
  currentPot: 0,
  currentBetAmount: 20, // Set initial bet amount
  phase: "INIT",
  bettingRound: { 
    currentPlayerIndex: 0, // Start with first player (user)
    bettingComplete: false 
  },
  winner: null,
  moves: { user: [], openai: [], claude: [] },
  currentTurn: "user" // Set initial turn to user
};