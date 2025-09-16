// ecommerce-api/src/routes/pivotConfigRoutes.js
import express from 'express';
import {
  getPivotConfigurations,
  savePivotConfiguration,
  updatePivotConfiguration,
  deletePivotConfiguration,
  getDefaultConfiguration
} from '../controllers/pivotConfigController.js';

import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add middleware for logging
router.use((req, res, next) => {
  console.log(`📊 PIVOT CONFIG ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('User:', req.user?.email || 'Not authenticated');
  next();
});

// All routes require admin access (only admins can save pivot configurations)
router.use(protect, isAdmin);

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'Pivot configuration routes are working!',
    timestamp: new Date().toISOString(),
    user: req.user?.email
  });
});

// Get all configurations for current user
router.get('/', getPivotConfigurations);

// Get default configuration for current user
router.get('/default', getDefaultConfiguration);

// Save new configuration
router.post('/', savePivotConfiguration);

// Update existing configuration
router.put('/:id', updatePivotConfiguration);

// Delete configuration
router.delete('/:id', deletePivotConfiguration);

export default router;