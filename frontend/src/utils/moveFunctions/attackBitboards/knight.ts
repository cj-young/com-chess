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

export default function generateKnightAttackBitboard(
  position: Position,
  color: "white" | "black"
): bigint {
  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyKnights = friendlyPieces & position.knights;

  let res = 0n;
  // Up 2 right 1
  let temp = friendlyKnights;
  temp &= ~rank8 & ~rank7 & ~fileH;
  if (temp !== 0n) {
    temp <<= 17n;
    res |= temp;
  }

  // Up 1 right 2
  temp = friendlyKnights;
  temp &= ~rank8 & ~fileG & ~fileH;
  if (temp !== 0n) {
    temp <<= 10n;
    res |= temp;
  }

  // Down 1 right 2
  temp = friendlyKnights;
  temp &= ~rank1 & ~fileG & ~fileH;
  if (temp !== 0n) {
    temp >>= 6n;
    res |= temp;
  }

  // Down 2 right 1
  temp = friendlyKnights;
  temp &= ~rank1 & ~rank2 & ~fileH;
  if (temp !== 0n) {
    temp >>= 15n;
    res |= temp;
  }

  // Down 2 left 1
  temp = friendlyKnights;
  temp &= ~rank1 & ~rank2 & ~fileA;
  if (temp !== 0n) {
    temp >>= 17n;
    res |= temp;
  }

  // Down 1 left 2
  temp = friendlyKnights;
  temp &= ~rank1 & ~fileB & ~fileA;
  if (temp !== 0n) {
    temp >>= 10n;
    res |= temp;
  }

  // Up 1 left 2
  temp = friendlyKnights;
  temp &= ~rank8 & ~fileB & ~fileA;
  if (temp !== 0n) {
    temp <<= 6n;
    res |= temp;
  }

  // Up 2 left 1
  temp = friendlyKnights;
  temp &= ~rank8 & ~rank7 & ~fileA;
  if (temp !== 0n) {
    temp <<= 15n;
    res |= temp;
  }

  return res;
}
