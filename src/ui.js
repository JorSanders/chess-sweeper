import { idxToAlg, isWhite, PIECE_NAMES } from './chess.js';
import { minesRemaining, elapsedMs, markResult, MARK_PIECES } from './game.js';

const GLYPHS = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const TEXT_PRESENTATION = '︎';

/** Returns the element with the given id. */
function byId(id) {
  return document.getElementById(id);
}

/** Returns the Unicode glyph for a piece letter, forced to text presentation. */
export function pieceGlyph(piece) {
  return GLYPHS[piece.toLowerCase()] + TEXT_PRESENTATION;
}

/** Formats milliseconds as m:ss, or mm:ss when pad is true. */
export function formatTime(ms, pad = false) {
  const total = Math.floor(ms / 1000);
  const minutes = String(Math.floor(total / 60));
  const seconds = String(total % 60).padStart(2, '0');
  return `${pad ? minutes.padStart(2, '0') : minutes}:${seconds}`;
}

/** Returns the CSS colour class for a piece. */
function pieceClass(piece) {
  return isWhite(piece) ? 'pw' : 'pb';
}

/** Describes an attack count for screen readers. */
function countLabel(count) {
  if (count === 0) return 'no attackers';
  return count === 1 ? '1 attacker' : `${count} attackers`;
}

/** Returns the number text and colour classes for a safe square. */
function numberParts(count) {
  return {
    text: count === 0 ? '' : String(count),
    classes: count === 0 ? ['n0'] : [`n${Math.min(count, 9)}`],
  };
}

/** Describes a square after the game has ended, with the full position revealed and marks graded. */
function finishedView(state, idx, square) {
  const piece = state.board[idx];
  const mark = state.marks[idx];
  const result = markResult(state, idx);
  if (piece) {
    const name = PIECE_NAMES[piece];
    const classes = ['open', 'piece', pieceClass(piece)];
    if (idx === state.lostAt) {
      return { kind: 'lost', text: pieceGlyph(piece), classes: [...classes, 'lost'], label: `${square}, ${name}, captured here` };
    }
    if (state.status === 'won') classes.push('win');
    if (result === 'exact') {
      return { kind: 'piece', text: pieceGlyph(piece), classes: [...classes, 'mark-exact'], label: `${square}, ${name}, marked correctly` };
    }
    if (result === 'piece') {
      return { kind: 'piece', text: pieceGlyph(piece), classes: [...classes, 'mark-piece'], guess: pieceGlyph(mark), label: `${square}, ${name}, marked as ${PIECE_NAMES[mark]}` };
    }
    return { kind: 'piece', text: pieceGlyph(piece), classes, label: `${square}, ${name}` };
  }
  const count = state.counts[idx];
  const { text, classes } = numberParts(count);
  if (result === 'empty') {
    return { kind: 'number', text, classes: ['open', ...classes, 'mark-empty'], label: `${square}, empty but marked as ${PIECE_NAMES[mark]}, ${countLabel(count)}` };
  }
  return { kind: 'number', text, classes: ['open', ...classes], label: `${square}, ${countLabel(count)}` };
}

/**
 * Computes how one square should be drawn.
 * @returns {{kind: string, text: string, classes: string[], label: string, glyph?: string, guess?: string}}
 */
export function cellView(state, idx) {
  const square = idxToAlg(idx);
  if (state.status !== 'playing') return finishedView(state, idx, square);
  if (state.known[idx]) {
    const piece = state.board[idx];
    return { kind: 'known', text: pieceGlyph(piece), classes: ['known', pieceClass(piece)], label: `${square}, ${PIECE_NAMES[piece]} (known)` };
  }
  if (state.revealed[idx]) {
    const count = state.counts[idx];
    const { text, classes } = numberParts(count);
    return { kind: 'number', text, classes: ['open', ...classes], label: `${square}, ${countLabel(count)}` };
  }
  const mark = state.marks[idx];
  if (mark) {
    return { kind: 'mark', text: '', glyph: pieceGlyph(mark), classes: ['fog', 'mark', pieceClass(mark)], label: `${square}, marked as ${PIECE_NAMES[mark]}` };
  }
  return { kind: 'hidden', text: '', classes: ['fog'], label: `${square}, hidden` };
}

/** Sets or removes a data attribute on an element. */
function setData(el, key, value) {
  if (value) el.dataset[key] = value;
  else delete el.dataset[key];
}

/**
 * Builds the 8x8 grid of square buttons inside the container.
 * @returns {HTMLButtonElement[]} the 64 cells in index order.
 */
export function buildBoard(container, focusIdx = 0) {
  const cells = [];
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < 8; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.setAttribute('role', 'row');
    for (let file = 0; file < 8; file++) {
      const idx = row * 8 + file;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.setAttribute('role', 'gridcell');
      cell.dataset.idx = String(idx);
      cell.dataset.shade = (row + file) % 2 === 0 ? 'light' : 'dark';
      cell.tabIndex = idx === focusIdx ? 0 : -1;
      rowEl.append(cell);
      cells.push(cell);
    }
    fragment.append(rowEl);
  }
  container.replaceChildren(fragment);
  return cells;
}

/** Updates the timer display from the state. */
export function renderTimer(state) {
  byId('timer').textContent = formatTime(elapsedMs(state), true);
}

/** Returns the status line text for the state. */
function statusText(state) {
  if (state.status === 'won') return 'Cleared!';
  if (state.status === 'lost') return 'Captured!';
  return state.startedAt === null ? 'Tap a square to begin' : 'Playing';
}

/** Shows the end-of-game banner in place of the Mark mode button, or hides it during play. */
function renderBanner(state) {
  const finished = state.status !== 'playing';
  const banner = byId('banner');
  byId('end-actions').hidden = !finished;
  byId('mark-mode').hidden = finished;
  banner.closest('.top-row').classList.toggle('is-finished', finished);
  banner.classList.toggle('is-won', state.status === 'won');
  banner.classList.toggle('is-lost', state.status === 'lost');
  const word = state.status === 'won' ? 'Cleared!' : 'Captured!';
  banner.textContent = finished ? `${word} See below ↓` : '';
}

/** Redraws all 64 squares, the banner and the status bar. */
export function render(state, cells) {
  const finished = state.status !== 'playing';
  cells.forEach((cell, idx) => {
    const view = cellView(state, idx);
    cell.className = ['cell', `shade-${cell.dataset.shade}`, `k-${view.kind}`, ...view.classes].join(' ');
    if (cell.textContent !== view.text) cell.textContent = view.text;
    setData(cell, 'glyph', view.glyph);
    setData(cell, 'guess', view.guess);
    cell.setAttribute('aria-label', view.label);
    if (finished || view.kind === 'known') cell.setAttribute('aria-disabled', 'true');
    else cell.removeAttribute('aria-disabled');
  });
  byId('remaining').textContent = String(minesRemaining(state));
  byId('progress').textContent = `${state.revealedSafe}/${state.safeTotal}`;
  byId('status-text').textContent = statusText(state);
  renderBanner(state);
  byId('board-wrap').classList.toggle('finished', finished);
  renderTimer(state);
}

/** Sets an element's text and hides it when the text is empty. */
function setText(id, text) {
  const el = byId(id);
  el.textContent = text;
  el.hidden = !text;
}

/** Returns the value unless it is empty or a placeholder dash. */
function present(value) {
  return value === null || value === undefined || value === '' || value === '—' ? '' : String(value);
}

/** Builds the result headline for a finished game. */
function headline(state) {
  if (state.status === 'won' && state.startedAt === null) return 'The opening reveal cleared the whole board!';
  if (state.status === 'won') return `Board cleared in ${formatTime(elapsedMs(state))}!`;
  const piece = state.board[state.lostAt];
  return `Captured on ${idxToAlg(state.lostAt)} by the ${PIECE_NAMES[piece]}!`;
}

/** Summarises how the player's marks compare with the real position, or returns '' when none were placed. */
export function marksSummary(state) {
  const tally = { exact: 0, piece: 0, empty: 0 };
  let any = false;
  for (let idx = 0; idx < 64; idx++) {
    const result = markResult(state, idx);
    if (!result) continue;
    tally[result]++;
    any = true;
  }
  if (!any) return '';
  return `Marks: ${tally.exact} exact, ${tally.piece} right square wrong piece, ${tally.empty} wrong square`;
}

/** Fills and shows the result panel with the outcome and the story of the position. */
export function fillResult(state) {
  const p = state.position;
  const panel = byId('result');
  panel.classList.toggle('is-won', state.status === 'won');
  panel.classList.toggle('is-lost', state.status === 'lost');
  setText('result-headline', headline(state));
  setText('result-marks', marksSummary(state));
  setText('result-name', p.name);
  const players = [
    present(p.white) && `White: ${p.white}`,
    present(p.black) && `Black: ${p.black}`,
  ].filter(Boolean).join(' / ');
  setText('result-players', players);
  setText('result-event', [present(p.event), present(p.year)].filter(Boolean).join(', '));
  setText('result-outcome', present(p.result) && `Result: ${p.result}`);
  setText('result-move', present(p.moveNote));
  setText('result-blurb', present(p.blurb));
  const link = byId('result-link');
  link.href = p.link || '#';
  link.parentElement.hidden = !p.link;
  panel.hidden = false;
}

/** Hides and empties the result panel so nothing about the position is in the page during play. */
export function clearResult() {
  byId('result').hidden = true;
  for (const id of ['result-headline', 'result-marks', 'result-name', 'result-players', 'result-event', 'result-outcome', 'result-move', 'result-blurb']) {
    setText(id, '');
  }
  const link = byId('result-link');
  link.href = '#';
  link.parentElement.hidden = true;
}

/**
 * Fills the picker with one button per piece (white row, then black row) and a Clear button.
 * @returns {HTMLButtonElement[]} the twelve piece buttons in MARK_PIECES order.
 */
export function buildPicker(grid) {
  const buttons = MARK_PIECES.map((piece) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pick ${pieceClass(piece)}`;
    button.dataset.piece = piece;
    button.textContent = pieceGlyph(piece);
    button.setAttribute('aria-label', PIECE_NAMES[piece]);
    return button;
  });
  grid.replaceChildren(...buttons);
  return buttons;
}

/** Updates the picker's label and highlights the square's current mark and the last chosen piece. */
export function renderPicker(picker, buttons, square, current, last) {
  picker.setAttribute('aria-label', `Mark ${square}`);
  for (const button of buttons) {
    const piece = button.dataset.piece;
    button.setAttribute('aria-pressed', String(piece === current));
    button.classList.toggle('is-last', piece === last);
  }
}
