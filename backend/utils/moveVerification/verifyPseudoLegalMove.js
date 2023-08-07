const generateBishopAttackBitboard = require("./attackBitboards/bishop");
const generateKingAttackBitboard = require("./attackBitboards/king");
const generateKnightAttackBitboard = require("./attackBitboards/knight");
const generatePawnAttackBitboard = require("./attackBitboards/pawn");
const generateQueenAttackBitboard = require("./attackBitboards/queen");
const generateRookAttackBitboard = require("./attackBitboards/rook");

module.exports = function verifyPseudoLegalMove(position, turn, move, type) {
  const fromBitboard = 1n << move.from;
  const toBitboard = 1n << move.to;

  // Clear squares where move occurred on all but whitePieces and blackPieces, where the move is applied
  let newPosition = {
    whitePieces:
      turn === "white"
        ? (position.whitePieces & ~fromBitboard) | toBitboard
        : position.whitePieces & ~(fromBitboard | toBitboard),
    blackPieces:
      turn === "black"
        ? (position.blackPieces & ~fromBitboard) | toBitboard
        : position.blackPieces & ~(fromBitboard | toBitboard),
    pawns: position.pawns & ~(fromBitboard | toBitboard),
    knights: position.knights & ~(fromBitboard | toBitboard),
    bishops: position.bishops & ~(fromBitboard | toBitboard),
    rooks: position.rooks & ~(fromBitboard | toBitboard),
    queens: position.queens & ~(fromBitboard | toBitboard),
    kings: position.kings & ~(fromBitboard | toBitboard)
  };

  // Add moved piece
  switch (type) {
    case "pawn":
      newPosition = {
        ...newPosition,
        pawns: (position.pawns & ~fromBitboard) | toBitboard
      };
      break;
    case "knight":
      newPosition = {
        ...newPosition,
        knights: (position.knights & ~fromBitboard) | toBitboard
      };
      break;
    case "bishop":
      newPosition = {
        ...newPosition,
        bishops: (position.bishops & ~fromBitboard) | toBitboard
      };
      break;
    case "rook":
      newPosition = {
        ...newPosition,
        rooks: (position.rooks & ~fromBitboard) | toBitboard
      };
      break;
    case "queen":
      newPosition = {
        ...newPosition,
        queens: (position.queens & ~fromBitboard) | toBitboard
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
        ...newPosition,
        kings: (position.kings & ~fromBitboard) | toBitboard
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
};
