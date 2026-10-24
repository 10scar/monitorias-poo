'use strict';

/* ==========================================================================
   Motor de presentación: navegación, resaltado de código e iframe diferido.
   ========================================================================== */

const KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'of', 'in', 'new', 'class', 'extends', 'super', 'this', 'null', 'undefined',
  'true', 'false', 'async', 'await', 'import', 'from', 'export', 'typeof',
  'instanceof', 'try', 'catch', 'throw', 'switch', 'case', 'break', 'continue',
  'default', 'delete', 'void', 'yield', 'static', 'get', 'set',
];

const KEYWORD_RE = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'g');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Resaltador mínimo, sin dependencias. Guarda comentarios y cadenas en
 * marcadores con caracteres de uso privado para que las palabras clave y los
 * números no los vuelvan a tocar.
 */
function highlight(code) {
  const tokens = [];
  const stash = (html) => {
    const mark = String.fromCharCode(0xe000 + tokens.push(html) - 1);
    return `\u0000${mark}\u0000`;
  };

  let text = code.replace(
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g,
    (match, comment) =>
      stash(
        `<span class="${comment ? 'tok-com' : 'tok-str'}">${escapeHtml(match)}</span>`
      )
  );

  text = escapeHtml(text);
  text = text.replace(KEYWORD_RE, '<span class="tok-key">$1</span>');
  text = text.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
  text = text.replace(
    /\b([A-Z][A-Za-z0-9_]*)\b/g,
    '<span class="tok-cls">$1</span>'
  );
  text = text.replace(/\u0000([\uE000-\uF8FF])\u0000/g, (_, mark) => {
    return tokens[mark.charCodeAt(0) - 0xe000];
  });

  return text;
}

function highlightAll() {
  document.querySelectorAll('pre code.js').forEach((block) => {
    block.innerHTML = highlight(block.textContent);
  });
}

/* -------------------------------------------------------------------------- */

const slides = Array.from(document.querySelectorAll('.slide'));
let current = 0;

const progressBar = document.querySelector('.progress__bar');
const counter = document.querySelector('.nav__count');
const prevButton = document.querySelector('.nav__prev');
const nextButton = document.querySelector('.nav__next');
const fullButton = document.querySelector('.nav__full');

function pad(number) {
  return String(number).padStart(2, '0');
}

function activate(index) {
  if (slides.length === 0) {
    return;
  }

  current = Math.max(0, Math.min(slides.length - 1, index));

  slides.forEach((slide, i) => {
    const active = i === current;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
  });

  if (progressBar) {
    progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  }
  if (counter) {
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
  }
  if (prevButton) {
    prevButton.disabled = current === 0;
  }
  if (nextButton) {
    nextButton.disabled = current === slides.length - 1;
  }

  const activeSlide = slides[current];
  activeSlide.querySelectorAll('iframe[data-src]').forEach((frame) => {
    if (!frame.getAttribute('src')) {
      frame.setAttribute('src', frame.getAttribute('data-src'));
    }
  });

  try {
    history.replaceState(null, '', `#slide-${current + 1}`);
  } catch {
    // file:// y algunos navegadores restringen replaceState; no es crítico.
  }
}

function go(step) {
  activate(current + step);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

document.addEventListener('keydown', (event) => {
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return;
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      event.preventDefault();
      go(1);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      event.preventDefault();
      go(-1);
      break;
    case 'Home':
      event.preventDefault();
      activate(0);
      break;
    case 'End':
      event.preventDefault();
      activate(slides.length - 1);
      break;
    case 'f':
    case 'F':
      event.preventDefault();
      toggleFullscreen();
      break;
    default:
      break;
  }
});

prevButton?.addEventListener('click', () => go(-1));
nextButton?.addEventListener('click', () => go(1));
fullButton?.addEventListener('click', toggleFullscreen);

/* Swipe horizontal, sin interferir con el iframe ni con los enlaces. */
let pointerStart = null;

document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('a, button, iframe')) {
    pointerStart = null;
    return;
  }
  pointerStart = { x: event.clientX, y: event.clientY };
});

document.addEventListener('pointerup', (event) => {
  if (!pointerStart) {
    return;
  }
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  pointerStart = null;

  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
    go(dx < 0 ? 1 : -1);
  }
});

/* -------------------------------------------------------------------------- */

const hashMatch = window.location.hash.match(/slide-(\d+)/);
const querySlide = Number(new URLSearchParams(window.location.search).get('slide'));
const initial = hashMatch
  ? Number(hashMatch[1]) - 1
  : Number.isFinite(querySlide) && querySlide > 0
    ? querySlide - 1
    : 0;

highlightAll();

// La primera activación no debe animar: evita el flash de la portada
// cuando se abre una presentación con #slide-N.
document.documentElement.classList.add('preload');
activate(initial);
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('preload');
  });
});
