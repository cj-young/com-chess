import { fileA, fileH, rank1, rank8 } from "../bitboardMasks";

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

export default function generateKingAttackBitboard(
  position: Position,
  color: "white" | "black"
): bigint {
  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyKings = friendlyPieces & position.kings;

  let res = 0n;

  // Up
  res |= (friendlyKings & ~rank8) << 8n;

  // Right
  res |= (friendlyKings & ~fileH) << 1n;

  // Down
  res |= (friendlyKings & ~rank1) >> 8n;

  // Left
  res |= (friendlyKings & ~fileA) >> 1n;

  // Up and right
  res |= (friendlyKings & ~rank8 & ~fileH) << 9n;

  // Down and right
  res |= (friendlyKings & ~rank1 & ~fileH) >> 7n;

  // Down and left
  res |= (friendlyKings & ~rank1 & ~fileA) >> 9n;

  // Up and left
  res |= (friendlyKings & ~rank8 & ~fileA) << 7n;

  return res;
}
