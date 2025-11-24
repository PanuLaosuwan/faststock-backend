import express from 'express';
import {
    getStockForBar,
    getAllStock,
    getStockForEvent,
    createStockInitial,
    patchStockEntry
} from '../controllers/stockControllers.js';
import { validateStockInitial, validateStockPatch } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/stock', getAllStock);
router.get('/stock/bar/:barId', getStockForBar);
router.get('/stock/event/:eid', getStockForEvent);

router.get('/bars/:barId/stock', getStockForBar);
router.post('/bars/:barId/stock-initial', validateStockInitial, createStockInitial);
router.patch('/bars/:barId/stock/:pid/:sdate', validateStockPatch, patchStockEntry);

export default router;
