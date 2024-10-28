import express from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// Create a new order
router.post('/', createOrder);

// Get all orders for a user
router.get('/', getOrders);

// Update the status of an order
router.put('/:id/status', updateOrderStatus);

export default router;

