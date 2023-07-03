const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

module.exports = (passport) => {
  const locallyAuthenticate = async (identifier, password, done) => {
    try {
      const user = await User.findOne().or([
        { email: identifier },
        { username: identifier }
      ]);
      if (!user) {
        return done(null, false, { message: "Invalid login credentials" });
      }

      if (user.password && (await bcrypt.compare(password, user.password))) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid login credentials" });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "identifier" }, locallyAuthenticate)
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0]?.value;
          if (!email) done(new Error("Login failed"));
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            if (existingUser.googleId) return done(null, existingUser);
            else
              return done(null, false, { message: "Email is already in use" });
          } else {
            const user = await User.create({
              email: email,
              username: null,
              googleId: profile.id,
              friends: [],
              pastGames: []
            });
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => done(err));
  });
};
