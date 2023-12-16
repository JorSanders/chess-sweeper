import styles from "./chessboard.module.css";

interface Props {
  tilesPerRow: number;
  tilesPerColumn: number;
  pieceCount: number;
}

interface Location {
  row: number;
  column: number;
}

const pieceTypeList = ["p", "r", "n", "b", "k", "q"] as const;
type PieceType = (typeof pieceTypeList)[number];

interface Piece {
  location: Location;
  type: PieceType;
}

const pieceAttacksSquare = (piece: Piece, target: Location) => {
  const columnDelta = Math.abs(piece.location.column - target.column);
  const rowDelta = Math.abs(piece.location.row - target.row);

  switch (piece.type) {
    case "p":
      if (
        piece.location.column === target.column - 1 &&
        (piece.location.row + 1 === target.row ||
          piece.location.row - 1 === target.row)
      ) {
        return true;
      }
      break;
    case "r":
      if (
        piece.location.column === target.column ||
        piece.location.row === target.row
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
        piece.location.column - piece.location.row ===
          target.column - target.row ||
        piece.location.column + piece.location.row ===
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
        piece.location.column === target.column ||
        piece.location.row === target.row ||
        piece.location.column - piece.location.row ===
          target.column - target.row ||
        piece.location.column + piece.location.row ===
          target.column + target.row
      ) {
        return true;
      }
      break;
  }
  return false;
};

const generateUniqueLocations = ({
  tilesPerColumn,
  tilesPerRow,
  count,
}: {
  tilesPerColumn: number;
  tilesPerRow: number;
  count: number;
}) => {
  const occupiedTiles: Location[] = [];

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

  const pieces: Piece[] = locations.map((location) => {
    return {
      location,
      type: pieceTypeList[Math.floor(Math.random() * pieceTypeList.length)],
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

      const attackedByCount = pieces.reduce((count, piece) => {
        if (pieceAttacksSquare(piece, { row: rowIndex, column: columnIndex })) {
          return count + 1;
        }
        return count;
      }, 0);

      const piece = pieces.find((piece) => {
        return (
          piece.location.row === rowIndex &&
          piece.location.column === columnIndex
        );
      });

      console.log(piece);

      return (
        <button
          key={rowIndex}
          className={`${styles.tile} ${
            isDarkSquare ? styles.dark : styles.light
          }`}
        >
          {piece ? piece.type : attackedByCount}
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
