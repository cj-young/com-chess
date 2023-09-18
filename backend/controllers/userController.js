const User = require("../models/User");
const { PastLiveGame, PastBotGame } = require("../models/PastGame");

const getProfile = async (req, res, next) => {
  try {
    const requester = req.user;
    const user = await User.findOne({ username: req.params.username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isSelf = requester.id === user.id;

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

      if (game.type === "live") {
        const [whitePlayer, blackPlayer] = await Promise.all([
          User.findById(game.whitePlayer),
          User.findById(game.blackPlayer),
        ]);
        const [whiteUsername, blackUsername] = [
          whitePlayer.username,
          blackPlayer.username,
        ];

        const color =
          game.whitePlayer.toString() === user.id ? "white" : "black";
        combinedGames[i] = {
          ...combinedGames[i],
          whiteUsername,
          blackUsername,
          color,
        };
      }

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

      combinedGames[i] = { ...combinedGames[i], winStatus };
    }

    res.json({
      isSelf,
      joinedAt: user.createdAt,
      username: user.username,
      pastGames: combinedGames,
      id: user.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile };
