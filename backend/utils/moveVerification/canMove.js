const generateLegalMoves = require("./generateLegalMoves");

module.exports = (pieces, moves) => {
  for (let piece of pieces) {
    if (generateLegalMoves(pieces, piece, moves).length > 0) {
      return true;
    }
  }

  return false;
};
