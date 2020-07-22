'use strict'
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gBoard = createBoard()
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

init();

function init() {
    renderBoard();
    console.log(gBoard);
}

function renderBoard() {
    var board = gBoard;
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += `<tr>`
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var cellClass = '';
            if (cell.isMine) {
                cellClass += ' mine';
            }
            strHtml += `<td class = "cell ${cellClass}" onclick="cellClicked(this, ${i}, ${j})">`
            strHtml += `${cell.minesAroundCount}`
            strHtml += `</td>`
        }
        strHtml += `</tr>`
    }
    document.querySelector('tBody').innerHTML = strHtml;

}

function createBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                i: i,
                j: j,
                isShown: true,
                isMine: false,
                isMarked: false,
                minesAroundCount: 0
            };


            board[i][j] = cell;
            if (cell.isShown && i === 1 && j === 1) cell.isMine = true;
           if (cell.isShown && i === 3 && j === 2) cell.isMine = true;
            if (cell.isMine) console.log("cell.i:", setMinesNegsCount(board,cell.i, cell.j));
            

        }
    }

    return board;
}


function setMinesNegsCount(board,i, j) {
    console.log("connect", i, j);

    
    for (var k = i - 1; k < i + 1; k++) {
        if(k < 0 || s < 0 || k > board.length  || s > board.length -1) continue;
        for (var s = j - 1; s < j + 1; s++) {
            if(k < 0 || s < 0 || k > board.length  || s > board.length -1) continue;
            console.log("connect ks", board[k][s]);
             board[k][s];
            if(!board[k][s].isMine)
             board[k][s].minesAroundCount++
        }
    }
    console.log(board);


}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];


    console.log("cell: ", cell);
    return cell;
}