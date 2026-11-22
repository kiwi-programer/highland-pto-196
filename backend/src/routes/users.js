import {Router} from 'express'
import {legacyWrite} from '../store/hubContent.js'
const router=Router()
router.all('*',legacyWrite)
export default router
