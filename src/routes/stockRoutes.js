import express from 'express';
import { getStockForBar, createStockInitial, patchStockEntry } from '../controllers/stockControllers.js';
import { validateStockInitial, validateStockPatch } from '../middlewares/inputValidator.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/bars/:barId/stock', authenticateToken, getStockForBar);
router.post('/bars/:barId/stock-initial', authenticateToken, validateStockInitial, createStockInitial);
router.patch('/bars/:barId/stock/:pid/:sdate', authenticateToken, validateStockPatch, patchStockEntry);

export default router;
