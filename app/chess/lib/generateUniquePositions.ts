import { Position } from "../types/Position";

export const generateUniqueLocations = ({
  tilesPerColumn,
  tilesPerRow,
  count,
}: {
  tilesPerColumn: number;
  tilesPerRow: number;
  count: number;
}) => {
  const occupiedTiles: Position[] = [];

  while (occupiedTiles.length < count) {
    const location = {
      row: Math.floor(Math.random() * tilesPerRow),
      column: Math.floor(Math.random() * tilesPerColumn),
    };

    if (
      !occupiedTiles.some((tile) => {
        return tile.row === location.row && tile.column === location.column;
      })
    ) {
      occupiedTiles.push(location);
    }
  }
  return occupiedTiles;
};
