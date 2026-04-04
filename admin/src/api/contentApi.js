function normalizeApiBase(rawBase) {
  let base = String(rawBase || '').trim().replace(/\/+$/, '')

  // If the value looks like a host but has no scheme, default to https in production.
  if (base && !base.startsWith('/') && !/^https?:\/\//i.test(base)) {
    base = `https://${base}`
  }

  if (!base || base === '/') {
    return '/api'
  }

  return base.endsWith('/api') ? base : `${base}/api`
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
const DEBUG_API = String(import.meta.env.VITE_DEBUG_API || '').toLowerCase() === 'true'

function debugApiLog(message, details) {
  if (!DEBUG_API) {
    return
  }

  if (details !== undefined) {
    console.log(`[admin-api] ${message}`, details)
    return
  }

  console.log(`[admin-api] ${message}`)
}

async function request(path, options = {}, token) {
  const url = `${API_BASE}${path}`
  const method = options.method || 'GET'

  debugApiLog('Request start', {
    method,
    url,
    apiBase: API_BASE,
    hasToken: Boolean(token),
    hasBody: Boolean(options.body)
  })

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  })

  const payload = await response.json().catch(() => ({}))

  debugApiLog('Response received', {
    method,
    url,
    status: response.status,
    ok: response.ok,
    payload
  })

  if (!response.ok) {
    throw new Error(
      payload.message ||
      `Request failed with status ${response.status} at ${url}. Check VITE_API_BASE_URL and backend /api routes.`
    )
  }

  return payload
}

export function fetchPages(token) {
  return request('/pages', {}, token)
}

export function fetchSite(token) {
  return request('/site', {}, token)
}

export function createPage(page, token) {
  return request('/pages', {
    method: 'POST',
    body: JSON.stringify(page)
  }, token)
}

export function updatePage(slug, page, token) {
  return request(`/pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(page)
  }, token)
}

export function updateSite(site, token) {
  return request('/site', {
    method: 'PUT',
    body: JSON.stringify({ site })
  }, token)
}