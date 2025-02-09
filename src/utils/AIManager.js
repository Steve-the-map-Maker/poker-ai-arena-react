import axios from "axios";
import Anthropic from '@anthropic-ai/sdk';

// Define the evaluateHandStrength function in this file
const evaluateHandStrength = (aiHand, communityCards) => {
  const allCards = [...aiHand, ...communityCards];
  if (allCards.length < 2) return 1; // Not enough info yet

  const highRanks = ["A", "K", "Q", "J", "T"]; // Cards considered high
  let score = 1;
  allCards.forEach(card => {
    if (highRanks.includes(card[0])) score += 2;
  });
  return Math.min(score, 10); // Cap the score at 10
};

const getOpenAIMove = async (gameState) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("API key is missing!");
    return "Error: Missing API Key";
  }
  
  const handStrength = evaluateHandStrength(gameState.aiHand, gameState.communityCards);
  
  const prompt = `
You are an AI poker player in a Texas Hold'em game. Here is the current game state:
- Your Hand: ${gameState.aiHand.join(", ")}
- Community Cards: ${gameState.communityCards.length > 0 ? gameState.communityCards.join(", ") : "None"}
- Pot Size: ${gameState.currentPot}
- AI Chips: ${gameState.aiChips}
- Opponent Chips: ${gameState.userChips}
- Current Bet to Call: ${gameState.currentBetAmount}
- Estimated Hand Strength (1-10): ${handStrength}

Make your decision based on the following:
- If hand strength is **1-3**, fold unless the call amount is very low.
- If hand strength is **4-6**, call unless the bet is very high.
- If hand strength is **7-10**, raise moderately.

Respond with one of the following:
- "Fold"
- "Call"
- "Raise {amount}" (only if you raise)
  `;

  console.log("AI API Request Sent:", prompt);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert Texas Hold'em AI." },
          { role: "user", content: prompt }
        ],
        max_tokens: 20
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("AI API Response:", response.data);
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error getting AI move:", error);
    return "Error";
  }
};

const validateClaudeApiKey = (apiKey) => {
  if (!apiKey) {
    console.error("Claude API key is missing");
    return false;
  }
  
  if (!apiKey.startsWith('sk-ant-')) {
    console.error("Claude API key appears invalid (should start with 'sk-ant-')");
    return false;
  }
  
  return true;
};

const getClaudeMove = async (gameState) => {
  console.log("Starting Claude move calculation...");
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!validateClaudeApiKey(apiKey)) {
    console.error("Defaulting to Fold due to API key issues");
    return "Fold";
  }

  const handStrength = evaluateHandStrength(gameState.aiHand, gameState.communityCards);

  try {
    console.log("Preparing Claude request...");
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",  // Updated to latest model
      max_tokens: 20,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: `You are a poker AI. Current state:
Hand: ${gameState.aiHand.join(", ")}
Cards: ${gameState.communityCards.length > 0 ? gameState.communityCards.join(", ") : "None"}
Pot: ${gameState.currentPot}
Chips: ${gameState.aiChips}
Opponent: ${gameState.userChips}
To Call: ${gameState.currentBetAmount}
Strength: ${handStrength}/10

If strength 1-3: fold unless call is very low
If strength 4-6: call unless bet is very high
If strength 7-10: raise moderately

Reply only: "Fold" or "Call" or "Raise {amount}"`
      }]
    });

    console.log("Claude API response received:", response);
    
    if (!response?.content?.[0]?.text) {
      console.error("Invalid response structure from Claude:", response);
      return "Fold";
    }

    const decision = response.content[0].text.trim();
    console.log("Raw Claude decision:", decision);

    if (!decision.match(/^(Fold|Call|Raise \d+)$/)) {
      console.error("Invalid Claude response format:", decision);
      return "Fold";
    }

    return decision;

  } catch (error) {
    console.error("Claude API error:", error);
    if (error.response) {
      console.error("Error details:", error.response?.data || error.response);
    }
    // Log specific error types
    if (error.type === 'not_found_error') {
      console.error("Model not found. Please check the model name.");
    }
    return "Fold";
  }
};

const getAIMove = async (gameState, aiType) => {
  console.log(`Getting move for ${aiType} with game state:`, gameState);
  
  try {
    let response;
    let retries = 0;
    const maxRetries = 2;

    while (retries < maxRetries) {
      try {
        if (aiType === 'openai') {
          response = await getOpenAIMove(gameState);
          break;
        } else if (aiType === 'claude') {
          console.log('Attempting Claude API call...');
          response = await getClaudeMove(gameState);
          if (response !== "Error") break;
        }
      } catch (error) {
        console.warn(`Attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries === maxRetries) {
          console.error(`All ${maxRetries} attempts failed`);
          return "Fold";
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Validate and sanitize response
    if (response === "Fold" || response === "Call") {
      return response;
    } else if (response.startsWith("Raise")) {
      const amount = parseInt(response.split(" ")[1]);
      if (!isNaN(amount) && amount > 0 && amount <= gameState.aiChips) {
        return `Raise ${amount}`;
      }
      return "Call";
    }

    return "Fold";
  } catch (error) {
    console.error(`Error in getAIMove for ${aiType}:`, error);
    return "Fold";
  }
};

export default getAIMove;
