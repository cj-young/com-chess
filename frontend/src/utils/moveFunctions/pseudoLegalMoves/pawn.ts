import { fileA, fileH, rank2, rank7 } from "../bitboardMasks";
import { Position } from "../../../types";

export default function generatePseudoLegalPawnMoves(
  position: Position,
  square: bigint,
  turn: "white" | "black",
  enPassantSquare: null | bigint
): bigint[] {
  const squareBitboard = 1n << square;
  const enPassantBitboard = enPassantSquare ? 1n << enPassantSquare : 0n;
  const allPieces = position.blackPieces | position.whitePieces;

  const res = [];
  if (turn === "white") {
    // Can move forward
    if (((squareBitboard << 8n) & ~allPieces) !== 0n) {
      res.push(square + 8n);

      // Can move forward twice
      if ((((squareBitboard & rank2) << 16n) & ~allPieces) !== 0n) {
        res.push(square + 16n);
      }
    }

    // Can take left
    if (
      (((squareBitboard & ~fileA) << 7n) &
        (position.blackPieces | enPassantBitboard)) !==
      0n
    )
      res.push(square + 7n);

    // Can take right
    if (
      (((squareBitboard & ~fileH) << 9n) &
        (position.blackPieces | enPassantBitboard)) !==
      0n
    )
      res.push(square + 9n);
  } else {
    // Can move forward
    if (((squareBitboard >> 8n) & ~allPieces) !== 0n) {
      res.push(square - 8n);

      // Can move forward twice
      if ((((squareBitboard & rank7) >> 16n) & ~allPieces) !== 0n) {
        res.push(square - 16n);
      }
    }

    // Can take left
    if (
      (((squareBitboard & ~fileH) >> 7n) &
        (position.whitePieces | enPassantBitboard)) !==
      0n
    )
      res.push(square - 7n);

    // Can take right
    if (
      (((squareBitboard & ~fileA) >> 9n) &
        (position.whitePieces | enPassantBitboard)) !==
      0n
    )
      res.push(square - 9n);
  }

  return res;
}
