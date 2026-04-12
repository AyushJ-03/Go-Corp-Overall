import { Router } from "express"
import { createOffice, getOfficeById, updateOffice } from "./office.controller.js"

const router = Router()

router.post('/add-office', createOffice)
router.get('/:office_id', getOfficeById)
router.put('/:office_id', updateOffice)

export default router