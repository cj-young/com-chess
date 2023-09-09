const PastGame = require("../models/PastGame");

const postBotGameEnd = async (req, res, next) => {
  try {
    const { user } = req;
    const { moves, color, result, difficulty } = req.body;

    let winningColor;
    if (result === "draw") {
      winningColor = null;
    } else if (result === "win") {
      winningColor = color;
    } else {
      winningColor = color === "white" ? "black" : "white";
    }

    const pastGame = await PastGame.create({
      moves: moves,
      blackPlayer: color === "black" ? user.id : difficulty,
      whitePlayer: color === "white" ? user.id : difficulty,
      winner: winningColor,
      gameType: "bot",
    });

    res.json({ gameId: pastGame.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { postBotGameEnd };
