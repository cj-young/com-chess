import { Move } from "../types";

const promotableSuffixes = new Map([
  ["n", "knight"],
  ["b", "bishop"],
  ["r", "rook"],
  ["q", "queen"],
]);

export default function uciToMove(move: string): Move {
  if (move.length < 5) {
    return {
      from: move.slice(0, 2),
      to: move.slice(2, 4),
    };
  } else {
    return {
      from: move.slice(0, 2),
      to: move.slice(2, 4),
      promoteTo: promotableSuffixes.get(move[4]) as
        | "knight"
        | "bishop"
        | "rook"
        | "queen"
        | undefined,
    };
  }
}
