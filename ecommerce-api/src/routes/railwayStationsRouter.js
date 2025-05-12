import express from 'express';
import { 
    createStation, 
    deleteStation, 
    getAllStations, 
    getStationById, 
    getStationsByCity, 
    updateStation,
    getAvailableLanguages 
} from '../controllers/railwayStationsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllStations);
router.get('/languages', getAvailableLanguages);
router.get('/:id', getStationById);
router.get('/by-city/:city', getStationsByCity);

// Admin routes
router.post('/', createStation);
router.put('/:id', updateStation);
router.delete('/:id', deleteStation);

export default router;