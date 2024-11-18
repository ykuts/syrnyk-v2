import express from 'express';
import { uploadProducts, uploadStations } from '../middleware/upload.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Загрузка изображений продукта
router.post('/products', uploadProducts.array('images', 10), async (req, res) => {
    try {
        const files = req.files;
        const urls = files.map(file => `/uploads/products/${file.filename}`);
        
        res.json({
            message: 'Images uploaded successfully',
            urls: urls
        });
    } catch (error) {
        console.error('Error uploading product images:', error);
        res.status(500).json({
            message: 'Error uploading images',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Загрузка изображения станции
router.post('/stations', uploadStations.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Возвращаем путь без /uploads/
        const imageUrl = `/stations/${req.file.filename}`;
        
        res.json({
            message: 'Station image uploaded successfully',
            url: imageUrl
        });
    } catch (error) {
        console.error('Error uploading station image:', error);
        res.status(500).json({
            message: 'Error uploading image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Удаление изображения продукта
router.delete('/products/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(__dirname, '../../uploads/products', filename);
        
        await fs.unlink(filepath);
        
        res.json({
            message: 'Product image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product image:', error);
        res.status(500).json({
            message: 'Error deleting image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Удаление изображения станции
router.delete('/stations/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(__dirname, '../../uploads/stations', filename);
        
        await fs.unlink(filepath);
        
        res.json({
            message: 'Station image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting station image:', error);
        res.status(500).json({
            message: 'Error deleting image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;