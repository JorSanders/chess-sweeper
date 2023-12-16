"use client";

import { useState } from "react";
import { Piece } from "../types/Piece";
import styles from "./tile.module.css";

interface Props {
  isDarkSquare: boolean;
  piece?: Piece;
  attackedByCount: number;
  pieceHit: () => void;
}

export const Tile = ({
  isDarkSquare,
  piece,
  attackedByCount,
  pieceHit,
}: Props) => {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button
        className={`${styles.tile} ${
          isDarkSquare ? styles.dark : styles.light
        } ${styles.notRevealed}`}
        type="button"
        onClick={() => {
          if (piece) {
            pieceHit();
          }
          setRevealed(true);
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
