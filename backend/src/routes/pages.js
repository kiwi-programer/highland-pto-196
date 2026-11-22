import {Router} from 'express'
import {readPages} from '../store/pageStore.js'
import {published,legacyWrite} from '../store/hubContent.js'
const router=Router()
router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next()})
async function pages(){
 const data=await readPages()
 return Promise.all(data.pages.map(async p=>{
  const document=await published(p.slug)
  const item=document?.data.content.find(c=>c.type==='HighlandPage')
  if(!item)return p
  const {id,...content}=item.props
  return {...p,...content,slug:p.slug}
 })).then(items=>items.sort((a,b)=>a.order-b.order))
}
router.get('/',async(_req,res,next)=>{try{res.json({pages:await pages()})}catch(e){next(e)}})
router.get('/:slug',async(req,res,next)=>{try{const page=(await pages()).find(p=>p.slug===req.params.slug);return page?res.json({page}):res.status(404).json({message:'Page not found.'})}catch(e){next(e)}})
router.all('*',legacyWrite)
export default router
