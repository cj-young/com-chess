import { fileA, fileH, rank8 } from "../bitboardMasks";
import { Color, Position } from "../../../types";

export default function generatePawnAttackBitboard(
  position: Position,
  color: Color
) {
  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyPawns = friendlyPieces & position.pawns;

  let res = 0n;

  if (color === "white") {
    // Up and left
    res |= (friendlyPawns & ~rank8 & ~fileA) << 7n;
    // Up and right
    res |= (friendlyPawns & ~rank8 & ~fileH) << 9n;
  } else {
    // Down and left
    res |= (friendlyPawns & ~rank8 & ~fileA) >> 9n;
    // Down and right
    res |= (friendlyPawns & ~rank8 & ~fileH) >> 7n;
  }

  return res;
}
