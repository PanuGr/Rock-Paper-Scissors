// Supabase initialization
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient('https://kwyiywrugbqvhsxyvnac.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eWl5d3J1Z2JxdmhzeHl2bmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTU0MTcsImV4cCI6MjA2MzIzMTQxN30.PKNz6AFQQuV8veIObld_8E-rTnsPuPayMc0ZnbbS69M')


async function getResults() {

  const { data, error } = await supabase
    .from('scoreboard')
    .select('*')

  if
    (error) {
    console.error(error);
  }
  else {
    renderSupabaseStats(data);
  }
}

//getResults();
async function shareScore() {
  const localStorage = window.localStorage;
  const gameHistory = JSON.parse(localStorage.getItem('GameHistory'));
  const { data, error } = await supabase
    .from('scoreboard')
    .insert(
      {
        Player: gameHistory[0].playerName,
        Score: gameHistory[0].score
      }
    )

  if (error) {
    console.error(error);
    alert("Your score couldn't be saved.");
  }
  else {
    alert('Your score has been saved.');
  }
};

function renderSupabaseStats(params) {
  const scoreboard = document.getElementById('scoreboard-body');
  if (!scoreboard) return; // Αν το στοιχείο δεν υπάρχει, μην κάνεις τίποτα
  scoreboard.innerHTML = ''; // Καθαρισμός προηγούμενων εγγραφών

  if (params.length === 0) {
    const row = scoreboard.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 3; // Ο αριθμός των στηλών του πίνακα
    cell.textContent = 'No saved games';
    cell.classList.add('text-center');
    return;
  }

  params.forEach((entry) => {
    const row = scoreboard.insertRow();
    row.insertCell().textContent = entry.Player||"Player";
    row.insertCell().textContent = entry.Opponent;
    row.insertCell().textContent = entry.Score;
  });
}

export {getResults, shareScore};
