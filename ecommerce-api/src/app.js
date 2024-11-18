import express from 'express';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import railwayStationsRouter from './routes/railwayStationsRouter.js';
import uploadRoutes from './routes/uploadRoutes.js';  // Добавляем импорт роутов загрузки
import { handleMulterError } from './middleware/upload.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();

app.use(express.json()); // Middleware for parsing JSON

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем директории для загрузок
const uploadsDir = path.join(__dirname, '../uploads');
const stationsDir = path.join(uploadsDir, 'stations');
const productsDir = path.join(uploadsDir, 'products'); // Добавляем директорию для продуктов

// Создаем все необходимые директории
[uploadsDir, stationsDir, productsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Настраиваем статические файлы
app.use('/uploads', express.static(uploadsDir));

// Добавляем middleware для логирования запросов к файлам
app.use('/uploads', (req, res, next) => {
    console.log('Requesting file:', req.url);
    next();
});

// CORS to allow requests from localhost:3000
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/railway-stations', railwayStationsRouter);
app.use('/api/upload', uploadRoutes); // Добавляем роуты для загрузки файлов

app.use(handleMulterError);

// Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
      message: process.env.NODE_ENV === 'development' 
          ? err.message 
          : 'Произошла ошибка при обработке запроса',
      error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({
      message: 'Маршрут не найден'
  });
});

// Set the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Upload directories initialized:
    - Main uploads: ${uploadsDir}
    - Stations: ${stationsDir}
    - Products: ${productsDir}`);
});