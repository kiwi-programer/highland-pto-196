function normalizeApiBase(rawBase) {
  const base = String(rawBase || '').trim().replace(/\/+$/, '')

  if (!base || base === '/') {
    return '/api'
  }

  return base.endsWith('/api') ? base : `${base}/api`
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
