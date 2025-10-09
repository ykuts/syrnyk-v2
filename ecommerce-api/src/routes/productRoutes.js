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

// CORS headers
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// ============================================
// PUBLIC ROUTES (with internal auth support)
// These support language parameter: ?lang=uk|en|fr|ru
// ============================================

// Get available languages - NO AUTH (metadata endpoint)
router.get('/languages', getAvailableLanguages);

// Get all products - supports both public and internal requests
router.get('/', internalAuth, getProducts);

// Get product by ID - supports both public and internal requests
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