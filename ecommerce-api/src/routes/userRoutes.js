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
  resetPassword,
  getUserDeliveryPreferences,
  updateDeliveryPreferences,
  getDataProcessingTerms,
  updateUserConsent,              
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-password-reset', requestPasswordReset);  
router.post('/reset-password', resetPassword); 
router.get('/data-processing-terms', getDataProcessingTerms); 


// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);
router.get('/orders', protect, getUserOrders);
router.get('/delivery-preferences', protect, getUserDeliveryPreferences);
router.put('/delivery-preferences', protect, updateDeliveryPreferences);
router.put('/consent', protect, updateUserConsent); // Endpoint for updating consent
//router.get('/data-export', protect, getUserDataExport); // Endpoint for exporting user data
//router.post('/request-deletion', protect, requestAccountDeletion); // Endpoint for requesting account deletion

// Admin routes
router.get('/admin/users', protect, isAdmin, getAllUsers);
router.patch('/admin/users/:id/status', protect, isAdmin, updateUserStatus);

export default router;