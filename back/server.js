const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Game = require('./models/game.model')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors())

const password = process.env.MONGODB_PASSWORD

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).exec()
    res.status(200).json(users)
  } catch (error) {
    console.error('Error retrieving users:', error)
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
})

app.get('/games', async (req, res) => {
  try {
    const games = await Game.find({}).exec()
    res.status(200).json(games)
  } catch (error) {
    console.error('Error retrieving games:', error)
    res.status(500).json({ error: 'Failed to retrieve games' })
  }
})

app.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}).sort({ maxScore: -1 }).limit(10).exec()
    res.status(200).json(users)
  } catch (error) {
    console.error('Error retrieving leaderboard:', error)
    res.status(500).json({ error: 'Failed to retrieve leaderboard' })
  }
})

app.post('/submit', async (req, res) => {
  if (!req.body.name || !req.body.score || !req.body.timePlayed || !req.body.lines) {
    return res.status(400).json({ message: 'No data provided' })
  } else {
    try {
      let user = await User.findOne({ name: req.body.name })

      if (!user) {
        user = await User.create(req.body)
      }

      const game = await Game.create({
        user: user._id,
        score: req.body.score,
        timePlayed: req.body.timePlayed,
        lines: req.body.lines
      })

      user.maxScore = Math.max(user.maxScore, req.body.score)
      user.totalTimePlayed = user.totalTimePlayed + req.body.timePlayed
      user.totalGamesPlayed = user.totalGamesPlayed + 1
      await user.save()

      res.status(200).json({ user, game })
    } catch (error) {
      console.error('Error saving game:', error)
      res.status(500).json({ error: 'Failed to submit game data' })
    }
  }
})

const connectionString = `mongodb+srv://admin:${password}@epictetrisdb.gnfrfpv.mongodb.net/TetrisDB?retryWrites=true&w=majority&appName=EpicTetrisDB`

mongoose.connect(connectionString)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(port, () => {
      console.log(`Server app listening on port ${port}`)
    })
  })
  .catch(() => {
    console.log('Error connecting to MongoDB')
  })
