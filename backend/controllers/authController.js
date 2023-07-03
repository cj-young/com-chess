const bcrypt = require("bcrypt");
const User = require("../models/User");
const validator = require("validator");

const signupLocal = async (req, res, next) => {
  try {
    const { password, confirmPassword, email, username } = req.body;

    if (!validator.isEmail(email)) throw new Error("Invalid email address");
    if (!username || !email || !password || !confirmPassword)
      throw new Error("All fields must be completed");
    const usernameRegex = /^[A-Za-z0-9_]*$/;
    if (username.length < 3)
      throw new Error("Username must be at least 3 charcters long");
    if (username.length > 20)
      throw new Error("Username cannot be longer than 20 characters");
    if (!usernameRegex.test(username))
      throw new Error(
        "Username may only contain letters, numbers, and underscores"
      );
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    if (password.length < 6)
      throw new Error("Password must be at least 6 characters long");
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;
    if (!passwordRegex.test(password))
      throw new Error(
        "Password must contain a lowercase letter, an uppercase letter, a digit, and a special character"
      );

    const userWithEmail = await User.findOne({ email });
    const userWithUsername = await User.findOne({ username });

    if (userWithEmail && userWithUsername) {
      throw new Error("Email and username are already taken");
    } else if (userWithEmail) {
      throw new Error("Email is already taken");
    } else if (userWithUsername) {
      throw new Error("Username is already taken");
    }

    if (password !== confirmPassword)
      return res.json({ err: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      friends: [],
      pastGames: [],
      password: hashedPassword
    });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ id: user._id, username: user.username });
    });
  } catch (error) {
    return next(error);
  }
};

const updateUsername = async (req, res, next) => {
  const { id } = req.user;
  const { username } = req.body;

  try {
    const usernameRegex = /^[A-Za-z0-9_]*$/;
    if (username.length < 3)
      throw new Error("Username must be at least 3 charcters long");
    if (username.length > 20)
      throw new Error("Username cannot be longer than 20 characters");
    if (!usernameRegex.test(username))
      throw new Error(
        "Username may only contain letters, numbers, and underscores"
      );
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      if (existingUser.id === id) {
        return res.status(409).json({
          message: "You can't change your username to what it currently is"
        });
      } else {
        return res.status(409).json({ message: "Username is taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username: username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    return res.status(200).json({ id, username: updatedUser.username });
  } catch (error) {
    next(error);
  }
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  const error = new Error("Unauthorized");
  error.status = 401;
  next(error);
};

module.exports = { signupLocal, updateUsername, isAuthenticated };
