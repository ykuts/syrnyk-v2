import express from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductOrder,
  getAvailableLanguages,
} from '../controllers/productController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { internalAuth } from '../middleware/internalAuth.js';

const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// ============================================
// PUBLIC ROUTES (with optional internal auth)
// These support language parameter: ?lang=uk|en|fr|ru
// internalAuth is OPTIONAL - doesn't block public requests
// ============================================

// Get available languages - NO AUTH
router.get('/languages', getAvailableLanguages);

// Get all products - PUBLIC + optional internal auth
router.get('/', internalAuth, getProducts);

// Get product by ID - PUBLIC + optional internal auth
router.get('/:id', internalAuth, getProductById);

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================

// Create product - ADMIN ONLY
router.post('/', protect, isAdmin, createProduct);

// Update product order - ADMIN ONLY
router.post('/update-order', protect, isAdmin, updateProductOrder);

// Update product - ADMIN ONLY
router.put('/:id', protect, isAdmin, updateProduct);

// Delete product - ADMIN ONLY
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router;