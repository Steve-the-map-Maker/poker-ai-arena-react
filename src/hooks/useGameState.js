// useGameState.js
import { useState, useCallback, useEffect } from 'react';
import { INITIAL_STATE, GAME_PHASES, PLAYER_ORDER } from '../utils/gameConstants';
import { useBetting } from './useBetting';
import { useGameProgress } from './useGameProgress';
import { useHandEvaluation } from './useHandEvaluation';
import { usePlayerActions } from './usePlayerActions';

const useGameState = () => {
  const [state, setState] = useState(INITIAL_STATE);

  const { getAIMoveDecision } = usePlayerActions(state, setState);
  
  // Pass getAIMoveDecision to useBetting
  const { placeBet, callBet, fold } = useBetting(state, setState, getAIMoveDecision);
  const { startNewHand, progressGame } = useGameProgress(state, setState);
  const { determineWinner } = useHandEvaluation(state, setState);

  // Auto-trigger AI moves when game starts or after user action
  const handleGameStateChange = useCallback(() => {
    if (state.currentTurn && state.currentTurn !== 'user' && !state.bettingRound.bettingComplete) {
      getAIMoveDecision();
    }
  }, [state.currentTurn, state.bettingRound.bettingComplete]);

  // Effect to handle AI turns
  useEffect(() => {
    handleGameStateChange();
  }, [state.currentTurn, handleGameStateChange]);

  // Effect to progress game when betting and phase are complete
  useEffect(() => {
    if (state.bettingRound.bettingComplete && state.phaseComplete) {
      // Progress to next phase (FLOP, TURN, RIVER, or SHOWDOWN)
      progressGame();
    }
  }, [state.bettingRound.bettingComplete, state.phaseComplete]);

  // Auto-progress game when betting is complete
  const checkAndProgressGame = () => {
    const bettingComplete = state.players.every(player => 
      player.hasFolded || 
      player.isAllIn || 
      player.currentBet === state.currentBetAmount
    );

    if (bettingComplete) {
      progressGame();
      return true;
    }
    return false;
  };

  // Handle user actions
  const handleUserAction = (actionType, amount = 0) => {
    switch (actionType) {
      case 'bet':
        placeBet(amount);
        break;
      case 'call':
        callBet();
        break;
      case 'fold':
        fold();
        break;
      default:
        console.error('Unknown action type:', actionType);
        return;
    }

    // If betting isn't complete and next player is AI, trigger AI move
    if (!checkAndProgressGame() && state.currentTurn !== 'user') {
      setTimeout(() => getAIMoveDecision(), 1000);
    }
  };

  // Handle game progression
  const handleGameProgress = () => {
    switch (state.phase) {
      case GAME_PHASES.INIT:
        startNewHand();
        break;
      case GAME_PHASES.SHOWDOWN:
        determineWinner();
        break;
      default:
        if (checkAndProgressGame()) {
          progressGame();
        }
    }
  };

  return {
    // State
    ...state,
    
    // Game actions
    startNewHand,
    placeBet: (amount) => handleUserAction('bet', amount),
    callBet: () => handleUserAction('call'),
    fold: () => handleUserAction('fold'),
    progressGame: handleGameProgress,
    
    // AI handling
    getAIMoveDecision,
    
    // Helper methods
    isUserTurn: state.currentTurn === 'user',
    canBet: !state.bettingRound.bettingComplete && state.phase !== GAME_PHASES.SHOWDOWN,
    currentPlayer: state.players[state.bettingRound.currentPlayerIndex],
    minimumBet: state.bigBlindValue,
    
    // Game status
    gamePhase: state.phase,
    isGameOver: state.winner !== null,
    currentPotTotal: state.currentPot,
    activePlayers: state.players.filter(p => !p.hasFolded)
  };
};

export default useGameState;
