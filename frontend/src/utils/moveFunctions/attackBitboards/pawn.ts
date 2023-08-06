import { fileA, fileH, rank8 } from "../bitboardMasks";

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

export default function generatePawnAttackBitboard(
  position: Position,
  color: "white" | "black"
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
