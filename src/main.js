import { newGame, reveal, setMark, canMark, MODES, MARK_PIECES } from './game.js';
import { parseFen, idxToAlg } from './chess.js';
import { POSITIONS } from './positions.js';
import { buildBoard, render, renderTimer, fillResult, clearResult, buildPicker, renderPicker } from './ui.js';

const LAST_KEY = 'chess-sweeper:last';
const LAST_PIECE_KEY = 'chess-sweeper:last-piece';
const DIFFICULTY_KEY = 'chess-sweeper:difficulty';
const DIFFICULTIES = {
  all: () => true,
  easy: (n) => n <= 5,
  medium: (n) => n >= 6 && n <= 8,
  hard: (n) => n >= 9,
};
const PICKER_MARGIN_PX = 8;
const DEFAULT_PICKER_COLUMNS = 6;
const LONG_PRESS_MS = 450;
const MOVE_TOLERANCE_PX = 10;
const CONTEXTMENU_GRACE_MS = 600;
const TIMER_TICK_MS = 250;
const SWALLOW_CLICK_MS = 400;

const els = {
  board: document.getElementById('board'),
  boardWrap: document.getElementById('board-wrap'),
  newGame: document.getElementById('new-game'),
  markMode: document.getElementById('mark-mode'),
  picker: document.getElementById('picker'),
  pickerGrid: document.getElementById('picker-grid'),
  pickerClear: document.getElementById('picker-clear'),
  newRandom: document.getElementById('new-random'),
  nextGame: document.getElementById('next-game'),
  modeInputs: [...document.querySelectorAll('input[name="mode"]')],
  difficultyInputs: [...document.querySelectorAll('input[name="difficulty"]')],
};

let state = null;
let cells = [];
let forcedPosition = null;
let markMode = false;
let lastPiece = null;
let pickButtons = [];
let pickerIdx = -1;
let swallowClick = false;
let swallowTimerId = 0;
let focusIdx = 0;
let timerId = 0;
let suppressNextClick = false;
let longPressAt = -Infinity;
const press = { timerId: 0, idx: -1, x: 0, y: 0, pointerType: '' };

/** Reads a value from localStorage, returning null when storage is unavailable. */
function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes a value to localStorage, ignoring storage errors. */
function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

/** Counts the pieces in a position. */
function pieceCount(position) {
  return parseFen(position.fen).filter(Boolean).length;
}

/** Returns the currently selected difficulty. */
function currentDifficulty() {
  return els.difficultyInputs.find((input) => input.checked)?.value ?? 'all';
}

/** Picks a random position for the selected difficulty, avoiding the current and last played ones, and remembers the choice. */
function pickRandom() {
  const fits = DIFFICULTIES[currentDifficulty()] ?? DIFFICULTIES.all;
  const matching = POSITIONS.filter((p) => fits(pieceCount(p)));
  const base = matching.length > 0 ? matching : POSITIONS;
  const avoid = new Set([readStorage(LAST_KEY), state?.position.id]);
  const fresh = base.filter((p) => !avoid.has(p.id));
  const others = base.filter((p) => p.id !== state?.position.id);
  const pool = [fresh, others, base].find((list) => list.length > 0);
  const position = pool[Math.floor(Math.random() * pool.length)];
  writeStorage(LAST_KEY, position.id);
  return position;
}

/** Applies the dev URL parameters ?pos, ?fen and ?mode. */
function readParams() {
  const savedDifficulty = readStorage(DIFFICULTY_KEY);
  if (savedDifficulty && Object.hasOwn(DIFFICULTIES, savedDifficulty)) {
    els.difficultyInputs.forEach((input) => { input.checked = input.value === savedDifficulty; });
  }
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (mode && Object.values(MODES).includes(mode)) {
    els.modeInputs.forEach((input) => { input.checked = input.value === mode; });
  }
  const fen = params.get('fen');
  if (fen) {
    try {
      parseFen(fen);
      forcedPosition = { id: 'custom', name: 'Custom position', kind: 'custom', fen, blurb: 'Loaded from the URL.' };
    } catch (error) {
      console.warn(`Ignoring ?fen: ${error.message}`);
    }
    return;
  }
  const id = params.get('pos');
  if (id) {
    forcedPosition = POSITIONS.find((p) => p.id === id) ?? null;
    if (!forcedPosition) console.warn(`Unknown ?pos id "${id}", picking a random position.`);
  }
}

/** Returns the currently selected mode. */
function currentMode() {
  return els.modeInputs.find((input) => input.checked)?.value ?? MODES.ONE_SIDE;
}

/** Stops the timer interval. */
function stopTimers() {
  clearInterval(timerId);
  timerId = 0;
}

/** Starts a new game on the given position with the selected mode. */
function startGame(position) {
  stopTimers();
  cancelPress();
  closePicker(false);
  clearResult();
  const hadFocus = els.board.contains(document.activeElement);
  state = newGame(position, currentMode());
  cells = buildBoard(els.board, focusIdx);
  render(state, cells);
  if (hadFocus) cells[focusIdx].focus();
  if (state.status !== 'playing') {
    fillResult(state);
    return;
  }
  timerId = setInterval(() => renderTimer(state), TIMER_TICK_MS);
}

/** Starts a new game on the forced position once, then on new random positions. */
function startNext() {
  const position = forcedPosition ?? pickRandom();
  forcedPosition = null;
  startGame(position);
}

/** Re-renders after an action and handles the transition to a finished game. */
function afterAction(wasPlaying) {
  render(state, cells);
  if (!wasPlaying || state.status === 'playing') return;
  stopTimers();
  fillResult(state);
}

/** Reveals a square. */
function doReveal(idx) {
  const wasPlaying = state.status === 'playing';
  reveal(state, idx);
  afterAction(wasPlaying);
}

/** Sets or clears the mark on a square. */
function doMark(idx, piece) {
  const wasPlaying = state.status === 'playing';
  setMark(state, idx, piece);
  afterAction(wasPlaying);
}

/** Performs the primary action on a square: open the picker in Mark mode, otherwise reveal. */
function activate(idx) {
  if (markMode) openPicker(idx);
  else doReveal(idx);
}

/** Places the open picker next to its square, below it when there is room and above otherwise, inside the viewport. */
function positionPicker() {
  if (pickerIdx < 0) return;
  const rect = cells[pickerIdx].getBoundingClientRect();
  const picker = els.picker;
  const width = picker.offsetWidth;
  const height = picker.offsetHeight;
  const viewW = document.documentElement.clientWidth;
  const viewH = window.innerHeight;
  const below = rect.bottom + PICKER_MARGIN_PX;
  const above = rect.top - PICKER_MARGIN_PX - height;
  const fitsBelow = below + height <= viewH - PICKER_MARGIN_PX;
  const top = fitsBelow || above < PICKER_MARGIN_PX ? Math.min(below, viewH - PICKER_MARGIN_PX - height) : above;
  const centre = rect.left + rect.width / 2 - width / 2;
  const left = Math.max(PICKER_MARGIN_PX, Math.min(centre, viewW - PICKER_MARGIN_PX - width));
  picker.style.top = `${Math.max(PICKER_MARGIN_PX, top)}px`;
  picker.style.left = `${left}px`;
}

/** Opens the piece picker for a markable square and moves focus into it. */
function openPicker(idx) {
  if (!canMark(state, idx)) return;
  cancelPress();
  pickerIdx = idx;
  const current = state.marks[idx];
  renderPicker(els.picker, pickButtons, idxToAlg(idx), current, lastPiece);
  els.pickerClear.disabled = !current;
  els.picker.hidden = false;
  cells[idx].classList.add('picking');
  positionPicker();
  const target = pickButtons.find((b) => b.dataset.piece === (current ?? lastPiece)) ?? pickButtons[0];
  target.focus({ preventScroll: true });
}

/** Closes the picker, returning focus to its square when asked. */
function closePicker(refocus = true) {
  if (pickerIdx < 0) return;
  const idx = pickerIdx;
  pickerIdx = -1;
  els.picker.hidden = true;
  cells[idx]?.classList.remove('picking');
  if (refocus && cells[idx]) setFocusIdx(idx, true);
}

/** Applies a choice from the picker: a piece letter, or null to clear. */
function choosePiece(piece) {
  const idx = pickerIdx;
  if (idx < 0) return;
  if (piece) {
    lastPiece = piece;
    writeStorage(LAST_PIECE_KEY, piece);
  }
  closePicker(true);
  doMark(idx, piece);
}

/** Handles clicks inside the picker. */
function onPickerClick(event) {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  if (!button) return;
  if (button === els.pickerClear) choosePiece(null);
  else if (button.dataset.piece) choosePiece(button.dataset.piece);
}

/** Reads the picker's column count from the --picker-columns CSS property that also lays out its grid. */
function pickerColumns() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--picker-columns');
  const columns = Number.parseInt(value, 10);
  return columns > 0 ? columns : DEFAULT_PICKER_COLUMNS;
}

/** Handles Escape, Tab wrapping and arrow-key movement inside the picker. */
function onPickerKeyDown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closePicker(true);
    return;
  }
  const focusables = [...pickButtons, els.pickerClear].filter((b) => !b.disabled);
  const at = focusables.indexOf(document.activeElement);
  if (event.key === 'Tab') {
    event.preventDefault();
    const step = event.shiftKey ? -1 : 1;
    focusables[(at + step + focusables.length) % focusables.length].focus();
    return;
  }
  const pick = pickButtons.indexOf(document.activeElement);
  if (pick < 0) return;
  const columns = pickerColumns();
  const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
  if (!(event.key in moves)) return;
  event.preventDefault();
  const next = pick + moves[event.key];
  if (next >= 0 && next < pickButtons.length) pickButtons[next].focus();
  else if (event.key === 'ArrowDown' && !els.pickerClear.disabled) els.pickerClear.focus();
}

/** Stops swallowing clicks and cancels the pending reset. */
function clearSwallow() {
  clearTimeout(swallowTimerId);
  swallowTimerId = 0;
  swallowClick = false;
}

/** Closes the picker on a press outside it; a primary press on a square also swallows the click it would cause, so it does not reveal. */
function onDocumentPointerDown(event) {
  clearSwallow();
  if (pickerIdx < 0 || els.picker.contains(event.target)) return;
  const onCell = cellIndex(event.target) >= 0;
  if (onCell) event.stopPropagation();
  closePicker(false);
  if (onCell && event.button === 0) swallowClick = true;
}

/** Lets a swallowed click arrive after the press ends, then forgets it so it cannot go stale. */
function onDocumentPointerUp() {
  if (!swallowClick) return;
  clearTimeout(swallowTimerId);
  swallowTimerId = setTimeout(clearSwallow, SWALLOW_CLICK_MS);
}

/** Swallows the pointer click that follows a press on a square which closed the picker. */
function onDocumentClick(event) {
  if (!swallowClick || event.detail === 0) return;
  clearSwallow();
  event.stopPropagation();
  event.preventDefault();
}

/** Returns the square index for an event target inside the board, or -1. */
function cellIndex(target) {
  const cell = target instanceof Element ? target.closest('.cell') : null;
  return cell ? Number(cell.dataset.idx) : -1;
}

/** Moves the roving tabindex to a square, optionally focusing it. */
function setFocusIdx(idx, focus) {
  if (cells[focusIdx]) cells[focusIdx].tabIndex = -1;
  focusIdx = idx;
  cells[idx].tabIndex = 0;
  if (focus) cells[idx].focus();
}

/** Cancels a pending long-press. */
function cancelPress() {
  clearTimeout(press.timerId);
  press.timerId = 0;
  press.idx = -1;
}

/** Fires the long-press: opens the picker on the square and swallows the click that follows. */
function fireLongPress() {
  const idx = press.idx;
  press.timerId = 0;
  press.idx = -1;
  if (idx < 0 || !canMark(state, idx)) return;
  suppressNextClick = true;
  longPressAt = performance.now();
  navigator.vibrate?.(30);
  setFocusIdx(idx, false);
  openPicker(idx);
}

/** Handles a click or tap on a square. */
function onClick(event) {
  const idx = cellIndex(event.target);
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  if (idx < 0) return;
  setFocusIdx(idx, false);
  activate(idx);
}

/** Handles right-click and the browser's long-press context menu, leaving the native menu alone on squares that cannot be marked. */
function onContextMenu(event) {
  const idx = cellIndex(event.target);
  if (idx < 0) return;
  if (performance.now() - longPressAt < CONTEXTMENU_GRACE_MS) {
    event.preventDefault();
    return;
  }
  if (!canMark(state, idx)) return;
  event.preventDefault();
  if (press.timerId) {
    const touchLike = press.pointerType !== 'mouse';
    cancelPress();
    if (touchLike) {
      suppressNextClick = true;
      longPressAt = performance.now();
    }
  }
  setFocusIdx(idx, false);
  openPicker(idx);
}

/** Starts the long-press timer on a primary pointer press. */
function onPointerDown(event) {
  suppressNextClick = false;
  if (!event.isPrimary || event.button !== 0) return;
  const idx = cellIndex(event.target);
  if (idx < 0 || !canMark(state, idx)) return;
  cancelPress();
  press.idx = idx;
  press.x = event.clientX;
  press.y = event.clientY;
  press.pointerType = event.pointerType;
  press.timerId = setTimeout(fireLongPress, LONG_PRESS_MS);
}

/** Cancels the long-press when the pointer drifts too far. */
function onPointerMove(event) {
  if (!press.timerId) return;
  if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > MOVE_TOLERANCE_PX) cancelPress();
}

/** Handles arrow-key navigation, reveal and mark keys on the board. */
function onKeyDown(event) {
  const idx = cellIndex(event.target);
  if (idx < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
  const row = Math.floor(idx / 8);
  const file = idx % 8;
  let next = -1;
  switch (event.key) {
    case 'ArrowUp': next = row > 0 ? idx - 8 : idx; break;
    case 'ArrowDown': next = row < 7 ? idx + 8 : idx; break;
    case 'ArrowLeft': next = file > 0 ? idx - 1 : idx; break;
    case 'ArrowRight': next = file < 7 ? idx + 1 : idx; break;
    case 'Home': next = row * 8; break;
    case 'End': next = row * 8 + 7; break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      setFocusIdx(idx, false);
      activate(idx);
      return;
    case 'm':
    case 'M':
      event.preventDefault();
      setFocusIdx(idx, false);
      openPicker(idx);
      return;
    default:
      return;
  }
  event.preventDefault();
  setFocusIdx(next, true);
}

/** Stops the native Space keyup from also clicking the focused square. */
function onKeyUp(event) {
  if (event.key === ' ' && cellIndex(event.target) >= 0) event.preventDefault();
}

/** Toggles Mark mode. */
function toggleMarkMode() {
  markMode = !markMode;
  els.markMode.setAttribute('aria-pressed', String(markMode));
  els.boardWrap.classList.toggle('marking', markMode);
}

/** Wires up all event listeners and starts the first game. */
function init() {
  readParams();
  const stored = readStorage(LAST_PIECE_KEY);
  lastPiece = MARK_PIECES.includes(stored) ? stored : null;
  pickButtons = buildPicker(els.pickerGrid);
  els.picker.addEventListener('click', onPickerClick);
  els.picker.addEventListener('keydown', onPickerKeyDown);
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
  document.addEventListener('pointerup', onDocumentPointerUp, true);
  document.addEventListener('pointercancel', clearSwallow, true);
  document.addEventListener('click', onDocumentClick, true);
  window.addEventListener('resize', positionPicker);
  window.addEventListener('scroll', positionPicker, { passive: true });
  els.board.addEventListener('click', onClick);
  els.board.addEventListener('contextmenu', onContextMenu);
  els.board.addEventListener('pointerdown', onPointerDown);
  els.board.addEventListener('pointermove', onPointerMove);
  els.board.addEventListener('pointerup', cancelPress);
  els.board.addEventListener('pointercancel', cancelPress);
  els.board.addEventListener('pointerleave', cancelPress);
  els.board.addEventListener('keydown', onKeyDown);
  els.board.addEventListener('keyup', onKeyUp);
  els.newGame.addEventListener('click', startNext);
  els.markMode.addEventListener('click', toggleMarkMode);
  els.modeInputs.forEach((input) => input.addEventListener('change', startNext));
  els.difficultyInputs.forEach((input) => input.addEventListener('change', () => {
    writeStorage(DIFFICULTY_KEY, currentDifficulty());
    startNext();
  }));
  els.newRandom.addEventListener('click', startNext);
  els.nextGame.addEventListener('click', startNext);
  startNext();
}

init();
