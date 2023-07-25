const deleteNotification = async (req, res, next) => {
  const { user } = req;

  user.notifications.shift();

  await user.save();
};

module.exports = { deleteNotification };
