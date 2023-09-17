const User = require("../models/User");

const getProfile = async (req, res, next) => {
  try {
    const requester = req.user;
    const user = await User.findOne({ username: req.params.username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isSelf = requester.id === user.id;
    res.json({
      isSelf,
      joinedAt: user.createdAt,
      username: user.username,
      pastGames: user.pastGames,
      id: user.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile };
