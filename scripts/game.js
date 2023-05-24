var origBoard;
const huPlayer = 'X';
const aiPlayer = 'O';
let first_turn = true;

player_score = 0;
game_draws = 0;
computer_score = 0;

html_player_score = document.getElementById("player-score");
html_game_draws = document.getElementById("game-draws");
html_computer_score = document.getElementById("computer-score");

player_x = document.getElementById("X");
player_o = document.getElementById("O");

shareButton = document.getElementById("share");

const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]

const cells = document.querySelectorAll('.block');
const winner_statement = document.getElementById("winner");
const board_container = document.querySelector(".play-area");

if (!navigator.share)
	shareButton.style = "display: none";

if('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('serviceworker.js')
		.then(function() { console.log("Service Worker Registered"); });
}

startGame();

function startGame() {
	winner_statement.classList.remove("playerWin", "computerWin", "draw");
	first = true;

	if(document.getElementById('friend').checked == true){
		player_x.innerText = "X";
		player_o.innerText = "O";
		winner_statement.innerText = "X starts the game";
	}
	else {
		player_x.innerText = "You";
		player_o.innerText = "Computer";
		winner_statement.innerText = "Good luck ;)";
	}

	origBoard = Array.from(Array(9).keys());
	for (var i = 0; i < cells.length; i++) {
		cells[i].innerText = '';
		cells[i].classList.remove('win', 'occupied');
		cells[i].addEventListener('click', turnClick, false);
	}
}

function turnClick(square) {
	if (typeof origBoard[square.target.id] == 'number'){
		if(document.getElementById('ai').checked == true) {
			turn(square.target.id, huPlayer);
			for (var i = 0; i < cells.length; i++) {
				cells[i].removeEventListener('click', turnClick, false);
			}
			setTimeout(function () {
				if (!checkWin(origBoard, huPlayer))
					turn(bestSpot(), aiPlayer);
					if(!checkWin(origBoard, aiPlayer)) {
						for (var i = 0; i < cells.length; i++) {
							cells[i].addEventListener('click', turnClick, false);
						}
					}
			}, 350);
		}
		else {
			if(first){
				turn(square.target.id, huPlayer);
				if (!checkWin(origBoard, huPlayer))
					winner_statement.innerText = "O's turn";
				first = false;
			}
			else {
				turn(square.target.id, aiPlayer);
				if (!checkWin(origBoard, aiPlayer))
					winner_statement.innerText = "X's turn";
				first = true;
			}
		}
	}
	checkTie();
}

function turn(squareId, player) {
	origBoard[squareId] = player;
	document.getElementById(squareId).innerText = player;
	document.getElementById(squareId).classList.add("occupied");
	let gameWon = checkWin(origBoard, player);
	if (gameWon)
		gameOver(gameWon);
}

function checkWin(board, player) {
	let plays = board.reduce((a, e, i) =>
		(e === player) ? a.concat(i) : a, []);
	let gameWon = null;
	for (let [index, win] of winCombos.entries()) {
		if (win.every(elem => plays.indexOf(elem) > -1)) {
			gameWon = {index: index, player: player};
			break;
		}
	}
	return gameWon;
}

function gameOver(gameWon) {
	for (let index of winCombos[gameWon.index]) {
		document.getElementById(index).classList.add("win");
	}
	for (var i = 0; i < cells.length; i++) {
		cells[i].removeEventListener('click', turnClick, false);
		cells[i].classList.add('occupied');
	}
	if (gameWon.player == huPlayer){
		player_score += 1;
		if (document.getElementById('friend').checked == true)
			winner_statement.innerText = "X is the winner!";
		else
			winner_statement.innerText = "You Won! :)";

    	winner_statement.classList.add("playerWin");
		html_player_score.innerText = player_score;
	}
	else {
		computer_score += 1;
		if (document.getElementById('friend').checked == true){
			winner_statement.innerText = "O is the winner!";
			winner_statement.classList.add("playerWin");
		}
		else {
			winner_statement.innerText = "Computer Won :(";
			winner_statement.classList.add("computerWin");
		}
		html_computer_score.innerText = computer_score;
	}
}

function emptySquares() {
	return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
	return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
	if (emptySquares().length == 0 && !checkWin(origBoard, huPlayer)) {
		for (var i = 0; i < cells.length; i++) {
			cells[i].removeEventListener('click', turnClick, false);
		}
		game_draws += 1;
    	winner_statement.innerText = "Draw!";
    	winner_statement.classList.add("draw");
		html_game_draws.innerText = game_draws;
		return true;
	}
	return false;
}

function minimax(newBoard, player) {
	var availSpots = emptySquares();

	if (checkWin(newBoard, huPlayer)) {
		return {score: -10};
	} else if (checkWin(newBoard, aiPlayer)) {
		return {score: 10};
	} else if (availSpots.length === 0) {
		return {score: 0};
	}

	var moves = [];
	for (var i = 0; i < availSpots.length; i++) {
		var move = {};
		move.index = newBoard[availSpots[i]];
		newBoard[availSpots[i]] = player;

		if (player == aiPlayer) {
			var result = minimax(newBoard, huPlayer);
			move.score = result.score;
		} else {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		}

		newBoard[availSpots[i]] = move.index;

		moves.push(move);
	}

	var bestMove;
	if(player === aiPlayer) {
		var bestScore = -10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	} else {
		var bestScore = 10000;
		for(var i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}

	return moves[bestMove];
}

function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}
  
function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
}

function resetScore() {
	player_score = 0;
	game_draws = 0;
	computer_score = 0;
	html_computer_score.innerText = "0";
	html_game_draws.innerText = "0";
	html_player_score.innerText = "0";
}

shareButton.addEventListener('click', event => {
	if (navigator.share) {
		navigator.share({
		  title: 'Tic-Tac-Toe game',
		  text: 'Check out this Tic-Tac-Toe game, its cool',
		  url: '#'
		})
	}
});