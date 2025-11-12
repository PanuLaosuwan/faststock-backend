import express from 'express';
import { getAllUsers, createUser, getUserById, updateUser, patchUser, deleteUser, loginUser } from '../controllers/userControllers.js';
import validateUser, { validateLogin, validateUserPatch } from '../middlewares/inputValidator.js';
const router = express.Router();

router.get('/user', getAllUsers);
router.get('/user/:id', getUserById);
router.post('/user', validateUser,createUser);
router.put('/user/:id', validateUser,updateUser);
router.patch('/user/:id', validateUserPatch, patchUser);
router.delete('/user/:id', deleteUser);
router.post('/auth/login', validateLogin, loginUser);

export default router;
