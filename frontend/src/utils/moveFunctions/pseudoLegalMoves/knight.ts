import {
  fileA,
  fileB,
  fileG,
  fileH,
  rank1,
  rank2,
  rank7,
  rank8,
} from "../bitboardMasks";
import { Position } from "../../../types";

export default function generatePseudoLegalKnightMoves(
  position: Position,
  square: bigint,
  turn: "white" | "black"
): bigint[] {
  const res: bigint[] = [];

  const enemyPieces =
    turn === "white" ? position.blackPieces : position.whitePieces;
  const friendlyPieces =
    turn === "white" ? position.whitePieces : position.blackPieces;

  const squareBitboard = 1n << square;

  // Up 2 right 1
  let temp = squareBitboard;
  temp &= ~rank8 & ~rank7 & ~fileH;
  if (temp !== 0n) {
    temp <<= 17n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 17n);
    }
  }

  // Up 1 right 2
  temp = squareBitboard;
  temp &= ~rank8 & ~fileG & ~fileH;
  if (temp !== 0n) {
    temp <<= 10n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 10n);
    }
  }

  // Down 1 right 2
  temp = squareBitboard;
  temp &= ~rank1 & ~fileG & ~fileH;
  if (temp !== 0n) {
    temp >>= 6n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 6n);
    }
  }

  // Down 2 right 1
  temp = squareBitboard;
  temp &= ~rank1 & ~rank2 & ~fileH;
  if (temp !== 0n) {
    temp >>= 15n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 15n);
    }
  }

  // Down 2 left 1
  temp = squareBitboard;
  temp &= ~rank1 & ~rank2 & ~fileA;
  if (temp !== 0n) {
    temp >>= 17n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 17n);
    }
  }

  // Down 1 left 2
  temp = squareBitboard;
  temp &= ~rank1 & ~fileB & ~fileA;
  if (temp !== 0n) {
    temp >>= 10n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square - 10n);
    }
  }

  // Up 1 left 2
  temp = squareBitboard;
  temp &= ~rank8 & ~fileB & ~fileA;
  if (temp !== 0n) {
    temp <<= 6n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 6n);
    }
  }

  // Up 2 left 1
  temp = squareBitboard;
  temp &= ~rank8 & ~rank7 & ~fileA;
  if (temp !== 0n) {
    temp <<= 15n;
    if ((temp & friendlyPieces) === 0n) {
      res.push(square + 15n);
    }
  }

  return res;
}
