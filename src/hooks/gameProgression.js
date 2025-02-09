import { bestHandEvaluation, HAND_RANKINGS } from "./PokerEvaluator";

export const progressGame = (state, setState) => {
    if (!state.bettingRoundOver) return;

    const newDeck = [...state.deck];
    let newCommunityCards = [...state.communityCards];

    if (state.gameStatus === "flop") {
        newCommunityCards = [newDeck.pop(), newDeck.pop(), newDeck.pop()];
        setState(prev => ({ ...prev, gameStatus: "turn" }));
    } else if (state.gameStatus === "turn") {
        newCommunityCards.push(newDeck.pop());
        setState(prev => ({ ...prev, gameStatus: "river" }));
    } else if (state.gameStatus === "river") {
        newCommunityCards.push(newDeck.pop());
        setState(prev => ({ ...prev, gameStatus: "showdown" }));
        determineWinner(state, setState);
    }

    setState(prev => ({
        ...prev,
        deck: newDeck,
        communityCards: newCommunityCards,
        bettingRoundOver: false,
    }));
};

export const determineWinner = (state, setState) => {
    const userBest = bestHandEvaluation([...state.userHand, ...state.communityCards]);
    const aiBest = bestHandEvaluation([...state.aiHand, ...state.communityCards]);

    let winnerMessage;
    let newUserChips = state.userChips;
    let newAiChips = state.aiChips;

    if (!userBest || !aiBest) {
        winnerMessage = "Tie";
    } else {
        const userScore = [HAND_RANKINGS[userBest[0]], userBest[1]];
        const aiScore = [HAND_RANKINGS[aiBest[0]], aiBest[1]];

        if (userScore > aiScore) {
            winnerMessage = `User Wins with ${userBest[0]}`;
            newUserChips += state.pot;
        } else if (aiScore > userScore) {
            winnerMessage = `AI Wins with ${aiBest[0]}`;
            newAiChips += state.pot;
        } else {
            winnerMessage = "Tie";
            newUserChips += state.pot / 2;
            newAiChips += state.pot / 2;
        }
    }

    setState(prev => ({
        ...prev,
        winner: winnerMessage,
        userChips: Math.max(newUserChips, 0),  // Prevent negative chips
        aiChips: Math.max(newAiChips, 0),  // Prevent negative chips
        bettingRoundOver: true,
    }));
};