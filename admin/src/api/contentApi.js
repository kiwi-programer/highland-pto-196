function normalizeApiBase(rawBase) {
  const base = String(rawBase || '').trim().replace(/\/+$/, '')

  if (!base || base === '/') {
    return '/api'
  }

  return base.endsWith('/api') ? base : `${base}/api`
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)

async function request(path, options = {}, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}`)
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