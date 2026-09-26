'use strict';

// Play's turn-taking game for N players, with a HISTORY.
//
// Same rules as the 2-player sketch: one board, whose-turn read off `order`,
// the click guarded by `isValid` then `isEmpty`. Marks are integers 0..PLAYERS-1
// instead of 'X' / 'O'. The turn is `order % PLAYERS`.
//
// The board is never overwritten. Every position is kept, and `index` says
// which one we are looking at. A move clones the present; undo/redo move an int.

const BOARD = 360;                     // board side, in pixels
const SIZE_MIN = 2;                    // smallest board (SIZE_MIN x SIZE_MIN)
const SIZE_MAX = 10;                   // largest board
const PLAYERS_MIN = 2;                 // at least two players
const PLAYERS_MAX = 9;                 // symbols 0 .. PLAYERS_MAX-1
const THUMB = 10;                      // cell length of a history thumbnail
const STRIP_Y = 376;                   // top of the history strip

let size = 3;                          // board size: size x size
let players = 3;                       // n players; symbols '0', '1', ...
let timeline = [];                     // every position, oldest first
let index = 0;                         // the one on screen
let undoButton, redoButton, resetButton;
let sizeMinusButton, sizePlusButton;
let playersMinusButton, playersPlusButton;

function setup() {
  createCanvas(BOARD, 455);
  Quadrille.cellLength = BOARD / size;
  undoButton = createButton('undo');
  undoButton.position(0, height + 8);
  undoButton.mousePressed(undo);
  redoButton = createButton('redo');
  redoButton.position(58, height + 8);
  redoButton.mousePressed(redo);
  resetButton = createButton('new game');
  resetButton.position(116, height + 8);
  resetButton.mousePressed(reset);

  sizeMinusButton = createButton('board −');
  sizeMinusButton.position(210, height + 8);
  sizeMinusButton.mousePressed(shrinkBoard);
  sizePlusButton = createButton('board +');
  sizePlusButton.position(278, height + 8);
  sizePlusButton.mousePressed(growBoard);

  playersMinusButton = createButton('players −');
  playersMinusButton.position(0, height + 36);
  playersMinusButton.mousePressed(fewerPlayers);
  playersPlusButton = createButton('players +');
  playersPlusButton.position(90, height + 36);
  playersPlusButton.mousePressed(morePlayers);

  reset();
}

// The position on screen. There is no other board.
function present() {
  return timeline[index];
}

function reset() {
  Quadrille.cellLength = BOARD / size;
  timeline = [createQuadrille(size, size)];  // history starts with the empty board
  index = 0;
}

function shrinkBoard() {
  if (size > SIZE_MIN) {
    size--;
    reset();
  }
}

function growBoard() {
  if (size < SIZE_MAX) {
    size++;
    reset();
  }
}

function fewerPlayers() {
  if (players > PLAYERS_MIN) {
    players--;
    reset();
  }
}

function morePlayers() {
  if (players < PLAYERS_MAX) {
    players++;
    reset();
  }
}

function draw() {
  background('#faf7f0');
  // The strip is drawn FIRST so the big board is the last draw of the frame —
  // that is the placement `mouseRow` and `mouseCol` report.
  strip();
  drawQuadrille(present(), { outline: '#cbbf9e', outlineWeight: 2 });
  status();
  undoButton.elt.disabled = index === 0;
  redoButton.elt.disabled = index === timeline.length - 1;
  sizeMinusButton.elt.disabled = size === SIZE_MIN;
  sizePlusButton.elt.disabled = size === SIZE_MAX;
  playersMinusButton.elt.disabled = players === PLAYERS_MIN;
  playersPlusButton.elt.disabled = players === PLAYERS_MAX;
}

// Every snapshot, small, with the current one picked out.
function strip() {
  const side = size * THUMB, gap = 6;
  push();
  noStroke();
  fill('#6b705c');
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text('history · ' + timeline.length + ' snapshots · board ' + size + '×' + size
     + ' · ' + players + ' players', 2, STRIP_Y - 5);
  pop();
  timeline.forEach((snapshot, i) => drawQuadrille(snapshot, {
    x: i * (side + gap), y: STRIP_Y,
    cellLength: THUMB,
    outline: i === index ? '#d1495b' : '#cbbf9e',
    outlineWeight: i === index ? 2 : 1
  }));
}

// The question is asked of the SNAPSHOT, so stepping back in time
// restores the turn for free.
function status() {
  const board = present();
  push();
  noStroke();
  fill('#6b705c');
  textSize(13);
  textAlign(CENTER, CENTER);
  const mark = board.order % players;
  const turn = 'player ' + mark + ' (' + mark + ')';
  text(board.order === board.size ? 'board full — undo, or start a new game'
     : 'snapshot ' + index + ' of ' + (timeline.length - 1) + ' · ' + turn + ' to move',
    BOARD / 2, 430);
  pop();
}

function mousePressed() {
  let jumped = false;
  timeline.forEach((snapshot, i) => {
    if (i === index) return;
    if (snapshot.isValid(snapshot.mouseRow, snapshot.mouseCol)) {
      index = i;
      jumped = true;
    }
  });
  if (jumped) return;

  // Alternativa con for + mouseRow/col:
  // for (let i = 0; i < timeline.length; i++) {
  //   if (i === index) continue;
  //   const snap = timeline[i];
  //   if (snap.isValid(snap.mouseRow, snap.mouseCol)) {
  //     index = i;
  //     return;
  //   }
  // }

  // Alternativa con for + rangos (mouseX / mouseY):
  // const side = size * THUMB, gap = 6;
  // for (let i = 0; i < timeline.length; i++) {
  //   const x = i * (side + gap);
  //   if (mouseX >= x && mouseX < x + side &&
  //       mouseY >= STRIP_Y && mouseY < STRIP_Y + side) {
  //     index = i;
  //     return;
  //   }
  // }

  const board = present();
  const row = board.mouseRow;
  const col = board.mouseCol;
  // isValid first, then narrow — Sketch's guard, Play's reason
  if (board.isValid(row, col) && board.isEmpty(row, col)) {
    const next = board.clone();        // the future is a COPY of the present
    next.fill(row, col, String(board.order % players));  // '0'..'n-1' as text
    timeline.length = index + 1;       // playing from the past drops the old future
    timeline.push(next);
    index++;
  }
}

// Navigating time is changing an integer. Nothing is restored, copied or undone.
function undo() {
  if (index > 0) {
    index--;
  }
}

function redo() {
  if (index < timeline.length - 1) {
    index++;
  }
}
