// Game state - Combined from both files
const gameState = {
  singlePlayer: {
    playerScore: 0,
    computerScore: 0
  },
  multiPlayer: {
    player1Choice: null,
    player2Choice: null
  },
  ai: {
    playerHistory: [],
    computerHistory: [],
    difficulty: 'medium', // 'easy', 'medium', 'hard', 'adaptive'
    adaptiveLevel: 0.5,   // 0-1 scale for adaptive difficulty
    winRatio: 0.5        // Target win ratio for adaptive difficulty
  }
};

// DOM Elements - Single Player
const playerChoices = document.querySelectorAll('[name="user"]');
const computerChoiceIcons = Array.from(document.querySelectorAll('.computer-choice'));
const playButton = document.getElementById('play-button');
const resultDisplay = document.getElementById('result');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
/* 
// DOM Elements - Multiplayer
const startButton = document.getElementById('start');
const multiplayerSection = document.getElementById('multiplayer-section');
const player1Form = document.getElementById('user1');
const player2Form = document.getElementById('user2');
const player1Choices = document.querySelectorAll('[name="user1"]');
const player2Choices = document.querySelectorAll('[name="user2"]');
const select1Button = document.getElementById('select1');
const select2Button = document.getElementById('select2');
const pvpResultDisplay = document.getElementById('pvp-result');
const loader = document.getElementById('loader');
 */

/**
 * Get the user's choice from radio buttons
 * @returns {string|null} The user's selection or null if none selected
 */
const getUserChoice = () => {
  const selectedChoice = Array.from(playerChoices).find(choice => choice.checked);
  return selectedChoice ? selectedChoice.value : null;
};

/**
 * Get a random choice for the computer
 * @returns {string} The computer's random selection
 */
const getRandomChoice = () => {
  const choices = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * 3);
  return choices[randomIndex];
};

/**
 * Make API call to AI for prediction (if available)
 * @param {Array} playerHistory - Array of player's previous moves
 * @returns {Promise<string|null>} - AI's prediction of player's next move or null
 */
async function getAIPrediction(playerHistory) {
  // Only make prediction if we have sufficient history
  if (playerHistory.length < 3) return null;

  // This is a simplified version that doesn't rely on external API
  // Instead, we'll implement basic pattern recognition
  
  // Check for patterns like repeated moves
  const lastThree = playerHistory.slice(-3);
  
  // If player used the same move three times in a row, they might do it again
  if (lastThree[0] === lastThree[1] && lastThree[1] === lastThree[2]) {
    return lastThree[0];
  }
  
  // Check for rotation pattern (rock->paper->scissors->rock)
  const rotationPattern = {
    'rock': 'paper',
    'paper': 'scissors',
    'scissors': 'rock'
  };
  
  if (lastThree[1] === rotationPattern[lastThree[0]] && 
      lastThree[2] === rotationPattern[lastThree[1]]) {
    return rotationPattern[lastThree[2]];
  }
  
  // If no pattern found, guess randomly with slight bias toward what they haven't played recently
  const choices = ['rock', 'paper', 'scissors'];
  const recentMoves = new Set(lastThree);
  const unusedMoves = choices.filter(move => !recentMoves.has(move));
  
  if (unusedMoves.length > 0) {
    // Higher chance to play a move they haven't used recently
    return unusedMoves[Math.floor(Math.random() * unusedMoves.length)];
  }
  
  // Fallback to random
  return getRandomChoice();
}

/**
 * Make API call to MistralAI for prediction
 * @param {Array} playerHistory - Array of player's previous moves
 * @returns {Promise<string|null>} - AI's prediction of player's next move or null
 */
async function getMistralAIPrediction(playerHistory) {
  // Only make prediction if we have sufficient history
  if (playerHistory.length < 3) return null;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_MISTRAL_API_KEY'
      },
      body: JSON.stringify({
        model: 'mistral-small', // Fast, low-cost model good for this task
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
    console.error('Error getting MistralAI prediction:', error);
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

  switch (gameState.ai.difficulty) {
    case 'easy':
      computerChoice = getRandomChoice();
      /* 
      // Easy mode: 70% random, 30% makes losing moves
      if (Math.random() < 0.3 && gameState.ai.playerHistory.length > 0) {
        const lastPlayerMove = gameState.ai.playerHistory[gameState.ai.playerHistory.length - 1];
        // Choose the move that loses to the player's last move
        const losingMoveMap = {
          'rock': 'scissors',  // Player's rock beats computer's scissors
          'paper': 'rock',     // Player's paper beats computer's rock
          'scissors': 'paper'  // Player's scissors beats computer's paper
        };
        computerChoice = losingMoveMap[lastPlayerMove];
      } else {
        // Random choice
        computerChoice = getRandomChoice();
      } */
      break;

    case 'medium':
      // Medium: 50% random, 50% based on simple pattern recognition
      if (Math.random() < 0.5 && gameState.ai.playerHistory.length >= 3) {
        // Look for simple patterns like repetition
        const lastThree = gameState.ai.playerHistory.slice(-3);
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
          computerChoice = getRandomChoice();
        }
      } else {
        computerChoice = getRandomChoice();
      }
      break;

    case 'hard':
      // Hard: Use AI model to predict player's next move
      const aiPrediction = await getAIPrediction(gameState.ai.playerHistory);

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
        computerChoice = getRandomChoice();
      }
      break;
      
    case 'adaptive':
      // Adaptive: Use MistralAI to predict player's next move
      const mistralPrediction = await getMistralAIPrediction(gameState.ai.playerHistory);
      
      if (mistralPrediction) {
        // Choose the move that beats the predicted player move
        const winningMoveMap = {
          'rock': 'paper',     // Computer's paper beats player's rock
          'paper': 'scissors', // Computer's scissors beats player's paper
          'scissors': 'rock'   // Computer's rock beats player's scissors
        };
        computerChoice = winningMoveMap[mistralPrediction];
      } else {
        // If no prediction available, fall back to the local AI prediction
        const localPrediction = await getAIPrediction(gameState.ai.playerHistory);
        if (localPrediction) {
          const winningMoveMap = {
            'rock': 'paper',
            'paper': 'scissors',
            'scissors': 'rock'
          };
          computerChoice = winningMoveMap[localPrediction];
        } else {
          computerChoice = getRandomChoice();
        }
      }
      break;
      
    default:
      computerChoice = getRandomChoice();
  }

  return computerChoice;
}

/**
 * Display the computer's choice with a visual indicator
 * @param {string} choice - The computer's selection
 */
const displayComputerChoice = (choice) => {
  // Hide all computer choice icons first
  computerChoiceIcons.forEach(icon => icon.style.visibility = 'hidden');
  
  // Show the selected one
  const iconMap = {
    'rock': computerChoiceIcons[0],
    'paper': computerChoiceIcons[1],
    'scissors': computerChoiceIcons[2]
  };
  
  if (iconMap[choice]) {
    iconMap[choice].style.visibility = 'visible';
  }
};

/**
 * Determine the winner of the game
 * @param {string} playerChoice - The player's selection
 * @param {string} computerChoice - The computer's selection
 * @returns {string} The result message
 */
const determineWinner = (playerChoice, computerChoice) => {
  // Tie case
  if (playerChoice === computerChoice) {
    return "It's a tie!";
  }
  
  // Win conditions for player
  const playerWins = (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'rock') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
  );
  
  if (playerWins) {
    gameState.singlePlayer.playerScore++;
    playerScoreDisplay.textContent = gameState.singlePlayer.playerScore;
    return "You win!";
  } else {
    gameState.singlePlayer.computerScore++;
    computerScoreDisplay.textContent = gameState.singlePlayer.computerScore;
    return "Computer wins!";
  }
};

/**
 * Play a single round of the game (player vs computer)
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
  gameState.ai.playerHistory.push(playerChoice);

  // Get computer's choice with AI enhancement
  const computerChoice = await getComputerChoice();

  // Record computer's choice
  gameState.ai.computerHistory.push(computerChoice);

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
  
  // Update dashboard if it exists
  if (typeof updateDashboard === 'function') {
    updateDashboard(playerChoice, computerChoice, result);
  }
}

/**
 * Start the multiplayer game
 */
/* 
const startMultiplayerGame = () => {
  multiplayerSection.style.display = 'flex';
  player1Form.reset();
  player2Form.reset();
  player1Form.style.visibility = 'visible';
  player2Form.style.visibility = 'hidden';
  select1Button.classList.remove('btn-success', 'border-3');
  select2Button.classList.remove('btn-success', 'border-3');
  pvpResultDisplay.textContent = '';
  
  // Reset multiplayer state
  gameState.multiPlayer.player1Choice = null;
  gameState.multiPlayer.player2Choice = null;
};
 */
/**
 * Handle player 1's selection
 * @param {Event} e - The click event
 */
/* 
const handlePlayer1Selection = (e) => {
  e.preventDefault();
  
  const selectedChoice = Array.from(player1Choices).find(choice => choice.checked);
  
  if (!selectedChoice) {
    pvpResultDisplay.textContent = "Player 1: Please select rock, paper, or scissors!";
    pvpResultDisplay.classList.add('text-danger');
    return;
  }
  
  pvpResultDisplay.textContent = '';
  pvpResultDisplay.classList.remove('text-danger');
  
  // Store player 1's choice
  gameState.multiPlayer.player1Choice = selectedChoice.value;
  
  // Hide player 1's form and show player 2's
  player1Form.style.visibility = 'hidden';
  player2Form.style.visibility = 'visible';
  
  // Visual feedback that selection was made
  select1Button.classList.add('btn-success', 'border-3');
};
 */
/**
 * Determine the winner for the multiplayer game
 * @param {string} choice1 - Player 1's choice
 * @param {string} choice2 - Player 2's choice
 * @returns {string} The result message
 */
/* 
const determineMultiplayerWinner = (choice1, choice2) => {
  // Tie case
  if (choice1 === choice2) {
    return "It's a tie!";
  }
  
  // Win conditions for player 1
  const player1Wins = (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  );
  
  if (player1Wins) {
    return "Player 1 wins!";
  } else {
    return "Player 2 wins!";
  }
};
 */
/**
 * Handle player 2's selection and determine the winner
 * @param {Event} e - The click event
 */
/* 
const handlePlayer2Selection = (e) => {
  e.preventDefault();
  
  const selectedChoice = Array.from(player2Choices).find(choice => choice.checked);
  
  if (!selectedChoice) {
    pvpResultDisplay.textContent = "Player 2: Please select rock, paper, or scissors!";
    pvpResultDisplay.classList.add('text-danger');
    return;
  }
  
  pvpResultDisplay.classList.remove('text-danger');
  
  // Store player 2's choice
  gameState.multiPlayer.player2Choice = selectedChoice.value;
  
  // Visual feedback that selection was made
  select2Button.classList.add('btn-success', 'border-3');
  
  // Hide game section and show loader
  startButton.style.display = 'none';
  multiplayerSection.style.display = 'none';
  loader.style.display = 'block';
  
  // Show results after a short delay
  setTimeout(() => {
    const result = determineMultiplayerWinner(
      gameState.multiPlayer.player1Choice,
      gameState.multiPlayer.player2Choice
    );
    
    // Hide loader and display result
    loader.style.display = 'none';
    pvpResultDisplay.textContent = result;
    pvpResultDisplay.classList.add('result-animation');
    
    // Show start button again
    startButton.style.display = 'inline-block';
    
    // Wait a bit before showing the game interface again
    setTimeout(() => {
      multiplayerSection.style.display = 'flex';
      player1Form.style.visibility = 'visible';
      player2Form.style.visibility = 'hidden';
      player1Form.reset();
      player2Form.reset();
      select1Button.classList.remove('btn-success', 'border-3');
      select2Button.classList.remove('btn-success', 'border-3');
      pvpResultDisplay.classList.remove('result-animation');
    }, 2000);
  }, 2000);
};
 */

/**
 * Add visual feedback for choices when selected
 * @param {NodeList} choices - Radio button elements
 */
const addChoiceSelectionFeedback = (choices) => {
  choices.forEach(choice => {
    choice.addEventListener('change', () => {
      // Remove selected class from all siblings
      const parentForm = choice.closest('form') || choice.closest('div');
      if (parentForm) {
        parentForm.querySelectorAll('i').forEach(icon => {
          icon.classList.remove('selected');
        });
      }
      
      // Add selected class to the chosen option
      const selectedIcon = choice.nextElementSibling;
      if (selectedIcon) {
        selectedIcon.classList.add('selected');
      }
    });
  });
};

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
    gameState.ai.difficulty = e.target.value;

    // Reset adaptive level when changing difficulty
    if (gameState.ai.difficulty === 'adaptive') {
      gameState.ai.adaptiveLevel = 0.5;
    }
    
    // Reset game history for new difficulty
    if (confirm("Reset game scores for new difficulty level?")) {
      gameState.singlePlayer.playerScore = 0;
      gameState.singlePlayer.computerScore = 0;
      gameState.ai.playerHistory = [];
      gameState.ai.computerHistory = [];
      playerScoreDisplay.textContent = '0';
      computerScoreDisplay.textContent = '0';
      resultDisplay.textContent = '';
    }
  });
}

/**
 * Add AI Dashboard button
 */
function addDashboardButton() {
  const dashboardButton = document.createElement('button');
  dashboardButton.id = 'dashboard-button';
  dashboardButton.className = 'btn btn-info btn-sm ms-3';
  dashboardButton.textContent = 'Show AI Stats';
  
  // Find the difficulty select and add the button next to it
  const difficultySelect = document.getElementById('difficulty-select');
  if (difficultySelect) {
    difficultySelect.parentNode.appendChild(dashboardButton);
  }
  
  // Add event listener to open dashboard
  dashboardButton.addEventListener('click', toggleDashboard);
}

/**
 * Toggle AI Dashboard visibility
 */
function toggleDashboard() {
  const dashboard = document.getElementById('ai-dashboard');
  const dashboardButton = document.getElementById('dashboard-button');
  
  if (dashboard) {
    const isVisible = dashboard.style.display !== 'none';
    dashboard.style.display = isVisible ? 'none' : 'block';
    dashboardButton.textContent = isVisible ? 'Show AI Stats' : 'Hide AI Stats';
  } else {
    createDashboard();
    dashboardButton.textContent = 'Hide AI Stats';
  }
}

/**
 * Create a simple AI Dashboard
 */
function createDashboard() {
  const dashboard = document.createElement('div');
  dashboard.id = 'ai-dashboard';
  dashboard.className = 'mt-4 p-3 bg-dark rounded';
  dashboard.innerHTML = `
    <h4 class="text-light">Game Analysis</h4>
    <div class="row g-3 mt-1">
      <div class="col-md-4">
        <div class="card bg-dark border-info text-light">
          <div class="card-body">
            <h5 class="card-title">Your Moves</h5>
            <div class="d-flex justify-content-around">
              <div class="text-center">
                <i class="fas fa-hand-rock"></i>
                <div id="rock-percent">0%</div>
              </div>
              <div class="text-center">
                <i class="fas fa-hand-paper"></i>
                <div id="paper-percent">0%</div>
              </div>
              <div class="text-center">
                <i class="fas fa-hand-scissors"></i>
                <div id="scissors-percent">0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-dark border-info text-light">
          <div class="card-body">
            <h5 class="card-title">Game Stats</h5>
            <p>Games played: <span id="games-played">0</span></p>
            <p>Win rate: <span id="win-rate">0%</span></p>
            <div class="progress">
              <div id="win-progress" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-dark border-info text-light">
          <div class="card-body">
            <h5 class="card-title">Analysis</h5>
            <p id="ai-analysis" class="small">Play more games for AI analysis</p>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-3">
      <button id="reset-stats" class="btn btn-outline-danger btn-sm">Reset Statistics</button>
    </div>
  `;
  
  // Add dashboard to the page after the scores
  const scoreDisplay = document.querySelector('.score-display');
  scoreDisplay.parentNode.insertBefore(dashboard, scoreDisplay.nextSibling);
  
  // Add event listener for reset button
  document.getElementById('reset-stats').addEventListener('click', () => {
    gameState.ai.playerHistory = [];
    gameState.ai.computerHistory = [];
    updateDashboard();
  });
  
  // Initial update
  updateDashboard();
}

/**
 * Update the AI Dashboard with latest statistics
 */
function updateDashboard(playerMove, computerMove, result) {
  const dashboard = document.getElementById('ai-dashboard');
  if (!dashboard) return;
  
  const totalGames = gameState.ai.playerHistory.length;
  document.getElementById('games-played').textContent = totalGames;
  
  // Calculate move percentages
  const moveCount = {
    rock: gameState.ai.playerHistory.filter(move => move === 'rock').length,
    paper: gameState.ai.playerHistory.filter(move => move === 'paper').length,
    scissors: gameState.ai.playerHistory.filter(move => move === 'scissors').length
  };
  
  if (totalGames > 0) {
    document.getElementById('rock-percent').textContent = `${Math.round(moveCount.rock / totalGames * 100)}%`;
    document.getElementById('paper-percent').textContent = `${Math.round(moveCount.paper / totalGames * 100)}%`;
    document.getElementById('scissors-percent').textContent = `${Math.round(moveCount.scissors / totalGames * 100)}%`;
    
    // Win rate
    const winRate = gameState.singlePlayer.playerScore / totalGames * 100;
    document.getElementById('win-rate').textContent = `${Math.round(winRate)}%`;
    document.getElementById('win-progress').style.width = `${winRate}%`;
    
    // AI Analysis
    if (totalGames >= 5) {
      let analysis = "";
      
      // Most used move
      const mostUsedMove = Object.entries(moveCount).sort((a, b) => b[1] - a[1])[0][0];
      analysis += `You favor ${mostUsedMove} (${Math.round(moveCount[mostUsedMove] / totalGames * 100)}% of moves). `;
      
      // Pattern detection
      if (totalGames >= 10) {
        // Check for alternating patterns
        const lastFiveMoves = gameState.ai.playerHistory.slice(-5);
        const uniqueMoves = new Set(lastFiveMoves);
        if (uniqueMoves.size === 1) {
          analysis += "You're repeating the same move. Try mixing it up! ";
        } else if (
          lastFiveMoves[0] === lastFiveMoves[2] && lastFiveMoves[2] === lastFiveMoves[4] &&
          lastFiveMoves[1] === lastFiveMoves[3]
        ) {
          analysis += "You're alternating in a predictable pattern. ";
        }
        
        // If too predictable or too successful
        if (winRate > 60) {
          analysis += "You're doing well against the AI. Maybe try a harder difficulty?";
        } else if (winRate < 30) {
          analysis += "The AI seems to be predicting your moves. Try being less predictable.";
        }
      }
      
      document.getElementById('ai-analysis').textContent = analysis;
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game
  playerScoreDisplay.textContent = gameState.singlePlayer.playerScore;
  computerScoreDisplay.textContent = gameState.singlePlayer.computerScore;
  
  // Add the difficulty selector to the UI
  addDifficultySelector();
  
  // Add dashboard button
  addDashboardButton();
  
  // Replace the original play button event listener
  playButton.removeEventListener('click', playSinglePlayerGame);
  playButton.addEventListener('click', playSinglePlayerGame);
  /* 
  // Other event listeners
  startButton.addEventListener('click', startMultiplayerGame);
  select1Button.addEventListener('click', handlePlayer1Selection);
  select2Button.addEventListener('click', handlePlayer2Selection);
  // Add visual feedback for choices
  addChoiceSelectionFeedback(playerChoices);
  addChoiceSelectionFeedback(player1Choices);
  addChoiceSelectionFeedback(player2Choices);
  */
});
