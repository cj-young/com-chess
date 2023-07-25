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

    connectedUsers.set(user.username, socket.id);

    socket.on("friendRequest", async (username) => {
      try {
        if (username === user.username)
          throw new Error("You cannot be friends with yourself");
        const receiver = await User.findOneAndUpdate(
          { username: username },
          {
            $push: {
              notifications: { type: "friendRequest", from: user.username }
            }
          },
          { new: true }
        );
        if (!receiver) {
          throw new Error("User does not exist");
        }

        const receiverId = connectedUsers.get(username);
        if (receiverId) {
          io.to(receiverId).emit("friendRequest", user.username);
          socket.emit("friendRequestSuccess", username);
        }
      } catch (error) {
        socket.emit("friendRequestFailure", error.message);
      }
    });

    io.on("disconnect", () => {
      connectedUsers.delete(user.username);
    });
  });
};
