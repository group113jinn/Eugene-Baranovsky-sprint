'use strict'

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

var gClickCount; // count of clicks for first click action of setting up mines and neighbours
var gStartTime = 0;
var timerInterval = 0;


function init() {
    document.querySelector('.startBtn').classList.remove('lose'); //Smiley button clear
    document.querySelector('.startBtn').classList.remove('win');
    document.querySelector('.startBtn').classList.add('normal'); //setting default smiley
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    clearInterval(timerInterval);
    document.querySelector('.infoTime').innerHTML = '00.0'; //reset time str
    gGame.isOn = true;
    gClickCount = 0;
    gBoard = createBoard();
    renderBoard();

}

function renderBoard() { //matrix rendering
    var board = gBoard;
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += `<tr>`;
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var cellClass = '';
            if (cell.isMine) {
                cellClass += ' mine';
            }
            if (cell.isMarked) {
                cellClass += ' flag';
            }
            if (!cell.isShown) {
                cellClass += ' noshow';
            }
            if (cell.isShown && !cell.isMine && cell.minesAroundCount != 0) {
                if (cell.minesAroundCount === 1) {
                    cellClass += `one`;
                }
                if (cell.minesAroundCount === 2) {
                    cellClass += `two`;
                }
                if (cell.minesAroundCount === 3) {
                    cellClass += `three`;
                }
                if (cell.minesAroundCount === 4) {
                    cellClass += `four`;
                }
            } /*onclick actions for right and left clicks with coordinates variables from obj*/
            strHtml += `<td class = "cell ${cellClass}" oncontextmenu="cellMarked(this, ${i}, ${j});return false;"  onclick="cellClicked(this, ${i}, ${j})">`;
            strHtml += `</td>`;
        }
        strHtml += `</tr>`;
    }
    document.querySelector('tBody').innerHTML = strHtml;
    document.querySelector('.infoNum').innerHTML = gGame.markedCount; // info area for flagged cells count dispplay
}

function createBoard() { //matrix creation
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                i: i,
                j: j,
                isShown: false,
                isMine: false,
                isMarked: false,
                minesAroundCount: 0
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function setMinesNegsCount() { //general loop for defining neighbours areal
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = neighbourSearch(gBoard, i, j);
            }
        }
    }
}

function neighbourSearch(board, i, j) { //search  of neighbours in predefined area
    for (var k = i - 1; k <= i + 1; k++) {
        for (var s = j - 1; s <= j + 1; s++) {
            if (k < 0 || k > board.length - 1 || s < 0 || s > board[0].length - 1 || k === i && s === j) {
                continue;
            }
            if (!board[k][s].isMine) {
                board[k][s].minesAroundCount++;
            }
        }
    }
}

function placeMines(i, j) { // random landing mines
    for (var k = 0; k < gLevel.MINES; k++) {
        gBoard[getRandomInt(0, gBoard.length - 1)][getRandomInt(0, gBoard.length - 1)].isMine = true;
    }
    setMinesNegsCount();
    renderBoard();
}

function cellClicked(elCell, i, j) { // main click function
    if (!gGame.isOn) {
        return;
    }
    var cell = gBoard[i][j];
    if (cell.isMarked || cell.isShown) {
        return;
    }
    gClickCount++;
    if (gClickCount === 1) {
        gStartTime = Date.now();
        timerInterval = setInterval(Timer, 100);
        placeMines(i, j);
    }
    if (!cell.isShown) {
        cell.isShown = true;
        if (cell.isMine) {
            showAllMines();
            renderBoard();
            endGame();
        } else {
            expandShown(gBoard, elCell, i, j);
            renderBoard();
        }
    }
    checkVictory();
    return cell;
}

function cellMarked(elCell, i, j) { // flag interactions
    if (!gGame.isOn) {
        return;
    }
    var cell = gBoard[i][j];
    if (cell.isShown) {
        return;
    }
    if (!cell.isMarked) {
        elCell.classList.add('flag')
        cell.isMarked = true;
        gGame.markedCount++;
        renderBoard();
    } else {
        elCell.classList.remove('flag')
        cell.isMarked = false;
        gGame.markedCount--;
        renderBoard();
    }
}

function expandShown(board, elCell, i, j) { // used if main cellClicked landed onto free space to show free cells and mine neighbour count cells
    for (var k = i - 1; k <= i + 1; k++) {
        for (var s = j - 1; s <= j + 1; s++) {
            if (k < 0 || k > board.length - 1 || s < 0 || s > board[0].length - 1 || k === i && s === j) {
                continue;
            }
            if (!board[k][s].isMine) {
                board[k][s].isShown = true;
                if (board[k][s].isMarked) {
                    board[k][s].isShown = false;
                }
            }
        }
    }
}

function showAllMines() { // is cellClicked landed on mine, all mines displayed
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                gBoard[i][j].isMarked = false;
                gBoard[i][j].isShown = true;
            }
        }
    }
}

function endGame() {
    document.querySelector('.startBtn').classList.remove('normal');
    document.querySelector('.startBtn').classList.add('lose');
    clearInterval(timerInterval);
    gGame.isOn = false;
}


function winGame() {
    document.querySelector('.startBtn').classList.remove('normal');
    document.querySelector('.startBtn').classList.add('win');
    clearInterval(timerInterval);
    gGame.isOn = false;
}

function levelSetting(level) { // complexity presets(matrix size and number of mines)
    gLevel.SIZE = +level.value;
    if (+level.value === 4) {
        gLevel.MINES = 2;
    }
    if (+level.value === 8) {
        gLevel.MINES = 12;
    }
    if (+level.value === 12) {
        gLevel.MINES = 30;
    }
    init();

}

function checkVictory() {
    var count = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown) {
                count++;
            }
        }
    }
    if (count === gLevel.SIZE ** 2 - gLevel.MINES) {
        return winGame();
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Timer() {
    var gEndTime = Date.now();
    var gameTime = (gEndTime - gStartTime) / 1000;
    document.querySelector('.infoTime').innerHTML = +gameTime.toFixed(1);
}
