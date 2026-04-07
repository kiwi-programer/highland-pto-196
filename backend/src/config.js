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
export const AUTH0_M2M_CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID || ''
export const AUTH0_M2M_CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET || ''
export const AUTH0_DB_CONNECTION = process.env.AUTH0_DB_CONNECTION || 'Username-Password-Authentication'
export const AUTH0_MANAGEMENT_ENABLED = Boolean(
  AUTH0_DOMAIN && AUTH0_M2M_CLIENT_ID && AUTH0_M2M_CLIENT_SECRET
)
