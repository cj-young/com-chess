const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true
    },
    from: {
      type: String
    }
  },
  { timestamps: true }
);

const IncomingGameRequestSchema = new Schema(
  {
    from: {
      type: String,
      requred: true
    },
    minutes: {
      type: Number,
      required: true
    },
    increment: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

const OutgoingGameRequestSchema = new Schema(
  {
    to: {
      type: String,
      requred: true
    },
    minutes: {
      type: Number,
      required: true
    },
    increment: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

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
      unique: true,
      allowNull: true,
      sparse: true
    },
    friends: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: []
    },
    pastGames: {
      type: [Schema.Types.ObjectId],
      required: true,
      default: []
    },
    currentGame: {
      type: Schema.Types.ObjectId,
      default: null
    },
    notifications: {
      type: [NotificationSchema],
      default: []
    },
    incomingGameRequests: {
      type: [IncomingGameRequestSchema],
      default: []
    },
    outgoingGameRequest: {
      type: OutgoingGameRequestSchema,
      default: null
    }
  },
  { timestamps: true }
);

UserSchema.methods.validatePassword = async function (inputPassword) {
  if (!this.password) throw new Error("User is not associated with a password");
  const isValid = await bcrypt.compare(inputPassword, this.password);
  return isValid;
};

UserSchema.methods.sendNotification = async function (
  io,
  connectedUsers,
  notification
) {
  this.notifications.push(notification);
  await this.save();

  const socketId = connectedUsers.get(this.id);
  if (socketId) {
    io.to(socketId).emit("notification", notification);
  }

  return notification;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
