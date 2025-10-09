// ecommerce-api/src/middleware/authMiddleware.js
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

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'User not found' });
    }

    // Set req.user with consistent structure
    // Make sure both id and userId are available for backwards compatibility
    req.user = {
      id: decoded.userId,        // Add this for controllers expecting req.user.id
      userId: decoded.userId,    // Keep this for existing code
      email: decoded.email,
      role: user.role,
      ...decoded  // Include other JWT payload properties
    };
    
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
    
    // Use req.user.id (which is now set by protect middleware)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      console.log('User is not admin:', { userId: req.user.id, role: user?.role });
      return res.status(403).json({ 
        message: 'Access denied. Admin rights required.' 
      });
    }

    console.log('Admin check passed');
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      message: 'Error checking admin rights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};