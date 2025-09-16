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
    user: req.user?.email,
    available_endpoints: [
      'GET /orders-data - Get detailed orders data for pivot analysis',
      'GET /orders-summary - Get summarized statistics',
      'GET /planning-data - Get planning-optimized data for future deliveries'
    ]
  });
});

// Get orders data for pivot table with planning support
// Supports both historical analysis and future planning
// Query parameters:
// - startDate, endDate: Filter by order creation date (historical)
// - deliveryStartDate, deliveryEndDate: Filter by delivery date (for planning)
// - status: Order status filter
// - deliveryType: Delivery type filter
router.get('/orders-data', getOrdersReportData);

// Get planning-specific data optimized for future deliveries
// Query parameters:
// - planningStartDate, planningEndDate: Planning period (defaults to next 4 weeks)
// - deliveryType: Filter by delivery type
router.get('/planning-data', getPlanningReportData);

// Get orders summary statistics with planning insights
// Query parameters:
// - period: Number of days for historical analysis (default: 30)
// - includeUnscheduled: Include orders without delivery dates
router.get('/orders-summary', getOrdersSummary);

router.get('/orders-data', getOrdersReportData);

// Future endpoints for other report types
// router.get('/products-data', getProductsReportData);
// router.get('/customers-data', getCustomersReportData);

export default router;