const Game = () => {
  const gameState = useGameState();

  // In the parent component where GameControls is used
console.log('Game state:', {
    currentTurn,
    isUserTurn: currentTurn === 'user',
    phase: gameState.phase
  });
  
  return (
    <div className="game-container">
      {/* User Player */}
      <PlayerBox 
        player={gameState.players.find(p => p.id === "user")}
        isCurrentTurn={gameState.currentTurn === "user"}
        playerName="You"
      />
      
      {/* OpenAI Player */}
      <PlayerBox 
        player={gameState.players.find(p => p.id === "openai")}
        isCurrentTurn={gameState.currentTurn === "openai"}
        playerName="OpenAI"
      />
      
      {/* Claude Player */}
      <PlayerBox 
        player={gameState.players.find(p => p.id === "claude")}
        isCurrentTurn={gameState.currentTurn === "claude"}
        playerName="Claude"
      />
      
      {/* Community cards and other game elements */}
      <div className="community-cards">
        <h2>Community Cards</h2>
        {gameState.communityCards.map((card, index) => (
          <span key={index} className="card">{card}</span>
        ))}
      </div>
    </div>
  );
};

export default Game;