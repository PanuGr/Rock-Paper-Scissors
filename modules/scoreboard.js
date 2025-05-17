// Φορτώνει το ιστορικό παιχνιδιών από το localStorage.
function loadGameHistory(gameState,localSave) {
    const storedHistory = localStorage.getItem(localSave);
    if (storedHistory) {
      gameState.gameHistory = JSON.parse(storedHistory);
    }
    renderGameHistory(gameState);
  }
  
  //Αποθηκεύει το τρέχον ιστορικό παιχνιδιών στο localStorage.
  function saveGameHistory(gameState) {
    localStorage.setItem('GameHistory', JSON.stringify(gameState.gameHistory));
  }
  
  /**
 * Προσθέτει μια νέα εγγραφή στο ιστορικό παιχνιδιών και το αποθηκεύει.
 * @param {string} playerName
 * @param {string} playerChoice
 * @param {string} computerChoice
 * @param {string} resultMessage
 * @param {number} playerScore
 * @param {number} computerScore
 */
function addGameToHistory(playerName, playerChoice, computerChoice, resultMessage, playerScore, computerScore, gameState) {
    const gameEntry = {
      id: Date.now(), // Μοναδικό ID για κάθε εγγραφή
      playerName,
      playerChoice,
      computerChoice,
      resultMessage,
      score: `${playerScore} - ${computerScore}`,
      timestamp: new Date().toLocaleString() // Προαιρετικά, για εμφάνιση ώρας
    };
    gameState.gameHistory.unshift(gameEntry); // Προσθήκη στην αρχή για εμφάνιση των νεότερων πρώτα
    // Περιορισμός του ιστορικού σε έναν λογικό αριθμό, π.χ. 10 τελευταία παιχνίδια
    if (gameState.gameHistory.length > 10) {
        gameState.gameHistory.pop();
    }
    saveGameHistory(gameState);
    renderGameHistory(gameState);
  }
  
  //Εμφανίζει το ιστορικό παιχνιδιών στον πίνακα HTML.
  function renderGameHistory(gameState) {
    const gameHistoryBody = document.getElementById('game-history-body');
    if (!gameHistoryBody) return; // Αν το στοιχείο δεν υπάρχει, μην κάνεις τίποτα
  
    gameHistoryBody.innerHTML = ''; // Καθαρισμός προηγούμενων εγγραφών
  
    if (gameState.gameHistory.length === 0) {
      const row = gameHistoryBody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 6; // Ο αριθμός των στηλών του πίνακα
      cell.textContent = 'No saved games';
      cell.classList.add('text-center');
      return;
    }
  
    gameState.gameHistory.forEach((entry, index) => {
      const row = gameHistoryBody.insertRow();
      row.insertCell().textContent = gameState.gameHistory.length - index; // Αρίθμηση #
      row.insertCell().textContent = entry.playerName;
      row.insertCell().innerHTML = `<i class="fas fa-hand-${entry.playerChoice}"></i> ${entry.playerChoice}`;
      row.insertCell().innerHTML = `<i class="fas fa-hand-${entry.computerChoice}"></i> ${entry.computerChoice}`;
      row.insertCell().textContent = entry.resultMessage;
      row.insertCell().textContent = entry.score;
    });
  }
  
  // Εκκαθαρίζει το ιστορικό παιχνιδιών από την κατάσταση και το localStorage.
  function clearGameHistory(gameState) {
    if (confirm("This will delete all game history. Are you sure?")) {
      gameState.gameHistory = [];
      saveGameHistory(gameState); // Αποθήκευση του κενού πίνακα
      renderGameHistory(gameState);
    }
  }
  
  export { loadGameHistory, saveGameHistory, addGameToHistory, renderGameHistory, clearGameHistory };