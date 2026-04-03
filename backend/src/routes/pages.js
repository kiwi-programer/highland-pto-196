import { Router } from 'express'
import { requireAuth } from '../auth/auth0.js'
import { readPages, writePages } from '../store/pageStore.js'

const router = Router()

function normalizeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function validatePageInput(input, { isCreate }) {
  const title = String(input.title || '').trim()
  const navLabel = String(input.navLabel || '').trim()
  const summary = String(input.summary || '').trim()
  const content = String(input.content || '').trim()
  const order = Number(input.order || 0)

  if (!title || !navLabel || !summary || !content) {
    return { error: 'title, navLabel, summary, and content are required.' }
  }

  let slug = String(input.slug || '').trim()
  if (isCreate && !slug) {
    slug = title
  }

  slug = normalizeSlug(slug)
  if (!slug) {
    return { error: 'A valid slug is required.' }
  }

  return {
    value: {
      slug,
      title,
      navLabel,
      summary,
      content,
      order: Number.isFinite(order) ? order : 0,
      updatedAt: new Date().toISOString()
    }
  }
}

router.get('/', async (_req, res, next) => {
  try {
    const data = await readPages()
    const pages = [...data.pages].sort((a, b) => a.order - b.order)
    res.json({ pages })
  } catch (error) {
    next(error)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const data = await readPages()
    const page = data.pages.find((item) => item.slug === req.params.slug)

    if (!page) {
      return res.status(404).json({ message: 'Page not found.' })
    }

    return res.json({ page })
  } catch (error) {
    return next(error)
  }
})

router.post('/', requireAuth(), async (req, res, next) => {
  try {
    const data = await readPages()
    const { error, value } = validatePageInput(req.body, { isCreate: true })

    if (error) {
      return res.status(400).json({ message: error })
    }

    const exists = data.pages.some((item) => item.slug === value.slug)
    if (exists) {
      return res.status(409).json({ message: 'A page with this slug already exists.' })
    }

    data.pages.push(value)
    await writePages(data)

    return res.status(201).json({ page: value })
  } catch (error) {
    return next(error)
  }
})

router.put('/:slug', requireAuth(), async (req, res, next) => {
  try {
    const data = await readPages()
    const index = data.pages.findIndex((item) => item.slug === req.params.slug)

    if (index === -1) {
      return res.status(404).json({ message: 'Page not found.' })
    }

    const { error, value } = validatePageInput(
      { ...req.body, slug: req.params.slug },
      { isCreate: false }
    )

    if (error) {
      return res.status(400).json({ message: error })
    }

    data.pages[index] = {
      ...data.pages[index],
      ...value,
      slug: req.params.slug
    }

    await writePages(data)
    return res.json({ page: data.pages[index] })
  } catch (error) {
    return next(error)
  }
})

export default router
