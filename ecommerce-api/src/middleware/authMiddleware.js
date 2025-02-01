import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  try {
    console.log('Checking authentication...');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

 // Add user check
 const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
  select: { id: true, role: true }
});

if (!user) {
  console.log('User not found for token');
  return res.status(401).json({ message: 'User not found' });
}

    req.user = decoded; 
    console.log('Authentication successful');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
     });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    console.log('Checking admin privileges...');
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      console.log('User is not admin:', { userId: req.user.userId, role: user?.role });
      return res.status(403).json({ 
        message: 'Access denied. Admin rights required.' 
      });
    }

    console.log('Admin check passed');
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      message: 'Error checking admin rights' ,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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