import express from 'express';
import upload from '../middleware/upload.js';
//import { isAdmin } from '../middleware/authMiddleware.js';
import { createStation, deleteStation, getAllStations, getStationById, getStationsByCity, updateStation } from '../controllers/railwayStationsController.js';

const router = express.Router();
// Public routes
router.get('/', getAllStations);
router.get('/:id', getStationById);
router.get('/by-city/:city', getStationsByCity);

// For ADMIN only
router.post('/', upload.single('photo'), createStation);

router.put('/:id', upload.single('photo'), updateStation);

router.delete('/:id', deleteStation);

export default router;