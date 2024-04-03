module.exports = function squareToIndex(square) {
  const rank = +square[1] - 1;
  const file = square.charCodeAt(0) - 97;

  return BigInt(rank * 8 + file);
};
