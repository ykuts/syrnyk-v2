import jwt from 'jsonwebtoken';

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
};