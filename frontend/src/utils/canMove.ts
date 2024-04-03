import Piece from "./Piece";
import generateLegalMoves from "./move-functions/generateLegalMoves";

export default function canMove(
  pieces: Piece[],
  moves: {
    from: string;
    to: string;
    promoteTo?: "knight" | "bishop" | "rook" | "queen";
  }[]
) {
  for (let piece of pieces) {
    if (generateLegalMoves(pieces, piece, moves).length > 0) {
      return true;
    }
  }

  return false;
}
