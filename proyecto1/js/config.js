'use strict';

/**
 * Configuración única del juego.
 *
 * Todo número que un lector podría querer ajustar vive aquí. Las clases no
 * conocen valores "mágicos": reciben o leen de este objeto con nombre propio.
 */
const CONFIG = (() => {
  const config = {
    maze: {
      cols: 17,
      rows: 13,
      cellLength: 36,
    },

    reveal: {
      // Radio que se marca como explorado (en celdas).
      radius: 4.4,
      // Ancho del degradado interior del borde de la luz.
      fadeWidth: 1.6,
      // Alfa de la niebla que ya fue vista alguna vez.
      memoryAlpha: 170,
      // Alfa de la niebla que nunca fue tocada por la linterna.
      unknownAlpha: 251,
      // Velocidad de transición entre estados de la niebla.
      fadeSpeed: 9,
    },

    walk: {
      cellsPerSecond: 7.2,
    },

    relics: {
      count: 3,
      // Fracciones de la distancia máxima donde se reparten los ecos.
      distanceBands: [0.28, 0.54, 0.8],
      bandWidth: 0.14,
      minSeparation: 2,
    },

    colors: {
      background: '#070b14',
      wall: '#22375b',
      wallEdge: '#3c5f96',
      veil: [6, 9, 18],
      trail: [255, 206, 122, 34],
      lantern: [255, 207, 122],
      relic: [116, 230, 255],
      relicCore: [190, 250, 255],
      portalOpen: [255, 196, 96],
      portalClosed: [150, 158, 186],
    },

    ui: {
      winDelay: 420,
      toastDuration: 2600,
    },
  };

  Object.values(config).forEach((section) => Object.freeze(section));
  return Object.freeze(config);
})();
