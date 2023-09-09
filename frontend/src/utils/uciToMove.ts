type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

const promotableSuffixes = new Map([
  ["n", "knight"],
  ["b", "bishop"],
  ["r", "rook"],
  ["q", "queen"],
]);

export default function uciToMove(move: string): Move {
  if (move.length < 5) {
    return {
      to: move.slice(0, 2),
      from: move.slice(2, 4),
    };
  } else {
    return {
      to: move.slice(0, 2),
      from: move.slice(2, 4),
      promoteTo: promotableSuffixes.get(move[4]) as
        | "knight"
        | "bishop"
        | "rook"
        | "queen"
        | undefined,
    };
  }
}
