import './style.css'
import { piece, colors, pieces, PIXEL, BOARD_WIDTH, BOARD_HEIGHT } from './consts'

// inicializacion de canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const music = new window.Audio('./tetris.mp3')

canvas.width = BOARD_WIDTH * PIXEL
canvas.height = BOARD_HEIGHT * PIXEL

context.scale(PIXEL, PIXEL)

const createBoard = (width, height) => {
  return Array(height).fill().map(() => Array(width).fill(0))
}

// !!Trying next piece
let firstPiece = 0

const nextPiece = document.querySelector('.nextPiece')
const nextContext = nextPiece.getContext('2d')

nextPiece.width = PIXEL * 7
nextPiece.height = PIXEL * 4
nextContext.scale(PIXEL, PIXEL)

const nextBoard = createBoard(5, 6)

// board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

// pieces

function getRandomPiece () {
  // TODO REFACTOR PLS
  const randomNumber = Math.floor(Math.random() * pieces.length)
  if (!firstPiece) {
    piece.shape = pieces[randomNumber]
    piece.color = colors[randomNumber]
    const scndRandomNumber = Math.floor(Math.random() * pieces.length)
    nextPiece.shape = pieces[scndRandomNumber]
    nextPiece.color = colors[scndRandomNumber]
    firstPiece = 1
  } else {
    piece.shape = nextPiece.shape
    piece.color = nextPiece.color
    nextPiece.shape = pieces[randomNumber]
    nextPiece.color = colors[randomNumber]
  }
  nextPiece.position = { x: 1, y: 1 }
}

// points
let score = 0
let maxScore = 0

// game loop
let dropCounter = 0
let lastTime = 0

function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime + (score / 100)
  const pieceDown = { x: piece.position.x, y: piece.position.y + 1 }

  if (dropCounter > 1000) {
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

function draw () {
  // !!next piece canvas
  nextContext.fillStyle = 'black'
  nextContext.fillRect(0, 0, nextPiece.width, nextPiece.height)
  nextBoard.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        const gradient = context.createRadialGradient(x + 0.5, y + 0.5, 0, x + 0.5, y + 0.5, 1)
        gradient.addColorStop(0.30, value)
        gradient.addColorStop(1, 'black')
        context.fillStyle = gradient
        context.fillRect(x, y, 0.95, 0.95)
      }
    })
  })
  // To delete the white lines set next value BLACK
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        // TODO refactor next values
        context.fillStyle = 'black'
        context.fillRect(x, y, 0.996, 0.996)
        const gradient = context.createRadialGradient(x + 0.5, y + 0.5, 0, x + 0.5, y + 0.5, 1)
        gradient.addColorStop(0.30, value)
        gradient.addColorStop(1, 'black')
        context.fillStyle = gradient
        context.fillRect(x, y, 0.95, 0.95)
      } else {
        context.fillStyle = 'black'
        context.fillRect(x, y, 0.996, 0.996)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        // TODO refactor next values
        const gradient = context.createRadialGradient(x + piece.position.x + 0.5, y + piece.position.y + 0.5, 0, x + piece.position.x + 0.5, y + piece.position.y + 0.5, 1)
        gradient.addColorStop(0.30, piece.color)
        gradient.addColorStop(1, 'black')
        context.fillStyle = gradient
        context.fillRect(x + piece.position.x, y + piece.position.y, 0.95, 0.95)
      }
    })
  })

  // !! NXT PIECE
  nextPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        // TODO refactor next values
        const gradient = nextContext.createRadialGradient(x + nextPiece.position.x + 0.5, y + nextPiece.position.y + 0.5, 0, x + nextPiece.position.x + 0.5, y + nextPiece.position.y + 0.5, 1)
        gradient.addColorStop(0.30, nextPiece.color)
        gradient.addColorStop(1, 'black')
        nextContext.fillStyle = gradient
        nextContext.fillRect(x + nextPiece.position.x, y + nextPiece.position.y, 0.95, 0.95)
      }
    })
  })
}

// predict colission

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

// solidify

function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = piece.color
      }
    })
  })

  // reset position & get new piece
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 1)
  piece.position.y = 0
  getRandomPiece()

  // game over
  if (checkColission()) {
    window.alert('Game over!! Try again!')
    maxScore = Math.max(score, maxScore)
    score = 0
    board.forEach((row) => row.fill(0))
  }
}

// remove rows

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
  // sum score
  const multiplier = (2 ** (removedRows - 1))
  const basePoints = 25
  score = score + (removedRows * basePoints * multiplier)
  document.getElementById('score').textContent = score
  document.getElementById('maxScore').textContent = maxScore
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
  // TODO If collission right x--
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

const $section = document.querySelector('section')

$section.addEventListener('click', () => {
  getRandomPiece()
  update()
  $section.remove()
  music.volume = 0.5
  // music.play()
})
