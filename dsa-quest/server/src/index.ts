import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import topicsRoutes from './routes/topics'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 3001
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/topics', topicsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
