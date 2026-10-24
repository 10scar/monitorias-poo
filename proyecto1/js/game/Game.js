'use strict';

/**
 * Orquestador del juego.
 *
 * Es el único objeto que conoce a todas las entidades a la vez. Su trabajo es
 * de coordinación, no de dibujo ni de pathfinding: recibe intención del
 * jugador, se la pasa a las mecánicas y actualiza el HUD con el resultado.
 */
class Game {
  constructor(hud) {
    this.hud = hud;
    this.cellLength = CONFIG.maze.cellLength;
    this.time = 0;
    this.steps = 0;
    this.seed = this._initialSeed();
    this.runId = 0;

    this.dungeon = null;
    this.explorer = null;
    this.reveal = null;
    this.walk = null;
    this.trail = null;
    this.relics = [];
    this.portal = null;
    this.state = 'idle';

    this.hud.bindRestart(() => this.restart());
    this.startRun(this.seed);
  }

  _initialSeed() {
    const fromUrl = Number(new URLSearchParams(window.location.search).get('seed'));
    if (Number.isFinite(fromUrl) && fromUrl > 0) {
      return Math.floor(fromUrl);
    }
    return Math.floor(Math.random() * 9000) + 1000;
  }

  _nextSeed() {
    let next = this.seed;
    while (next === this.seed) {
      next = Math.floor(Math.random() * 9000) + 1000;
    }
    return next;
  }

  startRun(seed) {
    this.runId += 1;
    this.seed = seed;
    this.state = 'playing';
    this.steps = 0;
    this.time = 0;

    this.dungeon = new Dungeon({
      cols: CONFIG.maze.cols,
      rows: CONFIG.maze.rows,
      cellLength: this.cellLength,
    }).generate(seed);

    this.explorer = new Explorer(this.dungeon.start);
    this.reveal = new Reveal(this.dungeon, CONFIG.reveal);
    this.trail = createQuadrille(this.dungeon.cols, this.dungeon.rows);
    this.portal = new Portal(this.dungeon.farthestCell());
    this.relics = this._placeRelics();

    this.walk = new Walk(this.dungeon, this.explorer, {
      cellsPerSecond: CONFIG.walk.cellsPerSecond,
      onStep: (next) => this._onStep(next),
      onArrive: () => this._onArrive(),
    });

    this.hud.reset({ seed, totalRelics: this.relics.length });
  }

  /**
   * Reparte los ecos en bandas de distancia. Así no quedan todos juntos ni
   * pegados al inicio: el jugador tiene que atravesar el laberinto.
   */
  _placeRelics() {
    const chosen = [];
    const { count, distanceBands, bandWidth, minSeparation } = CONFIG.relics;

    const isValidCandidate = (cell) => {
      if (cell.equals(this.dungeon.start) || cell.equals(this.portal.cell)) {
        return false;
      }
      return chosen.every((other) => other.manhattanTo(cell) >= minSeparation);
    };

    for (const fraction of distanceBands) {
      const candidates = this.dungeon
        .cellsInDistanceBand(fraction, bandWidth)
        .filter(isValidCandidate);

      if (candidates.length > 0) {
        chosen.push(random(candidates));
      }
    }

    if (chosen.length < count) {
      const fallback = shuffle(this.dungeon.floorCells(), true);
      for (const cell of fallback) {
        if (chosen.length >= count) {
          break;
        }
        if (isValidCandidate(cell)) {
          chosen.push(cell);
        }
      }
    }

    return chosen
      .slice(0, count)
      .map((cell, index) => new Relic(cell, index * 2.1));
  }

  handleClick(x, y) {
    if (this.state !== 'playing') {
      return;
    }

    const cell = this.dungeon.cellAtPixel(x, y);
    if (!cell) {
      this.hud.toast('Ese punto queda fuera del tablero.');
      return;
    }

    if (!this.dungeon.isFloor(cell)) {
      this.hud.toast('Hay un muro ahí.');
      return;
    }

    if (!this.reveal.isExplored(cell)) {
      this.hud.toast('Todavía no puedes ver esa celda. Acerca la linterna.');
      return;
    }

    if (cell.equals(this.explorer.cell)) {
      this.hud.toast('Ya estás en esa celda.');
      return;
    }

    const result = this.walk.planTo(cell);
    if (!result.ok) {
      this.hud.toast('No hay una ruta conocida hasta ahí.');
      return;
    }

    this.hud.setState('Caminando');
    this.hud.toast(
      `Ruta de ${result.steps} ${result.steps === 1 ? 'paso' : 'pasos'}.`,
      1300
    );
  }

  _onStep(next) {
    this.steps += 1;
    this.trail.fill(next.row, next.col, color(...CONFIG.colors.trail));
    this.reveal.revealAt(next);

    const relic = this.relics.find((candidate) => candidate.isAt(next));
    if (relic) {
      relic.collect();
      const collected = this._collectedRelics();
      this.hud.setRelics(collected, this.relics.length);

      if (collected === this.relics.length) {
        this.portal.unlock();
        this.hud.toast('Los ecos vibran: el Umbral se ha abierto.', 3200);
      } else {
        this.hud.toast(`Eco recuperado · ${collected}/${this.relics.length}`, 2200);
      }
    }

    if (this.portal.isAt(next)) {
      if (this.portal.open) {
        this._win();
      } else {
        const remaining = this.relics.length - this._collectedRelics();
        this.hud.toast(
          `El Umbral sigue sellado: faltan ${remaining} ${remaining === 1 ? 'eco' : 'ecos'}.`,
          2800
        );
      }
    }

    this.hud.setSteps(this.steps);
  }

  _onArrive() {
    if (this.state === 'playing') {
      this.hud.setState('Explorando');
    }
  }

  _collectedRelics() {
    return this.relics.filter((relic) => relic.collected).length;
  }

  _win() {
    if (this.state !== 'playing') {
      return;
    }

    this.state = 'won';
    this.walk.cancel();
    this.hud.setState('Umbral cruzado');
    this.hud.toast('Has cruzado el Umbral.', 3000);

    const runId = this.runId;
    window.setTimeout(() => {
      if (this.state === 'won' && this.runId === runId) {
        this.hud.showWin({ steps: this.steps, seed: this.seed });
      }
    }, CONFIG.ui.winDelay);
  }

  restart() {
    this.startRun(this._nextSeed());
  }

  update(deltaTime) {
    this.time += deltaTime / 1000;
    this.reveal.update(deltaTime);

    if (this.state === 'playing') {
      this.walk.update(deltaTime);
    }
  }

  draw() {
    background(CONFIG.colors.background);

    this.dungeon.draw();
    drawQuadrille(this.trail, { outlineWeight: 0 });

    for (const relic of this.relics) {
      if (this.reveal.isExplored(relic.cell)) {
        relic.draw(this.time);
      }
    }

    if (this.reveal.isExplored(this.portal.cell)) {
      this.portal.draw(this.time);
    }

    this.reveal.draw();
    this._drawLanternGlow();
    this.explorer.draw(this.time, this.cellLength);
  }

  _drawLanternGlow() {
    const { x, y } = this.explorer.pixelCenter(this.cellLength);
    const radius = this.cellLength * (CONFIG.reveal.radius - 0.5);
    const context = drawingContext;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    const [red, green, blue] = CONFIG.colors.lantern;

    gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.18)`);
    gradient.addColorStop(0.55, `rgba(${red}, ${green}, ${blue}, 0.06)`);
    gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

    context.save();
    context.globalCompositeOperation = 'lighter';
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}
