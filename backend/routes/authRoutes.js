const express = require("express");
const passport = require("passport");
const {
  signupLocal,
  isAuthenticated,
  updateUsername
} = require("../controllers/authController");

const router = express.Router();

router.get("/user", isAuthenticated, (req, res) => {
  res.status(200).json({ id: req.user.id, username: req.user.username });
});

router.post("/local/signup", signupLocal);

router.post("/local/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info.message });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});

router.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback", (req, res, next) => {
  console.log("Google callback");
  passport.authenticate("google", {
    // successRedirect: process.env.CLIENT_URL,
    successRedirect: `${process.env.CLIENT_URL}/login/redirect`,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=true`
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  if (!req.isAuthenticated())
    res.status(200).json({ message: "Logout successful" });
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logout successful" });
  });
});

router.put("/username", isAuthenticated, updateUsername);

module.exports = router;
