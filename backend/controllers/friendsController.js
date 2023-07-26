const User = require("../models/User");

const getFriends = async (req, res, next) => {
  const { friends } = req.user;
  const usernames = [];
  const safetySet = new Set();

  for (let friendId of friends) {
    const user = await User.findById(friendId);
    const username = user ? user.username : null;
    if (username && !safetySet.has(username)) {
      usernames.push(username);
      safetySet.add(username);
    }
  }

  res.json({ friends: usernames });
};

module.exports = { getFriends };
