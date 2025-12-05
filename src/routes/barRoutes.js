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
router.get('/bars/:bid', getBarById);
router.post('/bars', validateBar, createBar);
router.put('/bars/:bid', validateBar, updateBar);
router.patch('/bars/:bid', validateBarPatch, patchBar);
router.delete('/bars/:bid', deleteBar);

export default router;
