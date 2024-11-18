import express from 'express';
import { 
    createStation, 
    deleteStation, 
    getAllStations, 
    getStationById, 
    getStationsByCity, 
    updateStation 
} from '../controllers/railwayStationsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllStations);
router.get('/:id', getStationById);
router.get('/by-city/:city', getStationsByCity);

// Admin routes
router.post('/', createStation);
router.put('/:id', updateStation);
router.delete('/:id', deleteStation);

export default router;