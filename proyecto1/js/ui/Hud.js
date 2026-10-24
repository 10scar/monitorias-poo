'use strict';

/**
 * Interfaz DOM del juego.
 *
 * El canvas dibuja el mundo; este objeto es dueño de los textos, contadores y
 * del overlay de victoria. `Game` le avisa qué cambió; nunca toca el DOM.
 */
class Hud {
  constructor() {
    this.el = {
      seed: document.getElementById('seed'),
      relics: document.getElementById('relics'),
      relicsLabel: document.getElementById('relics-label'),
      steps: document.getElementById('steps'),
      state: document.getElementById('state'),
      message: document.getElementById('message'),
      overlay: document.getElementById('win-overlay'),
      winSteps: document.getElementById('win-steps'),
      winSeed: document.getElementById('win-seed'),
      restart: document.getElementById('restart'),
      newMaze: document.getElementById('new-maze'),
    };

    this.restartHandler = null;
    this.messageTimer = null;

    this.el.restart.addEventListener('click', () => {
      this.restartHandler?.();
    });

    this.el.newMaze?.addEventListener('click', () => {
      this.restartHandler?.();
    });
  }

  bindRestart(handler) {
    this.restartHandler = handler;
  }

  reset({ seed, totalRelics }) {
    this.setSeed(seed);
    this.setRelics(0, totalRelics);
    this.setSteps(0);
    this.setState('Explorando');
    this.hideWin();
    this.setMessage('Tu linterna solo alcanza lo que ya has visto.');
  }

  setSeed(seed) {
    this.el.seed.textContent = `#${seed}`;
  }

  setRelics(collected, total) {
    this.el.relics.replaceChildren();

    for (let index = 0; index < total; index++) {
      const icon = document.createElement('span');
      const filled = index < collected;
      icon.className = `relic${filled ? ' relic--filled' : ''}`;
      icon.textContent = filled ? '◆' : '◇';
      icon.setAttribute('aria-hidden', 'true');
      this.el.relics.appendChild(icon);
    }

    this.el.relics.setAttribute(
      'aria-label',
      `${collected} de ${total} ecos recuperados`
    );
    this.el.relicsLabel.textContent = `${collected} / ${total} ecos`;
  }

  setSteps(steps) {
    this.el.steps.textContent = String(steps);
  }

  setState(state) {
    this.el.state.textContent = state;
  }

  setMessage(text) {
    window.clearTimeout(this.messageTimer);
    this.el.message.textContent = text;
    this.el.message.classList.remove('message--flash');
    this.el.message.classList.toggle('message--visible', Boolean(text));
  }

  /** Mensaje temporal que no borra el estado permanente del HUD. */
  toast(text, duration = CONFIG.ui.toastDuration) {
    window.clearTimeout(this.messageTimer);
    this.el.message.textContent = text;
    this.el.message.classList.add('message--visible', 'message--flash');

    this.messageTimer = window.setTimeout(() => {
      this.el.message.textContent = 'Tu linterna solo alcanza lo que ya has visto.';
      this.el.message.classList.remove('message--flash');
    }, duration);
  }

  showWin({ steps, seed }) {
    this.el.winSteps.textContent = String(steps);
    this.el.winSeed.textContent = `#${seed}`;
    this.el.overlay.hidden = false;
    this.el.restart.focus({ preventScroll: true });
  }

  hideWin() {
    this.el.overlay.hidden = true;
  }
}
