import express from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, patchEvent, deleteEvent } from '../controllers/eventControllers.js';
import { validateEvent, validateEventPatch } from '../middlewares/inputValidator.js';

const router = express.Router();

router.get('/event', getAllEvents);
router.get('/event/:id', getEventById);
router.post('/event', validateEvent, createEvent);
router.put('/event/:id', validateEvent, updateEvent);
router.patch('/event/:id', validateEventPatch, patchEvent);
router.delete('/event/:id', deleteEvent);

export default router;
