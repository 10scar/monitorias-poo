'use strict';

/**
 * Un eco: el objeto que el jugador debe recoger.
 *
 * Su dibujo es una display function guardada en una celda 1×1 de Quadrille.
 * La celda se dibuja a sí misma y recibe el tiempo por `options`, no por estado
 * global. Ese es el guiño a Shine: presentación como dato, no como código suelto
 * en `draw()`.
 */
function relicDisplay(options) {
  const cellLength = options.cellLength;
  const time = options.t ?? 0;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.2 + options.phase);
  const radius = cellLength * 0.13;
  const [red, green, blue] = CONFIG.colors.relic;
  const [coreRed, coreGreen, coreBlue] = CONFIG.colors.relicCore;

  noStroke();

  // Halo exterior.
  for (let ring = 3; ring >= 1; ring--) {
    fill(red, green, blue, 10 + 6 * ring);
    circle(0, 0, radius * (2.2 + ring * 1.1 + pulse * 0.7));
  }

  // Anillo y rombo.
  noFill();
  stroke(red, green, blue, 130 + 70 * pulse);
  strokeWeight(Math.max(1, cellLength * 0.035));
  circle(0, 0, radius * (2.3 + pulse * 0.4));

  noStroke();
  fill(coreRed, coreGreen, coreBlue, 230);
  quad(0, -radius, radius, 0, 0, radius, -radius, 0);

  fill(255, 255, 255, 220);
  circle(0, 0, radius * 0.5);
}

class Relic {
  constructor(cell, phase) {
    this.cell = cell;
    this.phase = phase;
    this.collected = false;
    this.board = createQuadrille(1, 1).fill(relicDisplay);
  }

  isAt(cell) {
    return !this.collected && this.cell.equals(cell);
  }

  collect() {
    this.collected = true;
  }

  draw(time) {
    if (this.collected) {
      return;
    }

    drawQuadrille(this.board, {
      x: this.cell.col * CONFIG.maze.cellLength,
      y: this.cell.row * CONFIG.maze.cellLength,
      options: {
        t: time,
        phase: this.phase,
        cellLength: CONFIG.maze.cellLength,
        origin: 'center',
      },
      outlineWeight: 0,
    });
  }
}
