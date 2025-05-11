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
  bot: {
    playerHistory: [],
    computerHistory: [],
    difficulty: 'easy'
  }
};

// DOM Elements - Single Player
const playerChoices = document.querySelectorAll('[name="user"]');
const computerChoiceIcons = Array.from(document.querySelectorAll('.computer-choice'));
const playButton = document.getElementById('play-button');
const resultDisplay = document.getElementById('result');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');

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

async function getPrediction(playerHistory) {
  // Only make prediction if we have sufficient history
  if (playerHistory.length < 3) return null;

  // A basic pattern recognition

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
}

/**
 * Choose computer move based on difficulty level
 * @returns {Promise<string>} - The computer's move
 */
async function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  let computerChoice;

  switch (gameState.bot.difficulty) {
    case 'easy':
      computerChoice = getRandomChoice();
      break;

    case 'medium':
      // Look for simple patterns like repetition
      const lastThree = gameState.bot.playerHistory.slice(-3);
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
      }
      break;

    case 'hard':
      const prediction = await getPrediction(gameState.bot.playerHistory);

      if (prediction) {
        // Choose the move that beats the predicted player move
        const winningMoveMap = {
          'rock': 'paper',     // Computer's paper beats player's rock
          'paper': 'scissors', // Computer's scissors beats player's paper
          'scissors': 'rock'   // Computer's rock beats player's scissors
        };
        computerChoice = winningMoveMap[prediction];
      }
      break;
    default:
      console.log('return to default switch case');
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
    resultDisplay.classList.add('text-info');
    return;
  }

  //resultDisplay.classList.remove('text-danger');

  // Record player's choice for pattern analysis
  gameState.bot.playerHistory.push(playerChoice);

  // Get computer's choice
  const computerChoice = await getComputerChoice();

  // Record computer's choice
  gameState.bot.computerHistory.push(computerChoice);

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
    gameState.bot.difficulty = e.target.value;

    // Reset game history for new difficulty
    gameState.singlePlayer.playerScore = 0;
    gameState.singlePlayer.computerScore = 0;
    gameState.bot.playerHistory = [];
    gameState.bot.computerHistory = [];
    playerScoreDisplay.textContent = '0';
    computerScoreDisplay.textContent = '0';
    resultDisplay.textContent = '';

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
    gameState.bot.playerHistory = [];
    gameState.bot.computerHistory = [];
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

  const totalGames = gameState.bot.playerHistory.length;
  document.getElementById('games-played').textContent = totalGames;

  // Calculate move percentages
  const moveCount = {
    rock: gameState.bot.playerHistory.filter(move => move === 'rock').length,
    paper: gameState.bot.playerHistory.filter(move => move === 'paper').length,
    scissors: gameState.bot.playerHistory.filter(move => move === 'scissors').length
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
        const lastFiveMoves = gameState.bot.playerHistory.slice(-5);
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
          analysis += "You're doing well against the bot. Maybe try a harder difficulty?";
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
