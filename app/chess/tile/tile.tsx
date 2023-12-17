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

const dangerClassNameMap = (attackedByCount: number) => {
  switch (attackedByCount) {
    case 0:
      return "";
    case 1:
      return `${styles.dangerLevelOne}`;
    case 2:
      return `${styles.dangerLevelTwo}`;
    case 3:
      return `${styles.dangerLevelThree}`;
    case 4:
      return `${styles.dangerLevelFour}`;
    case 5:
    default:
      return `${styles.dangerLevelFive}`;
  }
};

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
          <ChessPiece pieceType={piece.type}></ChessPiece>
        ) : (
          attackedByCount
        )}
      </button>
    );
  }

  return (
    <button
      className={`${styles.tile} ${
        isDarkSquare ? styles.dark : styles.light
      } ${dangerClassNameMap(attackedByCount)}`}
      type="button"
      disabled
      {...attributes}
    >
      <span>{attackedByCount > 0 && attackedByCount}</span>
    </button>
  );
};
