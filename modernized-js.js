// Game state
const gameState = {
  singlePlayer: {
    playerScore: 0,
    computerScore: 0
  },
  multiPlayer: {
    player1Choice: null,
    player2Choice: null
  }
};

// DOM Elements - Single Player
const playerChoices = document.querySelectorAll('[name="user"]');
const computerChoiceIcons = Array.from(document.querySelectorAll('.computer-choice'));
const playButton = document.getElementById('play-button');
const resultDisplay = document.getElementById('result');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');

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
const getComputerChoice = () => {
  const choices = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * 3);
  return choices[randomIndex];
};

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
const playSinglePlayerGame = () => {
  const playerChoice = getUserChoice();
  
  if (!playerChoice) {
    resultDisplay.textContent = "Please select rock, paper, or scissors first!";
    resultDisplay.classList.add('text-danger');
    return;
  }
  
  resultDisplay.classList.remove('text-danger');
  
  // Get and display computer's choice
  const computerChoice = getComputerChoice();
  displayComputerChoice(computerChoice);
  
  // Determine and display the winner
  const result = determineWinner(playerChoice, computerChoice);
  resultDisplay.textContent = result;
  
  // Add animation to the result
  resultDisplay.classList.add('result-animation');
  setTimeout(() => {
    resultDisplay.classList.remove('result-animation');
  }, 800);
};

/**
 * Start the multiplayer game
 */
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

/**
 * Handle player 1's selection
 * @param {Event} e - The click event
 */
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

/**
 * Determine the winner for the multiplayer game
 * @param {string} choice1 - Player 1's choice
 * @param {string} choice2 - Player 2's choice
 * @returns {string} The result message
 */
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

/**
 * Handle player 2's selection and determine the winner
 * @param {Event} e - The click event
 */
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

// Event Listeners
playButton.addEventListener('click', playSinglePlayerGame);
startButton.addEventListener('click', startMultiplayerGame);
select1Button.addEventListener('click', handlePlayer1Selection);
select2Button.addEventListener('click', handlePlayer2Selection);

// Add visual feedback for choices
addChoiceSelectionFeedback(playerChoices);
addChoiceSelectionFeedback(player1Choices);
addChoiceSelectionFeedback(player2Choices);

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  playerScoreDisplay.textContent = gameState.singlePlayer.playerScore;
  computerScoreDisplay.textContent = gameState.singlePlayer.computerScore;
});
