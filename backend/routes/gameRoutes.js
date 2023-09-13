const express = require("express");
const { PastLiveGame, PastBotGame } = require("../models/PastGame");
const User = require("../models/User");
const { isAuthenticated } = require("../controllers/authController");
const { mongoose } = require("mongoose");

const router = express.Router();

router.get("/:gameId", async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    if (!mongoose.Types.ObjectId.isValid(gameId.slice(1))) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (gameId[0] === "0") {
      const game = await PastLiveGame.findById(gameId.slice(1));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      const [black, white] = await Promise.all([
        User.findById(game.blackPlayer),
        User.findById(game.whitePlayer),
      ]);
      return res.json({
        whitePlayer: white.username,
        blackPlayer: black.username,
        minutes: game.minutes,
        increment: game.increment,
        winner: game.winner,
        moves: game.moves,
        type: "live",
      });
    } else if (gameId[0] === "1") {
      const game = await PastBotGame.findById(gameId.slice(1));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      return res.json({
        user: game.user,
        moves: game.moves,
        color: game.color,
        winner: game.winner,
        type: "bot",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
