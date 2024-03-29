const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const initializePassport = require("./config/passport");
const MongoStore = require("connect-mongo");
const { createServer } = require("http");

require("dotenv").config();

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  })
);

initializePassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoStoreOptions = {
  mongoUrl: process.env.DB_URI,
  collectionName: "sessions"
};

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create(mongoStoreOptions),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: true,
    sameSite: "none"
  }
});
app.use(sessionMiddleware);

app.use((req, res, next) => {
  console.log("cookies: ", req.headers.cookie);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Set up websocket
require("./socket")(httpServer, sessionMiddleware, passport);

app.use("/", require("./routes/index"));

app.use((error, req, res, next) => {
  console.log(error.message);
  res.status(400).json({ message: error.message });
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    httpServer.listen(process.env.BACKEND_PORT, () => {
      console.log(`server running on port ${process.env.BACKEND_PORT}`);
    });
  })
  .catch((err) => console.error(err));
