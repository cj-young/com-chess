module.exports = class Piece {
  constructor(type, color, square, active) {
    this.type = type;
    this.color = color;
    this.square = square;
    this.active = active;
  }

  get numRank() {
    return 7 - (+this.square[1] - 1);
  }

  get numFile() {
    return this.square.charCodeAt(0) - 97;
  }
};
