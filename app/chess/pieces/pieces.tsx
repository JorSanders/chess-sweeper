import { ChessPiece } from "../chessPiece/chesssPiece";
import { Piece } from "../types/Piece";
import styles from "./pieces.module.css";

interface Props {
  pieces: Piece[];
}

export const Pieces = ({ pieces }: Props) => {
  return (
    <>
      {pieces.map((piece) => {
        return (
          <div className={styles.imageWrapper}>
            <ChessPiece pieceType={piece.type}></ChessPiece>
          </div>
        );
      })}
    </>
  );
};
