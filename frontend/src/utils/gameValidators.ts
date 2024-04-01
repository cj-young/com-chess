import { Color, Move } from "../types";
import applyMoves from "./applyMoves";
import generateStartingPosition from "./generateStartingPosition";

type LocalStorageGame = {
  color: Color;
  difficulty: "easy" | "medium" | "hard" | "impossible";
  moves: Move[];
};

export function isLocalStorageGameValid(game: any): game is LocalStorageGame {
  try {
    if (typeof game !== "object") return false;
    if (game.color !== "white" && game.color !== "black") return false;
    if (!["easy", "medium", "hard", "impossible"].includes(game.difficulty))
      return false;
    if (!areMovesValid(game.moves)) return false;
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if an array of moves are valid, doesn't check if they are legal.
 * Essentially just checks if applyMoves will throw an error
 */
export function areMovesValid(moves: unknown): boolean {
  if (moves === undefined || !Array.isArray(moves)) return false;
  if (!isObjArrayMovesArray(moves)) return false;
  const pieces = generateStartingPosition();
  try {
    applyMoves(pieces, moves);
    // return true;
  } catch (error) {
    return false;
  }
  return true;
}

function isObjArrayMovesArray(objArr: any[]): objArr is Move[] {
  return !objArr.some((obj) => !isObjectMove(obj));
}

function isObjectMove(obj: any): obj is Move {
  return (
    typeof obj.to === "string" &&
    typeof obj.from === "string" &&
    [undefined, "knight", "bishop", "rook", "queen"].includes(obj.promoteTo)
  );
}
