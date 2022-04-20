const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

var blockWords = [];
var dict;
var points = {
    "a": { "points":  1, "tiles":  9 },
    "b": { "points":  3, "tiles":  2 },
    "c": { "points":  3, "tiles":  2 },
    "d": { "points":  2, "tiles":  4 },
    "e": { "points":  1, "tiles": 12 },
    "f": { "points":  4, "tiles":  2 },
    "g": { "points":  2, "tiles":  3 },
    "h": { "points":  4, "tiles":  2 },
    "i": { "points":  1, "tiles":  9 },
    "j": { "points":  8, "tiles":  1 },
    "k": { "points":  5, "tiles":  1 },
    "l": { "points":  1, "tiles":  4 },
    "m": { "points":  3, "tiles":  2 },
    "n": { "points":  1, "tiles":  6 },
    "o": { "points":  1, "tiles":  8 },
    "p": { "points":  3, "tiles":  2 },
    "q": { "points": 10, "tiles":  1 },
    "r": { "points":  1, "tiles":  6 },
    "s": { "points":  1, "tiles":  4 },
    "t": { "points":  1, "tiles":  6 },
    "u": { "points":  1, "tiles":  4 },
    "v": { "points":  4, "tiles":  2 },
    "w": { "points":  4, "tiles":  2 },
    "x": { "points":  8, "tiles":  1 },
    "y": { "points":  4, "tiles":  2 },
    "z": { "points": 10, "tiles":  1 }
}
// var blockWords = ["prez","prig","prim","proa","prod","prof","prog","prom"];
context.scale(30, 30);

$.get('https://raw.githubusercontent.com/zeisler/scrabble/master/db/dictionary.csv', function(data) {
    dict = data.split('\r\n');

    dict.forEach(word => {
        if (word.length == 4) {
            blockWords.push(word);
        }
    });

    playerReset();
    updateScore();
    update();
});


// this function checks for words
function arenaSweep() {
    var bestVert = 0;
    var bestVertX = -1;
    var bestVertY = -1;

    var bestHoriz = 0;
    var bestHorizX = -1;
    var bestHorizY = -1;

    for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] !== 0) {
                var len1 = checkVertical(x, y);
                var len2 = checkHorizontal(x, y);

                if (len1 > bestVert) {
                    bestVert = len1;
                    bestVertX = x;
                    bestVertY = y;
                }
                if (len2 > bestHoriz) {
                    bestHoriz = len2;
                    bestHorizX = x;
                    bestHorizY = y;
                }
            }
        }
    }
    if (bestHoriz >= bestVert) {
        if (bestHoriz >= 3) {
            var letterscore = 0;
            for (var i = 0; i < bestHoriz; i++) {
                letterscore += points[arena[bestHorizY][bestHorizX+i][1].toLowerCase()]["points"];

                // shift everything down
                for (var y = bestHorizY; y > 0; y--) {
                    arena[y][bestHorizX+i] = arena[y - 1][bestHorizX+i];
                }
                arena[0][bestHorizX+i] = 0;
            }
            player.score += Math.ceil(letterscore * Math.pow(2, bestHoriz) / bestHoriz);
        }
    }
    else {
        if (bestVert >= 3) {
            var letterscore = 0;
            for (var i = 0; i < bestVert; i++) {
                letterscore += points[arena[bestVertY+i][bestVertX][1].toLowerCase()]["points"];
            }
            player.score += Math.ceil(letterscore * Math.pow(2, bestVert) / bestVert);

            for (var i = bestVertY + bestVert - 1; i >= 0; i--) {
                if (i - bestVert < 0) {
                    arena[i][bestVertX] = 0;
                }
                else {
                    arena[i][bestVertX] = arena[i - bestVert][bestVertX];
                }
            }
        }
    }
}

// check if a word exists starting at x, y
function checkVertical(x, y) {
    var maxLen = 0;
    var word = "";
    // words must be formed from multiple blocks
    var isMultiblock = false;
    for (var len = 0; len < arena.length - y; len++) {
        if (arena[y+len][x] === 0) {
            break;
        }
        var block1 = arena[y][x][2];

        word += arena[y+len][x][1];

        if (arena[y+len][x][2] != block1) {
            isMultiblock = true;
        }

        if (dict.includes(word.toLowerCase()) && isMultiblock) {
            if (len > maxLen) {
                maxLen = len;
            }
        }
    }
    return maxLen + 1;
}

// check if a word exists starting at x, y
function checkHorizontal(x, y) {
    var maxLen = 0;
    var word = "";
    // words must be formed from multiple blocks
    var isMultiblock = false;
    for (var len = 0; len < arena[0].length - x; len++) {
        if (arena[y][x+len] === 0) {
            break;
        }
        var block1 = arena[y][x][2];

        word += arena[y][x+len][1];

        if (arena[y][x+len][2] != block1) {
            isMultiblock = true;
        }

        if (dict.includes(word.toLowerCase()) && isMultiblock) {
            if (len > maxLen) {
                maxLen = len;
            }
        }
    }
    return maxLen + 1;
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 0 || value[1] === 0) {
                // do nothing
            }
            else {
                context.fillStyle = colors[value[0]];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);

                context.fillStyle = "#fff";
                context.font = '1px monospace';
                context.fillText(value[1], x + offset.x + 0.25, y + offset.y + 0.85);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);

    var word = blockWords[blockWords.length * Math.random() | 0].toUpperCase();
    var index = 0;
    // assign word to the piece
    for (var i = 0; i < player.matrix.length; i++) {
        for (var j = 0; j < player.matrix[0].length; j++) {
            if (player.matrix[i][j] !== 0) {
                player.matrix[i][j] = [player.matrix[i][j], word[index], player.blockNum];
                index++;
            }
        }
    }

    player.blockNum++;

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(8, 13);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    blockNum: 0,
};
