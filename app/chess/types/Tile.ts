import { Piece } from "./Piece";
import { Position } from "./Position";

export interface Tile {
  position: Position;
  piece?: Piece;
  revealed: boolean;
  isDarkSquare: boolean;
  attackedByCount: number;
}
