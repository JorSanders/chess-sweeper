import styles from "./chessboard.module.css";

interface Props {
  itemsPerRow: number;
  itemsPerColumn: number;
}

export const Chessboard = ({ itemsPerRow = 8, itemsPerColumn = 8 }: Props) => {
  const columns = Array.from({ length: itemsPerColumn }, (_, columnIndex) => {
    const rows = Array.from({ length: itemsPerRow }, (_, rowIndex) => {
      const isDarkSquare = (rowIndex + columnIndex) % 2 === 0;

      return (
        <button
          key={rowIndex}
          className={`${styles.tile} ${
            isDarkSquare ? styles.dark : styles.light
          }`}
        >
          {String.fromCharCode(96 + 1 + columnIndex)} {rowIndex + 1}
        </button>
      );
    });
    return rows;
  });

  return (
    <div className={styles.board}>
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
