export type Promotable = "knight" | "bishop" | "rook" | "queen";

export type Color = "white" | "black";

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

export type PastGame =
  | {
      type: "live";
      opponent: string;
      minutes: number;
      increment: number;
      whiteUsername: string;
      blackUsername: string;
      color: string;
      readonly _id: string;
      winner: string;
    }
  | {
      type: "bot";
      difficulty: string;
      color: string;
      readonly _id: string;
      winner: string;
    };
