import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // здесь должен быть { userId: number }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Access denied. Admin rights required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      message: 'Error checking admin rights' 
    });
  }
};

/* import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Ожидаем заголовок "Authorization: Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // добавляем информацию о пользователе в req для последующих маршрутов
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


export const isAdmin = (req, res, next) => {
  // Предполагается, что информация о пользователе добавляется в req после аутентификации
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin rights required.' });
  }
  next();
}; */