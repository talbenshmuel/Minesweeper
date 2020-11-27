'use strict';
var gLevel = {
    SIZE: 16,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    firstClick: true,
    isLightBulb: false,
    heartCount: 3

}

// var gLevelTry = 'Beginner';
var gGameInterval;
var gElBulb;
var gElSteppedMine;
var seconds = 0
var minutes = 0
var newSeconds = 0
var newMinutes = 0
var elStopwatch = document.querySelector('.stopwatch b');

var gMineslocations;
var gBoard;
var MINE = '💣';
var FLAG = '🚩';

function initGame() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        firstClick: true,
        isLightBulb: false,
        heartCount: 3
    }
    gElBulb;
    gBoard = buildBoard(gLevel.SIZE);
    //// start to edit here-----+}
    console.table(gBoard);
    renderBoard(gBoard);
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = '😄';
    var elBulb = document.querySelector('.light-bulb');
    elBulb.innerHTML = `<span onclick="useHint(this)">💡</span><span onclick="useHint(this)">💡</span><span onclick="useHint(this)">💡</span>`
    var elHearts = document.querySelector('.hearts-span');
    elHearts.innerHTML = `<span class="hearts">❤️</span><span class="hearts">❤️</span><span class="hearts">❤️</span>`;
    var elFlagCounter = document.querySelector('.flags-count');
    elFlagCounter.innerHTML = gLevel.MINES - gGame.markedCount;
    var elSafeButtons = document.querySelector('.safe-clicks');
    elSafeButtons.innerHTML = `<span onclick="findSafeCell(this)">👌</span><span onclick="findSafeCell(this)">👌</span><span onclick="findSafeCell(this)">👌</span></span>`;
}



function restart(numOfCells = gLevel.SIZE, numOfMines = gLevel.MINES) {
    var elSmiley = document.querySelector('.smiley');
    gLevel = {
        SIZE: numOfCells,
        MINES: numOfMines
    };
    pauseTime()
    closeModal()
    elSmiley.innerHTML = '😉';
    setTimeout(function () {
        elSmiley.innerHTML = '😄';
        initGame()
    }, 200)

}
function buildBoard(numOfCells) {
    var board = [];
    var boardSize = Math.sqrt(numOfCells)
    for (var i = 0; i < boardSize; i++) {
        board.push([])
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = {
                value: '',
                minesAroundCount: null,
                isMine: false,
                flagValue: null,
                heartValue: null,
                isMarked: false,
                isShown: false
            }
        }
    }
    return board;
}


function placeMine(numOfCells, numOfMines, firstClickCell) {
    var mineCount = 0;
    var boardSize = Math.sqrt(numOfCells);

    while (mineCount < numOfMines) {
        var i = getRandomInt(0, boardSize);
        var j = getRandomInt(0, boardSize);
        var cell = gBoard[i][j];
        if (cell === firstClickCell) continue;
        if (!cell.isMine) {
            cell.value = MINE;
            cell.isMine = true;
            mineCount++

        }
    }
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {

            var minesNegsCount = setMinesNegsCount(i, j, board);
            var cell = board[i][j];
            if (minesNegsCount) {
                cell.minesAroundCount = minesNegsCount;
                if (!cell.isMine && !cell.isMarked)
                    cell.value = minesNegsCount;
            }

            var cellClass = '';
            if (cell.isMine) cellClass += 'mine';
            if (cell.minesAroundCount && !cell.isMine) cellClass += 'number'
            if (cell.isShown && !cell.isMarked) cellClass += ' clicked';
            if (cell === gElSteppedMine) cellClass += ' stepped-on-mine';

            var cellSpan = '';
            var cellSpanVisibility = 'hidden';
            if (cell.isShown) {
                cellSpanVisibility = '';
            }
            if (gGame.isOn && !cell.isShown && cell.isMine) {
                cellSpan = `<span>${cell.value}</span>`;
                cellClass += ' clicked';
            } else if (!cell.value) {
                `<span></span>`
            } else {
                cellSpan = `<span ${cellSpanVisibility}>${cell.value}</span>`
            }
            if (cell.isMarked && cell.flagValue && cell.isMine && gGame.isOn) cellSpan = `<span>❌</span>`;
            else if (cell.isMarked && cell.flagValue) cellSpan = `<span>${cell.flagValue}</span>`;

            if (cell.isMarked && cell.heartValue) cellSpan = `<span>${cell.heartValue}</span>`;


            strHTML += `<td class="cell ${cellClass} cell-${i}-${j}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})">`
            // if () { add this if(!somthing) - when the user click on one of the mines- 
            strHTML += cellSpan;
            // }

            strHTML += '</td>'

        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    // // gives me the object
    // console.log(currCell);
    // //give me the html
    // console.log(elCell);

    if (!gGame.isLightBulb) {
        if (gGame.firstClick) {
            gGameInterval = setInterval(displayTime, 1000);
            gGame.firstClick = false;
            placeMine(gLevel.SIZE, gLevel.MINES, currCell);
            renderBoard(gBoard);
            console.table(gBoard)
        }
        if (!gGame.isOn && !currCell.flagValue) {
            currCell.isShown = true;
            if (currCell.isMine) {
                if (gGame.heartCount === 0) {
                    gElSteppedMine = currCell;
                    gGame.isOn = true;
                    clearInterval(gGameInterval);
                    gameOver();
                } else if (!currCell.heartValue) {
                    gGame.heartCount--;
                    removeHeart();
                    currCell.heartValue = '❤️';
                    currCell.isMarked = true;
                    elCell.classList.add('clicked');
                }
            }
            else if (!currCell.value) {
                openNegsCells(i, j, gBoard);

            }
            renderBoard(gBoard);
        }
        if (countShownCells(gLevel.SIZE) + gGame.markedCount === gLevel.SIZE && !gGame.isOn) {
            // var elGameTimerResult = document.querySelector('.game-info b');
            gGame.isOn = true;
            clearInterval(gGameInterval);
            // keepBestTime(gLevelTry,elGameTimerResult);
            gameWin();
        }
    }
    else if (gGame.isLightBulb && !currCell.isShown && !currCell.isMarked) {
        openNegsCellsHintOn(i, j);
    }
}


function useHint(elBulb) {
    console.log(elBulb);
    if (!gGame.isOn) {
        if (!gGame.isLightBulb && elBulb.innerHTML !== '❌') {
            elBulb.innerHTML = '❌';
            gGame.isLightBulb = true;
        }
        gElBulb = elBulb;
    }
}

function removeHeart() {

    var elHearts = document.querySelectorAll('.hearts');
    var currHeart = elHearts[gGame.heartCount];

    currHeart.style.visibility = 'hidden';


}

function flagsCount() {
    var elFlagCounter = document.querySelector('.flags-count');
    elFlagCounter.innerHTML = gLevel.MINES - gGame.markedCount;
}

function setMinesNegsCount(cellI, cellJ, board) {
    var mineSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].value === MINE) mineSum++;

        }
    }
    return mineSum;

}


function openNegsCells(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        var currCellI = i
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            var currCellJ = j
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[currCellI][currCellJ].isMarked) continue;
            gBoard[currCellI][currCellJ].isShown = true;

        }
    }

}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // including min, not including max
}


function setSmiley(smileyExpression) {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = smileyExpression;
}

function gameOver() {
    setSmiley('😫');
    openModal('GAME OVER!!')
}

function gameWin() {
    setSmiley('😎');
    openModal('You did it!!')
}

function openModal(modalText) {
    var elModal = document.querySelector('.modal');
    var elModalSpan = elModal.querySelector('h3 span');
    elModal.style.display = 'block';
    elModalSpan.innerHTML = modalText;

}

function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

function countShownCells(numOfCells) {
    gGame.shownCount = 0;
    var boardSize = Math.sqrt(numOfCells)
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            var cell = gBoard[i][j];
            if (cell.isShown) gGame.shownCount++;
        }

    }
    return gGame.shownCount;
}

function cellMarked(elCell, i, j) {
    var currCell = gBoard[i][j];

    if (gGame.markedCount <= gLevel.MINES + 1) {
        // if he is shown- you cannot click it
        if (!currCell.isShown && !gGame.isOn) {
            // if the cell is not marked, you place a flag
            if (!currCell.isMarked && gGame.markedCount < gLevel.MINES) {
                currCell.flagValue = FLAG;
                currCell.isMarked = true;
                gGame.markedCount++;
                renderBoard(gBoard)
                // if the cell is marked, take out the flag
            } else if (currCell.isMarked) {
                currCell.flagValue = null;
                currCell.isMarked = false;
                gGame.markedCount--;
                renderBoard(gBoard)
            }

        }
        flagsCount();
        // console.log(gGame.markedCount);
        if (countShownCells(gLevel.SIZE) + gGame.markedCount === gLevel.SIZE) {
            var elGameTimerResult = document.querySelector('.game-info b');
            gGame.isOn = true;
            clearInterval(gGameInterval);
            // keepBestTime(gLevelTry,elGameTimerResult);
            gameWin();
        }
    }
}


function displayTime() {
    seconds++
    newSeconds = (seconds < 10) ? '0' + seconds.toString() : seconds
    newMinutes = (minutes < 10) ? '0' + minutes.toString() : minutes
    if (seconds / 59 === 1) {
        seconds = 0
        minutes++
    }
    gGame.secsPassed = `${newMinutes}:${newSeconds}`
    elStopwatch.innerText = `${newMinutes}:${newSeconds}`
}

function pauseTime() {
    clearInterval(gGameInterval)
    gGameInterval = null
    seconds = 0
    minutes = 0
    newSeconds = 0
    newMinutes = 0
    elStopwatch.innerText = '00:00'
}


function openNegsCellsHintOn(cellI, cellJ) {
    var neighborsInnerHtml = [];
    var currCell = gBoard[cellI][cellJ];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        var currCellI = i
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            var currCellJ = j;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[currCellI][currCellJ].isMarked) continue;
            if (gBoard[currCellI][currCellJ].isShown) continue;
            // gBoard[currCellI][currCellJ].isNeighbor = true;
            var elCell = document.querySelector(`.cell-${currCellI}-${currCellJ}`);
            var currCellHTML = elCell.innerHTML;
            neighborsInnerHtml.push(currCellHTML);
            elCell.classList.add('clicked');
            elCell.innerHTML = `<span>${gBoard[currCellI][currCellJ].value}</span>`;
        }
    }
    setTimeout(function () {
        var count = 0;
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            var currCellI = i
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                var currCellJ = j;
                if (j < 0 || j >= gBoard[i].length) continue;
                if (gBoard[currCellI][currCellJ].isMarked) continue;
                if (gBoard[currCellI][currCellJ].isShown) continue;
                // gBoard[currCellI][currCellJ].isNeighbor = true;
                var elCell = document.querySelector(`.cell-${currCellI}-${currCellJ}`);
                elCell.classList.remove('clicked');
                elCell.innerHTML = neighborsInnerHtml[count];
                count++;
            }
        }
    }, 1000);
    gGame.isLightBulb = false;
}

function findSafeCell(elSafeEmojy) {

    var safeCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine || cell.isMarked || cell.isShown || cell.heartValue) continue;
            safeCells.push(`cell-${i}-${j}`);
        }
    }
    if (safeCells.length > 0 && elSafeEmojy.innerHTML !== '❌') {
        var safeCell = safeCells[getRandomInt(0, safeCells.length)];
        var elSafeCell = document.querySelector(`.${safeCell}`);
        var currCellHTML = elSafeCell.innerHTML;
        elSafeCell.classList.add('clicked');
        elSafeCell.innerHTML = `<span>${gBoard[safeCell.charAt(5)][safeCell.charAt(safeCell.length - 1)].value}</span>`
        setTimeout(function () {
            elSafeCell.classList.remove('clicked');
            elSafeCell.innerHTML = currCellHTML;
        }, 1000);
        elSafeEmojy.innerHTML = '❌';
    }


}

