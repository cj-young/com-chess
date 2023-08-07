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

const PastGameSchema = new Schema({
  moves: {
    type: [MoveSchema]
  },
  blackPlayer: {
    type: Schema.Types.ObjectId
  },
  whitePlayer: {
    type: Schema.Types.ObjectId
  },
  minutes: {
    type: Number
  },
  increment: {
    type: Number
  },
  winner: {
    type: String
  }
});

const PastGame = mongoose.model("PastGame", PastGameSchema);

module.exports = PastGame;
