import { GAME_PHASES, PLAYER_ORDER } from '../utils/gameConstants';
import { initializeDeck, dealCards } from '../utils/pokerLogic';

export const useGameProgress = (state, setState) => {
  const startNewHand = () => {
    const deck = initializeDeck();
    const { remainingDeck, dealtCards } = dealCards(deck, state.players.length * 2);
    
    setState(prev => ({
      ...prev,
      deck: remainingDeck,
      players: prev.players.map((player, index) => ({
        ...player,
        holeCards: dealtCards.slice(index * 2, (index + 1) * 2),
        currentBet: 0,
        hasFolded: false,
        isAllIn: false,
        hasActed: false  // Add this flag
      })),
      communityCards: [],
      currentPot: 0,
      currentBetAmount: prev.bigBlindValue,
      phase: GAME_PHASES.PREFLOP_BETTING,
      bettingRound: {
        currentPlayerIndex: 0, // Start with first player
        bettingComplete: false
      },
      winner: null,
      moves: { user: [], openai: [], claude: [] },
      currentTurn: PLAYER_ORDER[0] // Use player order to determine first turn
    }));
  };

  const isBettingRoundComplete = (players) => {
    // Get active players (not folded)
    const activePlayers = players.filter(player => !player.hasFolded);
    
    // If only one player remains, betting is complete
    if (activePlayers.length === 1) {
      return true;
    }

    // Check if all active players have acted and bets are equal
    const maxBet = Math.max(...players.map(p => p.currentBet));
    const allBetsMatched = activePlayers.every(player => 
      player.currentBet === maxBet && player.hasActed
    );

    return allBetsMatched;
  };

  const progressGame = () => {
    setState(prev => {
      const { players, bettingRound } = prev;
      
      // Check if betting round is complete
      if (!isBettingRoundComplete(players)) {
        console.log("Betting round not complete yet");
        return prev;
      }

      // Reset player actions for next round
      const updatedPlayers = players.map(player => ({
        ...player,
        hasActed: false,
        currentBet: 0
      }));

      // Find next active player
      const nextPlayerIndex = findNextActivePlayer(updatedPlayers);

      // Common state updates for next round
      const commonStateUpdate = {
        currentBetAmount: 0,
        players: updatedPlayers,
        bettingRound: {
          currentPlayerIndex: nextPlayerIndex,
          bettingComplete: false
        },
        currentTurn: PLAYER_ORDER[nextPlayerIndex]
      };

      switch (prev.phase) {
        case GAME_PHASES.PREFLOP_BETTING:
          const { remainingDeck: flopDeck, dealtCards: flopCards } = dealCards(prev.deck, 3);
          return {
            ...prev,
            ...commonStateUpdate,
            deck: flopDeck,
            communityCards: flopCards,
            phase: GAME_PHASES.POSTFLOP_BETTING,
          };

        case GAME_PHASES.POSTFLOP_BETTING:
          const { remainingDeck: turnDeck, dealtCards: [turnCard] } = dealCards(prev.deck, 1);
          return {
            ...prev,
            ...commonStateUpdate,
            deck: turnDeck,
            communityCards: [...prev.communityCards, turnCard],
            phase: GAME_PHASES.POSTTURN_BETTING,
          };

        case GAME_PHASES.POSTTURN_BETTING:
          const { remainingDeck: riverDeck, dealtCards: [riverCard] } = dealCards(prev.deck, 1);
          return {
            ...prev,
            ...commonStateUpdate,
            deck: riverDeck,
            communityCards: [...prev.communityCards, riverCard],
            phase: GAME_PHASES.POSTRIVER_BETTING,
          };

        case GAME_PHASES.POSTRIVER_BETTING:
          return {
            ...prev,
            phase: GAME_PHASES.SHOWDOWN,
            bettingRound: {
              ...prev.bettingRound,
              bettingComplete: true
            },
            currentTurn: null // No active turn during showdown
          };

        default:
          return prev;
      }
    });
  };

  // Helper function to find next active player
  const findNextActivePlayer = (players, startIndex = 0) => {
    let index = startIndex;
    const playerCount = players.length;
    
    for (let i = 0; i < playerCount; i++) {
      const nextIndex = (index + i) % playerCount;
      if (!players[nextIndex].hasFolded) {
        return nextIndex;
      }
    }
    
    return startIndex; // Fallback to starting player if no active players found
  };

  return { startNewHand, progressGame };
};