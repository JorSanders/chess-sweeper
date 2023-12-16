"use client";

import { HTMLAttributes } from "react";
import { ChessPiece } from "../chessPiece/chesssPiece";
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
      ></button>
    );
  }

  if (!!piece) {
    return (
      <button
        className={`${styles.tile} ${
          isDarkSquare ? styles.dark : styles.light
        }`}
        type="button"
        disabled
        {...attributes}
      >
        {piece ? (
          <ChessPiece
            height={45}
            width={45}
            pieceType={piece.type}
          ></ChessPiece>
        ) : (
          attackedByCount
        )}
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
      {attackedByCount > 0 && attackedByCount}
    </button>
  );
};
