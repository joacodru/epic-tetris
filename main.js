import './style.css'
import { piece, colors, pieces, PIXEL, BOARD_WIDTH, BOARD_HEIGHT, NEXT_PIECE_WIDTH, NEXT_PIECE_HEIGHT } from './consts'

// inicializacion de canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = BOARD_WIDTH * PIXEL
canvas.height = BOARD_HEIGHT * PIXEL

context.scale(PIXEL, PIXEL)

const createBoard = (width, height) => {
  return Array(height).fill().map(() => Array(width).fill(0))
}

let firstPiece = false

const nextPiece = document.querySelector('.nextPiece')
const nextContext = nextPiece.getContext('2d')

nextPiece.width = PIXEL * NEXT_PIECE_WIDTH
nextPiece.height = PIXEL * NEXT_PIECE_HEIGHT
nextContext.scale(PIXEL, PIXEL)

const nextBoard = createBoard(NEXT_PIECE_WIDTH, NEXT_PIECE_HEIGHT)

// board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

// pieces

function getRandomPiece () {
  const getRandomNumber = () => Math.floor(Math.random() * pieces.length)

  const setPiece = (targetPiece) => {
    const randomIndex = getRandomNumber()
    targetPiece.shape = pieces[randomIndex]
    targetPiece.color = colors[randomIndex]
  }

  if (!firstPiece) {
    setPiece(piece)
    setPiece(nextPiece)
    firstPiece = true
  } else {
    piece.shape = nextPiece.shape
    piece.color = nextPiece.color
    setPiece(nextPiece)
  }

  nextPiece.position = { x: 1, y: 1 }
}

// points
let score = 0
let level = 0
let lines = 0

// game loop
let dropCounter = 0
let lastTime = 0
const deltaLimit = 1000
const deltaMultiplier = 3

function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime + ((level + 1) * deltaMultiplier)
  const pieceDown = { x: piece.position.x, y: piece.position.y + 1 }

  if (dropCounter > deltaLimit) {
    if (!checkColission(pieceDown)) {
      piece.position.y++
    } else {
      solidifyPiece()
      removeRows()
    }
    dropCounter = 0
  }

  draw()
  window.requestAnimationFrame(update)
}
const gradienOffset = 0.5
function draw () {
  const fillRectWithGradient = (ctx, x, y, width, height, color) => {
    const gradient = ctx.createRadialGradient(x + gradienOffset, y + gradienOffset, 0, x + gradienOffset, y + gradienOffset, 1)
    gradient.addColorStop(0.30, color)
    gradient.addColorStop(1, 'black')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, width, height)
  }

  const drawBoard = (ctx, gameBoard) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    gameBoard.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          fillRectWithGradient(ctx, x, y, 0.95, 0.95, value)
        } else {
          ctx.fillStyle = 'black'
          ctx.fillRect(x, y, 0.996, 0.996)
        }
      })
    })
  }

  // Draw next piece canvas
  drawBoard(nextContext, nextBoard)
  nextPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        fillRectWithGradient(nextContext, x + nextPiece.position.x, y + nextPiece.position.y, 0.95, 0.95, nextPiece.color)
      }
    })
  })

  // Draw current game board
  drawBoard(context, board)

  // Draw current piece
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        fillRectWithGradient(context, x + piece.position.x, y + piece.position.y, 0.95, 0.95, piece.color)
      }
    })
  })
}

// Predict colission
function checkColission (movement) {
  const xPos = !movement ? piece.position.x : movement.x
  const yPos = !movement ? piece.position.y : movement.y
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 &&
        board[y + yPos]?.[x + xPos] !== 0
      )
    })
  })
}

function submitScore () {
  if (score && playerName && lines) {
    fetch('http://localhost:3000/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: playerName, score, lines, timePlayed: 12 })
    })
      .then(response => response.text())
      .then(data => {
        console.log(data)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }
}

// Solidify piece
function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = piece.color
      }
    })
  })

  // Reset position & get new piece
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 1)
  piece.position.y = 0
  getRandomPiece()

  // Game over
  if (checkColission()) {
    submitScore()
    window.alert('Game over!! Try again!')
    getLeaderboard()
    score = 0
    level = 0
    lines = 0
    board.forEach((row) => row.fill(0))
  }
}

// Remove rows
const singleLinePoints = 40
const twoLinePoints = 100
const threeLinePoints = 300
const tetrisPoints = 1200
const linesPerLevel = 10
function removeRows () {
  let removedRows = 0
  board.forEach((row, y) => {
    if (row.every(value => value !== 0)) {
      removedRows++
      board.splice(y, 1)
      const newRow = Array(BOARD_WIDTH).fill(0)
      board.unshift(newRow)
    }
  })

  // Summ score
  lines = lines + removedRows
  if (removedRows) {
    score = score + ((removedRows === 1 ? singleLinePoints : removedRows === 2 ? twoLinePoints : removedRows === 3 ? threeLinePoints : tetrisPoints) * (level + 1))
    level = Math.trunc(lines / linesPerLevel)
  }
  document.getElementById('score').textContent = score
  document.getElementById('lines').textContent = lines
  document.getElementById('level').textContent = level
}

// rotate piece

function rotate () {
  const rotated = []

  for (let i = 0; i < piece.shape[0].length; i++) {
    const row = []

    for (let j = piece.shape.length - 1; j >= 0; j--) {
      row.push(piece.shape[j][i])
    }
    rotated.push(row)
  }
  const previousShape = piece.shape
  piece.shape = rotated
  if (checkColission()) {
    piece.shape = previousShape
  }
}

// capture the key pressed
document.addEventListener('keydown', event => {
  const pieceLeft = { x: piece.position.x - 1, y: piece.position.y }
  const pieceRight = { x: piece.position.x + 1, y: piece.position.y }
  const pieceDown = { x: piece.position.x, y: piece.position.y + 1 }

  if (event.key === 'ArrowLeft') {
    if (!checkColission(pieceLeft)) {
      piece.position.x--
    }
  }

  if (event.key === 'ArrowRight') {
    if (!checkColission(pieceRight)) {
      piece.position.x++
    }
  }

  if (event.key === 'ArrowDown') {
    if (!checkColission(pieceDown)) {
      piece.position.y++
    } else {
      solidifyPiece()
      removeRows()
    }
  }

  if (event.key === 'ArrowUp') {
    rotate()
  }
})

function displayLeaderboard (leaderboard) {
  const leaderboardContainer = document.getElementById('leaderboard')
  leaderboardContainer.innerHTML = '' // Clear previous leaderboard data
  leaderboard.forEach(entry => {
    const listItemName = document.createElement('a')
    listItemName.textContent = `${entry.name}: `
    leaderboardContainer.appendChild(listItemName)

    const listItem = document.createElement('span')
    listItem.textContent = `${entry.maxScore}`
    leaderboardContainer.appendChild(listItem)

    const lineBreak = document.createElement('br')
    leaderboardContainer.appendChild(lineBreak)
  })
}

async function getLeaderboard () {
  try {
    const response = await fetch('http://localhost:3000/leaderboard')
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard')
    }
    const leaderboard = await response.json()
    displayLeaderboard(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
  }
}

const $startGameBtn = document.getElementById('startGameBtn')

const $section = document.querySelector('section')

let playerName = ''

const $playerNameInput = document.getElementById('playerName')

$startGameBtn.addEventListener('click', async () => {
  playerName = $playerNameInput.value.trim()

  if (!playerName) {
    window.alert('Please enter your name before starting the game.')
    return
  }

  await getLeaderboard()
  getRandomPiece()
  update()
  $section.remove()
})
