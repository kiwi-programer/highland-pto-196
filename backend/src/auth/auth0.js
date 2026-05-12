import { createRemoteJWKSet, jwtVerify } from 'jose'
import { AUTH0_AUDIENCE, AUTH0_DOMAIN, AUTH0_ENABLED } from '../config.js'

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return ''
  }

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return ''
  }

  return token
}

function hasScope(payload, requiredScope) {
  if (!requiredScope) {
    return true
  }

  const scopes = String(payload.scope || '')
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)

  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions.map((item) => String(item).trim()).filter(Boolean)
    : []

  return scopes.includes(requiredScope) || permissions.includes(requiredScope)
}

export function requireAuth(requiredScope = 'admin:write') {
  const cleanDomain = AUTH0_DOMAIN ? AUTH0_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''
  const issuer = cleanDomain ? `https://${cleanDomain}/` : ''
  const jwks = cleanDomain ? createRemoteJWKSet(new URL(`https://${cleanDomain}/.well-known/jwks.json`)) : null

  return async (req, res, next) => {
    if (!AUTH0_ENABLED || !jwks) {
      return next()
    }

    const authHeader = req.headers.authorization || ''
    const token = getBearerToken(authHeader)

    console.log('[backend][auth] incoming request auth header present:', Boolean(authHeader))
    console.log('[backend][auth] auth header length:', String(authHeader).length)
    console.log('[backend][auth] expected issuer:', issuer, 'audience:', AUTH0_AUDIENCE)
    if (!token) {
      console.warn('[backend][auth] Missing bearer token. Headers:', {
        host: req.headers.host,
        origin: req.headers.origin || 'none'
      })

      return res.status(401).json({ message: 'Missing bearer token.' })
    }

    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: AUTH0_AUDIENCE
      })

      console.log('[backend][auth] token validated; payload keys:', Object.keys(payload || {}))
      console.log('[backend][auth] payload scopes:', payload.scope)
      console.log('[backend][auth] payload permissions:', payload.permissions)

      if (!hasScope(payload, requiredScope)) {
        console.error('[backend][auth] Token rejected: missing required scope or permission', {
          required: requiredScope,
          providedScopes: payload.scope,
          providedPermissions: payload.permissions
        })

        // include a helpful hint in the response for debugging environments
        return res.status(403).json({ message: 'Insufficient permissions.' })
      }

      req.auth = payload
      return next()
    } catch (error) {
      const isOpaque = token.length < 50
      const debugTip = isOpaque 
        ? 'Token looks opaque (too short to be a JWT). Check VITE_AUTH0_AUDIENCE in your admin app.' 
        : `Backend expected issuer: ${issuer} and audience: ${AUTH0_AUDIENCE}.`

      console.error('[backend][auth] Token validation failed', {
        message: error.message,
        stack: error.stack,
        expectedIssuer: issuer,
        expectedAudience: AUTH0_AUDIENCE,
        isOpaque,
        authHeaderSummary: {
          present: Boolean(authHeader),
          length: String(authHeader).length
        }
      })

      return res.status(401).json({ 
        message: `Invalid or expired token. Reason: ${error.message}. ${debugTip}` 
      })
    }
  }
}