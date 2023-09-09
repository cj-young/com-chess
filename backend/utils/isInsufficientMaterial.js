const applyMoves = require("./applyMoves");
const generateStartingPosition = require("./generateStartingPosition");

module.exports = (moves, color) => {
  const pieces = applyMoves(generateStartingPosition(), moves);

  const cache = new Map([
    ["pawn", 0],
    ["knight", 0],
    ["bishop", 0],
    ["rook", 0],
    ["queen", 0],
    ["king", 0],
  ]);

  const firstPieceIndex = color === "white" ? 0 : 16;
  for (let i = firstPieceIndex; i < firstPieceIndex + 16; i++) {
    if (pieces[i].active) {
      cache.set(pieces[i].type, cache.get(pieces[i].type) + 1);
    }
  }

  // A king and a rook, queen, or pawn is sufficient
  if (
    cache.get("rook") > 0 ||
    cache.get("queen") > 0 ||
    cache.get("pawn") > 0
  ) {
    return false;
  }

  // A king and one bishop or one knight is insufficient
  if (cache.get("bishop") + cache.get("knight") <= 1) return true;

  // A king and two knights is insufficient vs lone king
  if (cache.get("knight") === 2 && cache.get("bishop") === 0) {
    const opponentFirstPieceIndex = color === "white" ? 0 : 16;

    for (
      let i = opponentFirstPieceIndex;
      i < opponentFirstPieceIndex + 16;
      i++
    ) {
      if (pieces[i].type !== "king" && pieces[i].active) return false;
    }

    return true;
  } else return false; // A king and two or more minor pieces, excluding two knights, is sufficient
};
