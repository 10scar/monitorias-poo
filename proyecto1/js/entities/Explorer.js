'use strict';

/**
 * El explorador.
 *
 * Guarda dos posiciones: la lógica (en celdas) y la de dibujo (interpolada
 * entre celdas). `Walk` mueve la primera; el render usa la segunda para que
 * el desplazamiento no se vea a saltos.
 */
class Explorer {
  constructor(cell) {
    this.cell = cell;
    this.renderRow = cell.row;
    this.renderCol = cell.col;
  }

  setCell(cell) {
    this.cell = cell;
    this.setRender(cell.row, cell.col);
  }

  setRender(row, col) {
    this.renderRow = row;
    this.renderCol = col;
  }

  pixelCenter(cellLength) {
    return {
      x: (this.renderCol + 0.5) * cellLength,
      y: (this.renderRow + 0.5) * cellLength,
    };
  }

  draw(time, cellLength) {
    const { x, y } = this.pixelCenter(cellLength);
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
    const [red, green, blue] = CONFIG.colors.lantern;

    push();
    noStroke();

    // Aura.
    fill(red, green, blue, 16);
    circle(x, y, cellLength * 1.35);
    fill(red, green, blue, 26);
    circle(x, y, cellLength * 0.9);

    // Cuerpo.
    fill(255, 229, 175, 245);
    circle(x, y, cellLength * (0.28 + pulse * 0.03));

    // Anillo.
    noFill();
    stroke(red, green, blue, 190);
    strokeWeight(Math.max(1, cellLength * 0.035));
    circle(x, y, cellLength * (0.48 + pulse * 0.05));

    // Pequeña chispa superior.
    noStroke();
    fill(255, 250, 230, 240);
    circle(x, y - cellLength * 0.17, cellLength * 0.05);

    pop();
  }
}
