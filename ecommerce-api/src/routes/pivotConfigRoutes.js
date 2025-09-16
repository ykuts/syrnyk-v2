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

// Apply authentication middleware first
router.use(protect, isAdmin);

// Add logging middleware AFTER authentication (so we have access to req.user)
router.use((req, res, next) => {
  console.log(`📊 PIVOT CONFIG ROUTE: ${req.method} ${req.originalUrl}`);
  console.log('User:', req.user?.email || req.user?.id || 'Unknown');
  console.log('User ID:', req.user?.id);
  console.log('User Role:', req.user?.role);
  next();
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    message: 'Pivot configuration routes are working!',
    timestamp: new Date().toISOString(),
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    }
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