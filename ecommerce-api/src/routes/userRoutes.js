import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserOrders,
  getAllUsers,         
  updateUserStatus,
  requestPasswordReset,
  resetPassword              
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-password-reset', requestPasswordReset);  
router.post('/reset-password', resetPassword);     

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.get('/orders', protect, getUserOrders);

// Admin routes
router.get('/admin/users', protect, isAdmin, getAllUsers);
router.patch('/admin/users/:id/status', protect, isAdmin, updateUserStatus);

export default router;