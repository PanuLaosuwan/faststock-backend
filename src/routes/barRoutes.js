import express from 'express';
import {
    getAllBars,
    getBarsByUser,
    getBarsByEvent,
    getBarById,
    createBar,
    updateBar,
    patchBar,
    deleteBar
} from '../controllers/barControllers.js';
import { validateBar, validateBarPatch } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/bars', getAllBars);
router.get('/bars/byuid/:uid', getBarsByUser);
router.get('/bars/byeid/:eid', getBarsByEvent);
router.get('/bars/:bcode', getBarById);
router.post('/bars', validateBar, createBar);
router.put('/bars/:bcode', validateBar, updateBar);
router.patch('/bars/:bcode', validateBarPatch, patchBar);
router.delete('/bars/:bcode', deleteBar);

export default router;
