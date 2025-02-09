const SUITS = ['H', 'D', 'C', 'S'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export const initializeDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(rank + suit);
    }
  }
  return shuffle(deck);
};

export const shuffle = (deck) => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const dealCards = (deck, count) => {
  const dealtCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { dealtCards, remainingDeck };
};

export const evaluateHandStrength = (holeCards, communityCards) => {
  // Simple hand strength evaluation (1-10)
  if (!holeCards || holeCards.length !== 2) return 1;
  
  const ranks = holeCards.map(card => card[0]);
  const suits = holeCards.map(card => card[1]);
  
  // Pair
  if (ranks[0] === ranks[1]) {
    return RANKS.indexOf(ranks[0]) >= 10 ? 8 : 6;
  }
  
  // Suited high cards
  if (suits[0] === suits[1]) {
    if (ranks.every(r => 'AKQJ'.includes(r))) return 7;
    if (ranks.some(r => 'AKQJ'.includes(r))) return 5;
  }
  
  // High cards
  if (ranks.some(r => 'AKQJ'.includes(r))) return 4;
  
  // Connected cards
  const rankIndices = ranks.map(r => RANKS.indexOf(r));
  if (Math.abs(rankIndices[0] - rankIndices[1]) === 1) return 3;
  
  return 2;
};

export const isValidBet = (amount, playerChips, currentBet, minBet) => {
  if (amount <= 0) return false;
  if (amount > playerChips) return false;
  if (amount < currentBet && amount !== playerChips) return false;
  if (amount < minBet) return false;
  return true;
};
