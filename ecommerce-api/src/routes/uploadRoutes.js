import express from 'express';
import { uploadProducts, uploadStations, cloudinary } from '../middleware/upload.js';

const router = express.Router();

// Upload product images (up to 10 files)
router.post('/products', uploadProducts.array('images', 10), async (req, res) => {
    try {
        const files = req.files;

        // Cloudinary returns secure_url and public_id for each uploaded file
        const urls = files.map(file => file.path); // file.path = Cloudinary secure_url

        res.json({
            message: 'Images uploaded successfully',
            urls,
        });
    } catch (error) {
        console.error('Error uploading product images:', error);
        res.status(500).json({ message: 'Error uploading images' });
    }
});

// Upload station image (single file)
router.post('/stations', uploadStations.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            message: 'Station image uploaded successfully',
            url: req.file.path, // Cloudinary secure_url
        });
    } catch (error) {
        console.error('Error uploading station image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

// Delete product image by Cloudinary public_id
// public_id is extracted from the full Cloudinary URL on the frontend
router.delete('/products/:publicId(*)', async (req, res) => {
    try {
        const publicId = req.params.publicId; // e.g. "syrnyk/products/abc123"
        await cloudinary.uploader.destroy(publicId);

        res.json({ message: 'Product image deleted successfully' });
    } catch (error) {
        console.error('Error deleting product image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
});

// Delete station image by Cloudinary public_id
router.delete('/stations/:publicId(*)', async (req, res) => {
    try {
        const publicId = req.params.publicId; // e.g. "syrnyk/stations/abc123"
        await cloudinary.uploader.destroy(publicId);

        res.json({ message: 'Station image deleted successfully' });
    } catch (error) {
        console.error('Error deleting station image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
});

export default router;