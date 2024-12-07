import express from 'express';
import { addAddress, getAllAddresses } from '../controllers/addressController.js';

const router = express.Router();

// Add new address
router.post('/', addAddress);

// Get all addresses
router.get('/', getAllAddresses);

export default router;
