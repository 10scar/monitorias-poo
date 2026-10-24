'use strict';

/**
 * Mecánica Walk.
 *
 * No mueve al explorador por teclado: le pide una ruta a la capa `known` y
 * consume esa respuesta paso a paso. Planear y gastar están separados porque
 * el tablero puede responder con una ruta vacía (destino sellado, muro, o
 * simplemente fuera de lo explorado) sin que el jugador se mueva.
 */
class Walk {
  constructor(dungeon, explorer, { cellsPerSecond, onStep, onArrive }) {
    this.dungeon = dungeon;
    this.explorer = explorer;
    this.cellsPerSecond = cellsPerSecond;
    this.onStep = onStep;
    this.onArrive = onArrive;

    this.plan = [];
    this.progress = 0;
    this.moving = false;
  }

  /**
   * Calcula una ruta hacia `target`.
   * @returns {{ok: boolean, reason?: string, steps?: number}}
   */
  planTo(target) {
    if (target.equals(this.explorer.cell)) {
      return { ok: false, reason: 'same' };
    }

    const steps = this.dungeon.path(this.explorer.cell, target);
    if (steps.length === 0) {
      return { ok: false, reason: 'unreachable' };
    }

    this.plan = steps;
    this.progress = 0;
    this.moving = true;
    return { ok: true, steps: steps.length };
  }

  cancel() {
    this.plan = [];
    this.progress = 0;
    this.moving = false;
    this.explorer.setRender(this.explorer.cell.row, this.explorer.cell.col);
  }

  update(deltaTime) {
    if (!this.moving) {
      this.explorer.setRender(this.explorer.cell.row, this.explorer.cell.col);
      return;
    }

    this.progress += (deltaTime / 1000) * this.cellsPerSecond;

    while (this.progress >= 1 && this.plan.length > 0) {
      this.progress -= 1;

      const next = this.plan.shift();
      this.explorer.setCell(next);
      this.onStep?.(next);

      if (this.plan.length === 0) {
        this.moving = false;
        this.progress = 0;
        this.onArrive?.();
      }
    }

    if (this.moving && this.plan.length > 0) {
      const from = this.explorer.cell;
      const to = this.plan[0];
      this.explorer.setRender(
        lerp(from.row, to.row, this.progress),
        lerp(from.col, to.col, this.progress)
      );
    } else {
      this.explorer.setRender(this.explorer.cell.row, this.explorer.cell.col);
    }
  }
}
