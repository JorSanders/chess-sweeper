"use client";

import { useEffect, useReducer, useRef } from "react";
import { generatePieces } from "../lib/generatePieces";
import { generateTiles } from "../lib/generateTiles";
import { revealAllTiles } from "../lib/realAllTiles";
import { revealConnectedTiles } from "../lib/revealConnectedTiles";
import { Tile } from "../tile/tile";
import { Tile as TileType } from "../types/Tile";
import styles from "./board.module.css";

interface BoardState {
  gameState: "playing" | "victory" | "defeat" | "initial";
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

export const Board = () => {
  const [boardState, dispatch] = useReducer(BoardStateReducer, {
    gameState: "initial",
    tiles: [],
  });

  const victoryDialogRef = useRef<HTMLDialogElement | null>(null);
  const defeatDialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    dispatch({
      action: "start",
      tilesPerColumn: 8,
      tilesPerRow: 8,
      pieceCount: 5,
    });
  }, []);

  if (boardState.gameState === "victory") {
    victoryDialogRef.current?.show();
  }

  if (boardState.gameState === "defeat") {
    defeatDialogRef.current?.show();
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${boardState.tiles[0]?.length}, 1fr)`,
        }}
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

      <dialog ref={victoryDialogRef} className={styles.dialog}>
        <div className={styles.dialogInside}>
          <div className={styles.dialogHeading}>
            <h2>You won!</h2>
            <p>by luck</p>
          </div>
          <div className={styles.dialogContent}>
            <span>:D</span>
          </div>
          <button
            type="button"
            className={styles.dialogCloseButton}
            onClick={() => {
              victoryDialogRef.current?.close();
              dispatch({
                action: "start",
                tilesPerColumn: 8,
                tilesPerRow: 8,
                pieceCount: 5,
              });
            }}
          >
            <span aria-label="Close">x</span>
          </button>
        </div>
      </dialog>

      <dialog ref={defeatDialogRef} className={styles.dialog}>
        <div className={styles.dialogInside}>
          <div className={styles.dialogHeading}>
            <h2>You got bricked!</h2>
            <p>on the pipi</p>
          </div>
          <div className={styles.dialogContent}>
            <span>&gt;:</span>
          </div>
          <button
            type="button"
            className={styles.dialogCloseButton}
            onClick={() => {
              defeatDialogRef.current?.close();
              dispatch({
                action: "start",
                tilesPerColumn: 8,
                tilesPerRow: 8,
                pieceCount: 5,
              });
            }}
          >
            <span aria-label="Close">x</span>
          </button>
        </div>
      </dialog>
    </div>
  );
};
