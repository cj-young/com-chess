import { fileA, fileH, rank1, rank8 } from "../bitboardMasks";
import { Position } from "../../../types";

export default function generateQueenAttackBitboard(
  position: Position,
  color: "white" | "black"
): bigint {
  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyQueens = friendlyPieces & position.queens;

  let res = 0n;
  // Up
  let temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8;
    temp <<= 8n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Right
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~fileH;
    temp <<= 1n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Down
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1;
    temp >>= 8n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Left
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~fileA;
    temp >>= 1n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Up and right
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8 & ~fileH;
    temp <<= 9n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Down and right
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1 & ~fileH;
    temp >>= 7n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Down and left
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1 & ~fileA;
    temp >>= 9n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Up and left
  temp = friendlyQueens;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8 & ~fileA;
    temp <<= 7n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  return res;
}
