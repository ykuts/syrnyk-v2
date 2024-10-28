import express from 'express';
import { addAddress, getAllAddresses } from '../controllers/addressController.js';

const router = express.Router();

// Маршрут для добавления нового адреса
router.post('/', addAddress);

// Маршрут для получения всех адресов
router.get('/', getAllAddresses);

export default router;
