import express from 'express';
import {
    getAllPrestock,
    getPrestockForEvent,
    createPrestock,
    patchPrestockEntry,
    deletePrestockEntry
} from '../controllers/prestockControllers.js';
import { validatePrestock, validatePrestockPatch } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/prestock', getAllPrestock);
router.get('/prestock/byeid/:eid', getPrestockForEvent);
router.get('/event/:eid/prestock', getPrestockForEvent);
router.post('/prestock', validatePrestock, createPrestock);
router.patch('/prestock/:eid/:pid', validatePrestockPatch, patchPrestockEntry);
router.delete('/prestock/:eid/:pid', deletePrestockEntry);

export default router;
