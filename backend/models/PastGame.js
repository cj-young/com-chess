const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MoveSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  promoteTo: {
    type: String,
  },
});

const PastLiveGameSchema = new Schema({
  moves: {
    type: [MoveSchema],
  },
  blackPlayer: {
    type: Schema.Types.ObjectId,
  },
  whitePlayer: {
    type: Schema.Types.ObjectId,
  },
  minutes: {
    type: Number,
  },
  increment: {
    type: Number,
  },
  winner: {
    type: String,
  },
});

const PastBotGameSchema = new Schema({
  moves: {
    type: [MoveSchema],
  },
  user: {
    type: Schema.Types.ObjectId,
  },
  color: {
    type: String,
  },
  difficulty: {
    type: String,
  },
  winner: {
    type: String,
  },
});

const PastLiveGame = mongoose.model("PastLiveGame", PastLiveGameSchema);
const PastBotGame = mongoose.model("PastBotGame", PastBotGameSchema);

module.exports = { PastLiveGame, PastBotGame };
