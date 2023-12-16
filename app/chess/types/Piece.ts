import { PieceType } from "./PieceType";
import { Position } from "./Position";

export interface Piece {
  position: Position;
  type: PieceType;
}
