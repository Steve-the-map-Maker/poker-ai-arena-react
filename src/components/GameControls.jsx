// GameControls.jsx
import { useState, useEffect } from "react";

const GameControls = ({ 
  placeBet, 
  callBet, 
  fold, 
  userChips, 
  currentBet,
  isUserTurn,
  currentTurn,
  minimumBet = 20
}) => {
  const [betAmount, setBetAmount] = useState(minimumBet);

  // Update bet amount when turn changes
  useEffect(() => {
    setBetAmount(minimumBet);
  }, [currentTurn, minimumBet]);

  // Debug logging
  console.log('GameControls state:', {
    isUserTurn,
    currentTurn,
    currentBet,
    betAmount,
    userChips
  });

  // Validate actions
  const isValidBet = betAmount >= minimumBet && 
                     betAmount <= userChips && 
                     betAmount > currentBet;
  
  const canCall = userChips >= currentBet;
  const canFold = true; // Always allow folding when it's user's turn

  const handleBet = () => {
    console.log('Attempting bet:', betAmount);
    if (isValidBet) {
      placeBet(betAmount);
    }
  };

  const handleCall = () => {
    console.log('Attempting call');
    if (canCall) {
      callBet();
    }
  };

  const handleFold = () => {
    console.log('Attempting fold');
    fold();
  };

  return (
    <div className="controls">
      <h3>Your Chips: ${userChips}</h3>
      <h3>Current Bet: ${currentBet}</h3>
      {currentTurn && <h3>Current Turn: {currentTurn}</h3>}
      
      <div className="betting-controls">
        <input
          type="number"
          min={minimumBet}
          max={userChips}
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value) || minimumBet)}
          disabled={!isUserTurn}
        />
        <button 
          onClick={handleBet} 
          disabled={!isUserTurn || !isValidBet}
          className="bet-button"
        >
          Raise to ${betAmount}
        </button>
        <button 
          onClick={handleCall} 
          disabled={!isUserTurn || !canCall}
          className="call-button"
        >
          Call ${currentBet}
        </button>
        <button 
          onClick={handleFold} 
          disabled={!isUserTurn}
          className="fold-button"
        >
          Fold
        </button>
      </div>

      {isUserTurn && (
        <div className="betting-info">
          <p>Minimum bet: ${minimumBet}</p>
          {!isValidBet && betAmount > 0 && (
            <p className="error">
              {betAmount < minimumBet ? "Bet must be at least the minimum bet" :
               betAmount > userChips ? "Insufficient chips" :
               betAmount <= currentBet ? "Bet must be higher than current bet" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GameControls;
