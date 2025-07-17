import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendEmailVerificationResend,
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
    const { 
      firstName,
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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Current version of the data processing agreement
    const currentConsentVersion = 'v1.0'; // Should be managed by configuration

    // Create user
    // Create user (unverified)
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
        preferredLanguage: preferredLanguage || 'uk',
        // Add email verification fields
        emailVerified: false,
        emailVerificationToken: verificationToken,
        verificationExpires: verificationExpires
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
        preferredLanguage: true,
        emailVerified: true
      },
    });

    // Send email verification instead of welcome email
    await sendEmailVerification(user, verificationToken, user.preferredLanguage || 'uk');

    // Don't generate JWT yet - user needs to verify email first
    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        ...user,
        requiresVerification: true
      }
      // No token here - user must verify email first
    });


    /* // Generate JWT
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
    }); */

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

// Add new controller functions for email verification

/**
 * Verify email with token
 */
export const verifyEmail = async (req, res) => {
  console.log('🚀 VERIFY EMAIL FUNCTION CALLED');
  console.log('Request URL:', req.originalUrl);
  console.log('Request query:', req.query);

  try {
    const { token } = req.query;

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ 
        message: 'Verification token is required' 
      });
    }

    console.log('🔍 Looking for user with token:', token);

     // СНАЧАЛА ищем неподтвержденного пользователя с этим токеном
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        verificationExpires: {
          gt: new Date() // Token not expired
        },
        emailVerified: false // Not already verified
      }
    });

    console.log('👤 Found unverified user:', user ? 'YES' : 'NO');

    if (user) {
      // Пользователь найден и ещё не подтвержден - подтверждаем
      console.log('✅ Updating user as verified');

      const verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null, // Очищаем токен
          verificationExpires: null
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          preferredLanguage: true,
          emailVerified: true
        }
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(verifiedUser, verifiedUser.preferredLanguage || 'uk');
        console.log('📧 Welcome email sent');
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { userId: verifiedUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Verification successful');

      return res.status(200).json({ 
        message: 'Email verified successfully!',
        user: verifiedUser,
        token: jwtToken
      });
    }

    // Если не нашли неподтвержденного пользователя, 
    // проверяем, может пользователь уже подтвержден
    console.log('🔍 Checking if user is already verified...');
    
    // Ищем пользователя, который мог быть подтвержден недавно
    // Проверяем по email, если токен недавно очищен
    const recentlyVerifiedUser = await prisma.user.findFirst({
      where: {
        emailVerified: true,
        // Ищем пользователей, подтвержденных в последние 5 минут
        updatedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 минут назад
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (recentlyVerifiedUser) {
      console.log('✅ Found recently verified user, assuming it was verified by this token');
      
      // Генерируем новый JWT токен
      const jwtToken = jwt.sign(
        { userId: recentlyVerifiedUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({ 
        message: 'Email is already verified!',
        user: {
          id: recentlyVerifiedUser.id,
          firstName: recentlyVerifiedUser.firstName,
          lastName: recentlyVerifiedUser.lastName,
          email: recentlyVerifiedUser.email,
          phone: recentlyVerifiedUser.phone,
          role: recentlyVerifiedUser.role,
          preferredLanguage: recentlyVerifiedUser.preferredLanguage,
          emailVerified: true
        },
        token: jwtToken
      });
    }

    console.log('❌ Invalid or expired token');
    return res.status(400).json({ 
      message: 'Invalid or expired verification token' 
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    return res.status(500).json({ 
      message: 'Error verifying email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Resend email verification
 */
export const resendEmailVerification = async (req, res) => {
  console.log('🔄 RESEND EMAIL VERIFICATION CALLED');

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Find unverified user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        verificationExpires: verificationExpires
      }
    });

    // Send new verification email
    await sendEmailVerificationResend(user, verificationToken, user.preferredLanguage || 'uk');

    res.json({ 
      message: 'Verification email sent successfully!' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      message: 'Error resending verification email',
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
        emailVerified: true,
        preferredLanguage: true
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Не вірні облікові дані' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
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
        password: false,
        role: true,
        preferredLanguage: true,
        preferredDeliveryType: true,
        deliveryAddress: true,
        preferredStation: true,
        preferredStore: true,
        dataConsentAccepted: true,
        dataConsentDate: true,
        marketingConsent: true,
        createdAt: true,
        updatedAt: true
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

// Update user profile with proper canton validation
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

      // Handle address delivery - store as JSON with canton validation
      if (deliveryPreferences.type === 'ADDRESS' && deliveryPreferences.address) {
        
        // Validate canton for address delivery
        const canton = deliveryPreferences.address.canton;
        if (!canton || !['VD', 'GE'].includes(canton)) {
          return res.status(400).json({
            message: 'Canton is required for address delivery and must be either VD (Vaud) or GE (Geneva)',
            error: 'INVALID_CANTON'
          });
        }

        // Validate required address fields
        const { street, house, city } = deliveryPreferences.address;
        if (!street || !house || !city) {
          return res.status(400).json({
            message: 'Street, house, and city are required for address delivery',
            error: 'MISSING_ADDRESS_FIELDS'
          });
        }

        // For Vaud canton, postal code is highly recommended for proper region detection
        if (canton === 'VD' && !deliveryPreferences.address.postalCode) {
          console.warn('Postal code missing for Vaud canton - this may affect delivery cost calculation');
        }

        // Store complete address with validated canton
        updateData.deliveryAddress = {
          street: street.trim(),
          house: house.trim(),
          apartment: deliveryPreferences.address.apartment?.trim() || '',
          city: city.trim(),
          postalCode: deliveryPreferences.address.postalCode?.trim() || '',
          canton: canton // Validated canton
        };


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
        message: 'Invalid delivery type',
        error: 'INVALID_DELIVERY_TYPE'
      });
    }

    // Additional validation for address delivery to ensure canton is included
    if (type === 'ADDRESS' && address) {
      if (!address.canton || !['VD', 'GE'].includes(address.canton)) {
        return res.status(400).json({
          message: 'Canton is required for address delivery and must be either VD (Vaud) or GE (Geneva)',
          error: 'INVALID_CANTON'
        });
      }

      // Validate required address fields
      if (!address.street || !address.house || !address.city) {
        return res.status(400).json({
          message: 'Street, house, and city are required for address delivery',
          error: 'MISSING_ADDRESS_FIELDS'
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

    // Process and validate delivery address
    let address = user.deliveryAddress;
    if (address && typeof address === 'object') {
      // Ensure canton is properly set and valid
      if (!address.canton || !['VD', 'GE'].includes(address.canton)) {
        console.warn('Invalid or missing canton in user delivery address:', address.canton);
        // Add default canton for backward compatibility
        address = {
          ...address,
          canton: 'VD' // Default to Vaud
        };
        
        // Optionally update the database to fix the data
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { deliveryAddress: address }
          });
          console.log('Updated user delivery address with default canton');
        } catch (updateError) {
          console.error('Error updating address with default canton:', updateError);
        }
      }
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
