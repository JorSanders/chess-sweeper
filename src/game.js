import { NEIGHBORS, parseFen, isWhite, computeAttackCounts } from './chess.js';

export const MODES = { HIDDEN: 'hidden', WHITE: 'white', BLACK: 'black' };

/** Creates a fresh game state for a position; in white/black mode that colour's pieces start known. */
export function newGame(position, mode = MODES.HIDDEN) {
  const board = parseFen(position.fen);
  const counts = computeAttackCounts(board);
  const known = new Uint8Array(64);
  let pieceCount = 0;
  let knownCount = 0;
  for (let idx = 0; idx < 64; idx++) {
    const piece = board[idx];
    if (!piece) continue;
    pieceCount++;
    if ((mode === MODES.WHITE && isWhite(piece)) || (mode === MODES.BLACK && !isWhite(piece))) {
      known[idx] = 1;
      knownCount++;
    }
  }
  const state = {
    position,
    mode,
    board,
    counts,
    revealed: new Uint8Array(64),
    marks: new Array(64).fill(null),
    known,
    status: 'playing',
    lostAt: -1,
    pieceCount,
    knownCount,
    safeTotal: 64 - pieceCount,
    revealedSafe: 0,
    startedAt: null,
    endedAt: null,
  };
  openStartSquare(state);
  settleWin(state);
  return state;
}

export const MIN_LEFT_AFTER_OPENING = 5;

/** Counts how many squares a flood reveal from start would open on a fresh board. */
export function cascadeSize(board, counts, start) {
  const seen = new Uint8Array(64);
  const stack = [start];
  seen[start] = 1;
  let size = 0;
  while (stack.length > 0) {
    const idx = stack.pop();
    size++;
    if (counts[idx] !== 0) continue;
    for (const next of NEIGHBORS[idx]) {
      if (seen[next] || board[next]) continue;
      seen[next] = 1;
      stack.push(next);
    }
  }
  return size;
}

/**
 * Lists the zero-attack squares that make a good free opening: their cascade leaves at least MIN_LEFT_AFTER_OPENING safe squares to find.
 * @returns {number[]} candidate square indices, empty when the position has no fair open start.
 */
export function openingSquares(board, counts) {
  const safeTotal = board.filter((piece) => !piece).length;
  const candidates = [];
  for (let idx = 0; idx < 64; idx++) {
    if (board[idx] || counts[idx] !== 0) continue;
    if (safeTotal - cascadeSize(board, counts, idx) >= MIN_LEFT_AFTER_OPENING) candidates.push(idx);
  }
  return candidates;
}

/** Opens one random fair zero-attack square at the start, falling back to any square that does not win outright. */
function openStartSquare(state, rng = Math.random) {
  const { board, counts, safeTotal } = state;
  const empty = [];
  for (let idx = 0; idx < 64; idx++) if (!board[idx]) empty.push(idx);
  if (empty.length === 0) return;
  const notWinning = empty.filter((idx) => cascadeSize(board, counts, idx) < safeTotal);
  const pools = [openingSquares(board, counts), notWinning, empty];
  const pool = pools.find((candidates) => candidates.length > 0);
  floodReveal(state, pool[Math.floor(rng() * pool.length)]);
}

/** Returns true when the square can still be revealed by the player. */
function isRevealable(state, idx) {
  return !state.revealed[idx] && !state.marks[idx] && !state.known[idx];
}

/**
 * Reveals a square: a piece loses the game, an empty square flood-reveals and may win it.
 * @returns {number[]} the newly revealed indices.
 */
export function reveal(state, idx) {
  if (state.status !== 'playing' || !isRevealable(state, idx)) return [];
  if (state.board[idx]) {
    state.status = 'lost';
    state.lostAt = idx;
    state.endedAt = Date.now();
    return [];
  }
  if (state.startedAt === null) state.startedAt = Date.now();
  const opened = floodReveal(state, idx);
  settleWin(state);
  return opened;
}

/** Marks a game in progress as won once every safe square is revealed. */
function settleWin(state) {
  if (state.status !== 'playing' || state.revealedSafe !== state.safeTotal) return;
  state.status = 'won';
  state.endedAt = Date.now();
}

/**
 * Breadth-first reveal from an empty square, expanding only through zero-count squares.
 * @returns {number[]} the newly revealed indices.
 */
export function floodReveal(state, start) {
  const opened = [];
  if (state.board[start] || !isRevealable(state, start)) return opened;
  const queue = [start];
  state.revealed[start] = 1;
  while (queue.length > 0) {
    const idx = queue.shift();
    opened.push(idx);
    state.revealedSafe++;
    if (state.counts[idx] !== 0) continue;
    for (const next of NEIGHBORS[idx]) {
      if (state.board[next] || !isRevealable(state, next)) continue;
      state.revealed[next] = 1;
      queue.push(next);
    }
  }
  return opened;
}

export const MARK_PIECES = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];

/** Returns true when a square can carry a mark: hidden, not known, and the game still in progress. */
export function canMark(state, idx) {
  return state.status === 'playing' && !state.revealed[idx] && !state.known[idx];
}

/**
 * Marks a hidden square with the piece the player believes stands there; null clears the mark.
 * @returns {string|null} the mark on the square after the call.
 */
export function setMark(state, idx, piece) {
  if (!canMark(state, idx)) return state.marks[idx];
  state.marks[idx] = piece && MARK_PIECES.includes(piece) ? piece : null;
  return state.marks[idx];
}

/**
 * Grades a mark against the real board.
 * @returns {'exact'|'piece'|'empty'|null} null when the square is unmarked.
 */
export function markResult(state, idx) {
  const mark = state.marks[idx];
  if (!mark) return null;
  const piece = state.board[idx];
  if (!piece) return 'empty';
  return piece === mark ? 'exact' : 'piece';
}

/** Returns the number of unknown pieces minus the number of marks placed (may be negative). */
export function minesRemaining(state) {
  const marks = state.marks.filter(Boolean).length;
  return state.pieceCount - state.knownCount - marks;
}

/**
 * Finds the 8-connected regions of empty squares with an attack count of zero.
 * @returns {number[][]} one array of indices per region.
 */
export function zeroRegions(board, counts) {
  const seen = new Uint8Array(64);
  const regions = [];
  const isZero = (idx) => !board[idx] && counts[idx] === 0;
  for (let start = 0; start < 64; start++) {
    if (seen[start] || !isZero(start)) continue;
    const region = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length > 0) {
      const idx = stack.pop();
      region.push(idx);
      for (const next of NEIGHBORS[idx]) {
        if (seen[next] || !isZero(next)) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }
    regions.push(region.sort((a, b) => a - b));
  }
  return regions;
}

/** Returns the elapsed play time in milliseconds, or 0 before the first reveal. */
export function elapsedMs(state, now = Date.now()) {
  if (state.startedAt === null) return 0;
  return (state.endedAt ?? now) - state.startedAt;
}
