'use strict';

/**
 * Una celda del tablero.
 *
 * Se usa en lugar de pasar pares sueltos (row, col) por todo el programa:
 * así no se pueden invertir los argumentos por accidente y las comparaciones
 * dicen lo que significan.
 */
class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   * Construye una celda a partir de coordenadas de píxeles del canvas.
   * Devuelve null cuando el punto cae fuera del tablero.
   */
  static fromPixel(x, y, cellLength, cols, rows) {
    const col = Math.floor(x / cellLength);
    const row = Math.floor(y / cellLength);
    const inside = row >= 0 && row < rows && col >= 0 && col < cols;
    return inside ? new Cell(row, col) : null;
  }

  equals(other) {
    return other instanceof Cell && this.row === other.row && this.col === other.col;
  }

  /** Clave estable para usar la celda en Set o Map. */
  key() {
    return `${this.row},${this.col}`;
  }

  manhattanTo(other) {
    return Math.abs(this.row - other.row) + Math.abs(this.col - other.col);
  }

  toString() {
    return `(${this.row}, ${this.col})`;
  }
}
