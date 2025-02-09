const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['H', 'D', 'C', 'S'];

export const HAND_RANKINGS = {
  ROYAL_FLUSH: 10,
  STRAIGHT_FLUSH: 9,
  FOUR_OF_A_KIND: 8,
  FULL_HOUSE: 7,
  FLUSH: 6,
  STRAIGHT: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  ONE_PAIR: 2,
  HIGH_CARD: 1
};

export const evaluateHand = (cards) => {
  if (!cards || cards.length < 5) return 0;
  
  const ranks = cards.map(card => card[0]);
  const suits = cards.map(card => card[1]);
  
  // Evaluate hand strength
  if (isRoyalFlush(ranks, suits)) return HAND_RANKINGS.ROYAL_FLUSH;
  if (isStraightFlush(ranks, suits)) return HAND_RANKINGS.STRAIGHT_FLUSH;
  if (isFourOfAKind(ranks)) return HAND_RANKINGS.FOUR_OF_A_KIND;
  if (isFullHouse(ranks)) return HAND_RANKINGS.FULL_HOUSE;
  if (isFlush(suits)) return HAND_RANKINGS.FLUSH;
  if (isStraight(ranks)) return HAND_RANKINGS.STRAIGHT;
  if (isThreeOfAKind(ranks)) return HAND_RANKINGS.THREE_OF_A_KIND;
  if (isTwoPair(ranks)) return HAND_RANKINGS.TWO_PAIR;
  if (isOnePair(ranks)) return HAND_RANKINGS.ONE_PAIR;
  
  return HAND_RANKINGS.HIGH_CARD;
};

// Helper functions for hand evaluation
const isRoyalFlush = (ranks, suits) => {
  return isStraightFlush(ranks, suits) && ranks.includes('A');
};

const isStraightFlush = (ranks, suits) => {
  return isFlush(suits) && isStraight(ranks);
};

const isFourOfAKind = (ranks) => {
  const rankCounts = getRankCounts(ranks);
  return Object.values(rankCounts).some(count => count === 4);
};

const isFullHouse = (ranks) => {
  const rankCounts = getRankCounts(ranks);
  const counts = Object.values(rankCounts);
  return counts.includes(3) && counts.includes(2);
};

const isFlush = (suits) => {
  return new Set(suits).size === 1;
};

const isStraight = (ranks) => {
  const sortedRanks = [...new Set(ranks)]
    .map(r => RANKS.indexOf(r))
    .sort((a, b) => a - b);
  
  return sortedRanks.every((rank, i) => {
    if (i === 0) return true;
    return rank === sortedRanks[i - 1] + 1;
  });
};

const isThreeOfAKind = (ranks) => {
  const rankCounts = getRankCounts(ranks);
  return Object.values(rankCounts).some(count => count === 3);
};

const isTwoPair = (ranks) => {
  const rankCounts = getRankCounts(ranks);
  const pairs = Object.values(rankCounts).filter(count => count === 2);
  return pairs.length === 2;
};

const isOnePair = (ranks) => {
  const rankCounts = getRankCounts(ranks);
  return Object.values(rankCounts).some(count => count === 2);
};

const getRankCounts = (ranks) => {
  return ranks.reduce((counts, rank) => {
    counts[rank] = (counts[rank] || 0) + 1;
    return counts;
  }, {});
};

export const compareHands = (hand1, hand2) => {
  const score1 = evaluateHand(hand1);
  const score2 = evaluateHand(hand2);
  
  if (score1 > score2) return 1;
  if (score1 < score2) return -1;
  return 0;
};