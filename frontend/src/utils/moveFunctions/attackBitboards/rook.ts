import { fileA, fileH, rank1, rank8 } from "../bitboardMasks";
import { Color, Position } from "../../../types";

export default function generateRookAttackBitboard(
  position: Position,
  color: Color
): bigint {
  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyRooks = friendlyPieces & position.rooks;

  let res = 0n;
  // Up
  let temp = friendlyRooks;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8;
    temp <<= 8n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Right
  temp = friendlyRooks;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~fileH;
    temp <<= 1n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Down
  temp = friendlyRooks;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1;
    temp >>= 8n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Left
  temp = friendlyRooks;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~fileA;
    temp >>= 1n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  return res;
}
