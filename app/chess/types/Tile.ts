import { Piece } from "./Piece";
import { Position } from "./Position";

export interface Tile {
  element: JSX.Element;
  position: Position;
  piece?: Piece;
  revealed: boolean;
}
