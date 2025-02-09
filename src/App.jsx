import useGameState from "./hooks/useGameState"; 
import GameControls from "./components/GameControls";
import "./index.css";
import { useEffect } from 'react';

function App() {
  const gameState = useGameState();

  useEffect(() => {
    // Validate environment variables on startup
    const validateEnvironment = () => {
      const claudeKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!claudeKey?.startsWith('sk-ant-')) {
        console.error('Warning: Claude API key appears invalid');
      }
      
      if (!openaiKey?.startsWith('sk-')) {
        console.error('Warning: OpenAI API key appears invalid');
      }
    };

    validateEnvironment();
  }, []);

  const {
    players,
    communityCards,
    currentPot,
    phase,
    winner,
    gameOver,
    startNewHand,
    progressGame,
    placeBet,
    callBet,
    fold,
    currentBetAmount,
    moves,
    currentTurn,
    gameMessage
  } = gameState;

  // Extract all players info
  const user = players.find(p => p.id === "user") || {};
  const openai = players.find(p => p.id === "openai") || {};
  const claude = players.find(p => p.id === "claude") || {};

  return (
    <div className="app">
      <h1>Poker AI Arena</h1>
      <div className="game-message">{gameMessage}</div>
      
      {gameOver ? (
        <>
          <h2>{winner}</h2>
          <button onClick={() => window.location.reload()}>Restart Game</button>
        </>
      ) : (
        <>
          <button 
            onClick={startNewHand} 
            disabled={phase !== "INIT" && !winner}  
          >
            {winner ? "Next Hand" : "Start Game"}
          </button>

          {phase !== "INIT" && !winner && (
            <button 
              onClick={progressGame} 
              disabled={phase === "SHOWDOWN"}
            >
              {phase === "PREFLOP_BETTING" ? "Deal Flop" :
               phase === "POSTFLOP_BETTING" ? "Deal Turn" :
               phase === "POSTTURN_BETTING" ? "Deal River" :
               phase === "POSTRIVER_BETTING" ? "Showdown" : "Progress"}
            </button>
          )}

          <div className="game-area">
            <div className={`player-section ${currentTurn === 'user' ? 'active-turn' : ''}`}>
              <h2>Your Hand:</h2>
              {user.holeCards && user.holeCards.map((card, i) => (
                <span key={i}>{card} </span>
              ))}
              <div className="player-chips">
                Chips: ${user.chips}
              </div>
            </div>

            <div className={`player-section ${currentTurn === 'openai' ? 'active-turn' : ''}`}>
              <h2>OpenAI Hand:</h2>
              {phase === "SHOWDOWN"
                ? openai.holeCards && openai.holeCards.map((card, i) => (
                    <span key={i}>{card} </span>
                  ))
                : openai.holeCards && openai.holeCards.map((_, i) => (
                    <span key={i}>?? </span>
                  ))}
              <div className="player-chips">
                Chips: ${openai.chips}
              </div>
            </div>

            <div className={`player-section ${currentTurn === 'claude' ? 'active-turn' : ''}`}>
              <h2>Claude Hand:</h2>
              {phase === "SHOWDOWN"
                ? claude.holeCards && claude.holeCards.map((card, i) => (
                    <span key={i}>{card} </span>
                  ))
                : claude.holeCards && claude.holeCards.map((_, i) => (
                    <span key={i}>?? </span>
                  ))}
              <div className="player-chips">
                Chips: ${claude.chips}
              </div>
            </div>

            <div className="community-cards">
              <h2>Community Cards:</h2>
              {communityCards.map((card, i) => (
                <span key={i}>{card} </span>
              ))}
            </div>
          </div>

          <h2>Pot: ${currentPot}</h2>
          <h3>
            User: ${user.chips} | OpenAI: ${openai.chips} | Claude: ${claude.chips}
          </h3>
          <h2>Status: {phase}</h2>

          {winner && <h2>Winner: {winner}</h2>}

          <div className="move-history">
            <h3>Move History:</h3>
            <div className="history-log">
              {moves.user && moves.user.map((move, index) => (
                <p key={index} className="user-move">{move}</p>
              ))}
              {moves.openai && moves.openai.map((move, index) => (
                <p key={index} className="openai-move">{move}</p>
              ))}
              {moves.claude && moves.claude.map((move, index) => (
                <p key={index} className="claude-move">{move}</p>
              ))}
            </div>
          </div>

          {phase !== "INIT" && !winner && (
            <GameControls 
              placeBet={placeBet} 
              callBet={callBet} 
              fold={fold} 
              userChips={user.chips} 
              currentBet={currentBetAmount}
              isUserTurn={currentTurn === 'user'}
              currentTurn={currentTurn}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
