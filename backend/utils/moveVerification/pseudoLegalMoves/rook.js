const { fileA, fileH, rank1, rank8 } = require("../bitboardMasks");

module.exports = function generatePseudoLegalRookMoves(position, square, turn) {
  const res = [];

  const enemyPieces =
    turn === "white" ? position.blackPieces : position.whitePieces;
  const friendlyPieces =
    turn === "white" ? position.whitePieces : position.blackPieces;

  const squareBitboard = 1n << square;

  // Move up
  let temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank8;
    if (temp === 0n) break;
    temp <<= 8n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(i * 8n + square);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(i * 8n + square);
    }
  }

  // Move down
  temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~rank1;
    if (temp === 0n) break;
    temp >>= 8n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(square - i * 8n);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(square - i * 8n);
    }
  }

  // Move right
  temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~fileH;
    if (temp === 0n) break;
    temp <<= 1n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(square + i);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(square + i);
    }
  }

  // Move left
  temp = squareBitboard;
  for (let i = 1n; i < 8n; i++) {
    temp &= ~fileA;
    if (temp === 0n) break;
    temp >>= 1n;
    if ((temp & enemyPieces) !== 0n) {
      res.push(square - i);
      break;
    } else if ((temp & friendlyPieces) !== 0n) {
      break;
    } else {
      res.push(square - i);
    }
  }

  return res;
};
