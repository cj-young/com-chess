const { fileA, fileH, rank1, rank8 } = require("../bitboardMasks");

module.exports = function generatePseudoLegalBishopMoves(
  position,
  square,
  turn
) {
  const res = [];

  const enemyPieces =
    turn === "white" ? position.blackPieces : position.whitePieces;
  const friendlyPieces =
    turn === "white" ? position.whitePieces : position.blackPieces;

  const squareBitboard = 1n << square;

  // Move up and right
  let temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8 & ~fileH;
    if (temp === 0n) break;
    temp <<= 9n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(i * 9n + square);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(i * 9n + square);
    }
  }

  // Move up and left
  temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8 & ~fileA;
    if (temp === 0n) break;
    temp <<= 7n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(i * 7n + square);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(i * 7n + square);
    }
  }

  // Down and right
  temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1 & ~fileH;
    if (temp === 0n) break;
    temp >>= 7n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(square - i * 7n);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(square - i * 7n);
    }
  }

  // Down and left
  temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1 & ~fileA;
    if (temp === 0n) break;
    temp >>= 9n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(square - i * 9n);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(square - i * 9n);
    }
  }

  return res;
};
