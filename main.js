import { updatePlayerName, updatePlayerScoreDisplay } from './modules/playerName.js';
import { loadGameHistory, addGameToHistory, clearGameHistory } from './modules/scoreboard.js';
// Game state
const gameState = {
  singlePlayer: {
    playerScore: 0,
    computerScore: 0,
    playerName: "Player"
  },
  multiPlayer: {
    player1Choice: null,
    player2Choice: null,
    player1Name: "Player 1",
    player2Name: "Player 2"
  },
  bot: {
    playerHistory: [],
    computerHistory: [],
    difficulty: 'easy'
  },
  gameHistory: []
};
// DOM Elements - Single Player
const playerChoices = document.querySelectorAll('[name="user"]');
const computerChoiceIcons = Array.from(document.querySelectorAll('.computer-choice'));
const playButton = document.getElementById('play-button');
const resultDisplay = document.getElementById('result');
//const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
const clearHistoryButton = document.getElementById('clear-history-button');


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
  let computerChoice = getRandomChoice(); // Always start with a random choice

  switch (gameState.bot.difficulty) {
    case 'easy':
      break;
    case 'hard':
      if (gameState.bot.playerHistory.length >= 3) {
        const lastThree = gameState.bot.playerHistory.slice(-3);
        let computerChoice = null;

        // Attempt prediction first
        const prediction = await getPrediction(gameState.bot.playerHistory);
        if (prediction) {
          console.log('prediction');
          const winningMoveMap = {
            'rock': 'paper',
            'paper': 'scissors',
            'scissors': 'rock'
          };
          computerChoice = winningMoveMap[prediction];
        } else if (lastThree[0] === lastThree[1] && lastThree[1] === lastThree[2]) {
          // Fallback to pattern recognition if prediction fails
          const expectedPlayerMove = lastThree[0];
          console.log('basic prediction')
          const winningMoveMap = {
            'rock': 'paper',
            'paper': 'scissors',
            'scissors': 'rock'
          };
          computerChoice = winningMoveMap[expectedPlayerMove];
        }

        // If neither prediction nor pattern recognition yielded a choice, fall back to random
        if (!computerChoice) {
          console.log('prediction failed, back to random');
          computerChoice = getRandomChoice();
        }

        return computerChoice; // Ensure a choice is returned
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
    updatePlayerScoreDisplay(gameState); // Update display instead of directly modifying text
    return `${gameState.singlePlayer.playerName} wins!`;
  } else {
    gameState.singlePlayer.computerScore++;
    updatePlayerScoreDisplay(gameState);
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

  // Save locally
  addGameToHistory(gameState.singlePlayer.playerName,
    playerChoice, computerChoice, result, gameState.singlePlayer.playerScore, gameState.singlePlayer.computerScore, gameState);

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
function reset(e) {
  gameState.bot.difficulty = e.target.value;
  gameState.singlePlayer.playerScore = 0;
  gameState.singlePlayer.computerScore = 0;
  gameState.bot.playerHistory = [];
  gameState.bot.computerHistory = [];
  updatePlayerScoreDisplay(gameState);
  computerScoreDisplay.textContent = '0';
  resultDisplay.textContent = '';

  if (document.getElementById('dashboard')) {
    document.getElementById('rock-percent').textContent = "0%";
    document.getElementById('paper-percent').textContent = "0%";
    document.getElementById('scissors-percent').textContent = '0%';
    document.getElementById('win-rate').textContent = "0%";
    document.getElementById('win-progress').style.width = "0%";
  }
  // updateDashboard();
  // Remove 'selected' class from player choices icons
  playerChoices.forEach(choice => {
    choice.checked = false;
    choice.nextElementSibling.classList.remove('selected');
  });
  // Hide and remove 'selected' class from computer choice icons
  computerChoiceIcons.forEach(icon => icon.style.visibility = 'hidden');
  computerChoiceIcons.forEach(icon => icon.classList.remove('selected'));
}

/**
 * Toggle Dashboard visibility
 */
function toggleDashboard() {
  const dashboard = document.getElementById('dashboard');
  const dashboardButton = document.getElementById('dashboard-button');

  if (dashboard) {
    const isVisible = dashboard.style.display !== 'none';
    dashboard.style.display = isVisible ? 'none' : 'block';
    dashboardButton.textContent = isVisible ? 'Show Stats' : 'Hide Stats';
  } else {
    createDashboard();
    dashboardButton.textContent = 'Hide Stats';
  }
}

/**
 * Create a simple Dashboard
 */
function createDashboard() {
  const dashboard = document.createElement('div');
  dashboard.id = 'dashboard';
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
            <p id="analysis" class="small">Play more games for game analysis</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add dashboard to the page after the scores
  const scoreDisplay = document.querySelector('.score-display');
  scoreDisplay.parentNode.insertBefore(dashboard, resultDisplay.nextSibling);

  // Initial update
  updateDashboard();
}

/**
 * Update the Dashboard with latest statistics
 */
function updateDashboard(playerMove, computerMove, result) {
  const dashboard = document.getElementById('dashboard');
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

    // Analysis
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

      document.getElementById('analysis').textContent = analysis;
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game
  updatePlayerScoreDisplay(gameState);
  loadGameHistory(gameState,'GameHistory'); // Φόρτωση του ιστορικού κατά την έναρξη
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener('click', clearGameHistory);
  }
  /* 
  playerScoreDisplay.textContent = gameState.singlePlayer.playerScore;
  computerScoreDisplay.textContent = gameState.singlePlayer.computerScore; 
  */
  // Add player name input event listener
  const playerNameInput = document.getElementById('player-name');
  if (playerNameInput) {
  playerNameInput.value = gameState.singlePlayer.playerName; // Ορισμός αρχικής τιμής από το gameState

    playerNameInput.addEventListener('change', () => updatePlayerName(gameState));
    playerNameInput.addEventListener('blur', () => updatePlayerName(gameState));
  }
  // Replace the original play button event listener
  playButton.removeEventListener('click', playSinglePlayerGame);
  playButton.addEventListener('click', playSinglePlayerGame);
  // Add visual feedback for choices
  addChoiceSelectionFeedback(playerChoices);
  // Reset game history for new difficulty
  document.getElementById('difficulty-select').addEventListener('change', reset);
  // Add event listener to open dashboard
  document.getElementById("dashboard-button").addEventListener('click', toggleDashboard);
});
