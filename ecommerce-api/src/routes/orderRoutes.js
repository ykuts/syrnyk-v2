import express from 'express';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  getAllOrders, 
  updatePaymentStatus,  
  updateOrderItem, 
  removeOrderItem, 
  addOrderItem, 
  updateOrderNotes, 
  getOrderById, 
  notifyOrderChanges,
  // NEW FUNCTIONS
  updateOrderSyncData,
  createSyncLog,
  getOrderWithSync,
  createOrderEnhanced,
  getOrderByDealId
} from '../controllers/orderController.js';

const router = express.Router();

// Base routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/all', getAllOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/notify-changes', notifyOrderChanges);

// Order status and payment routes
router.patch('/:orderId/status', updateOrderStatus);
router.patch('/:orderId/payment-status', updatePaymentStatus);
router.patch('/:orderId/notes', updateOrderNotes);

// Order items routes
router.put('/:orderId/items/:itemId', updateOrderItem);
router.delete('/:orderId/items/:itemId', removeOrderItem);
router.post('/:orderId/items', addOrderItem);

// CRM sync routes (for now without authentication, add internalApiAuth later)
router.patch('/:orderId/sync-data', updateOrderSyncData);
router.post('/:orderId/sync-log', createSyncLog);
router.get('/:orderId/sync', getOrderWithSync);
router.post('/enhanced', createOrderEnhanced);
router.get('/by-deal/:dealId', getOrderByDealId);

export default router;

