import getAIMove from "../utils/AIManager";
import { progressGame } from "../hooks/gameProgression";

export const placeBet = (state, setState, amount) => {
    if (state.userChips < amount || state.bettingRoundOver) return;
    
    setState(prev => ({
        ...prev,
        userChips: prev.userChips - amount,
        pot: prev.pot + amount,
        currentBet: amount,
        bettingRoundOver: true,
        userMoves: [...prev.userMoves, `User Bet: ${amount}`],
    }));

    getAIMoveDecision(state, setState);
};

export const callBet = (state, setState) => {
    if (state.aiChips < state.currentBet || state.bettingRoundOver) return;

    setState(prev => ({
        ...prev,
        aiChips: prev.aiChips - prev.currentBet,
        pot: prev.pot + prev.currentBet,
        bettingRoundOver: true,
        userMoves: [...prev.userMoves, "User Called"],
    }));

    // ✅ Automatically progress the game after both user & AI finish betting
    progressGame(state, setState);
};

export const fold = (state, setState) => {
    setState(prev => ({
        ...prev,
        winner: "AI Wins - You Folded!",
        aiChips: prev.aiChips + prev.pot,
        bettingRoundOver: true,
        userMoves: [...prev.userMoves, "User Folded"],
    }));
};

export const getAIMoveDecision = async (state, setState) => {
    if (state.bettingRoundOver) return;

    const gameState = {
        aiHand: state.aiHand,
        communityCards: state.communityCards,
        pot: state.pot,
        aiChips: state.aiChips,
        userChips: state.userChips,
        currentBet: state.currentBet,
    };

    const aiDecision = await getAIMove(gameState);

    setState(prev => ({
        ...prev,
        aiMoves: [...prev.aiMoves, `AI Decision: ${aiDecision}`],
    }));



    if (aiDecision.toLowerCase().includes("fold")) {
        setState(prev => ({
            ...prev,
            winner: "User Wins - AI Folded!",
            userChips: prev.userChips + prev.pot,
            bettingRoundOver: true,
        }));
    } else if (aiDecision.toLowerCase().includes("call")) {
        setState(prev => ({
            ...prev,
            aiChips: prev.aiChips - prev.currentBet,
            pot: prev.pot + prev.currentBet,
            bettingRoundOver: true,
        }));

        // ✅ Automatically progress game when AI calls
        progressGame(state, setState);
    } else if (aiDecision.toLowerCase().includes("raise")) {
        const raiseAmount = parseInt(aiDecision.split(" ")[1]) || 50;
        if (state.aiChips >= raiseAmount) {
            setState(prev => ({
                ...prev,
                aiChips: prev.aiChips - raiseAmount,
                pot: prev.pot + raiseAmount,
                currentBet: raiseAmount,
                bettingRoundOver: true,
            }));
        }
    }
};