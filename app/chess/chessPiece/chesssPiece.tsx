"use client";
import Image from "next/image";

import { PieceType } from "../types/PieceType";

interface Props {
  pieceType: PieceType;
}

export const ChessPiece = ({ pieceType }: Props) => {
  switch (pieceType) {
    case "p":
      return <Image src="/Pawn.svg" alt="Pawn" fill></Image>;
    case "r":
      return <Image src="/Rook.svg" alt="Rook" fill></Image>;
    case "n":
      return <Image src="/Knight.svg" alt="Knight" fill></Image>;
    case "b":
      return <Image src="/Bishop.svg" alt="Bishop" fill></Image>;
    case "k":
      return <Image src="/King.svg" alt="King" fill></Image>;
    case "q":
      return <Image src="/Queen.svg" alt="Queen" fill></Image>;
  }
};
