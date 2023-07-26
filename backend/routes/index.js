const express = require("express");
const authRoutes = require("./authRoutes");
const {
  deleteNotification
} = require("../controllers/notificationsController");
const { isAuthenticated } = require("../controllers/authController");
const { getFriends } = require("../controllers/friendsController");

const router = express.Router();

router.use("/auth", authRoutes);
router.delete("/notifications", isAuthenticated, deleteNotification);
router.get("/friends", isAuthenticated, getFriends);

module.exports = router;
