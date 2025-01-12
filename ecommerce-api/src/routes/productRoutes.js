import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById,
  updateProduct,
  deleteProduct 
} from '../controllers/productController.js';

const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Add new product
router.post('/add', createProduct);

// Get all products
router.get('/', getProducts);

// Get a product by ID
router.get('/:id', getProductById);

// Update product
router.put('/:id', updateProduct);

// Delete product
router.delete('/:id', deleteProduct);

export default router;