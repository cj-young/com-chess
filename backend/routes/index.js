const express = require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.get("/name", (req, res, next) => {
  res.json({ username: req.user.username });
});

module.exports = router;
