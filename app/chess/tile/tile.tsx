"use client";

import { Piece } from "../types/Piece";
import styles from "./tile.module.css";

interface Props {
  revealed: boolean;
  isDarkSquare: boolean;
  piece?: Piece;
  attackedByCount: number;
  onClick: () => void;
}

export const Tile = ({
  revealed,
  isDarkSquare,
  piece,
  attackedByCount,
  onClick,
}: Props) => {
  if (!revealed) {
    return (
      <button
        className={`${styles.tile} ${
          isDarkSquare ? styles.dark : styles.light
        } ${styles.notRevealed}`}
        type="button"
        onClick={() => {
          onClick();
        }}
      >
        ?
      </button>
    );
  }

  return (
    <button
      className={`${styles.tile} ${isDarkSquare ? styles.dark : styles.light}`}
      type="button"
      disabled
    >
      {piece ? piece.type : attackedByCount}
    </button>
  );
};
