"use client";

import { useEffect, useReducer } from "react";
import { generatePieces } from "../lib/generatePieces";
import { generateTiles } from "../lib/generateTiles";
import { revealAllTiles } from "../lib/realAllTiles";
import { revealConnectedTiles } from "../lib/revealConnectedTiles";
import { Tile } from "../tile/tile";
import { Tile as TileType } from "../types/Tile";
import styles from "./board.module.css";

interface Props {
  tilesPerColumn: number;
  tilesPerRow: number;
}

type GameState = "playing" | "victory" | "defeat" | "initial";

interface BoardState {
  gameState: GameState;
  tiles: TileType[][];
}

type BoardAction =
  | {
      action: "start";
      tilesPerColumn: number;
      tilesPerRow: number;
      pieceCount: number;
    }
  | {
      action: "reveal";
      tile: TileType;
    };

const BoardStateReducer = (
  state: BoardState,
  action: BoardAction,
): BoardState => {
  switch (action.action) {
    case "start": {
      const { tilesPerColumn, tilesPerRow, pieceCount } = action;
      const pieces = generatePieces({
        tilesPerColumn,
        tilesPerRow,
        count: pieceCount,
      });

      const newTiles = generateTiles({
        tilesPerColumn,
        tilesPerRow,
        pieces,
      });
      return { gameState: "playing", tiles: newTiles };
    }
    case "reveal": {
      if (action.tile.piece) {
        return {
          gameState: "defeat",
          tiles: revealAllTiles(state.tiles),
        };
      }
      const newTiles = revealConnectedTiles(state.tiles, action.tile);
      const remainingTile = newTiles.some((column) =>
        column.some((tile) => !tile.revealed && !tile.piece),
      );
      if (!remainingTile) {
        return {
          gameState: "victory",
          tiles: revealAllTiles(state.tiles),
        };
      }
      return {
        gameState: "playing",
        tiles: revealConnectedTiles(state.tiles, action.tile),
      };
    }
  }
};

const intialBoardState: BoardState = {
  gameState: "initial",
  tiles: [],
};

export const Board = ({ tilesPerRow, tilesPerColumn }: Props) => {
  const [boardState, dispatch] = useReducer(BoardStateReducer, {
    gameState: "initial",
    tiles: [],
  });

  useEffect(() => {
    dispatch({
      action: "start",
      tilesPerColumn: 8,
      tilesPerRow: 8,
      pieceCount: 1,
    });
  }, []);

  return (
    <>
      {boardState.gameState === "defeat" && <h2>Boom</h2>}
      {boardState.gameState === "victory" && <h2>Yay</h2>}
      <div
        className={styles.board}
        style={{ gridTemplateColumns: `repeat(${tilesPerRow}, 1fr)` }}
      >
        {boardState.tiles
          .map((column) => {
            return column.map((tile) => {
              return (
                <Tile
                  key={`${tile.position.column}-${tile.position.row}`}
                  data-tiles={`${tile.position.column}-${tile.position.row}`}
                  revealed={tile.revealed}
                  isDarkSquare={tile.isDarkSquare}
                  attackedByCount={tile.attackedByCount}
                  piece={tile.piece}
                  attributes={{
                    onClick: () => {
                      dispatch({ action: "reveal", tile });
                    },
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
