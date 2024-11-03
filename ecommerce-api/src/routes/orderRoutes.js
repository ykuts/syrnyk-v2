import express from 'express';
import { createOrder, getOrders, updateOrderStatus, getAllOrders, 
    updatePaymentStatus,  updateOrderItem, removeOrderItem, addOrderItem} from '../controllers/orderController.js';

const router = express.Router();

// Create a new order
router.post('/', createOrder);

// Get all orders for a user
router.get('/', getOrders);

// Update the status of an order
//router.put('/:id/status', updateOrderStatus);

//Get all orders
router.get('/all', getAllOrders)

router.patch('/:orderId/status', updateOrderStatus);

router.patch('/:orderId/payment-status', updatePaymentStatus);

router.put('/orders/:orderId/items/:itemId', updateOrderItem);

router.delete('/orders/:orderId/items/:itemId', removeOrderItem);

router.post('/orders/:orderId/items', addOrderItem);

export default router;

