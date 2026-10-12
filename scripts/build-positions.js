import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';
import { POSITIONS } from '../src/positions.js';
import { parseFen, computeAttackCounts } from '../src/chess.js';
import { openingSquares, MIN_LEFT_AFTER_OPENING } from '../src/game.js';

const TARGET = fileURLToPath(new URL('../src/positions.js', import.meta.url));

const KEY_ORDER = [
  'id', 'kind', 'name', 'white', 'black', 'event', 'year', 'result',
  'moveNote', 'pgn', 'ply', 'fen', 'blurb', 'link',
];

/** Removes parenthesised variations from PGN text, innermost first so nested ones go too. */
function stripVariations(text) {
  let current = text;
  let previous = '';
  while (current !== previous) {
    previous = current;
    current = current.replace(/\([^()]*\)/g, ' ');
  }
  return current;
}

/** Splits a PGN move list into SAN tokens, dropping comments, variations, NAGs, move numbers and result markers. */
function sanMoves(pgn) {
  const withoutComments = pgn.replace(/\{[^}]*\}/g, ' ').replace(/;[^\n]*/g, ' ');
  return stripVariations(withoutComments)
    .replace(/\$\d+/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^\d+\.(\.\.)?/, ''))
    .filter((token) => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));
}

/** Replays a PGN (optionally truncated to ply half-moves) and returns the resulting FEN. */
function fenFromPgn(entry) {
  const chess = new Chess();
  const moves = sanMoves(entry.pgn);
  const limit = entry.ply ?? moves.length;
  if (limit > moves.length) throw new Error(`${entry.id}: ply ${limit} exceeds ${moves.length} moves`);
  for (let i = 0; i < limit; i++) {
    try {
      chess.move(moves[i]);
    } catch {
      throw new Error(`${entry.id}: illegal move "${moves[i]}" at ply ${i + 1}`);
    }
  }
  return chess.fen();
}

/** Formats a string literal, preferring single quotes. */
function quote(value) {
  if (value.includes("'") && !value.includes('"')) return JSON.stringify(value);
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Formats a primitive value as JavaScript source. */
function literal(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'number') return String(value);
  throw new Error(`Unsupported value: ${value}`);
}

/** Serialises one position entry as an indented object literal. */
function serializeEntry(entry) {
  const unknown = Object.keys(entry).filter((key) => !KEY_ORDER.includes(key));
  if (unknown.length > 0) throw new Error(`${entry.id}: unknown keys ${unknown.join(', ')}`);
  const lines = KEY_ORDER
    .filter((key) => key in entry)
    .map((key) => `    ${key}: ${literal(entry[key])},`);
  return `  {\n${lines.join('\n')}\n  },`;
}

/** Validates ids, FEN legality via chess.js, the presence of both kings and a fair free opening. */
function validate(entries) {
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`Duplicate id: ${entry.id}`);
    ids.add(entry.id);
    if (!entry.fen) throw new Error(`${entry.id}: missing fen`);
    try {
      new Chess(entry.fen);
    } catch (error) {
      throw new Error(`${entry.id}: invalid fen (${error.message})`);
    }
    const board = parseFen(entry.fen);
    for (const king of ['K', 'k']) {
      const n = board.filter((piece) => piece === king).length;
      if (n !== 1) throw new Error(`${entry.id}: expected one ${king}, found ${n}`);
    }
    if (openingSquares(board, computeAttackCounts(board)).length === 0) {
      throw new Error(`${entry.id}: no zero-attack opening square leaves ${MIN_LEFT_AFTER_OPENING} or more squares to find`);
    }
  }
}

const updated = POSITIONS.map((entry) => {
  if (!entry.pgn) return { ...entry };
  const fen = fenFromPgn(entry);
  if (entry.fen && entry.fen !== fen) console.log(`${entry.id}: fen changed`);
  return { ...entry, fen };
});

validate(updated);

const source = `export const POSITIONS = [\n${updated.map(serializeEntry).join('\n')}\n];\n`;
await writeFile(TARGET, source);

for (const entry of updated) console.log(`${entry.id.padEnd(22)} ${entry.fen}`);
console.log(`Wrote ${updated.length} positions to src/positions.js`);
