const radio = document.getElementsByName('user');//USER'S CHOICE
const R = document.getElementsByClassName('fa-hand-rock')[1];//COMPUTER'S CHOICE
const P = document.getElementsByClassName('fa-hand-paper')[1];
const Sc = document.getElementsByClassName('fa-hand-scissors')[1];
let par = document.getElementById('result');
let robot;
const user = () => { //IT SHOWS THE USER'S CHOICE
   for (const choice of radio) {
    if (choice.checked) {
      return choice.value;
    }
  }
};
function computer() { //RANDOM CHOICE FOR COMPUTER
  const randomNumber = Math.round(Math.random()*2);
  switch (randomNumber) {
    case 0:
      robot = "rock"
      R.style.visibility = 'visible'
      break;
    case 1:
      robot = "paper"
      P.style.visibility = 'visible'
      break;
    case 2:
      robot = "scissors"
      Sc.style.visibility = 'visible'
  }
};
function winner() { //WINNING CONDITIONS
  computer();
  if (radio[0].checked === true && robot === 'rock') {
    par.innerHTML = 'The game is a tie';
  }
  else if (radio[0].checked === true && robot === 'paper') {
    par.innerHTML = 'Robot won';
  }
  else if (radio[1].checked === true && robot === 'paper') {
    par.innerHTML = 'The game is a tie';
  }
  else if (radio[1].checked === true && robot === 'scissors') {
    par.innerHTML = 'Robot won';
  }
  else if (radio[2].checked === true && robot === 'scissors') {
    par.innerHTML = 'The game is a tie';
  }
  else if (radio[2].checked === true && robot === 'rock') {
    par.innerHTML = 'Robot won';
  }
  else {
    par.innerHTML = 'You won!';
  }
};
const playGame = () => { //IF USER NOT EMPTY, PLAY
  R.style.visibility = 'hidden'
  P.style.visibility = 'hidden'
  Sc.style.visibility = 'hidden'
  const User = user();
  if (User != null) {
    winner();
  }
};
document.querySelector('button').addEventListener('click', playGame);

//PLAYER VS PLAYER
const radio1 = document.getElementsByName('user1');//USER1 CHOICE
const radio2 = document.getElementsByName('user2');//USER2 CHOICE
const select1 = document.getElementById('select1');
const select2 = document.getElementById('select2');
const user1 = () => { //IT SHOWS THE USER1'S CHOICE
   for (const choice of radio1) {
    if (choice.checked) {
      select1.style.color = 'green';
      select1.style.border = 'groove';
    }
  }
};
const user2 = () => { //IT SHOWS THE USER2'S CHOICE
    for (const choice of radio2) {
    if (choice.checked) {
      select2.style.color = 'green';
      select2.style.border = 'groove';
    }
  }
};
const label = document.getElementsByTagName('label');//Change the select button when user chooses
label[3].addEventListener('click', user1); label[4].addEventListener('click', user1);
label[5].addEventListener('click', user1); label[6].addEventListener('click', user2);
label[7].addEventListener('click', user2); label[8].addEventListener('click', user2);

//Start the game
const start=document.getElementById('start');
const User1=document.getElementsByTagName('section')[1];
const form1= document.getElementById('user1');
const form2= document.getElementById('user2');
start.onclick = () => {
  User1.style.display = 'flex';
  form1.reset();
  form2.reset();
  form2.style.visibility = 'hidden';
}
function invisible() { //Make the second user visible
  if (radio1[0].checked || radio1[1].checked || radio1[2].checked) {
    form1.style.visibility = 'hidden';
    form2.style.visibility = 'visible';
  }
}
function result() { //show results
  if (radio2[0].checked || radio2[1].checked || radio2[2].checked) {
    start.style.display = 'none';
    User1.style.display = 'none';
    setTimeout(showresults, 2000);
    document.getElementById('loader').style.display = 'block';
    function showresults() {
      document.getElementById('loader').style.display = 'none';
      start.style.display = 'inline-block';
      User1.style.display = 'flex';
      form1.style.visibility = 'visible';
      select1.style.color = 'initial';
      select1.style.border = 'none';
      select2.style.color = 'initial';
      select2.style.border = 'none';
    }
  }
}
