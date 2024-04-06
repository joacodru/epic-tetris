const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, required: true },
  timePlayed: { type: Number, required: true },
  lines: { type: Number, required: true }
},
{
  timestamps: true
})

const Game = mongoose.model('Game', GameSchema)

module.exports = Game
