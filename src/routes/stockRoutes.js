import express from 'express';
import {
    getStockForBar,
    getAllStock,
    getStockForEvent,
    createStockInitial,
    patchStockEntry,
    deleteStockEntry,
    upsertStockBulk
} from '../controllers/stockControllers.js';
import { validateStockInitial, validateStockPatch, validateStockBulk } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/stock', getAllStock);
router.post('/stock/bulk', validateStockBulk, upsertStockBulk);
router.get('/stock/bybid/:bid', getStockForBar);
router.get('/stock/bybcode/:bcode', getStockForBar);
router.get('/stock/byeid/:eid', getStockForEvent);

router.get('/bars/:bid/stock', getStockForBar);
router.post('/bars/:bid/add-stock', validateStockInitial, createStockInitial);
router.patch('/bars/:bid/stock/:pid/:sdate', validateStockPatch, patchStockEntry);
router.delete('/bars/:bid/stock/:pid/:sdate', deleteStockEntry);

// Alias path for patch stock with explicit product segment
router.patch('/stock/bar/:bid/product/:pid/:sdate', validateStockPatch, patchStockEntry);
router.patch('/update-stock/bar/:bid/product/:pid/:sdate', validateStockPatch, patchStockEntry);

export default router;
