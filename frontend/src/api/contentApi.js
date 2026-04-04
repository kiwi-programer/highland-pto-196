function normalizeApiBase(rawBase) {
  const base = String(rawBase || '').trim().replace(/\/+$/, '')

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
    console.log(`[frontend-api] ${message}`, details)
    return
  }

  console.log(`[frontend-api] ${message}`)
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const method = options.method || 'GET'

  debugApiLog('Request start', {
    method,
    url,
    apiBase: API_BASE,
    hasBody: Boolean(options.body)
  })

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
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

export function fetchPages() {
  return request('/pages')
}

export function fetchSite() {
  return request('/site')
}

export function fetchPageBySlug(slug) {
  return request(`/pages/${slug}`)
}

export function createPage(page) {
  return request('/pages', {
    method: 'POST',
    body: JSON.stringify(page)
  })
}

export function updatePage(slug, page) {
  return request(`/pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(page)
  })
}

export function updateSite(site, token) {
  return request('/site', {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ site })
  })
}
