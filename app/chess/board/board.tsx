"use client";

import { useState } from "react";
import { generateTiles } from "../lib/generateTiles";
import { Piece } from "../types/Piece";
import { Tile } from "../types/Tile";
import styles from "./board.module.css";

interface Props {
  pieces: Piece[];
  tilesPerColumn: number;
  tilesPerRow: number;
}

export const Board = ({ pieces, tilesPerRow, tilesPerColumn }: Props) => {
  const [tiles, setTiles] = useState<Tile[][]>(
    generateTiles({ tilesPerColumn, tilesPerRow, pieces }),
  );

  return (
    <div
      className={styles.board}
      style={{ gridTemplateColumns: `repeat(${tilesPerRow}, 1fr)` }}
    >
      {tiles
        .map((column) => {
          return column.map((row) => {
            return row.element;
          });
        })
        .reverse()}
    </div>
  );
};
