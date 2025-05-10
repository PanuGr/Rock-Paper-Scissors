// AI-Enhanced Difficulty System for Rock Paper Scissors


// Game state extension to include player history and AI difficulty
const aiGameState = {
  playerHistory: [],
  difficulty: 'medium', // 'easy', 'medium', 'hard', 'adaptive'
  adaptiveLevel: 0.5,   // 0-1 scale for adaptive difficulty
  winRatio: 0.5,        // Target win ratio for adaptive difficulty
};

/**
 * Make API call to OpenRouter AI for prediction
 * @param {Array} playerHistory - Array of player's previous moves
 * @returns {Promise<string>} - AI's prediction of player's next move
 */
async function getAIPrediction(playerHistory) {
  // Only make API call if we have sufficient history
  if (playerHistory.length < 3) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RhymeAI}`
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that predicts patterns in Rock Paper Scissors gameplay. Analyze the sequence and predict the most likely next move.'
          },
          {
            role: 'user',
            content: `Here is a sequence of player moves in Rock Paper Scissors: ${playerHistory.join(', ')}. Predict what they will play next. Respond with only "rock", "paper", or "scissors".`
          }
        ],
        max_tokens: 10
      })
    });

    const data = await response.json();
    const prediction = data.choices[0].message.content.trim().toLowerCase();

    // Validate the response is one of our valid moves
    if (['rock', 'paper', 'scissors'].includes(prediction)) {
      return prediction;
    }
    return null;
  } catch (error) {
    console.error('Error getting AI prediction:', error);
    return null;
  }
}

/**
 * Choose computer move based on difficulty level
 * @returns {Promise<string>} - The computer's move
 */
async function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  let computerChoice;

  switch (aiGameState.difficulty) {
    case 'easy':
      /* 
      // Easy mode: 70% random, 30% makes losing moves
      if (Math.random() < 0.3 && aiGameState.playerHistory.length > 0) {
        const lastPlayerMove = aiGameState.playerHistory[aiGameState.playerHistory.length - 1];
        // Choose the move that loses to the player's last move
        const losingMoveMap = {
          'rock': 'scissors',  // Player's rock beats computer's scissors
          'paper': 'rock',     // Player's paper beats computer's rock
          'scissors': 'paper'  // Player's scissors beats computer's paper
        };
        computerChoice = losingMoveMap[lastPlayerMove];
      } else {
        // Random choice
        computerChoice = choices[Math.floor(Math.random() * 3)];
      } */
      computerChoice = choices[Math.floor(Math.random() * 3)];
      break;

    case 'medium':
      // Medium: 50% random, 50% based on simple pattern recognition
      if (Math.random() < 0.5 && aiGameState.playerHistory.length >= 3) {
        // Look for simple patterns like repetition
        const lastThree = aiGameState.playerHistory.slice(-3);
        if (lastThree[0] === lastThree[1] && lastThree[1] === lastThree[2]) {
          // Player repeated same move 3 times, they might do it again
          const expectedPlayerMove = lastThree[0];
          // Choose the move that beats the expected player move
          const winningMoveMap = {
            'rock': 'paper',     // Computer's paper beats player's rock
            'paper': 'scissors', // Computer's scissors beats player's paper
            'scissors': 'rock'   // Computer's rock beats player's scissors
          };
          computerChoice = winningMoveMap[expectedPlayerMove];
        } else {
          computerChoice = choices[Math.floor(Math.random() * 3)];
        }
      } else {
        computerChoice = choices[Math.floor(Math.random() * 3)];
      }
      break;

    case 'hard':
      // Hard: Use AI model to predict player's next move
      const aiPrediction = await getAIPrediction(aiGameState.playerHistory);

      if (aiPrediction) {
        // Choose the move that beats the predicted player move
        const winningMoveMap = {
          'rock': 'paper',     // Computer's paper beats player's rock
          'paper': 'scissors', // Computer's scissors beats player's paper
          'scissors': 'rock'   // Computer's rock beats player's scissors
        };
        computerChoice = winningMoveMap[aiPrediction];
      } else {
        // If no prediction available, fall back to medium difficulty
        computerChoice = choices[Math.floor(Math.random() * 3)];
      }
      break;
    /* 
        case 'adaptive':
          // Adaptive: Adjust difficulty based on player performance
          const currentWinRate = calculatePlayerWinRate();
    
          if (currentWinRate > aiGameState.winRatio) {
            // Player is winning too much, increase difficulty
            aiGameState.adaptiveLevel = Math.min(aiGameState.adaptiveLevel + 0.1, 1.0);
          } else if (currentWinRate < aiGameState.winRatio) {
            // Player is losing too much, decrease difficulty
            aiGameState.adaptiveLevel = Math.max(aiGameState.adaptiveLevel - 0.1, 0.0);
          }
    
          // Use adaptiveLevel to determine if we use AI prediction or random choice
          if (Math.random() < aiGameState.adaptiveLevel) {
            const aiPrediction = await getAIPrediction(aiGameState.playerHistory);
            if (aiPrediction) {
              const winningMoveMap = {
                'rock': 'paper',
                'paper': 'scissors',
                'scissors': 'rock'
              };
              computerChoice = winningMoveMap[aiPrediction];
            } else {
              computerChoice = choices[Math.floor(Math.random() * 3)];
            }
          } else {
            computerChoice = choices[Math.floor(Math.random() * 3)];
          }
          break;
     */
    default:
      computerChoice = choices[Math.floor(Math.random() * 3)];
  }

  return computerChoice;
}

/**
 * Calculate the player's win rate over recent games
 * @returns {number} - Win rate between 0 and 1
 */
/* 
function calculatePlayerWinRate() {
  // Only consider the last 10 games for adaptive difficulty
  const recentGames = Math.min(aiGameState.playerHistory.length, 10);
  if (recentGames === 0) return 0.5;

  let playerWins = 0;
  for (let i = 1; i <= recentGames; i++) {
    const gameIndex = aiGameState.playerHistory.length - i;
    const playerMove = aiGameState.playerHistory[gameIndex];
    const computerMove = aiGameState.computerHistory[gameIndex];

    if ((playerMove === 'rock' && computerMove === 'scissors') ||
      (playerMove === 'paper' && computerMove === 'rock') ||
      (playerMove === 'scissors' && computerMove === 'paper')) {
      playerWins++;
    }
  }

  return playerWins / recentGames;
}
 */

/**
 * Modified play function to use AI-enhanced computer choice
 */
async function playSinglePlayerGame() {
  const playerChoice = getUserChoice();

  if (!playerChoice) {
    resultDisplay.textContent = "Please select rock, paper, or scissors first!";
    resultDisplay.classList.add('text-danger');
    return;
  }

  resultDisplay.classList.remove('text-danger');

  // Add loading indicator for AI processing
  playButton.disabled = true;
  playButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Thinking...';

  // Record player's choice for pattern analysis
  aiGameState.playerHistory.push(playerChoice);

  // Get computer's choice with AI enhancement
  const computerChoice = await getComputerChoice();

  // Record computer's choice
  if (!aiGameState.computerHistory) aiGameState.computerHistory = [];
  aiGameState.computerHistory.push(computerChoice);

  // Display computer's choice
  displayComputerChoice(computerChoice);

  // Determine and display the winner
  const result = determineWinner(playerChoice, computerChoice);
  resultDisplay.textContent = result;

  // Add animation to the result
  resultDisplay.classList.add('result-animation');
  setTimeout(() => {
    resultDisplay.classList.remove('result-animation');
  }, 800);

  // Re-enable play button
  playButton.disabled = false;
  playButton.textContent = 'Play';
}

/**
 * Add difficulty selector to the UI
 */
function addDifficultySelector() {
  const difficultySelector = document.createElement('div');
  difficultySelector.className = 'mt-4';
  difficultySelector.innerHTML = `
    <label for="difficulty-select" class="form-label text-light">Difficulty:</label>
    <select id="difficulty-select" class="form-select w-auto mx-auto">
      <option value="easy">Easy</option>
      <option value="medium" selected>Medium</option>
      <option value="hard">Hard (AI-powered)</option>
      <option value="adaptive">Adaptive (AI-powered)</option>
    </select>
  `;

  // Insert before the play button
  playButton.parentNode.insertBefore(difficultySelector, playButton);

  // Add event listener
  document.getElementById('difficulty-select').addEventListener('change', (e) => {
    aiGameState.difficulty = e.target.value;

    // Reset adaptive level when changing difficulty
    if (aiGameState.difficulty === 'adaptive') {
      aiGameState.adaptiveLevel = 0.5;
    }
  });
}

// Initialize the AI features
document.addEventListener('DOMContentLoaded', () => {
  // Add the difficulty selector to the UI
  addDifficultySelector();

  // Replace the original play button event listener
  playButton.removeEventListener('click', playSinglePlayerGame);
  playButton.addEventListener('click', playSinglePlayerGame);
});
