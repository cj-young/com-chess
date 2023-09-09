type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

const promotableSuffixes = new Map([
  ["knight", "n"],
  ["bishop", "b"],
  ["rook", "r"],
  ["queen", "q"],
]);

export default function moveToUCI(move: Move): string {
  return `${move.from}${move.to}${
    move.promoteTo ? promotableSuffixes.get(move.promoteTo) : ""
  }`;
}
