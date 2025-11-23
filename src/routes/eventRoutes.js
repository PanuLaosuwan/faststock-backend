import express from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, patchEvent, deleteEvent } from '../controllers/eventControllers.js';
import { validateEvent, validateEventPatch } from '../middlewares/inputValidator.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/event', authenticateToken, getAllEvents);
router.get('/event/:id', authenticateToken, getEventById);
router.post('/event', authenticateToken, validateEvent, createEvent);
router.put('/event/:id', authenticateToken, validateEvent, updateEvent);
router.patch('/event/:id', authenticateToken, validateEventPatch, patchEvent);
router.delete('/event/:id', authenticateToken, deleteEvent);

export default router;
