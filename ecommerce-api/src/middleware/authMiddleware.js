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
