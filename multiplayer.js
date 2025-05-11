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