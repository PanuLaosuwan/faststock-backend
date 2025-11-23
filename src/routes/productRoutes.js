import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, patchProduct } from '../controllers/productControllers.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/products', authenticateToken, getAllProducts);
router.get('/products/:id', authenticateToken, getProductById);
router.post('/products', authenticateToken, createProduct);
router.put('/products/:id', authenticateToken, updateProduct);
router.delete('/products/:id', authenticateToken, deleteProduct);
router.patch('/products/:id', authenticateToken, patchProduct);
export default router;
