import express from 'express';
import {
    getAllLost,
    getLostForBar,
    getLostForEvent,
    createLostEntry,
    patchLostEntry,
    deleteLostEntry
} from '../controllers/lostControllers.js';
import { validateLost, validateLostPatch } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/lost', getAllLost);
router.get('/lost/bybid/:bid', getLostForBar);
router.get('/lost/bybcode/:bcode', getLostForBar);
router.get('/lost/byeid/:eid', getLostForEvent);
router.get('/event/:eid/lost', getLostForEvent);
router.get('/bars/:bid/lost', getLostForBar);

router.post('/bars/:bid/add-lost', validateLost, createLostEntry);
router.patch('/bars/:bid/lost/:pid/:sdate', validateLostPatch, patchLostEntry);
router.delete('/bars/:bid/lost/:pid/:sdate', deleteLostEntry);

export default router;
