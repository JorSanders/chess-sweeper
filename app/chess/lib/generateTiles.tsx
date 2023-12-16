import { Piece } from "../types/Piece";
import { Tile as TileType } from "../types/Tile";

import { pieceAttacksSquare } from "./pieceAttacksSquare";

export const generateTiles = ({
  tilesPerColumn,
  tilesPerRow,
  pieces,
}: {
  tilesPerColumn: number;
  tilesPerRow: number;
  pieces: Piece[];
}) => {
  const tiles: TileType[][] = Array.from(
    { length: tilesPerColumn },
    (_, columnIndex) => {
      const rows = Array.from({ length: tilesPerRow }, (_, rowIndex) => {
        const isDarkSquare =
          columnIndex % 2 === 0 ? rowIndex % 2 === 0 : rowIndex % 2 === 1;

        const attackedByCount = pieces.reduce((count, piece) => {
          if (
            pieceAttacksSquare(piece, { row: rowIndex, column: columnIndex })
          ) {
            return count + 1;
          }
          return count;
        }, 0);

        const piece = pieces.find((piece) => {
          return (
            piece.position.row === rowIndex &&
            piece.position.column === columnIndex
          );
        });

        return {
          position: { row: rowIndex, column: columnIndex },
          piece,
          revealed: false,
          isDarkSquare,
          attackedByCount,
        };
      });
      return rows;
    },
  );

  return tiles;
};
