"use client";

import { useEffect, useState } from "react";
import { generateTiles } from "../lib/generateTiles";
import { revealConnectedTiles } from "../lib/revealTiles";
import { Tile } from "../tile/tile";
import { Piece } from "../types/Piece";
import { Tile as TileType } from "../types/Tile";
import styles from "./board.module.css";

interface Props {
  pieces: Piece[];
  tilesPerColumn: number;
  tilesPerRow: number;
}

type GameState = "playing" | "defeat" | "victory";

export const Board = ({ pieces, tilesPerRow, tilesPerColumn }: Props) => {
  const [gameState, setGameState] = useState<GameState>("playing");

  const [tiles, setTiles] = useState<TileType[][]>(
    generateTiles({ tilesPerColumn, tilesPerRow, pieces }),
  );

  useEffect(() => {
    const nonRevealedTile = tiles.find((column) =>
      column.find((tile) => !tile.revealed),
    );
    if (!nonRevealedTile) {
      setGameState("victory");
    }
  });

  return (
    <>
      {gameState === "defeat" && <h2>Boom</h2>}
      {gameState === "victory" && <h2>Yay</h2>}
      <div
        className={styles.board}
        style={{ gridTemplateColumns: `repeat(${tilesPerRow}, 1fr)` }}
      >
        {tiles
          .map((column) => {
            return column.map((tile) => {
              return (
                <Tile
                  key={`${tile.position.column}-${tile.position.row}`}
                  revealed={tile.revealed}
                  isDarkSquare={tile.isDarkSquare}
                  attackedByCount={tile.attackedByCount}
                  piece={tile.piece}
                  onClick={() => {
                    if (tile.piece) {
                      setGameState("defeat");
                      return;
                    }
                    setTiles(revealConnectedTiles(tiles, tile));
                  }}
                ></Tile>
              );
            });
          })
          .reverse()}
      </div>
    </>
  );
};
