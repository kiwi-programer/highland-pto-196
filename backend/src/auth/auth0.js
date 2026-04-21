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
  const issuer = AUTH0_DOMAIN ? `https://${AUTH0_DOMAIN}/` : ''
  const jwks = AUTH0_DOMAIN ? createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)) : null

  return async (req, res, next) => {
    if (!AUTH0_ENABLED || !jwks) {
      return next()
    }

    const token = getBearerToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ message: 'Missing bearer token.' })
    }

    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: AUTH0_AUDIENCE
      })

      if (!hasScope(payload, requiredScope)) {
        console.error('[backend][auth]', 'Token rejected: missing required scope or permission', {
          required: requiredScope,
          providedScopes: payload.scope,
          providedPermissions: payload.permissions
        })
        return res.status(403).json({ message: 'Insufficient permissions.' })
      }

      req.auth = payload
      return next()
    } catch (error) {
      const isOpaque = token.length < 50
      const debugTip = isOpaque 
        ? 'Token looks opaque (too short to be a JWT). Check VITE_AUTH0_AUDIENCE in your admin app.' 
        : `Backend expected issuer: ${issuer} and audience: ${AUTH0_AUDIENCE}.`
        
      console.error('[backend][auth]', 'Token validation failed', error.message, { expectedIssuer: issuer, expectedAudience: AUTH0_AUDIENCE, isOpaque })
      
      return res.status(401).json({ 
        message: `Invalid or expired token. Reason: ${error.message}. ${debugTip}` 
      })
    }
  }
}