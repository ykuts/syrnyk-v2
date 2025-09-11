// ecommerce-api/src/routes/reportsRoutes.js
import express from 'express';
import {
  getOrdersReportData,
  getOrdersSummary
} from '../controllers/reportsController.js';

import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add middleware for logging
router.use((req, res, next) => {
  console.log(`📊 REPORTS ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  console.log('User:', req.user?.email || 'Not authenticated');
  next();
});

// All routes require admin access
router.use(protect, isAdmin);

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({
    message: 'Reports routes are working!',
    timestamp: new Date().toISOString(),
    user: req.user?.email
  });
});

// Get orders data for pivot table
router.get('/orders-data', getOrdersReportData);

// Get orders summary statistics
router.get('/orders-summary', getOrdersSummary);

// Future endpoints for other report types
// router.get('/products-data', getProductsReportData);
// router.get('/customers-data', getCustomersReportData);

export default router;