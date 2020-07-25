'use strict'

var gLevel = {
    SIZE: 4,
    MINES: 2,
};
var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isTip: false,
    prevMoves: [],

};

var gClickCount; // count of clicks for first click action of setting up mines and neighbours
var gStartTime = 0;
var gTimerInterval = 0;
var gCannon = new Audio('sound/fire.mp3');
var gReload = new Audio('sound/reload.mp3');
var gSonar = new Audio('sound/sonar.mp3');
var gSink = new Audio('sound/sink.mp3');
var gWin = new Audio('sound/win.mp3');

function init() {
    clearInterval(gTimerInterval);
    if (document.querySelector('.activeTipBtn')) {
        document.querySelector('.activeTipBtn').classList.remove('activeTipBtn')
    }
    document.querySelector('.infoNum').style.color = 'rgb(36, 177, 17)';
    document.querySelector('.infoTime').style.color = 'rgb(36, 177, 17)';
    document.querySelector('.tipBtn1').classList.remove('hidden');
    document.querySelector('.tipBtn2').classList.remove('hidden');
    document.querySelector('.tipBtn3').classList.remove('hidden');
    document.querySelector('.startBtn').classList.remove('lose'); //Smiley button clear
    document.querySelector('.startBtn').classList.remove('win');
    document.querySelector('.startBtn').classList.add('normal'); //setting default smiley
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.isOn = true;
    gGame.isTip = false;
    gGame.prevMoves = [];

    document.querySelector('.infoTime').innerHTML = '00 : 00'; //reset time str
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
        var mine = gBoard[getRandomInt(0, gBoard.length - 1)][getRandomInt(0, gBoard.length - 1)];
        if (mine.i === i && mine.j === j || mine.isMine) {
            mine.isMine = false;
            k--;
            continue;

        }
        mine.isMine = true;
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
        gTimerInterval = setInterval(Timer, 1000);
        placeMines(i, j);
    }
    if (gGame.isTip) {
        setTimeout(() => {
            gSonar.play();   
        }, 1000);
        if (cell.isMine) {
            return;
        }
        if (!cell.isMine) {
            showOnTip(cell, elCell, i, j)
        }
    }else  if (!cell.isShown) {
        cell.isShown = true;
        if (cell.isMine) {
            setTimeout(() => {
                gSink.play();
            }, 500);
            showAllMines();
            renderBoard();
            endGame();
        } else {
                gCannon.play();
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
    gSonar.play();
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

function showOnTip(cell, elCell, i, j) {
    if (cell.isMine) {
        return;
    }
    gGame.prevMoves.push(cell); //clicked cell to array
    cell.isShown = true;
    expandShownTip(gBoard, elCell, i, j);
    renderBoard();
    setTimeout(() => {
        for (var i = 0; i < gGame.prevMoves.length; i++) {
            gGame.prevMoves[i].isShown = false;
        }
        renderBoard();
        gGame.isTip = false;
        document.querySelector('.activeTipBtn').classList.add('hidden');
        gGame.prevMoves = [];
    }, 1000);
}

function expandShownTip(board, elCell, i, j) { // used if main cellClicked landed onto free space to show free cells and mine neighbour count cells

    for (var k = i - 1; k <= i + 1; k++) {
        for (var s = j - 1; s <= j + 1; s++) {
            if (k < 0 || k > board.length - 1 || s < 0 || s > board[0].length - 1 || k === i && s === j) {
                continue;
            }
            if (board[k][s].isMine) {
                continue;
            }
            if (!board[k][s].isMine && !board[k][s].isShown && !board[k][s].isMarked) {
                board[k][s].isShown = true;
                gGame.prevMoves.push(board[k][s]);
            }
        }
    }

}


function endGame() {
    if (gGame.isTip) {
        return;
    }
    document.querySelector('.startBtn').classList.remove('normal');
    document.querySelector('.startBtn').classList.add('lose');
    document.querySelector('.infoNum').style.color = 'red';
    document.querySelector('.infoTime').style.color = 'red';
    clearInterval(gTimerInterval);
    gGame.isOn = false;
}

function winGame() {
    if (gGame.isTip) {
        return;
    }
    document.querySelector('.startBtn').classList.remove('normal');
    document.querySelector('.startBtn').classList.add('win');
    setTimeout(() => {
        gWin.play();
    }, 1000);
    clearInterval(gTimerInterval);
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
    var seconds;
    var minutes;
    var sec;
    var min;
    var gEndTime = Date.now();
    var gameTime = parseInt((gEndTime - gStartTime) / 1000);
    seconds = +gameTime % 60;
    minutes = parseInt(gameTime/60) % 60;
    if(+minutes === 59) {
        endGame();
    }
    if(seconds < 10){
        sec = '0' + seconds;
    }else{
       sec =  seconds;
    }
    if(minutes < 10){
         min = '0' + minutes;
    }else{
       min =  minutes;
    }
    document.querySelector('.infoTime').innerHTML = `${min} : ${sec}`;
}

function tipOn(elBtn) {
    gSonar.play();
    gGame.isTip = true;
    if (document.querySelector('.activeTipBtn')) {
        document.querySelector('.activeTipBtn').classList.remove('activeTipBtn')
    }
    elBtn.classList.add('activeTipBtn');


}

function reload() {
    gReload.play();
}