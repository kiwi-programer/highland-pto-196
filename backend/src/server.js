import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import pagesRouter from './routes/pages.js'
import siteRouter from './routes/site.js'
import { PORT } from './config.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'highland-pto-backend' })
})

app.use('/api/pages', pagesRouter)
app.use('/api/site', siteRouter)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Unexpected server error.' })
})

app.listen(PORT, () => {
  console.log(`Backend API listening on http://localhost:${PORT}`)
})
