import { Piece } from "../types/Piece";
import { pieceTypeList } from "../types/PieceType";
import { generateUniqueLocations } from "./generateUniquePositions";

export const generatePieces = ({
  tilesPerColumn,
  tilesPerRow,
  count,
}: {
  tilesPerColumn: number;
  tilesPerRow: number;
  count: number;
}) => {
  const positions = generateUniqueLocations({
    tilesPerColumn,
    tilesPerRow,
    count,
  });

  const pieces: Piece[] = positions.map((position) => {
    return {
      position,
      type: pieceTypeList[Math.floor(Math.random() * pieceTypeList.length)],
    };
  });

  return pieces;
};
