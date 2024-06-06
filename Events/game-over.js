// This function simulates the end of the game and displays the Game Over screen
function endGame(winner, delay) {
    document.getElementById('winner').innerText = winner;
    setTimeout(function() {document.getElementById('game-over-screen').classList.remove('hidden')}, delay);
    
}

export {endGame}
