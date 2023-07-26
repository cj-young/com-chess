const User = require("../models/User");

const deleteNotification = async (req, res, next) => {
  try {
    const { user } = req;

    // Shifting the notifications array and saving the user can lead to race conditions, so findByIdAndUpdate must be used instead
    await User.findByIdAndUpdate(
      user.id,
      { $pop: { notifications: -1 } },
      { new: true }
    );

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.log("error :(");
    next(error);
  }
};

module.exports = { deleteNotification };
