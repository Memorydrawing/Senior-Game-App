const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.game-section');

navButtons.forEach((button) => {
  const target = button.dataset.target;
  button.setAttribute('aria-controls', target);
  const targetSection = document.getElementById(target);
  const isInitiallyActive = targetSection?.classList.contains('active');
  button.classList.toggle('active', Boolean(isInitiallyActive));
  button.setAttribute('aria-pressed', isInitiallyActive ? 'true' : 'false');

  button.addEventListener('click', () => {
    sections.forEach((section) => {
      const isActive = section.id === target;
      section.classList.toggle('active', isActive);
    });

    navButtons.forEach((navButton) => {
      const isActive = navButton === button;
      navButton.classList.toggle('active', isActive);
      navButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const nextSection = document.getElementById(target);
    if (nextSection && window.matchMedia('(max-width: 900px)').matches) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Mahjong Match
const mahjongSymbols = ['🐢', '🌸', '🀄', '🍵', '🎎', '🍂', '🌙', '🌺'];
const mahjongBoard = document.getElementById('mahjong-board');
const mahjongStatus = document.getElementById('mahjong-status');
const mahjongReset = document.getElementById('mahjong-reset');

let mahjongTiles = [];
let selectedTiles = [];
let mahjongMatched = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createMahjongTiles() {
  const pairs = [...mahjongSymbols, ...mahjongSymbols];
  mahjongTiles = shuffle(
    pairs.map((symbol, index) => ({ id: index, symbol, matched: false }))
  );
  mahjongBoard.innerHTML = '';
  mahjongMatched = 0;
  mahjongStatus.textContent = 'Find all 8 pairs to win.';
  selectedTiles = [];

  mahjongTiles.forEach((tile) => {
    const button = document.createElement('button');
    button.className = 'tile';
    button.textContent = tile.symbol;
    button.setAttribute('aria-label', `Mahjong tile ${tile.symbol}`);
    button.addEventListener('click', () => handleMahjongClick(tile, button));
    mahjongBoard.appendChild(button);
  });
}

function handleMahjongClick(tile, element) {
  if (tile.matched || selectedTiles.includes(tile)) {
    return;
  }

  element.classList.add('selected');
  selectedTiles.push(tile);

  if (selectedTiles.length === 2) {
    const [first, second] = selectedTiles;
    if (first.symbol === second.symbol) {
      first.matched = true;
      second.matched = true;
      mahjongMatched += 1;
      mahjongStatus.textContent = `Great! ${mahjongMatched} of 8 pairs matched.`;

      mahjongBoard
        .querySelectorAll('.tile')
        .forEach((btn, index) => {
          if (mahjongTiles[index].matched) {
            btn.classList.add('matched');
          }
        });

      if (mahjongMatched === mahjongSymbols.length) {
        mahjongStatus.textContent = 'You matched all tiles! Excellent job!';
      }
    } else {
      mahjongStatus.textContent = 'Not a match this time. Try another pair!';
      setTimeout(() => {
        mahjongBoard
          .querySelectorAll('.tile')
          .forEach((btn) => btn.classList.remove('selected'));
      }, 600);
    }
    selectedTiles = [];
  }
}

mahjongReset.addEventListener('click', createMahjongTiles);
createMahjongTiles();

// Relaxed Solitaire
const suits = ['♠', '♥', '♦', '♣'];
const values = [
  { label: 'A', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 11 },
  { label: 'Q', value: 12 },
  { label: 'K', value: 13 }
];

const drawButton = document.getElementById('draw-card');
const resetStockButton = document.getElementById('reset-stock');
const wasteCard = document.getElementById('waste-card');
const stockCount = document.getElementById('stock-count');
const solitaireStatus = document.getElementById('solitaire-status');
const solitaireReset = document.getElementById('solitaire-reset');
const foundationButtons = document.querySelectorAll('.foundation');

let deck = [];
let waste = [];
let foundations = {};

function createDeck() {
  const newDeck = [];
  suits.forEach((suit) => {
    values.forEach((entry) => {
      newDeck.push({ suit, label: entry.label, value: entry.value });
    });
  });
  return shuffle(newDeck);
}

function updateStockCount() {
  stockCount.textContent = `${deck.length} card${deck.length === 1 ? '' : 's'} left`;
}

function updateWasteCard() {
  const top = waste[waste.length - 1];
  if (!top) {
    wasteCard.textContent = 'Empty';
    wasteCard.classList.add('empty');
  } else {
    wasteCard.textContent = `${top.label}${top.suit}`;
    wasteCard.classList.remove('empty');
  }
}

function updateFoundations() {
  foundationButtons.forEach((button) => {
    const suit = button.dataset.suit;
    const topValue = foundations[suit];
    button.textContent = topValue === 0 ? suit : `${values[topValue - 1].label}${suit}`;
    button.classList.toggle('ready', waste.length > 0 && canPlaceOnFoundation(suit));
  });
}

function canPlaceOnFoundation(suit) {
  const top = waste[waste.length - 1];
  if (!top || top.suit !== suit) {
    return false;
  }
  return top.value === foundations[suit] + 1;
}

function drawCard() {
  if (deck.length === 0) {
    solitaireStatus.textContent = 'Stock empty. Use "Recycle Waste" to continue.';
    return;
  }
  waste.push(deck.pop());
  solitaireStatus.textContent = 'Card drawn. Place it on the matching suit.';
  updateWasteCard();
  updateStockCount();
  updateFoundations();
}

function recycleWaste() {
  if (deck.length > 0) {
    solitaireStatus.textContent = 'You still have cards in the stock.';
    return;
  }
  if (waste.length === 0) {
    solitaireStatus.textContent = 'No cards to recycle. Draw new cards first.';
    return;
  }
  deck = shuffle(waste.splice(0, waste.length));
  solitaireStatus.textContent = 'Waste recycled. Keep going!';
  updateWasteCard();
  updateStockCount();
  updateFoundations();
}

function placeOnFoundation(suit) {
  if (!canPlaceOnFoundation(suit)) {
    solitaireStatus.textContent = 'That foundation is not ready for this card yet.';
    return;
  }
  const card = waste.pop();
  foundations[suit] += 1;
  updateWasteCard();
  updateFoundations();
  solitaireStatus.textContent = `Great move! ${card.label}${card.suit} placed.`;
  checkSolitaireWin();
}

function checkSolitaireWin() {
  const totalPlaced = Object.values(foundations).reduce((sum, value) => sum + value, 0);
  if (totalPlaced === suits.length * values.length) {
    solitaireStatus.textContent = 'You completed all foundations! Congratulations!';
  }
}

function resetSolitaire() {
  deck = createDeck();
  waste = [];
  foundations = { '♠': 0, '♥': 0, '♦': 0, '♣': 0 };
  solitaireStatus.textContent = 'Fresh deck ready. Draw a card to begin.';
  updateStockCount();
  updateWasteCard();
  updateFoundations();
}

drawButton.addEventListener('click', drawCard);
resetStockButton.addEventListener('click', recycleWaste);
solitaireReset.addEventListener('click', resetSolitaire);
foundationButtons.forEach((button) => {
  button.addEventListener('click', () => placeOnFoundation(button.dataset.suit));
});

resetSolitaire();

// Calming Tetris
const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');
const scale = 30;
context.scale(scale, scale);

const arena = createMatrix(10, 20);

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  lines: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationFrame = null;
let isPaused = true;

const colors = [
  null,
  '#f94144',
  '#f3722c',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#577590',
  '#f8961e',
];

function createMatrix(width, height) {
  const matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T':
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    case 'O':
      return [
        [2, 2],
        [2, 2],
      ];
    case 'L':
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
      ];
    case 'J':
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
      ];
    case 'I':
      return [[5, 5, 5, 5]];
    case 'S':
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case 'Z':
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
    default:
      return [[1]];
  }
}

function collide(arenaMatrix, playerObj) {
  const [matrix, offset] = [playerObj.matrix, playerObj.pos];
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (
        matrix[y][x] !== 0 &&
        (arenaMatrix[y + offset.y] && arenaMatrix[y + offset.y][x + offset.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function merge(arenaMatrix, playerObj) {
  playerObj.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arenaMatrix[y + playerObj.pos.y][x + playerObj.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < y; x += 1) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  if (dir > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);
  if (collide(arena, player)) {
    arena.forEach((row) => row.fill(0));
    player.score = 0;
    player.lines = 0;
    updateScore();
    tetrisStatus.textContent = 'Board cleared. Keep practicing!';
  }
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; y -= 1) {
    for (let x = 0; x < arena[y].length; x += 1) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y += 1;
    player.score += 100;
    player.lines += 1;
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#0f1828';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
  if (isPaused) {
    return;
  }
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  animationFrame = requestAnimationFrame(update);
}

function playerDrop() {
  player.pos.y += 1;
  if (collide(arena, player)) {
    player.pos.y -= 1;
    merge(arena, player);
    arenaSweep();
    updateScore();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
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

function updateScore() {
  scoreDisplay.textContent = player.score;
  lineDisplay.textContent = player.lines;
}

const scoreDisplay = document.getElementById('tetris-score');
const lineDisplay = document.getElementById('tetris-lines');
const tetrisStatus = document.getElementById('tetris-status');
const startButton = document.getElementById('tetris-start');
const pauseButton = document.getElementById('tetris-pause');
const resetButton = document.getElementById('tetris-reset');
const controlButtons = document.querySelectorAll('.tetris-controls button');

startButton.addEventListener('click', () => {
  if (!isPaused) {
    tetrisStatus.textContent = 'Game already running.';
    return;
  }
  isPaused = false;
  lastTime = 0;
  dropInterval = 1000;
  dropCounter = 0;
  tetrisStatus.textContent = 'Game started. Enjoy the calm pace!';
  animationFrame = requestAnimationFrame(update);
});

pauseButton.addEventListener('click', () => {
  if (isPaused) {
    tetrisStatus.textContent = 'Game is already paused.';
    return;
  }
  isPaused = true;
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  tetrisStatus.textContent = 'Game paused. Take a break whenever you like.';
});

resetButton.addEventListener('click', () => {
  arena.forEach((row) => row.fill(0));
  player.score = 0;
  player.lines = 0;
  playerReset();
  updateScore();
  draw();
  tetrisStatus.textContent = 'Board reset. Press start to play again!';
});

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    switch (button.dataset.action) {
      case 'left':
        playerMove(-1);
        break;
      case 'right':
        playerMove(1);
        break;
      case 'down':
        playerDrop();
        break;
      case 'rotate':
        playerRotate(1);
        break;
      default:
        break;
    }
    draw();
  });
});

document.addEventListener('keydown', (event) => {
  if (isPaused) {
    return;
  }
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'ArrowUp' || event.key === ' ') {
    playerRotate(1);
  }
  draw();
});

playerReset();
draw();
updateScore();
