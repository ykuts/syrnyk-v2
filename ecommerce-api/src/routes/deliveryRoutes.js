// src/routes/deliveryRoutes.js

import express from 'express';
import {
  getDeliveryZones,
  getDeliveryCityByPostalCode,
  getDeliveryTimeSlots,
  getPickupLocations,
  calculateDeliveryCost,
  getAvailableDeliveryDates,
} from '../controllers/deliveryController.js';

const router = express.Router();

// Get all delivery zones
router.get('/zones', getDeliveryZones);

// Get delivery city by postal code
router.get('/cities/:postalCode', getDeliveryCityByPostalCode);

// Get delivery time slots
router.get('/time-slots', getDeliveryTimeSlots);

// Get pickup locations
router.get('/pickup-locations', getPickupLocations);

// Calculate delivery cost
router.post('/calculate-cost', calculateDeliveryCost);

// Get available delivery dates
router.get('/available-dates', getAvailableDeliveryDates);

export default router;