"use client";

import { HTMLAttributes } from "react";
import { Piece } from "../types/Piece";
import styles from "./tile.module.css";

interface Props {
  revealed: boolean;
  isDarkSquare: boolean;
  piece?: Piece;
  attackedByCount: number;
  attributes: HTMLAttributes<HTMLButtonElement>;
}

export const Tile = ({
  revealed,
  isDarkSquare,
  piece,
  attackedByCount,
  attributes,
}: Props) => {
  if (!revealed) {
    return (
      <button
        className={`${styles.tile} ${
          isDarkSquare ? styles.dark : styles.light
        } ${styles.notRevealed}`}
        type="button"
        {...attributes}
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
      {...attributes}
    >
      {piece ? piece.type : attackedByCount}
    </button>
  );
};
