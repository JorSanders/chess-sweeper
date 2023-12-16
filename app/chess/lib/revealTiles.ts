import { Tile } from "../types/Tile";

const recursiveRealTiles = (tiles: Tile[][], tile: Tile) => {
  if (tile.revealed || tile.piece) {
    return;
  }

  tile.revealed = true;
  if (tile.attackedByCount === 0) {
    for (
      let column = tile.position.column - 1;
      column <= tile.position.column + 1;
      column++
    ) {
      if (column < 0 || column > tiles.length - 1) {
        break;
      }
      for (
        let row = tile.position.row - 1;
        row <= tile.position.column + 1;
        row++
      ) {
        if (row < 0 || row > tiles[column].length - 1) {
          break;
        }
        recursiveRealTiles(tiles, tiles[column][row]);
      }
    }
  }
};

export const revealConnectedTiles = (tiles: Tile[][], tile: Tile) => {
  // Don't mutate the values passed
  const tilesCopy = JSON.parse(JSON.stringify(tiles));
  const tileCopy = tilesCopy[tile.position.column][tile.position.row];
  tileCopy.revealed = true;

  recursiveRealTiles(tilesCopy, tileCopy);
  return tilesCopy;
};
