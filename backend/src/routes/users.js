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

const MANAGEMENT_AUDIENCE = AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN}/api/v2/` : ''
const MANAGEMENT_TOKEN_URL = AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN}/oauth/token` : ''

let cachedManagementToken = ''
let cachedManagementTokenExpiresAt = 0

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
    const auth0Message = payload.message || payload.error_description || 'Auth0 request failed.'
    const error = new Error(auth0Message)
    error.status = response.status
    throw error
  }

  return payload
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
    const query = new URLSearchParams({
      per_page: '100',
      page: '0',
      include_totals: 'false',
      include_fields: 'true',
      fields: 'user_id,email,name,created_at,identities',
      q: `identities.connection:\"${AUTH0_DB_CONNECTION}\"`,
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
    const password = String(req.body?.password || '').trim()
    const name = String(req.body?.name || '').trim()

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'password must be at least 8 characters.' })
    }

    const createdUser = await managementRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        connection: AUTH0_DB_CONNECTION,
        email,
        password,
        name: name || undefined,
        verify_email: true
      })
    })

    return res.status(201).json({ user: sanitizeUser(createdUser) })
  } catch (error) {
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
