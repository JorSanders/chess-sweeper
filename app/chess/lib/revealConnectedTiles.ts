import { Tile } from "../types/Tile";

const recursiveRevealTiles = (tiles: Tile[][], tile: Tile) => {
  if (tile.attackedByCount !== 0 || tile.revealed || !!tile.piece) {
    return;
  }

  tile.revealed = true;

  for (
    let column = tile.position.column - 1;
    column <= tile.position.column + 1;
    column++
  ) {
    if (column < 0 || column > tiles.length - 1) {
      break;
    }
    for (let row = tile.position.row - 1; row <= tile.position.row + 1; row++) {
      if (row < 0 || row > tiles[column].length - 1) {
        break;
      }
      recursiveRevealTiles(tiles, tiles[column][row]);
    }
  }
};

export const revealConnectedTiles = (tiles: Tile[][], tile: Tile): Tile[][] => {
  // Don't mutate the values passed
  const tilesCopy = JSON.parse(JSON.stringify(tiles));
  const tileCopy = tilesCopy[tile.position.column][tile.position.row];

  recursiveRevealTiles(tilesCopy, tileCopy);
  tileCopy.revealed = true;

  return tilesCopy;
};
