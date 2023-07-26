const { Server } = require("socket.io");
const User = require("./models/User");

module.exports = (server, sessionMiddleware, passport) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4000",
      credentials: true
    }
  });

  const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));

  io.use((socket, next) => {
    if (socket.request.user) {
      next();
    } else {
      next(new Error("unauthorized"));
    }
  });

  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    const user = socket.request.user;
    if (!user) return;

    connectedUsers.set(user.id, socket.id);

    socket.on("friendRequest", async (username) => {
      try {
        if (username === user.username)
          throw new Error("You cannot be friends with yourself");
        const receiver = await User.findOne({ username: username });
        if (!receiver) {
          throw new Error("User does not exist");
        }

        receiver.sendNotification(io, connectedUsers, {
          type: "friendRequest",
          from: user.username
        });

        socket.emit("friendRequestSuccess", username);
      } catch (error) {
        socket.emit("friendRequestFailure", error.message);
      }
    });

    socket.on("friendAccept", async (username) => {
      try {
        const requester = await User.findOne({ username: username });
        if (!requester) throw new Error("User not found");

        user.friends.push(requester.id);
        await user.save();
        requester.friends.push(user.id);
        await requester.save();

        user.sendNotification(io, connectedUsers, {
          type: "friendAccept",
          from: requester.username
        });
        requester.sendNotification(io, connectedUsers, {
          type: "friendAccept",
          from: user.username
        });
      } catch (error) {
        socket.emit("friendDecisionFailure", error.message);
      }
    });

    socket.on("friendDecline", async (username) => {
      try {
        const requester = await User.findOne({ username: username });
        if (!requester) throw new Error("User not found");

        user.sendNotification(io, connectedUsers, {
          type: "friendDidDecline",
          from: requester.username
        });
        requester.sendNotification(io, connectedUsers, {
          type: "friendWasDeclined",
          from: user.username
        });
      } catch (error) {
        socket.emit("friendDecisionFailure", error.message);
      }
    });

    io.on("disconnect", () => {
      connectedUsers.delete(user.username);
    });
  });
};
