const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const initializePassport = require("./config/passport");
const MongoStore = require("connect-mongo");

require("dotenv").config();

const app = express();

initializePassport(passport);

const originRegex = /^(http|https):\/\/localhost:4000($|\/.*$)/;
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || originRegex.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoStoreOptions = {
  mongoUrl: process.env.DB_URI,
  collectionName: "sessions"
};

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create(mongoStoreOptions),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/index"));

app.use((error, req, res, next) => {
  console.log(error);
  res.status(400).json({ message: error.message });
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(process.env.BACKEND_PORT, () => {
      console.log(`server running on port ${process.env.BACKEND_PORT}`);
    });
  })
  .catch((err) => console.error(err));
