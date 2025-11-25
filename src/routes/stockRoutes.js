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
router.get('/stock/bybcode/:bcode', getStockForBar);
router.get('/stock/bybid/:barId', getStockForBar); // legacy alias, expects bcode value
router.get('/stock/byeid/:eid', getStockForEvent);

router.get('/bars/:barId/stock', getStockForBar); // backward compatibility (barId as code)
router.get('/bars/:bcode/stock', getStockForBar);
router.post('/bars/:barId/add-stock', validateStockInitial, createStockInitial);
router.post('/bars/:bcode/add-stock', validateStockInitial, createStockInitial);
router.patch('/bars/:barId/stock/:pid/:sdate', validateStockPatch, patchStockEntry);
router.patch('/bars/:bcode/stock/:pid/:sdate', validateStockPatch, patchStockEntry);
router.delete('/bars/:barId/stock/:pid/:sdate', deleteStockEntry);
router.delete('/bars/:bcode/stock/:pid/:sdate', deleteStockEntry);

// Alias path for patch stock with explicit product segment
router.patch('/stock/bar/:barId/product/:pid/:sdate', validateStockPatch, patchStockEntry);
router.patch('/stock/bar/:bcode/product/:pid/:sdate', validateStockPatch, patchStockEntry);
router.patch('/update-stock/bar/:barId/product/:pid/:sdate', validateStockPatch, patchStockEntry);
router.patch('/update-stock/bar/:bcode/product/:pid/:sdate', validateStockPatch, patchStockEntry);

export default router;
