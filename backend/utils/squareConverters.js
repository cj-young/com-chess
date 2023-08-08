module.exports.numRank = (square) => {
  return 7 - (+square[1] - 1);
};

module.exports.numFile = (square) => {
  return square.charCodeAt(0) - 97;
};

module.exports.letterRank = (rank) => {
  return 8 - rank;
};

module.exports.letterFile = (file) => {
  return "abcdefgh"[file];
};

module.exports.numSquare = (square) => {
  return [module.exports.numRank(square), module.exports.numFile(square)];
};

module.exports.letterSquare = (rank, file) => {
  return letterFile(file) + letterRank(rank);
};
