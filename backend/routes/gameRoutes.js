const express = require("express");
const { PastLiveGame } = require("../models/PastGame");
const User = require("../models/User");
const { isAuthenticated } = require("../controllers/authController");
const { mongoose } = require("mongoose");

const router = express.Router();

router.get("/:gameId", async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      res.status(404).json({ message: "Game not found" });
    }
    const game = await PastLiveGame.findById(gameId);
    if (!game) {
      res.status(404).json({ message: "Game not found" });
    }
    const [black, white] = await Promise.all([
      User.findById(game.blackPlayer),
      User.findById(game.whitePlayer),
    ]);
    res.json({
      whitePlayer: white.username,
      blackPlayer: black.username,
      minutes: game.minutes,
      increment: game.increment,
      winner: game.winner,
      moves: game.moves,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
