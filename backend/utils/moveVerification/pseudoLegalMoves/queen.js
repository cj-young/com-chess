const generatePseudoLegalBishopMoves = require("./bishop");
const generatePseudoLegalRookMoves = require("./rook");

module.exports = function generatePseudoLegalQueenMoves(
  position,
  square,
  turn
) {
  const bishopMoves = generatePseudoLegalBishopMoves(position, square, turn);
  const rookMoves = generatePseudoLegalRookMoves(position, square, turn);

  const combinedMoves = new Set() < bigint > [...bishopMoves, ...rookMoves];

  return [...combinedMoves];
};
