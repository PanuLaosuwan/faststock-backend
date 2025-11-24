import express from 'express';
import {
    getStockForBar,
    getAllStock,
    getStockForEvent,
    createStockInitial,
    patchStockEntry,
    deleteStockEntry
} from '../controllers/stockControllers.js';
import { validateStockInitial, validateStockPatch } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/stock', getAllStock);
router.get('/stock/bybid/:barId', getStockForBar);
router.get('/stock/byeid/:eid', getStockForEvent);

router.get('/bars/:barId/stock', getStockForBar);
router.post('/bars/:barId/add-stock', validateStockInitial, createStockInitial);
router.patch('/bars/:barId/stock/:pid/:sdate', validateStockPatch, patchStockEntry);
router.delete('/bars/:barId/stock/:pid/:sdate', deleteStockEntry);

// Alias path for patch stock with explicit product segment
router.patch('/stock/bar/:barId/product/:pid/:sdate', validateStockPatch, patchStockEntry);
router.patch('/update-stock/bar/:barId/product/:pid/:sdate', validateStockPatch, patchStockEntry);

export default router;
