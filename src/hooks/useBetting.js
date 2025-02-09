import { PLAYER_ORDER } from '../utils/gameConstants';

export const useBetting = (state, setState, getAIMoveDecision) => {
  const handleTurnChange = (nextTurn) => {
    if (nextTurn !== 'user') {
      setTimeout(() => {
        getAIMoveDecision();
      }, 1000);
    }
  };

  const placeBet = (amount) => {
    if (!amount || state.currentTurn !== 'user') return;

    setState(prev => {
      const currentPlayer = prev.players[prev.bettingRound.currentPlayerIndex];
      if (amount > currentPlayer.chips) return prev;

      const players = [...prev.players];
      const currentPlayerIndex = prev.bettingRound.currentPlayerIndex;
      const moves = { ...prev.moves };

      // Update player chips and bet
      players[currentPlayerIndex] = {
        ...players[currentPlayerIndex],
        chips: players[currentPlayerIndex].chips - amount,
        currentBet: players[currentPlayerIndex].currentBet + amount
      };

      // Record the move
      moves.user = [...(moves.user || []), `Raise ${amount}`];

      // Find next non-folded player
      let nextPlayerIndex = (PLAYER_ORDER.indexOf(currentPlayer.id) + 1) % PLAYER_ORDER.length;
      while (players[nextPlayerIndex].hasFolded || players[nextPlayerIndex].isAllIn) {
        nextPlayerIndex = (nextPlayerIndex + 1) % PLAYER_ORDER.length;
        if (nextPlayerIndex === currentPlayerIndex) break;
      }

      const nextTurn = PLAYER_ORDER[nextPlayerIndex];

      // Schedule AI move if next turn is AI
      if (nextTurn !== 'user') {
        handleTurnChange(nextTurn);
      }

      return {
        ...prev,
        players,
        moves,
        currentPot: prev.currentPot + amount,
        currentBetAmount: Math.max(prev.currentBetAmount, amount),
        currentTurn: nextTurn,
        bettingRound: {
          currentPlayerIndex: nextPlayerIndex,
          bettingComplete: false
        }
      };
    });
  };

  const callBet = () => {
    setState(prev => {
      const currentPlayer = prev.players[prev.bettingRound.currentPlayerIndex];
      const callAmount = prev.currentBetAmount - currentPlayer.currentBet;
      
      if (callAmount > currentPlayer.chips) return prev;

      const players = [...prev.players];
      const currentPlayerIndex = prev.bettingRound.currentPlayerIndex;
      const moves = { ...prev.moves };

      // Update player chips and bet
      players[currentPlayerIndex] = {
        ...players[currentPlayerIndex],
        chips: players[currentPlayerIndex].chips - callAmount,
        currentBet: players[currentPlayerIndex].currentBet + callAmount
      };

      moves[currentPlayer.id] = [...(moves[currentPlayer.id] || []), `Call ${callAmount}`];

      // Find next non-folded player
      let nextPlayerIndex = (PLAYER_ORDER.indexOf(currentPlayer.id) + 1) % PLAYER_ORDER.length;
      const nextTurn = PLAYER_ORDER[nextPlayerIndex];

      // Schedule AI move if next turn is AI
      if (nextTurn !== 'user') {
        handleTurnChange(nextTurn);
      }

      return {
        ...prev,
        players,
        moves,
        currentPot: prev.currentPot + callAmount,
        currentTurn: nextTurn,
        bettingRound: {
          currentPlayerIndex: nextPlayerIndex,
          bettingComplete: false
        }
      };
    });
  };

  const fold = () => {
    if (state.currentTurn !== 'user') return;

    setState(prev => {
      const currentPlayer = prev.players[prev.bettingRound.currentPlayerIndex];
      const players = [...prev.players];
      const currentPlayerIndex = prev.bettingRound.currentPlayerIndex;
      const moves = { ...prev.moves };

      // Mark player as folded
      players[currentPlayerIndex] = {
        ...players[currentPlayerIndex],
        hasFolded: true
      };

      // Record the move
      moves.user = [...(moves.user || []), "Fold"];

      // Find next non-folded player
      let nextPlayerIndex = (PLAYER_ORDER.indexOf(currentPlayer.id) + 1) % PLAYER_ORDER.length;
      while (players[nextPlayerIndex].hasFolded || players[nextPlayerIndex].isAllIn) {
        nextPlayerIndex = (nextPlayerIndex + 1) % PLAYER_ORDER.length;
        if (nextPlayerIndex === currentPlayerIndex) break;
      }

      const nextTurn = PLAYER_ORDER[nextPlayerIndex];

      // Schedule AI move if next turn is AI
      if (nextTurn !== 'user') {
        handleTurnChange(nextTurn);
      }

      return {
        ...prev,
        players,
        moves,
        currentTurn: nextTurn,
        bettingRound: {
          currentPlayerIndex: nextPlayerIndex,
          bettingComplete: false
        }
      };
    });
  };

  return { placeBet, callBet, fold };
};