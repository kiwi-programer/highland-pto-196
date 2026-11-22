import {HUB_PUBLIC_URL} from '../config.js'
export function createPublishedReader(baseUrl,fetcher=fetch){
 const cache=new Map()
 return async function published(key){
  if(!baseUrl)return null
  const url=new URL('/api/public/studio/highland-pto-196/pages/'+encodeURIComponent(key),baseUrl)
  try{
   const response=await fetcher(url,{signal:AbortSignal.timeout(5000),redirect:'error'})
   if(response.status===404)return null
   if(!response.ok)throw new Error('Content unavailable')
   const value=await response.json()
   if(value.registryId!=='highland-pto-196@1.0.0'||!Array.isArray(value.data?.content))throw new Error('Registry mismatch')
   cache.set(key,value);return value
  }catch{return cache.get(key)||null}
 }
}
export const published=createPublishedReader(HUB_PUBLIC_URL)
export function legacyWrite(_req,res){return res.status(410).json({message:'Administration has moved to Rua Hub. Legacy writes are retired.',adminUrl:'https://hub.rua-labs.com/cms?project=highland-pto-196'})}
