const express = require("express");
const authRoutes = require("./authRoutes");
const {
  deleteNotification
} = require("../controllers/notificationsController");
const { isAuthenticated } = require("../controllers/authController");

const router = express.Router();

router.use("/auth", authRoutes);
router.delete("/notifications", isAuthenticated, deleteNotification);

module.exports = router;
