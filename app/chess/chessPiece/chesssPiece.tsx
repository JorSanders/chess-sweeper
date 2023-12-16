"use client";
import Image from "next/image";

import { PieceType } from "../types/PieceType";

interface Props {
  pieceType: PieceType;
  height: number;
  width: number;
}

export const ChessPiece = ({ pieceType, height, width }: Props) => {
  switch (pieceType) {
    case "p":
      return (
        <Image src="/Pawn.svg" alt="Pawn" height={height} width={width}></Image>
      );
    case "r":
      return (
        <Image src="/Rook.svg" alt="Rook" height={height} width={width}></Image>
      );
    case "n":
      return (
        <Image
          src="/Knight.svg"
          alt="Knight"
          height={height}
          width={width}
        ></Image>
      );
    case "b":
      return (
        <Image
          src="/Bishop.svg"
          alt="Bishop"
          height={height}
          width={width}
        ></Image>
      );
    case "k":
      return (
        <Image src="/King.svg" alt="King" height={height} width={width}></Image>
      );
    case "q":
      return (
        <Image
          src="/Queen.svg"
          alt="Queen"
          height={height}
          width={width}
        ></Image>
      );
  }
};
