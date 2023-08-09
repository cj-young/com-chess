import pawnWhite from "../assets/chess-pieces/pawn-white.svg";
import pawnBlack from "../assets/chess-pieces/pawn-black.svg";
import knightWhite from "../assets/chess-pieces/knight-white.svg";
import knightBlack from "../assets/chess-pieces/knight-black.svg";
import bishopWhite from "../assets/chess-pieces/bishop-white.svg";
import bishopBlack from "../assets/chess-pieces/bishop-black.svg";
import rookWhite from "../assets/chess-pieces/rook-white.svg";
import rookBlack from "../assets/chess-pieces/rook-black.svg";
import queenWhite from "../assets/chess-pieces/queen-white.svg";
import queenBlack from "../assets/chess-pieces/queen-black.svg";
import kingWhite from "../assets/chess-pieces/king-white.svg";
import kingBlack from "../assets/chess-pieces/king-black.svg";

export type PieceType =
  | "pawn"
  | "knight"
  | "bishop"
  | "rook"
  | "queen"
  | "king";
type Color = "white" | "black";

function makePieceColorMap(whitePiece: string, blackPiece: string) {
  return new Map<Color, string>([
    ["white", whitePiece],
    ["black", blackPiece]
  ]);
}

export const pieceImages = new Map<PieceType, Map<Color, string>>([
  ["pawn", makePieceColorMap(pawnWhite, pawnBlack)],
  ["knight", makePieceColorMap(knightWhite, knightBlack)],
  ["bishop", makePieceColorMap(bishopWhite, bishopBlack)],
  ["rook", makePieceColorMap(rookWhite, rookBlack)],
  ["queen", makePieceColorMap(queenWhite, queenBlack)],
  ["king", makePieceColorMap(kingWhite, kingBlack)]
]);

export const pieceValues = new Map<PieceType, number>([
  ["pawn", 1],
  ["knight", 3],
  ["bishop", 3],
  ["rook", 5],
  ["queen", 9],
  ["king", Infinity]
]);

export default class Piece {
  type: PieceType;
  color: Color;
  active: boolean;
  square: string;
  constructor(type: PieceType, color: Color, square: string, active: boolean) {
    this.type = type;
    this.color = color;
    this.square = square;
    this.active = active;
  }

  get image() {
    return pieceImages.get(this.type)?.get(this.color);
  }

  get numRank() {
    return 7 - (+this.square[1] - 1);
  }

  get numFile() {
    return this.square.charCodeAt(0) - 97;
  }
}
