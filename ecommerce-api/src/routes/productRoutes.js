import express from 'express';
import { createProduct, getProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

// Add new product
router.post('/add', createProduct);

// Get all products
router.get('/', getProducts);

// Get a product by ID
router.get('/:id', getProductById);

export default router;