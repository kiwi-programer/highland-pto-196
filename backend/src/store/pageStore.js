import { promises as fs } from 'node:fs'
import { DATA_FILE } from '../config.js'

export async function readPages() {
  const raw = await fs.readFile(DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.pages)) {
    throw new Error('Invalid pages data format.')
  }

  return parsed
}

export async function writePages(data) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}
