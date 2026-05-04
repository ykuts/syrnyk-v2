// ecommerce-api/src/routes/deliveryRouteRoutes.js
import express from 'express';
import { getDeliveryRoutes, completeDelivery, getProductionReport } from '../controllers/deliveryRouteController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All routes require admin authentication
 */
router.use(protect);      
router.use(isAdmin);

/**
 * GET /api/admin/delivery-routes
 * Get orders for delivery route
 * Query params: date (required), canton (optional: VD, GE, or ALL)
 */
router.get('/delivery-routes', getDeliveryRoutes);

/**
 * GET /api/admin/production-report
 * Get production report - aggregated products for preparation
 * Query params: date (required), canton (optional), deliveryType (optional), status (optional)
 */
router.get('/production-report', getProductionReport);

/**
 * PATCH /api/admin/orders/:id/complete-delivery
 * Mark order as delivered
 */
router.patch('/orders/:id/complete-delivery', completeDelivery);

export default router;