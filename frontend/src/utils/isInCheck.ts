import { Color } from "../types";
import Piece from "./Piece";
import generateBishopAttackBitboard from "./move-functions/attack-bitboards/bishop";
import generateKingAttackBitboard from "./move-functions/attack-bitboards/king";
import generateKnightAttackBitboard from "./move-functions/attack-bitboards/knight";
import generatePawnAttackBitboard from "./move-functions/attack-bitboards/pawn";
import generateQueenAttackBitboard from "./move-functions/attack-bitboards/queen";
import generateRookAttackBitboard from "./move-functions/attack-bitboards/rook";
import squareToIndex from "./move-functions/squareToIndex";

export default function isInCheck(pieces: Piece[], color: Color) {
  const position = {
    whitePieces: 0n,
    blackPieces: 0n,
    pawns: 0n,
    knights: 0n,
    bishops: 0n,
    rooks: 0n,
    queens: 0n,
    kings: 0n
  };

  // Add pieces to bitboards
  for (let i = 0; i < pieces.length; i++) {
    if (!pieces[i].active) continue;
    const square = squareToIndex(pieces[i].square);
    const pieceBitboard = 1n << square;
    switch (pieces[i].type) {
      case "pawn":
        position.pawns |= pieceBitboard;
        break;
      case "knight":
        position.knights |= pieceBitboard;
        break;
      case "bishop":
        position.bishops |= pieceBitboard;
        break;
      case "rook":
        position.rooks |= pieceBitboard;
        break;
      case "queen":
        position.queens |= pieceBitboard;
        break;
      case "king":
        position.kings |= pieceBitboard;
        break;
    }
    switch (pieces[i].color) {
      case "white":
        position.whitePieces |= pieceBitboard;
        break;
      case "black":
        position.blackPieces |= pieceBitboard;
        break;
    }
  }

  const opponentColor = color === "white" ? "black" : "white";

  const pawnAttackBitboard = generatePawnAttackBitboard(
    position,
    opponentColor
  );
  const knightAttackBitboard = generateKnightAttackBitboard(
    position,
    opponentColor
  );
  const bishopAttackBitboard = generateBishopAttackBitboard(
    position,
    opponentColor
  );
  const rookAttackBitboard = generateRookAttackBitboard(
    position,
    opponentColor
  );
  const queenAttackBitboard = generateQueenAttackBitboard(
    position,
    opponentColor
  );
  const kingAttackBitboard = generateKingAttackBitboard(
    position,
    opponentColor
  );

  const fullAttackBitboard =
    pawnAttackBitboard |
    knightAttackBitboard |
    bishopAttackBitboard |
    rookAttackBitboard |
    queenAttackBitboard |
    kingAttackBitboard;

  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyKing = friendlyPieces & position.kings;

  return (fullAttackBitboard & friendlyKing) !== 0n;
}
