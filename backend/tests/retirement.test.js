import {test} from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import {readFile} from 'node:fs/promises'
process.env.RUA_HUB_PUBLIC_URL=''
const {default:pages}=await import('../src/routes/pages.js')
const {default:site}=await import('../src/routes/site.js')
const {default:users}=await import('../src/routes/users.js')
const {createPublishedReader}=await import('../src/store/hubContent.js')
test('legacy mutation and user management routes are retired with missing Auth0 configuration',async()=>{
 const app=express();app.use(express.json());app.use('/api/pages',pages);app.use('/api/site',site);app.use('/api/users',users)
 const server=await new Promise(r=>{const s=app.listen(0,'127.0.0.1',()=>r(s))})
 const origin='http://127.0.0.1:'+server.address().port
 const before=await Promise.all(['pages','site'].map(x=>readFile(new URL('../data/'+x+'.json',import.meta.url),'utf8')))
 try{
  for(const [method,url]of [['POST','/api/pages'],['PUT','/api/pages/home'],['PATCH','/api/pages/home'],['DELETE','/api/pages/home'],['PUT','/api/site'],['GET','/api/users'],['POST','/api/users'],['DELETE','/api/users/a']]){
   const response=await fetch(origin+url,{method,headers:{'Content-Type':'application/json'},...(method==='GET'?{}:{body:'{}'})});assert.equal(response.status,410,method+' '+url)
  }
  assert.equal((await fetch(origin+'/api/pages')).status,200);assert.equal((await fetch(origin+'/api/site')).status,200)
  assert.deepEqual(await Promise.all(['pages','site'].map(x=>readFile(new URL('../data/'+x+'.json',import.meta.url),'utf8'))),before)
 }finally{await new Promise(r=>server.close(r))}
})
test('published content validates registry and retains last-good content during outage',async()=>{
 let offline=false
 const value={registryId:'highland-pto-196@1.0.0',data:{content:[{type:'HighlandPage',props:{title:'Published fixture'}}]}}
 const reader=createPublishedReader('https://fixture.invalid',async()=>{if(offline)throw Error('offline');return Response.json(value)})
 assert.deepEqual(await reader('home'),value);offline=true;assert.deepEqual(await reader('home'),value)
 const wrong=createPublishedReader('https://fixture.invalid',async()=>Response.json({...value,registryId:'another-project'}))
 assert.equal(await wrong('home'),null)
 assert.equal(await createPublishedReader('')('home'),null)
})
