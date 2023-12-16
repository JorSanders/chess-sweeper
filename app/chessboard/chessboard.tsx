import styles from "./chessboard.module.css";

interface Props {
  tilesPerRow: number;
  tilesPerColumn: number;
  pieceCount: number;
}

const pieceType = ["p", "r", "k", "b", "k", "q"];

const generateUniqueLocations = ({
  tilesPerColumn,
  tilesPerRow,
  count,
}: {
  tilesPerColumn: number;
  tilesPerRow: number;
  count: number;
}) => {
  const occupiedTiles: { row: number; column: number }[] = [];

  while (occupiedTiles.length < count) {
    const location = {
      row: Math.floor(Math.random() * tilesPerRow),
      column: Math.floor(Math.random() * tilesPerColumn),
    };

    if (!occupiedTiles.includes(location)) {
      occupiedTiles.push(location);
    }
  }
  return occupiedTiles;
};

const generatePieces = ({
  tilesPerColumn,
  tilesPerRow,
  count,
}: {
  tilesPerColumn: number;
  tilesPerRow: number;
  count: number;
}) => {
  const locations = generateUniqueLocations({
    tilesPerColumn,
    tilesPerRow,
    count,
  });

  const pieces = locations.map((location) => {
    return {
      ...location,
      type: pieceType[Math.floor(Math.random() * pieceType.length)],
    };
  });

  return pieces;
};

export const Chessboard = ({
  tilesPerRow: tilesPerRow,
  tilesPerColumn,
  pieceCount,
}: Props) => {
  const pieces = generatePieces({
    tilesPerColumn,
    tilesPerRow,
    count: pieceCount,
  });

  console.log(pieces);

  const columns = Array.from({ length: tilesPerColumn }, (_, columnIndex) => {
    const rows = Array.from({ length: tilesPerRow }, (_, rowIndex) => {
      const isDarkSquare =
        columnIndex % 2 === 0 ? rowIndex % 2 === 0 : rowIndex % 2 === 1;

      const piece = pieces.find((piece) => {
        return piece.row === rowIndex && piece.column === columnIndex;
      });

      console.log(piece);

      return (
        <button
          key={rowIndex}
          className={`${styles.tile} ${
            isDarkSquare ? styles.dark : styles.light
          }`}
        >
          {piece
            ? piece.type
            : `${String.fromCharCode(96 + 1 + rowIndex)} ${columnIndex + 1} `}
        </button>
      );
    });
    return rows;
  });

  return (
    <div
      className={styles.board}
      style={{ gridTemplateColumns: `repeat(${tilesPerRow}, 1fr)` }}
    >
      {columns
        .map((column) => {
          return column.map((row) => {
            return row;
          });
        })
        .reverse()}
    </div>
  );
};
