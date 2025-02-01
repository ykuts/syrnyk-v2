import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail 
} from '../services/emailService.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'All required fields must be provided' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'Користувач з такою поштою вже зареєстрований' 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        role: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send welcome email
    await sendWelcomeEmail(user);

    res.status(201).json({ 
      message: 'User registered successfully',
      user,
      token 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token
    await prisma.token.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'RESET_PASSWORD',
        expiresAt: tokenExpiry
      }
    });

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    res.json({
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      message: 'Error processing password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find valid token
    const resetToken = await prisma.token.findFirst({
      where: {
        token,
        type: 'RESET_PASSWORD',
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.token.delete({
        where: { id: resetToken.id }
      })
    ]);

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Генерируем JWT
    const token = jwt.sign(
      { userId: user.id },  
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        password: false,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ 
      message: 'Error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      firstName, 
      lastName, 
      phone, 
      deliveryPreferences 
    } = req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      // Add delivery preferences if provided
      ...(deliveryPreferences && {
        preferredDeliveryType: deliveryPreferences.type,
        deliveryAddress: deliveryPreferences.type === 'ADDRESS' ? 
          deliveryPreferences.address : null,
        preferredStation: deliveryPreferences.type === 'RAILWAY_STATION' ? 
          { id: parseInt(deliveryPreferences.stationId) } : null,
        preferredStore: deliveryPreferences.type === 'PICKUP' ? 
          { id: parseInt(deliveryPreferences.storeId) } : null
      })
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        preferredDeliveryType: true,
        deliveryAddress: true,
        preferredStation: true,
        preferredStore: true
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long' 
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.user;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
        addressDelivery: true,
        stationDelivery: {
          include: {
            station: true,
          },
        },
        pickupDelivery: {
          include: {
            store: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      message: 'Orders retrieved successfully',
      orders,
    });
  } catch (error) {
    console.error('Orders retrieval error:', error);
    res.status(500).json({ 
      message: 'Error retrieving orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        preferredDeliveryType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return an array of users in an object
    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    console.log('Updating user status:', { id, isActive });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'User status updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserDeliveryPreferences = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredDeliveryType: true,
        deliveryAddress: true,
        preferredStation: true,
        preferredStore: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Delivery preferences retrieved successfully',
      preferences: {
        type: user.preferredDeliveryType,
        address: user.deliveryAddress,
        stationId: user.preferredStation?.id,
        storeId: user.preferredStore?.id
      }
    });
  } catch (error) {
    console.error('Error retrieving delivery preferences:', error);
    res.status(500).json({
      message: 'Error retrieving delivery preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user's delivery preferences
export const updateDeliveryPreferences = async (req, res) => {
  try {
    const { userId } = req.user;
    const { type, address, stationId, storeId } = req.body;

    // Validate input based on delivery type
    if (!type || !['PICKUP', 'ADDRESS', 'RAILWAY_STATION'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid delivery type'
      });
    }

    // Prepare update data based on delivery type
    const updateData = {
      preferredDeliveryType: type,
      deliveryAddress: type === 'ADDRESS' ? address : null,
      preferredStation: type === 'RAILWAY_STATION' && stationId ? 
        { id: parseInt(stationId) } : null,
      preferredStore: type === 'PICKUP' && storeId ? 
        { id: parseInt(storeId) } : null
    };

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        preferredDeliveryType: true,
        deliveryAddress: true,
        preferredStation: true,
        preferredStore: true
      }
    });

    res.json({
      message: 'Delivery preferences updated successfully',
      preferences: {
        type: updatedUser.preferredDeliveryType,
        address: updatedUser.deliveryAddress,
        stationId: updatedUser.preferredStation?.id,
        storeId: updatedUser.preferredStore?.id
      }
    });
  } catch (error) {
    console.error('Error updating delivery preferences:', error);
    res.status(500).json({
      message: 'Error updating delivery preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
