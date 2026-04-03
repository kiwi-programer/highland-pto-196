import { Router } from 'express'
import { requireAuth } from '../auth/auth0.js'
import { readSite, writeSite } from '../store/siteStore.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const site = await readSite()
    res.json({ site })
  } catch (error) {
    next(error)
  }
})

router.put('/', requireAuth(), async (req, res, next) => {
  try {
    const site = req.body?.site || req.body

    if (!site || typeof site !== 'object') {
      return res.status(400).json({ message: 'site payload is required.' })
    }

    await writeSite(site)
    return res.json({ site })
  } catch (error) {
    return next(error)
  }
})

export default router