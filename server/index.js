const dotenv = require('dotenv')
const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')
const path = require('path')
const mysql = require('mysql2')

const envFile = `.env.${process.env.NODE_ENV || 'dev'}`
dotenv.config({ path: path.resolve(__dirname, envFile) })

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message)
  } else {
    console.log('✅ Connected to MySQL successfully!')
  }
})

app.use(cors())
app.use(express.json())

// HTTP route for testing request-response
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' })
})

app.get('/api/test-db', (req, res) => {
  connection.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message })
    } else {
      res.json({ message: 'Database connected!', result: results[0].result })
    }
  })
})

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected')

  // Function to generate random text
  const getRandomText = () => {
    const texts = ['Hello!', 'How are you?', 'Random message', 'WebSockets are cool!', 'Stay connected!']
    return texts[Math.floor(Math.random() * texts.length)]
  }

  // Send random text to the client every 5 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const randomText = getRandomText()
      ws.send(randomText)
    }
  }, 1000)

  ws.on('message', (message) => {
    console.log(`Received: ${message}`)
    ws.send(`Echo: ${message}`) // Echo back the message
  })

  ws.on('close', () => {
    console.log('Client disconnected')
    clearInterval(interval) // Stop sending messages when the client disconnects
  })
})


if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode')
  // Enable optimizations, disable verbose logging, etc.
} else {
  console.log('Running in development mode')
}

const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
