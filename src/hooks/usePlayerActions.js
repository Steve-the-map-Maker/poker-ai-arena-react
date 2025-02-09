import { PLAYER_ORDER } from '../utils/gameConstants';
import getAIMove from '../utils/AIManager';

export const usePlayerActions = (state, setState) => {
  const checkForWinByFolds = (players) => {
    // Count active (non-folded) players
    const activePlayers = players.filter(player => !player.hasFolded);
    
    if (activePlayers.length === 1) {
      console.log(`Winner by folds: ${activePlayers[0].id}`);
      return activePlayers[0].id;
    }
    return null;
  };

  const handleWinner = (prev, players, moves, winner, potAddition = 0) => {
    const winningPlayer = players.find(p => p.id === winner);
    const totalPot = prev.currentPot + potAddition;
    
    console.log(`${winner} wins pot of ${totalPot}`);
    winningPlayer.chips += totalPot;
    
    // Add winning message to moves history
    moves[winner] = [
      ...(moves[winner] || []),
      `${winner} wins ${totalPot} chips`
    ];

    return {
      ...prev,
      players,
      moves,
      currentPot: 0,
      winner,
      bettingRound: {
        ...prev.bettingRound,
        bettingComplete: true
      },
      currentTurn: null
    };
  };

  const handleBet = (action, amount = 0) => {
    setState(prev => {
      const players = [...prev.players];
      const currentPlayerIndex = prev.bettingRound.currentPlayerIndex;
      const moves = { ...prev.moves };

      // Mark current player as having acted
      players[currentPlayerIndex].hasActed = true;

      // Process the bet
      if (action === 'fold') {
        players[currentPlayerIndex].hasFolded = true;
      } else if (action === 'call') {
        const callAmount = prev.currentBetAmount - players[currentPlayerIndex].currentBet;
        players[currentPlayerIndex].chips -= callAmount;
        players[currentPlayerIndex].currentBet += callAmount;
      } else if (action === 'raise') {
        players[currentPlayerIndex].chips -= amount;
        players[currentPlayerIndex].currentBet = amount;
      }

      // Record the move
      const playerType = players[currentPlayerIndex].id;
      moves[playerType] = [...(moves[playerType] || []), `${action} ${amount || ''}`];

      return handleBetStateUpdate(prev, players, moves, action, amount);
    });
  };

  const isBettingRoundComplete = (players, currentBetAmount) => {
    // Get active players (not folded)
    const activePlayers = players.filter(p => !p.hasFolded);
    
    // If only one player remains, betting is complete
    if (activePlayers.length === 1) {
      return true;
    }

    // Get highest bet among all players
    const highestBet = Math.max(...players.map(p => p.currentBet));

    // Check if all active players have either:
    // 1. Matched the highest bet and acted
    // 2. Folded
    // 3. Gone all-in
    return activePlayers.every(p => 
      (p.currentBet === highestBet && p.hasActed) || 
      p.hasFolded || 
      p.isAllIn
    );
  };

  const findNextActivePlayer = (players, currentIndex) => {
    const startIndex = (currentIndex + 1) % players.length;
    let nextIndex = startIndex;
    const highestBet = Math.max(...players.map(p => p.currentBet));

    do {
      // A player should act again if they:
      // 1. Haven't folded
      // 2. Haven't matched the highest bet
      // 3. Haven't gone all-in
      if (!players[nextIndex].hasFolded && 
          !players[nextIndex].isAllIn && 
          (players[nextIndex].currentBet < highestBet || !players[nextIndex].hasActed)) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % players.length;
    } while (nextIndex !== startIndex);

    // If no one needs to act, return null
    return null;
  };

  const handleBetStateUpdate = (prev, players, moves, action, amount) => {
    const currentIndex = prev.bettingRound.currentPlayerIndex;
    const highestBet = Math.max(...players.map(p => p.currentBet));

    // Log detailed state for debugging
    console.log('Current betting state:', {
      action,
      amount,
      currentBet: prev.currentBetAmount,
      activePlayer: players[currentIndex].id,
      highestBet,
      playerStates: players.map(p => ({
        id: p.id,
        hasActed: p.hasActed,
        currentBet: p.currentBet,
        hasFolded: p.hasFolded
      }))
    });

    // Check for win by folds
    const winner = checkForWinByFolds(players);
    if (winner) {
      return handleWinner(prev, players, moves, winner, amount);
    }

    // Check if all active players have acted and bets are equal
    const activePlayers = players.filter(p => !p.hasFolded && !p.isAllIn);
    const allPlayersActed = activePlayers.every(p => 
      p.hasActed && p.currentBet === highestBet
    );

    if (allPlayersActed) {
      console.log('All players have acted and bets are equal - round complete');
      // Reset for next betting round
      players.forEach(p => {
        p.hasActed = false;
        p.currentBet = 0;
      });

      return {
        ...prev,
        players,
        moves,
        currentPot: prev.currentPot + amount,
        currentBetAmount: 0,
        bettingRound: {
          currentPlayerIndex: 0, // Reset to first player for next phase
          bettingComplete: true
        },
        currentTurn: null,
        phaseComplete: true // Add this flag to indicate phase completion
      };
    }

    // Find next player who needs to act
    let nextIndex = (currentIndex + 1) % players.length;
    let foundNextPlayer = false;
    let loopCount = 0;

    while (!foundNextPlayer && loopCount < players.length) {
      if (!players[nextIndex].hasFolded && 
          !players[nextIndex].isAllIn && 
          (!players[nextIndex].hasActed || players[nextIndex].currentBet < highestBet)) {
        foundNextPlayer = true;
      } else {
        nextIndex = (nextIndex + 1) % players.length;
        loopCount++;
      }
    }

    if (!foundNextPlayer) {
      console.log('No more players need to act - round complete');
      players.forEach(p => {
        p.hasActed = false;
        p.currentBet = 0;
      });

      return {
        ...prev,
        players,
        moves,
        currentPot: prev.currentPot + amount,
        currentBetAmount: 0,
        bettingRound: {
          currentPlayerIndex: 0,
          bettingComplete: true
        },
        currentTurn: null,
        phaseComplete: true
      };
    }

    console.log(`Next player to act: ${players[nextIndex].id}`);
    return {
      ...prev,
      players,
      moves,
      currentBetAmount: Math.max(prev.currentBetAmount, amount),
      currentPot: prev.currentPot + amount,
      bettingRound: {
        currentPlayerIndex: nextIndex,
        bettingComplete: false
      },
      currentTurn: PLAYER_ORDER[nextIndex],
      phaseComplete: false
    };
  };

  const getAIMoveDecision = async () => {
    console.log("AI move triggered for:", state.currentTurn);
    
    // Early return conditions
    if (state.bettingRound.bettingComplete) {
      console.log("Skipping AI move - betting complete");
      return;
    }

    const currentPlayer = state.players[state.bettingRound.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id === 'user') {
      console.log("Skipping AI move - not AI's turn");
      return;
    }

    const highestBet = Math.max(...state.players.map(p => p.currentBet));
    
    // Only skip if player has acted AND their bet matches highest bet
    if (currentPlayer.hasActed && currentPlayer.currentBet === highestBet) {
      console.log("Player has already acted and matched highest bet");
      return;
    }

    try {
      const aiType = currentPlayer.id;
      const gameStateForAI = {
        aiHand: currentPlayer.holeCards,
        communityCards: state.communityCards,
        currentPot: state.currentPot,
        aiChips: currentPlayer.chips,
        userChips: state.players.find(p => p.id === "user").chips,
        currentBetAmount: state.currentBetAmount,
      };

      const aiDecision = await getAIMove(gameStateForAI, aiType);
      console.log(`${aiType} decision received:`, aiDecision);

      setState(prev => {
        const players = [...prev.players];
        const currentPlayerIndex = prev.bettingRound.currentPlayerIndex;
        const moves = { ...prev.moves };

        // Mark that this player has acted
        players[currentPlayerIndex].hasActed = true;

        // Process AI decision
        let betAmount = 0;
        if (aiDecision.startsWith('Raise')) {
          betAmount = parseInt(aiDecision.split(' ')[1]);
          if (betAmount <= players[currentPlayerIndex].chips) {
            players[currentPlayerIndex].chips -= betAmount;
            players[currentPlayerIndex].currentBet = betAmount;
          }
        } else if (aiDecision === 'Call') {
          betAmount = prev.currentBetAmount - players[currentPlayerIndex].currentBet;
          if (betAmount <= players[currentPlayerIndex].chips) {
            players[currentPlayerIndex].chips -= betAmount;
            players[currentPlayerIndex].currentBet += betAmount;
          }
        } else {
          players[currentPlayerIndex].hasFolded = true;
        }

        // Record the move
        moves[aiType] = [...(moves[aiType] || []), `${aiType} ${aiDecision}`];

        return handleBetStateUpdate(prev, players, moves, aiDecision, betAmount);
      });
    } catch (error) {
      console.error("Error processing AI move:", error);
    }
  };

  // Helper function to calculate bet amounts
  const getActionAmount = (action, gameState, player) => {
    if (action === 'Fold') return 0;
    if (action === 'Call') {
      return Math.min(
        gameState.currentBetAmount - player.currentBet,
        player.chips
      );
    }
    if (action.startsWith('Raise')) {
      return Math.min(
        parseInt(action.split(' ')[1]),
        player.chips
      );
    }
    return 0;
  };

  return { getAIMoveDecision, handleBet };
};