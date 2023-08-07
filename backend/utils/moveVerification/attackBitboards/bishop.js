const { fileA, fileH, rank1, rank8 } = require("../bitboardMasks");

module.exports = function generateBishopAttackBitboard(position, color) {
  const friendlyPieces =
    color === "white" ? position.whitePieces : position.blackPieces;
  const friendlyBishops = friendlyPieces & position.bishops;

  let res = 0n;

  // Up and right
  let temp = friendlyBishops;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8 & ~fileH;
    temp <<= 9n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Down and right
  temp = friendlyBishops;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1 & ~fileH;
    temp >>= 7n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Down and left
  temp = friendlyBishops;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1 & ~fileA;
    temp >>= 9n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  // Up and left
  temp = friendlyBishops;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8 & ~fileA;
    temp <<= 7n;
    if (temp === 0n) break;
    res |= temp;
    temp &= ~(position.whitePieces | position.blackPieces);
  }

  return res;
};
