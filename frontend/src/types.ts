export type Promotable = "knight" | "bishop" | "rook" | "queen";

export type Move = {
  to: string;
  from: string;
  promoteTo?: Promotable;
};

export type Sideline = {
  startsAt: number;
  moves: Move[];
};

export type Line = {
  eval: number;
  moves: Move[];
  leadingMoves: Move[];
  type: "mate" | "cp";
};

export type Position = {
  whitePieces: bigint;
  blackPieces: bigint;
  pawns: bigint;
  knights: bigint;
  bishops: bigint;
  rooks: bigint;
  queens: bigint;
  kings: bigint;
};
