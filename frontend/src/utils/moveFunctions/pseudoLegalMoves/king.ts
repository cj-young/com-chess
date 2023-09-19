import { fileA, fileH, rank1, rank8 } from "../bitboardMasks";
import { Position } from "../../../types";

export default function generatePseudoLegalKingMoves(
  position: Position,
  square: bigint,
  turn: "white" | "black",
  canCastle: {
    kingSide: boolean;
    queenSide: boolean;
  }
): bigint[] {
  const res: bigint[] = [];

  const enemyPieces =
    turn === "white" ? position.blackPieces : position.whitePieces;
  const friendlyPieces =
    turn === "white" ? position.whitePieces : position.blackPieces;
  const squareBitboard = 1n << square;

  // Move up
  let temp = squareBitboard;
  temp &= ~rank8;
  if (temp !== 0n) {
    temp <<= 8n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 8n);
    }
  }

  // Move up and right
  temp = squareBitboard;
  temp &= ~rank8 & ~fileH;
  if (temp !== 0n) {
    temp <<= 9n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 9n);
    }
  }

  // Move right
  temp = squareBitboard;
  temp &= ~fileH;
  if (temp !== 0n) {
    temp <<= 1n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 1n);

      temp <<= 1n;
      if (
        (temp & (friendlyPieces | enemyPieces)) === 0n &&
        ((temp << 1n) & position.rooks & friendlyPieces) !== 0n &&
        canCastle.kingSide
      ) {
        res.push(square + 2n);
      }
    }
  }

  // Move down and right
  temp = squareBitboard;
  temp &= ~rank1 & ~fileH;
  if (temp !== 0n) {
    temp >>= 7n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 7n);
    }
  }

  // Move down
  temp = squareBitboard;
  temp &= ~rank1;
  if (temp !== 0n) {
    temp >>= 8n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 8n);
    }
  }

  // Move down and left
  temp = squareBitboard;
  temp &= ~rank1 & ~fileA;
  if (temp !== 0n) {
    temp >>= 9n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 9n);
    }
  }

  // Move left
  temp = squareBitboard;
  temp &= ~fileA;
  if (temp !== 0n) {
    temp >>= 1n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 1n);

      temp >>= 1n;
      if (
        (temp & (friendlyPieces | enemyPieces)) === 0n &&
        ((temp >> 2n) & position.rooks & friendlyPieces) !== 0n &&
        canCastle.queenSide
      ) {
        res.push(square - 2n);
      }
    }
  }

  // Move up and left
  temp = squareBitboard;
  temp &= ~rank8 & ~fileA;
  if (temp !== 0n) {
    temp <<= 7n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 7n);
    }
  }

  return res;
}
