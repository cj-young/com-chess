const { Server } = require("socket.io");
const User = require("./models/User");
const LiveGame = require("./models/LiveGame");

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
  const liveUsers = new Set();

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

        if (
          receiver.friends.includes(user.id) ||
          user.friends.includes(receiver.id)
        ) {
          throw new Error("You are already friends with this person");
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

        if (
          requester.friends.includes(user.id) ||
          user.friends.includes(requester.id)
        ) {
          throw new Error("You are already friends with this person");
        }

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

    socket.on("joinLive", async () => {
      liveUsers.add(user.id);

      if (user.currentGame) {
        const game = await LiveGame.findById(user.currentGame);
        const opponentUsername =
          game.blackPlayer === user.username
            ? game.whitePlayer
            : game.blackPlayer;

        const opponent = await User.findOne({ username: opponentUsername });

        if (liveUsers.has(opponent.id) && !game.started) {
          socket.emit("liveWaiting", opponent.username);
        } else {
          game.started = true;
          await game.save();
          socket.emit("startGame", game.toObject());
        }
      } else if (user.outgoingGameRequest) {
        socket.emit("liveWaiting", user.outgoingGameRequest.to);
      } else {
        socket.emit("liveCreating", true);
      }
    });

    socket.on("leaveLive", () => {
      liveUsers.delete(user.id);
    });

    socket.on("gameRequest", async ({ username, minutes, increment }) => {
      try {
        const receiver = await User.findOne({ username: username });
        if (!receiver) throw new Error("User not found");

        const incomingInvite = {
          from: user.username,
          minutes,
          increment
        };
        const outgoingInvite = {
          to: receiver.username,
          minutes,
          increment
        };

        receiver.incomingGameRequests.push(incomingInvite);
        user.outgoingGameRequest = outgoingInvite;

        await Promise.all([receiver.save(), user.save()]);
        const socketId = connectedUsers.get(receiver.id);
        io.to(socketId).emit("notification", {
          type: "gameRequest",
          ...incomingInvite
        });
        socket.emit("liveWaiting", receiver.username);
      } catch (error) {
        console.error(error);
      }
    });

    io.on("disconnect", () => {
      connectedUsers.delete(user.username);
    });
  });
};
