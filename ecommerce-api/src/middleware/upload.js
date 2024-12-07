import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for different file types
const createStorage = (folder) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join(__dirname, `../../uploads/${folder}`);
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });
};

// Check file type
const fileFilter = (req, file, cb) => {
    // Allowed Types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, JPG, PNG и WebP'), false);
    }
};

// Iploader for different file types
const uploadProducts = multer({
    storage: createStorage('products'),
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 2048 * 2048, // 10MB
        files: 10 // max files
    }
});

const uploadStations = multer({
    storage: createStorage('stations'),
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 2048 * 2048, // 10MB
        files: 1 // for stations only one file
    }
});

// Handle Multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Файл слишком большой. Максимальный размер - 10MB. Рекомендуется оптимизировать изображение.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Превышено максимальное количество файлов.'
            });
        }
        return res.status(400).json({
            message: 'Ошибка при загрузке файла.'
        });
    }
    next(err);
};

export { uploadProducts, uploadStations, handleMulterError };