import { Piece } from "../types/Piece";
import { Position } from "../types/Position";

export const pieceAttacksSquare = (piece: Piece, target: Position) => {
  const columnDelta = Math.abs(piece.position.column - target.column);
  const rowDelta = Math.abs(piece.position.row - target.row);

  switch (piece.type) {
    case "p":
      if (
        piece.position.column === target.column - 1 &&
        (piece.position.row + 1 === target.row ||
          piece.position.row - 1 === target.row)
      ) {
        return true;
      }
      break;
    case "r":
      if (
        piece.position.column === target.column ||
        piece.position.row === target.row
      ) {
        return true;
      }
      break;
    case "n":
      if (
        (columnDelta === 1 && rowDelta === 2) ||
        (columnDelta === 2 && rowDelta === 1)
      ) {
        return true;
      }
      break;
    case "b":
      if (
        piece.position.column - piece.position.row ===
          target.column - target.row ||
        piece.position.column + piece.position.row ===
          target.column + target.row
      ) {
        return true;
      }
      break;
    case "k":
      if (rowDelta <= 1 && columnDelta <= 1) {
        return true;
      }
      break;
    case "q":
      if (
        piece.position.column === target.column ||
        piece.position.row === target.row ||
        piece.position.column - piece.position.row ===
          target.column - target.row ||
        piece.position.column + piece.position.row ===
          target.column + target.row
      ) {
        return true;
      }
      break;
  }
  return false;
};
