import { Router } from 'express'
import { requireAuth } from '../auth/auth0.js'
import {
  AUTH0_DB_CONNECTION,
  AUTH0_DOMAIN,
  AUTH0_M2M_CLIENT_ID,
  AUTH0_M2M_CLIENT_SECRET,
  AUTH0_MANAGEMENT_ENABLED
} from '../config.js'

const router = Router()

// The management API audience MUST be https://domain/api/v2/
const MANAGEMENT_AUDIENCE = AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/v2/` : ''
const MANAGEMENT_TOKEN_URL = AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}/oauth/token` : ''

let cachedManagementToken = ''
let cachedManagementTokenExpiresAt = 0
let cachedDatabaseConnections = []
let cachedDatabaseConnectionsExpiresAt = 0

function ensureManagementConfig(res) {
  if (!AUTH0_MANAGEMENT_ENABLED || !MANAGEMENT_AUDIENCE || !MANAGEMENT_TOKEN_URL) {
    res.status(503).json({
      message:
        'User management is not configured. Set AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, and AUTH0_M2M_CLIENT_SECRET on the backend.'
    })
    return false
  }

  return true
}

async function getManagementAccessToken() {
  const now = Date.now()
  if (cachedManagementToken && now < cachedManagementTokenExpiresAt) {
    return cachedManagementToken
  }

  const response = await fetch(MANAGEMENT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: AUTH0_M2M_CLIENT_ID,
      client_secret: AUTH0_M2M_CLIENT_SECRET,
      audience: MANAGEMENT_AUDIENCE
    })
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.message || 'Failed to obtain Auth0 management token.')
  }

  const expiresInSec = Number(payload.expires_in || 3600)
  cachedManagementToken = payload.access_token
  cachedManagementTokenExpiresAt = now + Math.max(60, expiresInSec - 60) * 1000
  return cachedManagementToken
}

async function managementRequest(path, options = {}) {
  const token = await getManagementAccessToken()
  const response = await fetch(`${MANAGEMENT_AUDIENCE.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const auth0Message = payload.message || payload.error_description || payload.error || 'Auth0 request failed.'
    const error = new Error(auth0Message)
    error.status = response.status
    error.details = payload
    throw error
  }

  return payload
}

async function listDatabaseConnections() {
  const now = Date.now()
  if (cachedDatabaseConnections.length && now < cachedDatabaseConnectionsExpiresAt) {
    return cachedDatabaseConnections
  }

  const query = new URLSearchParams({
    per_page: '100',
    page: '0',
    include_totals: 'false',
    include_fields: 'true',
    fields: 'id,name,strategy,enabled_clients'
  })

  const connections = await managementRequest(`/connections?${query.toString()}`)
  const databaseConnections = Array.isArray(connections)
    ? connections
        .filter((connection) => String(connection?.strategy || '') === 'auth0')
        .map((connection) => ({
          id: String(connection?.id || ''),
          name: String(connection?.name || '').trim(),
          strategy: String(connection?.strategy || ''),
          enabled_clients: Array.isArray(connection?.enabled_clients) ? connection.enabled_clients : []
        }))
        .filter((connection) => connection.name)
    : []

  cachedDatabaseConnections = databaseConnections
  cachedDatabaseConnectionsExpiresAt = now + 5 * 60 * 1000
  return cachedDatabaseConnections
}

async function resolveDatabaseConnection() {
  const configuredConnection = String(AUTH0_DB_CONNECTION || '').trim()
  const connections = await listDatabaseConnections()

  if (configuredConnection) {
    const match = connections.find((connection) => connection.name === configuredConnection)
    if (match) {
      return match.name
    }

    const availableConnections = connections.map((connection) => connection.name)
    const error = new Error(
      availableConnections.length
        ? `Configured Auth0 database connection "${configuredConnection}" does not exist. Available database connections: ${availableConnections.join(', ')}.`
        : `Configured Auth0 database connection "${configuredConnection}" does not exist and no database connections were returned by Auth0.`
    )
    error.status = 503
    error.details = {
      configuredConnection,
      availableConnections
    }
    throw error
  }

  if (connections.length === 1) {
    return connections[0].name
  }

  if (connections.length === 0) {
    const error = new Error('No Auth0 database connections were returned by Auth0.')
    error.status = 503
    error.details = { availableConnections: [] }
    throw error
  }

  const availableConnections = connections.map((connection) => connection.name)
  const error = new Error(
    `Multiple Auth0 database connections exist. Set AUTH0_DB_CONNECTION to one of: ${availableConnections.join(', ')}.`
  )
  error.status = 503
  error.details = { availableConnections }
  throw error
}

function createUserErrorResponse(error) {
  const details = error?.details && typeof error.details === 'object' ? error.details : {}
  const message = String(error?.message || details.message || 'Failed to create user.')

  if (/already exists|duplicate/i.test(message)) {
    return {
      status: 409,
      body: {
        message: 'A user with that email already exists.',
        details
      }
    }
  }

  if (/password/i.test(message) && /length|strength|policy|invalid/i.test(message)) {
    return {
      status: 400,
      body: {
        message,
        details
      }
    }
  }

  return {
    status: Number.isInteger(error?.status) ? error.status : 500,
    body: {
      message,
      details
    }
  }
}

function sanitizeUser(user) {
  return {
    user_id: user.user_id,
    email: user.email || '',
    name: user.name || '',
    created_at: user.created_at || '',
    connection: user.identities?.[0]?.connection || ''
  }
}

router.get('/', requireAuth(), async (_req, res, next) => {
  if (!ensureManagementConfig(res)) {
    return
  }

  try {
    const connectionName = await resolveDatabaseConnection()
    const query = new URLSearchParams({
      per_page: '100',
      page: '0',
      include_totals: 'false',
      include_fields: 'true',
      fields: 'user_id,email,name,created_at,identities',
      q: `identities.connection:\"${connectionName}\"`,
      search_engine: 'v3'
    })

    const users = await managementRequest(`/users?${query.toString()}`)
    return res.json({ users: Array.isArray(users) ? users.map(sanitizeUser) : [] })
  } catch (error) {
    return next(error)
  }
})

router.post('/', requireAuth(), async (req, res, next) => {
  if (!ensureManagementConfig(res)) {
    return
  }

  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const name = String(req.body?.name || '').trim()

    if (!email || !password.trim()) {
      return res.status(400).json({ message: 'email and password are required.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'password must be at least 8 characters.' })
    }

    const connectionName = await resolveDatabaseConnection()
    const createdUser = await managementRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        connection: connectionName,
        email,
        password,
        name: name || undefined,
        verify_email: true
      })
    })

    return res.status(201).json({ user: sanitizeUser(createdUser) })
  } catch (error) {
    if (error?.details || error?.status) {
      const response = createUserErrorResponse(error)
      return res.status(response.status).json(response.body)
    }

    return next(error)
  }
})

router.delete('/:id', requireAuth(), async (req, res, next) => {
  if (!ensureManagementConfig(res)) {
    return
  }

  try {
    const userId = String(req.params.id || '').trim()
    if (!userId) {
      return res.status(400).json({ message: 'A user id is required.' })
    }

    await managementRequest(`/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    })

    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
})

export default router
