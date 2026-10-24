'use strict';

/**
 * El laberinto y sus consultas.
 *
 * `walls` es la verdad del nivel: celdas llenas = muro, celdas vacías = piso.
 * `known` es la misma verdad, pero con todo el piso no explorado bloqueado;
 * es el tablero sobre el que camina el jugador. Esa máscara es lo que hace
 * que la niebla tenga consecuencias y no sea solo un efecto visual.
 */
class Dungeon {
  constructor({ cols, rows, cellLength }) {
    this.cols = cols;
    this.rows = rows;
    this.cellLength = cellLength;
    this.start = new Cell(0, 0);
    this.walls = null;
    this.known = null;
    this.reachField = null;
    this.maxDistance = 0;
  }

  /** Genera un laberinto perfecto y reproducible a partir de una semilla. */
  generate(seed) {
    randomSeed(seed);

    this.walls = createQuadrille(this.cols, this.rows).maze(color(CONFIG.colors.wall));
    this.start = this._pickSpawn();
    this.reachField = this.walls.reach(this.start.row, this.start.col);
    this.maxDistance = this._measureMaxDistance();
    this.known = this._buildKnownMask();

    return this;
  }

  /**
   * El laberinto se cava desde la esquina, pero el jugador no tiene por qué
   * empezar ahí: arrancar en el centro evita media linterna fuera del tablero
   * y hace que la primera vista sea más legible.
   */
  _pickSpawn() {
    const center = new Cell(
      Math.floor(this.rows / 2),
      Math.floor(this.cols / 2)
    );

    if (this.walls.isEmpty(center.row, center.col)) {
      return center;
    }

    let best = new Cell(0, 0);
    let bestDistance = Infinity;

    this.walls.visit(({ row, col }) => {
      if (!this.walls.isEmpty(row, col)) {
        return;
      }

      const distance = Math.abs(row - center.row) + Math.abs(col - center.col);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = new Cell(row, col);
      }
    });

    return best;
  }

  /**
   * Copia los muros y bloquea, además, cada celda de piso que todavía no se
   * ha explorado. `Reveal` va liberando esas celdas a medida que la linterna
   * las toca.
   */
  _buildKnownMask() {
    const known = this.walls.clone();

    this.walls.visit(({ row, col }) => {
      if (this.walls.isEmpty(row, col)) {
        known.fill(row, col, true);
      }
    });

    return known;
  }

  _measureMaxDistance() {
    let max = 0;

    this.reachField.visit(({ value }) => {
      if (typeof value === 'number' && value > max) {
        max = value;
      }
    });

    return max;
  }

  isInside(cell) {
    return Boolean(cell) && this.walls.isValid(cell.row, cell.col);
  }

  isFloor(cell) {
    return this.isInside(cell) && this.walls.isEmpty(cell.row, cell.col);
  }

  isWall(cell) {
    return this.isInside(cell) && this.walls.isFilled(cell.row, cell.col);
  }

  /** Abre una celda de piso en la máscara de paso. Los muros nunca se abren. */
  unlock(cell) {
    if (this.isFloor(cell)) {
      this.known.clear(cell.row, cell.col);
    }
  }

  /**
   * Ruta más corta entre dos celdas usando únicamente lo ya explorado.
   * Devuelve [] si no hay ruta (o si el destino es un muro).
   */
  path(from, to) {
    const steps = this.known.path(from.row, from.col, to.row, to.col);
    return steps.map(({ row, col }) => new Cell(row, col));
  }

  distanceAt(cell) {
    const value = this.reachField.read(cell.row, cell.col);
    return typeof value === 'number' ? value : 0;
  }

  /** La celda de piso más lejana al inicio: allí vive el Umbral. */
  farthestCell() {
    let best = this.start;
    let bestDistance = -1;

    this.walls.visit(({ row, col }) => {
      if (!this.walls.isEmpty(row, col)) {
        return;
      }

      const distance = this.distanceAt(new Cell(row, col));
      if (distance > bestDistance) {
        bestDistance = distance;
        best = new Cell(row, col);
      }
    });

    return best;
  }

  floorCells() {
    const cells = [];

    this.walls.visit(({ row, col }) => {
      if (this.walls.isEmpty(row, col)) {
        cells.push(new Cell(row, col));
      }
    });

    return cells;
  }

  cellsInDistanceBand(fraction, width) {
    const center = this.maxDistance * fraction;
    const halfWidth = Math.max(2, this.maxDistance * width);
    const cells = [];

    this.walls.visit(({ row, col }) => {
      if (!this.walls.isEmpty(row, col)) {
        return;
      }

      const cell = new Cell(row, col);
      const distance = this.distanceAt(cell);
      if (Math.abs(distance - center) <= halfWidth) {
        cells.push(cell);
      }
    });

    return cells;
  }

  cellAtPixel(x, y) {
    return Cell.fromPixel(x, y, this.cellLength, this.cols, this.rows);
  }

  pixelCenter(cell) {
    return {
      x: (cell.col + 0.5) * this.cellLength,
      y: (cell.row + 0.5) * this.cellLength,
    };
  }

  draw() {
    drawQuadrille(this.walls, {
      outline: CONFIG.colors.wallEdge,
      outlineWeight: 1,
    });
  }
}
