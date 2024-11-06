import express from 'express';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import railwayStationsRouter from './routes/railwayStationsRouter.js'
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();


app.use(express.json()); // Middleware for parsing JSON

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем директорию uploads, если она не существует
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const stationsDir = path.join(uploadsDir, 'stations');
if (!fs.existsSync(stationsDir)) {
    fs.mkdirSync(stationsDir, { recursive: true });
}

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

// Set the server to listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});