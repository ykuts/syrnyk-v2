import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserOrders
  } from '../controllers/userController.js';
  import { protect } from '../middleware/authMiddleware.js';
  
  const router = express.Router();
  
  // Public routes
  router.post('/register', registerUser);
  router.post('/login', loginUser);
  
  // Protected routes
  router.get('/profile', protect, getUserProfile);
  router.put('/profile', protect, updateUserProfile);
  router.put('/password', protect, changePassword);
  router.get('/orders', protect, getUserOrders);
  
  export default router;