import express from 'express';
import { 
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected by middleware protect and isAdmin
router.use(protect, isAdmin);

router.get('/orders', getAllOrders);
router.put('/orders/:orderId', updateOrderStatus);
router.get('/users', getAllUsers);

export default router;