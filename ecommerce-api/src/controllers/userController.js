import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail
} from '../services/emailService.js';
import crypto from 'crypto';
import dataProcessingTermsTemplates from '../templates/dataProcessingTermsTemplates.js'; // Centralized storage for templates

const prisma = new PrismaClient();

// Validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length > 0;
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { firstName,
      lastName,
      email,
      password,
      phone,
      dataConsentAccepted,
      marketingConsent,
      preferredLanguage
    } = req.body;

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
        message: 'Password is required'
      });
    }

    // Check if data consent was accepted
    if (!dataConsentAccepted) {
      return res.status(400).json({
        message: 'You must accept the data processing terms to register'
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

    // Current version of the data processing agreement
    const currentConsentVersion = 'v1.0'; // Should be managed by configuration

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        dataConsentAccepted: true,
        dataConsentDate: new Date(),
        dataConsentVersion: currentConsentVersion,
        marketingConsent: marketingConsent || false,
        preferredLanguage: preferredLanguage || 'uk'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        role: true,
        dataConsentAccepted: true,
        dataConsentDate: true,
        marketingConsent: true, 
        preferredLanguage: true
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send welcome email
    await sendWelcomeEmail(user, user.preferredLanguage || 'uk');

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

// Add a new endpoint to get current data processing terms
export const getDataProcessingTerms = async (req, res) => {
  try {
    // Build the response with templates from our centralized storage
    const dataProcessingTerms = {
      version: 'v1.0',
      lastUpdated: '2025-03-01',
      content: dataProcessingTermsTemplates,
      supportedLanguages: Object.keys(dataProcessingTermsTemplates)
    };

    res.json(dataProcessingTerms);
  } catch (error) {
    console.error('Error fetching data processing terms:', error);
    res.status(500).json({
      message: 'Error retrieving data processing terms',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add a new endpoint for updating user consent
export const updateUserConsent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { dataConsentAccepted, marketingConsent } = req.body;

    // Current version of the data processing agreement
    const currentConsentVersion = 'v1.0'; // Should be managed by configuration

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dataConsentAccepted,
        dataConsentDate: new Date(),
        dataConsentVersion: currentConsentVersion,
        marketingConsent: marketingConsent || false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dataConsentAccepted: true,
        dataConsentDate: true,
        marketingConsent: true
      }
    });

    res.json({
      message: 'Consent settings updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({
      message: 'Error updating consent settings',
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
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        preferredLanguage: true
      }
    });
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
    const userLanguage = user.preferredLanguage || 'uk';
    await sendPasswordResetEmail(user, resetToken, userLanguage);

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
        message: 'Password is required'
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
        phone: true,
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

    console.log('Received delivery preferences:', deliveryPreferences); // Debug log

    // Prepare base update data
    const updateData = {
      firstName,
      lastName,
      phone,
    };

    // Add delivery preferences if provided
    if (deliveryPreferences) {
      updateData.preferredDeliveryType = deliveryPreferences.type;

      // Handle address delivery - store as JSON
      if (deliveryPreferences.type === 'ADDRESS' && deliveryPreferences.address) {
        updateData.deliveryAddress = deliveryPreferences.address;
      } else {
        // Clear address if not ADDRESS delivery type
        updateData.deliveryAddress = null;
      }

      // Handle railway station delivery - store as JSON
      if (deliveryPreferences.type === 'RAILWAY_STATION' && deliveryPreferences.stationId) {
        updateData.preferredStation = {
          id: parseInt(deliveryPreferences.stationId)
        };
      } else {
        // Clear station if not RAILWAY_STATION delivery type
        updateData.preferredStation = null;
      }

      // Handle pickup delivery - store as JSON
      if (deliveryPreferences.type === 'PICKUP' && deliveryPreferences.storeId) {
        updateData.preferredStore = {
          id: parseInt(deliveryPreferences.storeId)
        };
      } else {
        // Clear store if not PICKUP delivery type
        updateData.preferredStore = null;
      }
    }

    console.log('Prepared update data:', JSON.stringify(updateData, null, 2)); // Debug log

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

    console.log('Updated user:', updatedUser); // Debug log

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
        message: 'New password is required'
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

    const preferences = {
      type: user.preferredDeliveryType || 'PICKUP',
      address: user.deliveryAddress || null,
      stationId: user.preferredStation?.id || null,
      storeId: user.preferredStore?.id || null
    };

    console.log('Retrieved preferences:', preferences); // Debug log

    res.json({
      message: 'Delivery preferences retrieved successfully',
      preferences
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

    // Additional validation for address delivery to ensure canton is included
    if (type === 'ADDRESS' && address) {
      if (!address.canton || !['VD', 'GE'].includes(address.canton)) {
        return res.status(400).json({
          message: 'Canton is required for address delivery and must be either VD (Vaud) or GE (Geneva)'
        });
      }
    }

    // Prepare update data based on delivery type
    const updateData = {
      preferredDeliveryType: type,
      deliveryAddress: type === 'ADDRESS' ? {
        ...address,
        canton: address.canton || 'VD' // Ensure canton is always set for address delivery
      } : null,
      preferredStation: type === 'RAILWAY_STATION' && stationId ?
        { id: parseInt(stationId) } : null,
      preferredStore: type === 'PICKUP' && storeId ?
        { id: parseInt(storeId) } : null
    };

    console.log('Updating user delivery preferences:', updateData);

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

// Get user's delivery preferences
export const getDeliveryPreferences = async (req, res) => {
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

    // Ensure canton is included in address if it exists
    let address = user.deliveryAddress;
    if (address && typeof address === 'object' && !address.canton) {
      // Add default canton if missing from existing address
      address = {
        ...address,
        canton: 'VD' // Default to Vaud
      };
    }

    res.json({
      preferences: {
        type: user.preferredDeliveryType || 'PICKUP',
        address: address,
        stationId: user.preferredStation?.id,
        storeId: user.preferredStore?.id
      }
    });
  } catch (error) {
    console.error('Error getting delivery preferences:', error);
    res.status(500).json({
      message: 'Error retrieving delivery preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
