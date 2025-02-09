import React from 'react';
import './PlayerBox.css';

const PlayerBox = ({ player, isCurrentTurn, playerName }) => {
  return (
    <div 
      className={`player-box ${isCurrentTurn ? 'active-turn' : ''}`}
      style={{
        border: isCurrentTurn ? '2px solid white' : '2px solid transparent',
        boxShadow: isCurrentTurn ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <h2>{playerName}</h2>
      <div className="chips">Chips: ${player.chips}</div>
      <div className="cards">
        {player.id === "user" ? (
          // Show user's cards
          player.holeCards.map((card, index) => (
            <span key={index} className="card">{card}</span>
          ))
        ) : (
          // Show AI's cards only during showdown, otherwise show back of cards
          gameState.phase === "SHOWDOWN" ? (
            player.holeCards.map((card, index) => (
              <span key={index} className="card">{card}</span>
            ))
          ) : (
            <span className="card-back">🂠 🂠</span>
          )
        )}
      </div>
    </div>
  );
};

export default PlayerBox;