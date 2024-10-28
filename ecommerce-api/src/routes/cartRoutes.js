import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';

const router = express.Router();

// Get user's cart
router.get('/', getCart);

// Add a product to the cart
router.post('/add', addToCart);

// Remove a product from the cart
router.delete('/remove/:id', removeFromCart);

export default router;
