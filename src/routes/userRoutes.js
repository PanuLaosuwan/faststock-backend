import express from 'express';
import {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    patchUser,
    deleteUser,
    loginUser,
    getCurrentUser
} from '../controllers/userControllers.js';
import validateUser, { validateLogin, validateUserPatch } from '../middlewares/inputValidator.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/user', getAllUsers);
router.get('/user/:id', getUserById);
router.post('/user', validateUser, createUser);
router.put('/user/:id', validateUser, updateUser);
router.patch('/user/:id', validateUserPatch, patchUser);
router.delete('/user/:id', deleteUser);
router.post('/auth/login', validateLogin, loginUser);
router.get('/auth/me', authenticateToken, getCurrentUser);

export default router;
