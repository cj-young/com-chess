const { Server } = require("socket.io");
const User = require("./models/User");
const LiveGame = require("./models/LiveGame");
const applyMoves = require("./utils/applyMoves");
const generateLegalMoves = require("./utils/moveVerification/generateLegalMoves");
const generateStartingPosition = require("./utils/generateStartingPosition");
const isInCheck = require("./utils/moveVerification/isInCheck");
const canMove = require("./utils/moveVerification/canMove");
const PastGame = require("./models/PastGame");
const movesToFEN = require("./utils/movesToFEN");
const isInsufficientMaterial = require("./utils/isInsufficientMaterial");

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

    async function sterilizeGame(game) {
      const [whitePlayer, blackPlayer] = await Promise.all([
        User.findById(game.whitePlayer),
        User.findById(game.blackPlayer)
      ]);

      const [whiteUsername, blackUsername] = [
        whitePlayer.username,
        blackPlayer.username
      ];

      if (!whiteUsername || !blackUsername)
        throw new Error("One or more users not found");
      return {
        info: {
          whiteUsername,
          blackUsername,
          minutes: game.minutes,
          increment: game.increment,
          whiteTime: game.whiteTime,
          blackTime: game.blackTime
        },
        moves: game.moves,
        lastMoveTime: game.lastMoveTime
      };
    }

    socket.on("joinLive", async () => {
      try {
        const user = await User.findById(userId);
        liveUsers.add(userId);

        if (user.currentGame) {
          const game = await LiveGame.findById(user.currentGame);
          if (!game) throw new Error("Game not found");
          const opponentId =
            game.blackPlayer.toString() === user.id
              ? game.whitePlayer.toString()
              : game.blackPlayer.toString();

          const opponent = await User.findById(opponentId);

          if (!liveUsers.has(opponent.id) && !game.started) {
            socket.emit("liveWaiting", opponent.username);
          } else {
            const updatedGame = await LiveGame.findByIdAndUpdate(game.id, {
              $set: { started: true }
            });
            const sterilizedGame = await sterilizeGame(updatedGame);
            const whiteId = game.whitePlayer.toString();
            const blackId = game.blackPlayer.toString();
            if (connectedUsers.has(whiteId)) {
              io.to(connectedUsers.get(whiteId)).emit("startGame", {
                ...sterilizedGame,
                yourColor: "white"
              });
            }
            if (connectedUsers.has(blackId)) {
              io.to(connectedUsers.get(blackId)).emit("startGame", {
                ...sterilizedGame,
                yourColor: "black"
              });
            }
          }
        } else if (user.outgoingGameRequest) {
          socket.emit("liveWaiting", user.outgoingGameRequest.to);
        } else {
          socket.emit("liveCreating", true);
        }
      } catch (error) {
        console.error(error);
        socket.emit("error", error.message);
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
        socket.emit("error", error.message);
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
          throw new Error("Game invite was canceled or has expired");
        }

        const gameRequest = opponent.outgoingGameRequest;
        const whitePlayer = [user.id, opponent.id][
          Math.floor(Math.random() * 2)
        ];
        const blackPlayer = whitePlayer === user.id ? opponent.id : user.id;

        const game = await LiveGame.create({
          blackPlayer,
          whitePlayer,
          blackTime: gameRequest.minutes * 60 * 1000,
          whiteTime: gameRequest.minutes * 60 * 1000,
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

        const sterilizedGame = await sterilizeGame(game);
        const whiteId = game.whitePlayer.toString();
        const blackId = game.blackPlayer.toString();
        if (liveUsers.has(whiteId) && liveUsers.has(blackId)) {
          if (connectedUsers.has(whiteId)) {
            io.to(connectedUsers.get(whiteId)).emit("startGame", {
              ...sterilizedGame,
              yourColor: "white"
            });
          }
          if (connectedUsers.has(blackId)) {
            io.to(connectedUsers.get(blackId)).emit("startGame", {
              ...sterilizedGame,
              yourColor: "black"
            });
          }
        }
      } catch (error) {
        console.error(error);
        socket.emit("error", error.message);
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
        socket.emit("error", error.message);
      }
    });

    socket.on("gameCancel", async () => {
      try {
        const user = await User.findById(userId);
        let opponent;
        if (user.currentGame) {
          const game = await LiveGame.findByIdAndDelete(user.currentGame);
          const opponentId =
            game.whitePlayer === user.id ? game.blackPlayer : game.whitePlayer;
          opponent = await User.findById(opponentId);
        } else if (user.outgoingGameRequest) {
          opponent = await User.findOne({
            username: user.outgoingGameRequest.to
          });
        } else {
          throw new Error("No game to cancel");
        }

        if (!opponent) {
          User.findByIdAndUpdate(userId, {
            $set: { outgoingGameRequest: null, currentGame: null }
          });
          throw new Error("Opponent not found");
        }

        removeGameRequest(opponent, user.username);
        User.findByIdAndUpdate(userId, {
          $set: { outgoingGameRequest: null, currentGame: null }
        });
        User.findByIdAndUpdate(opponent.id, {
          $set: { outgoingGameRequest: null, currentGame: null }
        });

        socket.emit("liveCreating", true);
        if (connectedUsers.has(opponent.id)) {
          io.to(connectedUsers.get(opponent.id)).emit("liveCreating", true);
        }
      } catch (error) {
        console.error(error);
        socket.emit("error", error.message);
      }
    });

    socket.on("move", async ({ move, timeSpent }) => {
      try {
        const user = await User.findById(userId);
        const game = await LiveGame.findById(user.currentGame);

        if (!game) throw new Error("No game found");

        const { moves } = game;
        const [blackPlayer, whitePlayer] = [
          game.blackPlayer.toString(),
          game.whitePlayer.toString()
        ];
        const turn = game.moves.length % 2 === 0 ? "white" : "black";
        const BUFFER = 1000; // 1 second buffer to account for possible latency
        const adjustedTimeSpent = Math.max(
          timeSpent,
          Date.now() - game.lastMoveTime - BUFFER
        );

        let timeUpdatedGame;
        if (user.id === whitePlayer) {
          const adjustedTime = game.whiteTime - adjustedTimeSpent;
          timeUpdatedGame = await LiveGame.findByIdAndUpdate(
            game.id,
            { $set: { lastMoveTime: Date.now(), whiteTime: adjustedTime } },
            { new: true }
          );
        } else {
          const adjustedTime = game.blackTime - adjustedTimeSpent;
          timeUpdatedGame = await LiveGame.findByIdAndUpdate(
            game.id,
            { $set: { lastMoveTime: Date.now(), blackTime: adjustedTime } },
            { new: true }
          );
        }

        if (
          (turn === "white" && user.id !== whitePlayer) ||
          (turn === "black" && user.id !== blackPlayer)
        ) {
          socket.emit("move", {
            moves,
            blackTime: timeUpdatedGame.blackTime,
            whiteTime: timeUpdatedGame.whiteTime
          });
          throw new Error("Move attempted by user when it is not their turn");
        }

        const pieces = applyMoves(generateStartingPosition(), moves);
        let movedPiece;
        for (let piece of pieces) {
          if (piece.square === move.from && piece.active === true)
            movedPiece = piece;
        }

        if (!movedPiece) {
          socket.emit("move", {
            moves,
            blackTime: timeUpdatedGame.blackTime,
            whiteTime: timeUpdatedGame.whiteTime
          });
          throw new Error("Piece not found");
        }

        const legalMoves = generateLegalMoves(pieces, movedPiece, moves);

        let moveIsLegal = false;
        for (let legalMove of legalMoves) {
          if (legalMove === move.to) moveIsLegal = true;
        }

        if (!moveIsLegal) {
          socket.emit("move", {
            moves,
            blackTime: timeUpdatedGame.blackTime,
            whiteTime: timeUpdatedGame.whiteTime
          });
          throw new Error("Illegal move");
        }

        const updatedGame = await LiveGame.findByIdAndUpdate(
          game.id,
          { $push: { moves: move } },
          { new: true }
        );

        const opponentId =
          updatedGame.whitePlayer.toString() === user.id
            ? updatedGame.blackPlayer.toString()
            : updatedGame.whitePlayer.toString();

        const opponent = await User.findById(opponentId);

        socket.emit("move", {
          moves: updatedGame.moves,
          blackTime: timeUpdatedGame.blackTime,
          whiteTime: timeUpdatedGame.whiteTime
        });
        if (connectedUsers.has(opponent.id)) {
          io.to(connectedUsers.get(opponent.id)).emit("move", {
            moves: updatedGame.moves,
            blackTime: timeUpdatedGame.blackTime,
            whiteTime: timeUpdatedGame.whiteTime
          });
        }

        const updatedPieces = applyMoves(
          generateStartingPosition(),
          updatedGame.moves
        );

        if (!canMove(updatedPieces, updatedGame.moves)) {
          if (isInCheck(updatedPieces, turn === "white" ? "black" : "white")) {
            const pastGame = await PastGame.create({
              moves: updatedGame.moves,
              blackPlayer: updatedGame.blackPlayer,
              whitePlayer: updatedGame.whitePlayer,
              minutes: updatedGame.minutes,
              increment: updatedGame.increment,
              winner:
                user.id === updatedGame.whitePlayer.toString()
                  ? "white"
                  : "black"
            });

            socket.emit("gameWon", { type: "checkmate", id: pastGame.id });
            if (connectedUsers.has(opponent.id)) {
              io.to(connectedUsers.get(opponent.id)).emit("gameLost", {
                type: "checkmate",
                id: pastGame.id
              });
            }
          } else {
            const pastGame = await PastGame.create({
              moves: updatedGame.moves,
              blackPlayer: updatedGame.blackPlayer,
              whitePlayer: updatedGame.whitePlayer,
              minutes: updatedGame.minutes,
              increment: updatedGame.increment,
              winner: null
            });

            socket.emit("gameDrawn", { type: "stalemate", id: pastGame.id });
            if (connectedUsers.has(opponent.id)) {
              io.to(connectedUsers.get(opponent.id)).emit("gameDrawn", {
                type: "stalemate",
                id: pastGame.id
              });
            }
          }

          await Promise.all([
            LiveGame.findByIdAndDelete(updatedGame.id),
            User.findByIdAndUpdate(updatedGame.blackPlayer, {
              $set: { currentGame: null }
            }),
            User.findByIdAndUpdate(updatedGame.whitePlayer, {
              $set: { currentGame: null }
            })
          ]);
        } else {
          // Check for repetition
          const currentFEN = movesToFEN(updatedGame.moves)
            .split(" ")
            .slice(0, -2)
            .join(" ");
          let count = 0;

          for (let i = 0; i < updatedGame.moves.length + 1; i++) {
            const fenPosition = movesToFEN(updatedGame.moves.slice(0, i));
            if (fenPosition.split(" ").slice(0, -2).join(" ") === currentFEN)
              count++;
          }

          if (count >= 3) {
            const pastGame = await PastGame.create({
              moves: updatedGame.moves,
              blackPlayer: updatedGame.blackPlayer,
              whitePlayer: updatedGame.whitePlayer,
              minutes: updatedGame.minutes,
              increment: updatedGame.increment,
              winner: null
            });

            socket.emit("gameDrawn", { type: "repetition", id: pastGame.id });
            if (connectedUsers.has(opponent.id)) {
              io.to(connectedUsers.get(opponent.id)).emit("gameDrawn", {
                type: "repetition",
                id: pastGame.id
              });
            }

            await Promise.all([
              LiveGame.findByIdAndDelete(updatedGame.id),
              User.findByIdAndUpdate(updatedGame.blackPlayer, {
                $set: { currentGame: null }
              }),
              User.findByIdAndUpdate(updatedGame.whitePlayer, {
                $set: { currentGame: null }
              })
            ]);
          } else if (+movesToFEN(updatedGame.moves).split(" ")[4] >= 100) {
            const pastGame = await PastGame.create({
              moves: updatedGame.moves,
              blackPlayer: updatedGame.blackPlayer,
              whitePlayer: updatedGame.whitePlayer,
              minutes: updatedGame.minutes,
              increment: updatedGame.increment,
              winner: null
            });

            socket.emit("gameDrawn", { type: "fiftyMove", id: pastGame.id });
            if (connectedUsers.has(opponent.id)) {
              io.to(connectedUsers.get(opponent.id)).emit("gameDrawn", {
                type: "fiftyMove",
                id: pastGame.id
              });
            }

            await Promise.all([
              LiveGame.findByIdAndDelete(updatedGame.id),
              User.findByIdAndUpdate(updatedGame.blackPlayer, {
                $set: { currentGame: null }
              }),
              User.findByIdAndUpdate(updatedGame.whitePlayer, {
                $set: { currentGame: null }
              })
            ]);
          } else if (
            isInsufficientMaterial(updatedGame.moves, "white") &&
            isInsufficientMaterial(updatedGame.moves, "black")
          ) {
            const pastGame = await PastGame.create({
              moves: updatedGame.moves,
              blackPlayer: updatedGame.blackPlayer,
              whitePlayer: updatedGame.whitePlayer,
              minutes: updatedGame.minutes,
              increment: updatedGame.increment,
              winner: null
            });

            socket.emit("gameDrawn", {
              type: "insufficientMaterial",
              id: pastGame.id
            });
            if (connectedUsers.has(opponent.id)) {
              io.to(connectedUsers.get(opponent.id)).emit("gameDrawn", {
                type: "insufficientMaterial",
                id: pastGame.id
              });
            }

            await Promise.all([
              LiveGame.findByIdAndDelete(updatedGame.id),
              User.findByIdAndUpdate(updatedGame.blackPlayer, {
                $set: { currentGame: null }
              }),
              User.findByIdAndUpdate(updatedGame.whitePlayer, {
                $set: { currentGame: null }
              })
            ]);
          }
        }
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("liveChat", async (message) => {
      const user = await User.findById(userId);
      const game = await LiveGame.findById(user.currentGame);

      if (game) {
        const opponentId =
          game.blackPlayer.toString() === user.id
            ? game.whitePlayer
            : game.blackPlayer;

        const opponent = await User.findById(opponentId);

        if (connectedUsers.has(opponent.id)) {
          io.to(connectedUsers.get(opponent.id)).emit("liveChat", {
            from: user.username,
            message: message
          });
        }
      }
    });

    socket.on("timeout", async (color) => {
      try {
        const user = await User.findById(userId);
        const game = await LiveGame.findById(user.currentGame);

        if (!game) return;

        const elapsedTime = Date.now() - game.lastMoveTime;
        const clockTime = color === "white" ? game.whiteTime : game.blackTime;
        const opponentId =
          user.id === game.whitePlayer.toString()
            ? game.blackPlayer.toString()
            : game.whitePlayer.toString();
        if (elapsedTime >= clockTime) {
          if (
            isInsufficientMaterial(
              game.moves,
              color === "white" ? "black" : "white"
            )
          ) {
            const pastGame = await PastGame.create({
              moves: game.moves,
              blackPlayer: game.blackPlayer,
              whitePlayer: game.whitePlayer,
              minutes: game.minutes,
              increment: game.increment,
              winner: null
            });

            socket.emit("gameDrawn", {
              type: "insufficientMaterialTimeout",
              id: pastGame.id
            });
            if (connectedUsers.has(opponentId)) {
              io.to(connectedUsers.get(opponentId)).emit("gameDrawn", {
                type: "insufficientMaterialTimeout",
                id: pastGame.id
              });
            }

            await Promise.all([
              LiveGame.findByIdAndDelete(game.id),
              User.findByIdAndUpdate(game.blackPlayer, {
                $set: { currentGame: null }
              }),
              User.findByIdAndUpdate(game.whitePlayer, {
                $set: { currentGame: null }
              })
            ]);
          } else {
            const pastGame = await PastGame.create({
              moves: game.moves,
              blackPlayer: game.blackPlayer,
              whitePlayer: game.whitePlayer,
              minutes: game.minutes,
              increment: game.increment,
              winner: color === "white" ? "black" : "white"
            });

            const winnerId =
              color === "white"
                ? game.blackPlayer.toString()
                : game.whitePlayer.toString();
            const loserId =
              color === "white"
                ? game.whitePlayer.toString()
                : game.blackPlayer.toString();

            if (connectedUsers.has(winnerId)) {
              io.to(connectedUsers.get(winnerId)).emit("gameWon", {
                type: "timeout",
                id: pastGame.id
              });
            }
            if (connectedUsers.has(loserId)) {
              io.to(connectedUsers.get(loserId)).emit("gameLost", {
                type: "timeout",
                id: pastGame.id
              });
            }

            await Promise.all([
              LiveGame.findByIdAndDelete(game.id),
              User.findByIdAndUpdate(game.blackPlayer, {
                $set: { currentGame: null }
              }),
              User.findByIdAndUpdate(game.whitePlayer, {
                $set: { currentGame: null }
              })
            ]);
          }
        } else {
          socket.emit("timeoutFailure");
        }
      } catch (error) {
        console.error(error);
        socket.emit("timeoutFailure");
      }
    });

    socket.on("resign", async () => {
      try {
        const user = await User.findById(userId);
        const game = await LiveGame.findById(user.currentGame);

        if (!game) throw new Error("No game found");

        const pastGame = await PastGame.create({
          moves: game.moves,
          blackPlayer: game.blackPlayer,
          whitePlayer: game.whitePlayer,
          minutes: game.minutes,
          increment: game.increment,
          winner: user.id === game.whitePlayer.toString() ? "black" : "white"
        });

        const opponentId =
          user.id === game.whitePlayer.toString()
            ? game.blackPlayer.toString()
            : game.whitePlayer.toString();

        socket.emit("gameLost", { type: "resignation", id: pastGame.id });
        if (connectedUsers.has(opponentId)) {
          io.to(connectedUsers.get(opponentId)).emit("gameWon", {
            type: "resignation",
            id: pastGame.id
          });
        }

        await Promise.all([
          LiveGame.findByIdAndDelete(game.id),
          User.findByIdAndUpdate(game.blackPlayer, {
            $set: { currentGame: null }
          }),
          User.findByIdAndUpdate(game.whitePlayer, {
            $set: { currentGame: null }
          })
        ]);
      } catch (error) {
        console.error(error);
      }
    });

    io.on("disconnect", () => {
      connectedUsers.delete(userId);
    });
  });
};
