import express from 'express';
import {
    getAllBars,
    getBarById,
    createBar,
    updateBar,
    patchBar,
    deleteBar
} from '../controllers/barControllers.js';
import { validateBar, validateBarPatch } from '../middlewares/inputValidator.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/bars', authenticateToken, getAllBars);
router.get('/bars/:id', authenticateToken, getBarById);
router.post('/bars', authenticateToken, validateBar, createBar);
router.put('/bars/:id', authenticateToken, validateBar, updateBar);
router.patch('/bars/:id', authenticateToken, validateBarPatch, patchBar);
router.delete('/bars/:id', authenticateToken, deleteBar);

export default router;
