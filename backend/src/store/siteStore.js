import { promises as fs } from 'node:fs'
import { SITE_FILE } from '../config.js'

export async function readSite() {
  const raw = await fs.readFile(SITE_FILE, 'utf8')
  const parsed = JSON.parse(raw)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid site data format.')
  }

  return parsed
}

export async function writeSite(data) {
  await fs.writeFile(SITE_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}