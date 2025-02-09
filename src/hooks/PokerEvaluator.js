const RANKS = "23456789TJQKA";

export const HAND_RANKINGS = {
    "High Card": 1,
    "One Pair": 2,
    "Two Pair": 3,
    "Three of a Kind": 4,
    "Straight": 5,
    "Flush": 6,
    "Full House": 7,
    "Four of a Kind": 8,
    "Straight Flush": 9,
    "Royal Flush": 10,
};

// Extract rank from card (e.g., "AS" -> "A", "10D" -> "T")
const extractRank = (card) => card.length === 3 ? "T" : card[0];

// Evaluate hand based on best 5-card combination
export const evaluateHand = (hand) => {
    let values = hand.map(card => RANKS.indexOf(extractRank(card))).sort((a, b) => b - a);
    let suits = hand.map(card => card.slice(-1));

    let isFlush = new Set(suits).size === 1;
    let uniqueValues = [...new Set(values)];
    let isStraight = uniqueValues.length === 5 && (uniqueValues[0] - uniqueValues[4] === 4);

    if (isFlush && isStraight) {
        return uniqueValues[0] === 12 ? ["Royal Flush", values] : ["Straight Flush", values];
    }

    let counts = values.reduce((acc, val) => ((acc[val] = (acc[val] || 0) + 1), acc), {});
    let sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1] || b[0] - a[0]);

    if (sortedCounts[0][1] === 4) return ["Four of a Kind", sortedCounts.flat().map(x => +x)];
    if (sortedCounts[0][1] === 3 && sortedCounts[1][1] === 2) return ["Full House", sortedCounts.flat().map(x => +x)];
    if (isFlush) return ["Flush", values];
    if (isStraight) return ["Straight", values];
    if (sortedCounts[0][1] === 3) return ["Three of a Kind", sortedCounts.flat().map(x => +x)];
    if (sortedCounts[0][1] === 2 && sortedCounts[1][1] === 2) return ["Two Pair", sortedCounts.flat().map(x => +x)];
    if (sortedCounts[0][1] === 2) return ["One Pair", sortedCounts.flat().map(x => +x)];
    
    return ["High Card", values];
};

// Find best hand from 7 cards
export const bestHandEvaluation = (sevenCards) => {
    let bestHand = null;
    let bestScore = null;

    for (let combo of combinations(sevenCards, 5)) {
        let evalResult = evaluateHand(combo);
        let score = [HAND_RANKINGS[evalResult[0]], evalResult[1]];
        if (!bestScore || score > bestScore) {
            bestScore = score;
            bestHand = evalResult;
        }
    }

    return bestHand;
};

// Generate all 5-card combinations from 7 cards
const combinations = (array, size) => {
    let result = [];
    const comboHelper = (start, combo) => {
        if (combo.length === size) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            combo.push(array[i]);
            comboHelper(i + 1, combo);
            combo.pop();
        }
    };
    comboHelper(0, []);
    return result;
};