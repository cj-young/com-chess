const { Server } = require("socket.io");

module.exports = (server, sessionMiddleware, passport) => {
  const io = new Server(server);

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

  io.on("connection", (socket) => {
    const user = socket.request.user;
    if (!user) return;

    socket.on("friendRequest", (request) => {
      console.log("adding friend");
    });
  });
};
