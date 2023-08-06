import generateBishopAttackBitboard from "./attackBitboards/bishop";
import generateKingAttackBitboard from "./attackBitboards/king";
import generateKnightAttackBitboard from "./attackBitboards/knight";
import generatePawnAttackBitboard from "./attackBitboards/pawn";
import generateQueenAttackBitboard from "./attackBitboards/queen";
import generateRookAttackBitboard from "./attackBitboards/rook";

type Position = {
  whitePieces: bigint;
  blackPieces: bigint;
  pawns: bigint;
  knights: bigint;
  bishops: bigint;
  rooks: bigint;
  queens: bigint;
  kings: bigint;
};

export default function verifyPseudoLegalMove(
  position: Position,
  turn: "white" | "black",
  move: { from: bigint; to: bigint },
  type: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"
): boolean {
  const fromBitboard = 1n << move.from;
  const toBitboard = 1n << move.to;

  let newPosition: Position;
  switch (type) {
    case "pawn":
      newPosition = {
        ...position,
        pawns: (position.pawns & ~fromBitboard) | toBitboard,
        whitePieces:
          turn === "white"
            ? (position.whitePieces & ~fromBitboard) | toBitboard
            : position.whitePieces,
        blackPieces:
          turn === "black"
            ? (position.blackPieces & ~fromBitboard) | toBitboard
            : position.blackPieces
      };
      break;
    case "knight":
      newPosition = {
        ...position,
        knights: (position.knights & ~fromBitboard) | toBitboard,
        whitePieces:
          turn === "white"
            ? (position.whitePieces & ~fromBitboard) | toBitboard
            : position.whitePieces,
        blackPieces:
          turn === "black"
            ? (position.blackPieces & ~fromBitboard) | toBitboard
            : position.blackPieces
      };
      break;
    case "bishop":
      newPosition = {
        ...position,
        bishops: (position.bishops & ~fromBitboard) | toBitboard,
        whitePieces:
          turn === "white"
            ? (position.whitePieces & ~fromBitboard) | toBitboard
            : position.whitePieces,
        blackPieces:
          turn === "black"
            ? (position.blackPieces & ~fromBitboard) | toBitboard
            : position.blackPieces
      };
      break;
    case "rook":
      newPosition = {
        ...position,
        rooks: (position.rooks & ~fromBitboard) | toBitboard,
        whitePieces:
          turn === "white"
            ? (position.whitePieces & ~fromBitboard) | toBitboard
            : position.whitePieces,
        blackPieces:
          turn === "black"
            ? (position.blackPieces & ~fromBitboard) | toBitboard
            : position.blackPieces
      };
      break;
    case "queen":
      newPosition = {
        ...position,
        queens: (position.queens & ~fromBitboard) | toBitboard,
        whitePieces:
          turn === "white"
            ? (position.whitePieces & ~fromBitboard) | toBitboard
            : position.whitePieces,
        blackPieces:
          turn === "black"
            ? (position.blackPieces & ~fromBitboard) | toBitboard
            : position.blackPieces
      };
      break;
    case "king":
      if (move.from - move.to === 2n) {
        if (
          !verifyPseudoLegalMove(
            position,
            turn,
            { from: move.from, to: move.to + 1n },
            "king"
          )
        )
          return false;
        if (
          !verifyPseudoLegalMove(
            position,
            turn,
            { from: move.from, to: move.from },
            "king"
          )
        )
          return false;
      } else if (move.to - move.from === 2n) {
        if (
          !verifyPseudoLegalMove(
            position,
            turn,
            { from: move.from, to: move.to - 1n },
            "king"
          )
        )
          return false;
        if (
          !verifyPseudoLegalMove(
            position,
            turn,
            { from: move.from, to: move.from },
            "king"
          )
        )
          return false;
      }
      newPosition = {
        ...position,
        kings: (position.kings & ~fromBitboard) | toBitboard,
        whitePieces:
          turn === "white"
            ? (position.whitePieces & ~fromBitboard) | toBitboard
            : position.whitePieces,
        blackPieces:
          turn === "black"
            ? (position.blackPieces & ~fromBitboard) | toBitboard
            : position.blackPieces
      };
      break;
  }

  const opponentColor = turn === "white" ? "black" : "white";
  const pawnAttackBitboard = generatePawnAttackBitboard(
    newPosition,
    opponentColor
  );
  const knightAttackBitboard = generateKnightAttackBitboard(
    newPosition,
    opponentColor
  );
  const bishopAttackBitboard = generateBishopAttackBitboard(
    newPosition,
    opponentColor
  );
  const rookAttackBitboard = generateRookAttackBitboard(
    newPosition,
    opponentColor
  );
  const queenAttackBitboard = generateQueenAttackBitboard(
    newPosition,
    opponentColor
  );
  const kingAttackBitboard = generateKingAttackBitboard(
    newPosition,
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
    turn === "white" ? newPosition.whitePieces : newPosition.blackPieces;
  const friendlyKing = friendlyPieces & newPosition.kings;

  return (fullAttackBitboard & friendlyKing) === 0n;
}
