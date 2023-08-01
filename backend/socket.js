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
    const userId = socket.request.user?.id;
    if (!userId) return;

    connectedUsers.set(userId, socket.id);

    socket.on("friendRequest", async (username) => {
      try {
        const user = await User.findById(userId);
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
        const user = await User.findById(userId);
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
        const user = await User.findById(userId);
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
      try {
        const user = await User.findById(userId);
        liveUsers.add(userId);

        if (user.currentGame) {
          const game = await LiveGame.findById(user.currentGame);
          if (!game) throw new Error("Game not found");
          const opponentUsername =
            game.blackPlayer === user.username
              ? game.whitePlayer
              : game.blackPlayer;

          const opponent = await User.findOne({ username: opponentUsername });

          if (!liveUsers.has(opponent.id) && !game.started) {
            socket.emit("liveWaiting", opponent.username);
          } else {
            const updatedGame = await LiveGame.findByIdAndUpdate(game.id, {
              $set: { started: true }
            });
            socket.emit("startGame", updatedGame.toObject());
            if (connectedUsers.has(opponent.id)) {
              io.to(connectedUsers.get(opponent.id)).emit(
                "startGame",
                updatedGame.toObject()
              );
            }
          }
        } else if (user.outgoingGameRequest) {
          socket.emit("liveWaiting", user.outgoingGameRequest.to);
        } else {
          socket.emit("liveCreating", true);
        }
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("leaveLive", () => {
      liveUsers.delete(userId);
    });

    socket.on("gameRequest", async ({ username, minutes, increment }) => {
      try {
        const user = await User.findById(userId);
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

    async function removeGameRequest(receiver, username) {
      const newRequests = receiver.incomingGameRequests.filter(
        (gameRequest) => gameRequest.from !== username
      );
      await Promise.all([
        User.findByIdAndUpdate(
          receiver.id,
          { $set: { incomingGameRequests: newRequests } },
          { new: true }
        ),
        User.findOneAndUpdate(
          { username: username },
          { $set: { outgoingGameRequest: null } },
          { new: true }
        )
      ]);
    }

    socket.on("gameAccept", async (username) => {
      try {
        const user = await User.findById(userId);
        const opponent = await User.findOne({ username: username });
        if (!opponent) {
          removeGameRequest(user, username);
          throw new Error("User not found");
        }
        if (opponent.currentGame) {
          removeGameRequest(user, username);
          throw new Error("User is already in a game");
        }

        if (
          !opponent.outgoingGameRequest ||
          opponent.outgoingGameRequest.to !== user.username
        ) {
          removeGameRequest(user, username);
          throw new Error("Invalid game invite");
        }

        const gameRequest = opponent.outgoingGameRequest;
        const whitePlayer = [user.username, username][
          Math.floor(Math.random() * 2)
        ];
        const blackPlayer =
          whitePlayer === user.username ? username : user.username;

        const game = await LiveGame.create({
          blackPlayer,
          whitePlayer,
          blackTime: gameRequest.minutes,
          whiteTime: gameRequest.minutes,
          minutes: gameRequest.minutes,
          increment: gameRequest.increment
        });

        await Promise.all([
          User.findByIdAndUpdate(
            opponent.id,
            { $set: { currentGame: game.id } },
            { new: true }
          ),
          User.findByIdAndUpdate(
            user.id,
            { $set: { currentGame: game.id } },
            { new: true }
          )
        ]);
        removeGameRequest(user, username);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("gameDecline", async (username) => {
      try {
        const user = await User.findById(userId);
        const opponent = await User.findOne({ username: username });
        if (!opponent) {
          throw new Error("User not found");
        }
        removeGameRequest(user, username);
        opponent.sendNotification(io, connectedUsers, {
          type: "gameDeclined",
          from: user.username
        });
        if (connectedUsers.has(opponent.id)) {
          io.to(connectedUsers.get(opponent.id)).emit(
            "gameDeclined",
            opponent.username
          );
        }
      } catch (error) {
        console.error(error);
      }
    });

    io.on("disconnect", () => {
      connectedUsers.delete(userId);
    });
  });
};
