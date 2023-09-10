const express = require("express");
const authRoutes = require("./authRoutes");
const {
  deleteNotification,
  getNotifications,
} = require("../controllers/notificationsController");
const { isAuthenticated } = require("../controllers/authController");
const { getFriends } = require("../controllers/friendsController");
const { postBotGameEnd } = require("../controllers/botGameController");

const router = express.Router();

router.use("/auth", authRoutes);
router.delete("/notifications", isAuthenticated, deleteNotification);
router.get("/notifications", isAuthenticated, getNotifications);
router.get("/friends", isAuthenticated, getFriends);
router.post("/botGameEnd", isAuthenticated, postBotGameEnd);

module.exports = router;
