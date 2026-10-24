'use strict';

/**
 * El Umbral: la salida del laberinto.
 *
 * Permanece sellado hasta que todos los ecos hayan sido recogidos. Su display
 * function lee `options.open`, así que una sola función sirve para los dos
 * estados sin duplicar dibujo.
 */
function portalDisplay(options) {
  const cellLength = options.cellLength;
  const time = options.t ?? 0;
  const open = Boolean(options.open);
  const spin = time * (open ? 0.9 : 0.22);
  const radius = cellLength * (open ? 0.27 : 0.22);
  const color = open ? CONFIG.colors.portalOpen : CONFIG.colors.portalClosed;
  const pulse = 0.5 + 0.5 * Math.sin(time * (open ? 2.6 : 1.2));

  noFill();

  // Halo.
  noStroke();
  for (let ring = 3; ring >= 1; ring--) {
    fill(color[0], color[1], color[2], open ? 8 + ring * 3 : 4 + ring * 2);
    circle(0, 0, radius * (2 + ring * 0.85 + pulse * 0.2));
  }

  // Aro principal.
  stroke(color[0], color[1], color[2], open ? 220 : 130);
  strokeWeight(Math.max(1, cellLength * 0.035));
  circle(0, 0, radius * 2);

  // Ocho marcas que giran más rápido cuando el Umbral está abierto.
  strokeWeight(Math.max(1, cellLength * 0.028));
  for (let i = 0; i < 8; i++) {
    const angle = spin + (i * Math.PI) / 4;
    const inner = radius * 0.72;
    const outer = radius * 1.02;
    line(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner,
      Math.cos(angle) * outer,
      Math.sin(angle) * outer
    );
  }

  // Núcleo.
  noStroke();
  fill(color[0], color[1], color[2], open ? 240 : 110);
  quad(0, -radius * 0.5, radius * 0.5, 0, 0, radius * 0.5, -radius * 0.5, 0);
}

class Portal {
  constructor(cell) {
    this.cell = cell;
    this.open = false;
    this.board = createQuadrille(1, 1).fill(portalDisplay);
  }

  isAt(cell) {
    return this.cell.equals(cell);
  }

  unlock() {
    this.open = true;
  }

  draw(time) {
    drawQuadrille(this.board, {
      x: this.cell.col * CONFIG.maze.cellLength,
      y: this.cell.row * CONFIG.maze.cellLength,
      options: {
        t: time,
        open: this.open,
        cellLength: CONFIG.maze.cellLength,
        origin: 'center',
      },
      outlineWeight: 0,
    });
  }
}
