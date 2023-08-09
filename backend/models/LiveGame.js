const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MoveSchema = new Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  promoteTo: {
    type: String
  }
});

const LiveGameSchema = new Schema({
  moves: {
    type: [MoveSchema],
    default: []
  },
  blackPlayer: {
    type: Schema.Types.ObjectId
  },
  whitePlayer: {
    type: Schema.Types.ObjectId
  },
  blackTime: {
    type: Number
  },
  whiteTime: {
    type: Number
  },
  minutes: {
    type: Number
  },
  increment: {
    type: Number
  },
  started: {
    type: Boolean,
    default: false
  },
  lastMoveTime: {
    type: Number,
    default: Date.now
  }
});

const LiveGame = mongoose.model("LiveGame", LiveGameSchema);

module.exports = LiveGame;
