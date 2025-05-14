//Update player name when input changes
function updatePlayerName() {
  const nameInput = document.getElementById('player-name');
  if (nameInput) {
    gameState.singlePlayer.playerName = nameInput.value || "Player";
    
    // Update UI elements that display the player name
    const playerHeader = document.querySelector('.game-card h3');
    if (playerHeader) {
      playerHeader.innerHTML = `${gameState.singlePlayer.playerName} 🧍`;
    }
    // Update score display
    updateScoreDisplay();
  }
}

//Update the score display with current names
function updateScoreDisplay() {
  const playerScoreElement = document.querySelector('.score-display div:first-child');
  if (playerScoreElement) {
    playerScoreElement.textContent = `${gameState.singlePlayer.playerName}: ${gameState.singlePlayer.playerScore}`;
  }
}