import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=path.dirname(fileURLToPath(import.meta.url))
export const PORT=Number(process.env.PORT||4000)
export const DATA_FILE=path.resolve(root,'../data/pages.json')
export const SITE_FILE=path.resolve(root,'../data/site.json')
export const HUB_PUBLIC_URL=process.env.RUA_HUB_PUBLIC_URL??'https://api.rua-labs.com'
