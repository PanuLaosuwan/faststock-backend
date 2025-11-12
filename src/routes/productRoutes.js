import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, patchProduct } from '../controllers/productControllers.js';

const router = express.Router();

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id', patchProduct);
export default router;

