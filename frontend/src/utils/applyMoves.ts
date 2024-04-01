import { Move } from "../types";
import Piece from "./Piece";
import { numFile, numRank } from "./squareConverters";

export default function applyMoves(
  pieces: Piece[],
  moves: Move[]
): { pieces: Piece[]; error: string | null } {
  const board: (null | Piece)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );
  for (let piece of pieces) {
    if (!piece.active) continue;
    board[piece.numRank][piece.numFile] = piece;
  }

  let enPassantSquare: string | null = null;

  for (let move of moves) {
    let enPassantWasSet = false;
    const fromRow = numRank(move.from);
    const fromCol = numFile(move.from);
    const toRow = numRank(move.to);
    const toCol = numFile(move.to);

    const piece = board[fromRow][fromCol];
    board[fromRow][fromCol] = null;

    if (!piece) {
      return { pieces, error: "No piece there" };
    }

    if (piece.type === "pawn") {
      if (move.from[1] === "2" && move.to[1] === "4") {
        enPassantSquare = move.from[0] + "3";
        enPassantWasSet = true;
      } else if (move.from[1] === "7" && move.to[1] === "5") {
        enPassantSquare = move.from[0] + "6";
        enPassantWasSet = true;
      }

      if (move.to === enPassantSquare) {
        const capturedPiece = board[fromRow][numFile(enPassantSquare)];
        if (capturedPiece) capturedPiece.active = false;
        board[fromRow][numFile(enPassantSquare)] = null;
      }

      if (move.to[1] === "1" || move.to[1] === "8") {
        if (!move.promoteTo) {
          return { pieces, error: "No piece there" };
        }

        piece.type = move.promoteTo;
      }
    }

    const capturedPiece = board[toRow][toCol];
    if (capturedPiece) {
      capturedPiece.active = false;
    }

    // Castling
    if (piece.type === "king") {
      if (
        move.from[0] === "e" &&
        (move.to[0] === "g" || move.to[0] === "c") &&
        move.from[1] === move.to[1]
      ) {
        const [rookFromFile, rookToFile] =
          move.to[0] === "c" ? ["a", "d"] : ["h", "f"];
        const rook =
          board[numRank(`${rookFromFile}${move.from[1]}`)][
            numFile(`${rookFromFile}${move.from[1]}`)
          ];
        if (rook?.type === "rook") {
          board[numRank(`${rookFromFile}${move.from[1]}`)][
            numFile(`${rookFromFile}${move.from[1]}`)
          ] = null;
          const newPos = `${rookToFile}${move.from[1]}`;
          const [newRow, newCol] = [numRank(newPos), numFile(newPos)];
          const existingPiece = board[newRow][newCol];
          if (existingPiece) {
            existingPiece.active = false;
          }
          board[newRow][newCol] = rook;
          rook.square = newPos;
        }
      }
    }

    board[toRow][toCol] = piece;
    piece.square = move.to;

    if (!enPassantWasSet) enPassantSquare = null;
  }

  return { pieces, error: null };
}
