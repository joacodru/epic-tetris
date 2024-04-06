const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please enter your name'], unique: true },
  maxScore: { type: Number, default: 0 },
  totalTimePlayed: { type: Number, default: 0 },
  totalGamesPlayed: { type: Number, default: 0 }
},
{
  timestamps: true
}
)

const User = mongoose.model('User', UserSchema)

module.exports = User
