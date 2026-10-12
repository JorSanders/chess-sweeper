const FILES = 'abcdefgh';

const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_STEPS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ORTHOGONALS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export const PIECE_NAMES = {
  K: 'white king',
  Q: 'white queen',
  R: 'white rook',
  B: 'white bishop',
  N: 'white knight',
  P: 'white pawn',
  k: 'black king',
  q: 'black queen',
  r: 'black rook',
  b: 'black bishop',
  n: 'black knight',
  p: 'black pawn',
};

/** Returns true when (row, file) lies on the board. */
function onBoard(row, file) {
  return row >= 0 && row < 8 && file >= 0 && file < 8;
}

export const NEIGHBORS = Array.from({ length: 64 }, (_, idx) => {
  const row = Math.floor(idx / 8);
  const file = idx % 8;
  return KING_STEPS
    .filter(([dr, df]) => onBoard(row + dr, file + df))
    .map(([dr, df]) => (row + dr) * 8 + file + df);
});

/** Converts a square index (a8 = 0, h1 = 63) to algebraic notation such as "e4". */
export function idxToAlg(idx) {
  return FILES[idx % 8] + (8 - Math.floor(idx / 8));
}

/**
 * Parses the piece-placement field of a FEN string.
 * @returns {Array<string|null>} 64 entries, each a piece letter or null.
 */
export function parseFen(fen) {
  if (typeof fen !== 'string') throw new Error('FEN must be a string');
  const placement = fen.trim().split(/\s+/)[0];
  const ranks = placement.split('/');
  if (ranks.length !== 8) throw new Error(`FEN must have 8 ranks, got ${ranks.length}: ${fen}`);
  const board = [];
  for (const rank of ranks) {
    let width = 0;
    for (const ch of rank) {
      if (/[1-8]/.test(ch)) {
        const n = Number(ch);
        width += n;
        for (let i = 0; i < n; i++) board.push(null);
      } else if (/[KQRBNPkqrbnp]/.test(ch)) {
        width += 1;
        board.push(ch);
      } else {
        throw new Error(`Invalid FEN character "${ch}": ${fen}`);
      }
    }
    if (width !== 8) throw new Error(`FEN rank "${rank}" does not sum to 8: ${fen}`);
  }
  return board;
}

/** Returns true for an uppercase (white) piece letter. */
export function isWhite(piece) {
  return piece !== null && piece !== undefined && piece === piece.toUpperCase();
}

/** Collects the squares reached by single steps from (row, file). */
function stepTargets(row, file, steps) {
  return steps
    .filter(([dr, df]) => onBoard(row + dr, file + df))
    .map(([dr, df]) => (row + dr) * 8 + file + df);
}

/** Collects the squares reached by sliding from (row, file), including the first blocker in each direction. */
function slideTargets(board, row, file, directions) {
  const targets = [];
  for (const [dr, df] of directions) {
    let r = row + dr;
    let f = file + df;
    while (onBoard(r, f)) {
      const idx = r * 8 + f;
      targets.push(idx);
      if (board[idx]) break;
      r += dr;
      f += df;
    }
  }
  return targets;
}

/** Returns the indices of all squares attacked by the piece on idx (empty when the square is empty). */
export function attacksFrom(board, idx) {
  const piece = board[idx];
  if (!piece) return [];
  const row = Math.floor(idx / 8);
  const file = idx % 8;
  switch (piece.toLowerCase()) {
    case 'p': {
      const dr = isWhite(piece) ? -1 : 1;
      return stepTargets(row, file, [[dr, -1], [dr, 1]]);
    }
    case 'n':
      return stepTargets(row, file, KNIGHT_STEPS);
    case 'k':
      return stepTargets(row, file, KING_STEPS);
    case 'b':
      return slideTargets(board, row, file, DIAGONALS);
    case 'r':
      return slideTargets(board, row, file, ORTHOGONALS);
    case 'q':
      return slideTargets(board, row, file, [...DIAGONALS, ...ORTHOGONALS]);
    default:
      return [];
  }
}

/** Counts, for every square, how many pieces of either colour attack it. */
export function computeAttackCounts(board) {
  const counts = new Uint8Array(64);
  for (let idx = 0; idx < 64; idx++) {
    for (const target of attacksFrom(board, idx)) counts[target]++;
  }
  return counts;
}
