import { Board } from "./board/board";
import { generatePieces } from "./lib/generatePieces";

const tilesPerColumn = 8;
const tilesPerRow = 8;

export const ChessSweeper = () => {
  const pieces = generatePieces({
    tilesPerColumn,
    tilesPerRow,
    count: 8,
  });

  return (
    <Board
      pieces={pieces}
      tilesPerColumn={tilesPerColumn}
      tilesPerRow={tilesPerRow}
    ></Board>
  );
};
