const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  type: {
    type: String,
    required: true
  },
  from: {
    type: String
  }
});

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String,
      unique: true,
      allowNull: true,
      sparse: true
    },
    password: {
      type: String
    },
    googleId: {
      type: String,
      unique: true
    },
    gitHubId: {
      type: String,
      unique: true
    },
    friends: {
      type: [Schema.Types.ObjectId],
      required: true
    },
    pastGames: {
      type: [Schema.Types.ObjectId],
      required: true
    },
    currentGame: {
      type: Schema.Types.ObjectId
    },
    notifications: {
      type: [NotificationSchema]
    }
  },
  { timestamps: true }
);

UserSchema.methods.validatePassword = async function (inputPassword) {
  if (!this.password) throw new Error("User is not associated with a password");
  const isValid = await bcrypt.compare(inputPassword, this.password);
  return isValid;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
