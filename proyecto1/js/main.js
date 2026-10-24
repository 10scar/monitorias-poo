'use strict';

/**
 * Punto de entrada de p5.js (modo global).
 *
 * Aquí solo se conecta el ciclo de vida de p5 con el juego: crear el canvas,
 * instanciar `Game` y reenviar eventos. Toda la lógica vive en las clases.
 */
let game;

function setup() {
  Quadrille.cellLength = CONFIG.maze.cellLength;

  const canvas = createCanvas(
    CONFIG.maze.cols * CONFIG.maze.cellLength,
    CONFIG.maze.rows * CONFIG.maze.cellLength
  );
  canvas.parent('canvas-host');
  pixelDensity(2);
  canvas.elt.setAttribute('role', 'application');
  canvas.elt.setAttribute(
    'aria-label',
    'Laberinto de Ecos en la Niebla. Haz clic en una casilla explorada para caminar.'
  );
  canvas.elt.tabIndex = 0;

  frameRate(60);

  const hud = new Hud();
  game = new Game(hud);
}

function draw() {
  if (!game) {
    return;
  }
  game.update(deltaTime);
  game.draw();
}

function mousePressed() {
  if (!game) {
    return;
  }

  const insideCanvas = mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height;
  if (insideCanvas) {
    game.handleClick(mouseX, mouseY);
  }
}

function keyPressed(event) {
  if (!game) {
    return;
  }

  if (key === 'r' || key === 'R') {
    game.restart();
    event?.preventDefault();
    return false;
  }

  return undefined;
}
