const express = require("express");
const { PastLiveGame, PastBotGame } = require("../models/PastGame");
const User = require("../models/User");
const { mongoose } = require("mongoose");

const router = express.Router();

router.get("/list", async (req, res, next) => {
  try {
    const { user } = req;
    const [liveGames, botGames] = await Promise.all([
      PastLiveGame.find({
        $or: [{ blackPlayer: user.id }, { whitePlayer: user.id }],
      })
        .sort({ createdAt: -1 })
        .limit(10),
      PastBotGame.find({ user: user.id }).sort({ createdAt: -1 }).limit(10),
    ]);

    const combinedGames = [
      ...liveGames.map((game) => ({ ...game.toObject(), type: "live" })),
      ...botGames.map((game) => ({ ...game.toObject(), type: "bot" })),
    ]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    for (let i = 0; i < combinedGames.length; i++) {
      const game = combinedGames[i];
      let winStatus;
      if (game.type === "bot") {
        winStatus = game.winner
          ? game.winner === game.color
            ? "won"
            : "lost"
          : "drawn";
      } else {
        const isWhite = user.id === game.whitePlayer.toString();
        winStatus = game.winner
          ? (game.winner === "white" && isWhite) ||
            (game.winner === "black" && !isWhite)
            ? "won"
            : "lost"
          : "drawn";
      }

      combinedGames[i] = { ...game, winStatus };
    }

    return res.json({ games: combinedGames });
  } catch (error) {
    next(error);
  }
});

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
        difficulty: game.difficulty,
        type: "bot",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
