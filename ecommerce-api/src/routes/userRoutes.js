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
  verifyEmail,
  resendEmailVerification           
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

// Добавьте middleware для логирования
router.use((req, res, next) => {
  console.log(`📍 USER ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  next();
});

// Email verification routes (БЕЗ protect middleware!)
router.get('/verify-email', (req, res, next) => {
  console.log('🎯 VERIFY EMAIL ROUTE HIT!');
  next();
}, verifyEmail);

router.post('/resend-verification', (req, res, next) => {
  console.log('🔄 RESEND VERIFICATION ROUTE HIT!');
  next();
}, resendEmailVerification);

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-password-reset', requestPasswordReset);  
router.post('/reset-password', resetPassword); 
router.get('/data-processing-terms', getDataProcessingTerms); 

// Email verification routes
//router.get('/verify-email', verifyEmail);
//router.post('/resend-verification', resendEmailVerification);


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