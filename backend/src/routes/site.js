import {Router} from 'express'
import {readSite} from '../store/siteStore.js'
import {published,legacyWrite} from '../store/hubContent.js'
const router=Router()
router.get('/',async(_req,res,next)=>{try{const document=await published('site-settings');const item=document?.data.content.find(c=>c.type==='SiteSettings');res.json({site:item?.props.site??await readSite()})}catch(e){next(e)}})
router.all('*',legacyWrite)
export default router
