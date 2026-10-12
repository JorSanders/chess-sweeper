import { parseFen, computeAttackCounts, isWhite } from '../src/chess.js';
import { zeroRegions, openingSquares, cascadeSize } from '../src/game.js';
import { POSITIONS } from '../src/positions.js';

const MIN_ZERO_SQUARES = 6;

/** Returns how many safe squares remain hidden after opening each fair start square. */
function leftAfterOpenings(board, counts, safe) {
  return openingSquares(board, counts).map((start) => safe - cascadeSize(board, counts, start));
}

/** Computes the suitability figures for one position. */
function positionStats(position) {
  const board = parseFen(position.fen);
  const counts = computeAttackCounts(board);
  const pieces = board.filter(Boolean);
  const whitePieces = pieces.filter(isWhite).length;
  const blackPieces = pieces.length - whitePieces;
  let zeroSquares = 0;
  let maxCount = 0;
  for (let idx = 0; idx < 64; idx++) {
    if (board[idx]) continue;
    if (counts[idx] === 0) zeroSquares++;
    maxCount = Math.max(maxCount, counts[idx]);
  }
  const regions = zeroRegions(board, counts);
  const largest = regions.reduce((max, region) => Math.max(max, region.length), 0);
  const left = leftAfterOpenings(board, counts, 64 - pieces.length);
  return {
    id: position.id,
    total: pieces.length,
    pieces: `${whitePieces}/${blackPieces}`,
    safe: 64 - pieces.length,
    zero: zeroSquares,
    regions: regions.length,
    largest,
    maxCount,
    openings: left.length,
    leftAfter: left.length > 0 ? `${Math.min(...left)}-${Math.max(...left)}` : '-',
    verdict: zeroSquares < MIN_ZERO_SQUARES ? `warn: only ${zeroSquares} zero squares` : 'ok',
  };
}

console.table(POSITIONS.map(positionStats));
