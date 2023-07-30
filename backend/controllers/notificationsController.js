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
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const { user } = req;
    const notifications = [];

    const dbNotifications = user.notifications;
    const dbGameRequests = user.incomingGameRequests;

    let pN = 0;
    let pG = 0;

    while (pN < dbNotifications.length && pG < dbGameRequests.length) {
      if (
        dbNotifications[pN].getMilliseconds() <
        dbGameRequests[pG].getMilliseconds()
      ) {
        notifications.push(dbNotifications[pN]);
        pN++;
      } else {
        notifications.push({
          type: "gameRequest",
          ...dbGameRequests[pG]
        });
        pG++;
      }
    }

    if (pN >= dbNotifications.length) {
      for (let i = pG; i < dbGameRequests.length; i++) {
        notifications.push({
          type: "gameRequest",
          ...dbGameRequests[i]
        });
      }
    } else {
      for (let i = pN; i < dbNotifications.length; i++) {
        notifications.push(dbNotifications[i]);
      }
    }
    res.json({ notifications: notifications });
  } catch (error) {
    next(error);
  }
};

module.exports = { deleteNotification, getNotifications };
