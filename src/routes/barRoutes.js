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
router.get('/bars/user/:uid', getBarsByUser);
router.get('/bars/event/:eid', getBarsByEvent);
router.get('/bars/:id', getBarById);
router.post('/bars', validateBar, createBar);
router.put('/bars/:id', validateBar, updateBar);
router.patch('/bars/:id', validateBarPatch, patchBar);
router.delete('/bars/:id', deleteBar);

export default router;
