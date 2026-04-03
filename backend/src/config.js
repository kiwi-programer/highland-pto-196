import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const PORT = Number(process.env.PORT || 4000)
export const DATA_FILE = path.resolve(__dirname, '../data/pages.json')
export const SITE_FILE = path.resolve(__dirname, '../data/site.json')
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || ''
export const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || ''
export const AUTH0_ENABLED = Boolean(AUTH0_DOMAIN && AUTH0_AUDIENCE)
