import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed image formats
const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

// Storage for product images (folder: syrnyk/products)
const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'syrnyk/products',
        allowed_formats: allowedFormats,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
});

// Storage for station images (folder: syrnyk/stations)
const stationStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'syrnyk/stations',
        allowed_formats: allowedFormats,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
});

// File filter — allow only images
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format. Only JPEG, JPG, PNG and WebP are allowed.'), false);
    }
};

// Uploader for product images (up to 10 files)
const uploadProducts = multer({
    storage: productStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Uploader for station images (single file)
const uploadStations = multer({
    storage: stationStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Handle Multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Maximum size is 10MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files uploaded at once.' });
        }
        return res.status(400).json({ message: 'Error uploading file.' });
    }
    next(err);
};

export { uploadProducts, uploadStations, handleMulterError, cloudinary };