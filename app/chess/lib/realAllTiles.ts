import { Tile } from "../types/Tile";

export const revealAllTiles = (tiles: Tile[][]) => {
  return tiles.map((column) => {
    return column.map((tile) => {
      return { ...tile, revealed: true };
    });
  });
};
