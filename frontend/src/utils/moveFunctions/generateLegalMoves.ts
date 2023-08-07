import Piece from "../Piece";
import verifyPseudoLegalMove from "./verifyPseudoLegalMove";
import generatePseudoLegalBishopMoves from "./pseudoLegalMoves/bishop";
import generatePseudoLegalKingMoves from "./pseudoLegalMoves/king";
import generatePseudoLegalKnightMoves from "./pseudoLegalMoves/knight";
import generatePseudoLegalPawnMoves from "./pseudoLegalMoves/pawn";
import generatePseudoLegalQueenMoves from "./pseudoLegalMoves/queen";
import generatePseudoLegalRookMoves from "./pseudoLegalMoves/rook";
import squareToIndex from "./squareToIndex";
import indexToSquare from "./indexToSquare";

type Move = {
  from: string;
  to: string;
  promoteTo?: "queen" | "rook" | "bishop" | "knight";
};

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

export default function generateLegalMoves(
  pieces: Piece[],
  piece: Piece,
  moves: Move[]
) {
  const turn = moves.length % 2 === 0 ? "white" : "black";
  if (!piece.active) return [];

  if (piece.color !== turn) return [];

  const position: Position = {
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

  const canCastle = {
    kingSide: true,
    queenSide: true
  };

  const aRook = `a${turn === "white" ? 1 : 8}`;
  const hRook = `h${turn === "white" ? 1 : 8}`;
  const kingPos = `e${turn === "white" ? 1 : 8}`;

  for (let move of moves) {
    if (move.from === kingPos || move.to === kingPos) {
      canCastle.kingSide = false;
      canCastle.queenSide = false;
    } else if (move.from === aRook || move.to === aRook) {
      canCastle.queenSide = false;
    } else if (move.from === hRook || move.to === hRook) {
      canCastle.kingSide = false;
    }
  }

  const squareIdx = squareToIndex(piece.square);

  // Get en passant square if exists
  let enPassantSquare: null | bigint = null;
  const lastMove = moves[moves.length - 1];
  if (lastMove?.from[1] === "2" && lastMove?.to[1] === "4") {
    for (let piece of pieces) {
      if (piece.type === "pawn" && piece.square === lastMove.to) {
        enPassantSquare = squareToIndex(lastMove.from[0] + "3");
        break;
      }
    }
  } else if (lastMove?.from[1] === "7" && lastMove?.to[1] === "5") {
    for (let piece of pieces) {
      if (piece.type === "pawn" && piece.square === lastMove.to) {
        enPassantSquare = squareToIndex(lastMove.from[0] + "6");
        break;
      }
    }
  }

  // Get pseudo-legal moves
  let newSquares: {
    to: bigint;
    type: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
  }[];
  switch (piece.type) {
    case "pawn":
      newSquares = generatePseudoLegalPawnMoves(
        position,
        squareIdx,
        turn,
        enPassantSquare
      ).map((square) => ({ to: square, type: "pawn" }));
      break;
    case "knight":
      newSquares = generatePseudoLegalKnightMoves(
        position,
        squareIdx,
        turn
      ).map((square) => ({ to: square, type: "knight" }));
      break;
    case "bishop":
      newSquares = generatePseudoLegalBishopMoves(
        position,
        squareIdx,
        turn
      ).map((square) => ({ to: square, type: "bishop" }));
      break;
    case "rook":
      newSquares = generatePseudoLegalRookMoves(position, squareIdx, turn).map(
        (square) => ({ to: square, type: "rook" })
      );
      break;
    case "queen":
      newSquares = generatePseudoLegalQueenMoves(position, squareIdx, turn).map(
        (square) => ({ to: square, type: "queen" })
      );
      break;
    case "king":
      newSquares = generatePseudoLegalKingMoves(
        position,
        squareIdx,
        turn,
        canCastle
      ).map((square) => ({ to: square, type: "king" }));
      break;
    default:
      throw new Error("Piece does not have a type");
  }

  return newSquares
    .filter((newSquare) =>
      verifyPseudoLegalMove(
        position,
        turn,
        { from: squareIdx, to: newSquare.to },
        newSquare.type
      )
    )
    .map((newSquare) => indexToSquare(newSquare.to));
}
