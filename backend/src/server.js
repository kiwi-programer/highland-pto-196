import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import pagesRouter from './routes/pages.js'
import siteRouter from './routes/site.js'
import usersRouter from './routes/users.js'
import { PORT } from './config.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.use((req, res, next) => {
  const startedAt = Date.now()
  const id = Math.random().toString(36).slice(2, 10)

  console.log(`[backend][${id}] -> ${req.method} ${req.originalUrl}`, {
    host: req.headers.host,
    origin: req.headers.origin || 'none',
    userAgent: req.headers['user-agent'] || 'unknown'
  })

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt
    console.log(`[backend][${id}] <- ${res.statusCode} ${req.method} ${req.originalUrl} (${durationMs}ms)`)
  })

  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'highland-pto-backend' })
})

app.use('/api/pages', pagesRouter)
app.use('/api/site', siteRouter)
app.use('/api/users', usersRouter)

app.use((req, res) => {
  console.warn('[backend][404] Route not found', {
    method: req.method,
    path: req.originalUrl,
    host: req.headers.host,
    origin: req.headers.origin || 'none'
  })

  res.status(404).json({
    message: 'Route not found.',
    method: req.method,
    path: req.originalUrl,
    expectedPrefix: '/api',
    tip: 'Verify VITE_API_BASE_URL points to your backend origin and includes /api routes.'
  })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error?.status && Number.isInteger(error.status)) {
    return res.status(error.status).json({ message: error.message || 'Request failed.' })
  }

  return res.status(500).json({ message: 'Unexpected server error.' })
})

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`)
})
