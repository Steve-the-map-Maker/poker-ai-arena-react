import { evaluateHand } from '../utils/PokerEvaluator';

export const useHandEvaluation = (state, setState) => {
  const determineWinner = () => {
    const activePlayers = state.players.filter(p => !p.hasFolded);
    
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      setState(prev => ({
        ...prev,
        winner: `${winner.id} wins (others folded)`,
        players: prev.players.map(p => 
          p.id === winner.id 
            ? { ...p, chips: p.chips + prev.currentPot }
            : p
        ),
        currentPot: 0
      }));
      return;
    }

    const playerScores = activePlayers.map(player => ({
      player,
      score: evaluateHand([...player.holeCards, ...state.communityCards])
    }));

    playerScores.sort((a, b) => b.score - a.score);
    const winner = playerScores[0].player;

    setState(prev => ({
      ...prev,
      winner: `${winner.id} wins with ${playerScores[0].score}`,
      players: prev.players.map(p => 
        p.id === winner.id 
          ? { ...p, chips: p.chips + prev.currentPot }
          : p
      ),
      currentPot: 0
    }));
  };

  return { determineWinner };
};