'use strict';

/**
 * La celda de niebla se dibuja a sí misma.
 * `options.alpha` es la única fuente de verdad del estado visual; la función
 * no guarda nada y no decide nada, solo pinta lo que le entregan.
 */
function veilDisplay(options) {
  const alpha = options.alpha[options.row][options.col];
  const half = options.cellLength / 2;

  noStroke();
  fill(CONFIG.colors.veil[0], CONFIG.colors.veil[1], CONFIG.colors.veil[2], alpha);
  rect(-half - 0.5, -half - 0.5, options.cellLength + 1, options.cellLength + 1);
}

/**
 * Mecánica Reveal.
 *
 * Mantiene tres capas de información:
 *  - `explored`: lo que la linterna ya tocó alguna vez (memoria del jugador).
 *  - `lit`: lo que la linterna está tocando ahora.
 *  - `alpha`: el estado visual de la niebla, que se interpola para que la luz
 *    no salte de golpe.
 *
 * Además libera en `dungeon.known` las celdas de piso que se van explorando:
 * ahí es donde Reveal cambia lo que Walk puede hacer.
 */
class Reveal {
  constructor(dungeon, settings) {
    this.dungeon = dungeon;
    this.settings = settings;
    this.explored = this._grid(false);
    this.lit = this._grid(false);
    this.alpha = this._grid(settings.unknownAlpha);
    this.targetAlpha = this._grid(settings.unknownAlpha);
    this.veil = this._createVeil();

    this.reset(dungeon.start);
  }

  _grid(value) {
    return Array.from({ length: this.dungeon.rows }, () =>
      Array.from({ length: this.dungeon.cols }, () => value)
    );
  }

  _createVeil() {
    const veil = createQuadrille(this.dungeon.cols, this.dungeon.rows);
    veil.fill(veilDisplay);
    return veil;
  }

  reset(center) {
    this.explored = this._grid(false);
    this.lit = this._grid(false);
    this.alpha = this._grid(this.settings.unknownAlpha);
    this.targetAlpha = this._grid(this.settings.unknownAlpha);
    this.revealAt(center, true);
  }

  /**
   * Mueve la linterna a `center` y actualiza la memoria y los objetivos de
   * opacidad. Con `instant` se salta la transición (útil al iniciar).
   */
  revealAt(center, instant = false) {
    const { radius, fadeWidth, memoryAlpha, unknownAlpha } = this.settings;
    const fadeStart = radius - fadeWidth;

    for (let row = 0; row < this.dungeon.rows; row++) {
      this.lit[row].fill(false);
    }

    const minRow = Math.max(0, Math.floor(center.row - radius));
    const maxRow = Math.min(this.dungeon.rows - 1, Math.ceil(center.row + radius));
    const minCol = Math.max(0, Math.floor(center.col - radius));
    const maxCol = Math.min(this.dungeon.cols - 1, Math.ceil(center.col + radius));

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const distance = Math.hypot(row - center.row, col - center.col);
        if (distance > radius) {
          continue;
        }

        const cell = new Cell(row, col);
        this.explored[row][col] = true;
        this.lit[row][col] = true;
        this.dungeon.unlock(cell);
      }
    }

    for (let row = 0; row < this.dungeon.rows; row++) {
      for (let col = 0; col < this.dungeon.cols; col++) {
        const distance = Math.hypot(row - center.row, col - center.col);

        if (distance <= radius) {
          const edge = this._smoothstep(fadeStart, radius, distance);
          this.targetAlpha[row][col] = memoryAlpha * edge;
        } else if (this.explored[row][col]) {
          this.targetAlpha[row][col] = memoryAlpha;
        } else {
          this.targetAlpha[row][col] = unknownAlpha;
        }
      }
    }

    if (instant) {
      this.alpha = this.targetAlpha.map((row) => row.slice());
    }
  }

  _smoothstep(edge0, edge1, value) {
    const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  update(deltaTime) {
    const factor = 1 - Math.exp((-this.settings.fadeSpeed * deltaTime) / 1000);

    for (let row = 0; row < this.dungeon.rows; row++) {
      for (let col = 0; col < this.dungeon.cols; col++) {
        const current = this.alpha[row][col];
        const target = this.targetAlpha[row][col];
        this.alpha[row][col] = current + (target - current) * factor;
      }
    }
  }

  isExplored(cell) {
    return (
      this.dungeon.isInside(cell) &&
      this.explored[cell.row][cell.col]
    );
  }

  isLit(cell) {
    return this.dungeon.isInside(cell) && this.lit[cell.row][cell.col];
  }

  draw() {
    drawQuadrille(this.veil, {
      options: {
        alpha: this.alpha,
        cellLength: CONFIG.maze.cellLength,
        origin: 'center',
      },
      outlineWeight: 0,
    });
  }
}
