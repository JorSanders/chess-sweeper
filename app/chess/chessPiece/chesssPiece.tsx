"use client";

import { HTMLAttributes } from "react";
import { PieceType } from "../types/PieceType";
import Bishop from "./../icons/Bishop.svg";
import King from "./../icons/King.svg";
import Knight from "./../icons/Knight.svg";
import Pawn from "./../icons/Pawn.svg";
import Queen from "./../icons/Queen.svg";
import Rook from "./../icons/Rook.svg";

interface Props {
  pieceType: PieceType;
  attributes: HTMLAttributes<HTMLButtonElement>;
}

export const ChessPiece = ({ pieceType, attributes }: Props) => {
  switch (pieceType) {
    case "p":
      return <Pawn {...attributes}></Pawn>;
    case "r":
      return <Rook {...attributes}></Rook>;
    case "n":
      return <Knight {...attributes}></Knight>;
    case "b":
      return <Bishop {...attributes}></Bishop>;
    case "k":
      return <King {...attributes}></King>;
    case "q":
      return <Queen {...attributes}></Queen>;
  }
};
