const Piece = require("./Piece");

const files = "abcdefgh";

module.exports = function generateStartingPosition() {
  const res = [];
  const colors = ["white", "black"];

  for (let color of colors) {
    const rank = color === "white" ? 1 : 8;

    // Pawns
    for (let i = 0; i < 8; i++) {
      res.push(
        new Piece(
          "pawn",
          color,
          `${files[i]}${color === "white" ? 2 : 7}`,
          true
        )
      );
    }

    // Knights
    res.push(new Piece("knight", color, `b${rank}`, true));
    res.push(new Piece("knight", color, `g${rank}`, true));

    // Bishops
    res.push(new Piece("bishop", color, `c${rank}`, true));
    res.push(new Piece("bishop", color, `f${rank}`, true));

    // Rooks
    res.push(new Piece("rook", color, `a${rank}`, true));
    res.push(new Piece("rook", color, `h${rank}`, true));

    // Queen
    res.push(new Piece("queen", color, `d${rank}`, true));

    // King
    res.push(new Piece("king", color, `e${rank}`, true));
  }

  return res;
};
