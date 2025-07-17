// Updated emailService.js with multilingual support
// Path: ecommerce-api/src/services/emailService.js

import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import {
  emailSubjects,
  deliveryTypes,
  paymentMethods,
  orderStatuses,
  commonPhrases,
  getTranslatedText,
  formatSubject
} from '../constants/emailTranslations.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter with configuration
const createTransporter = () => {
  return nodemailer.createTransport({ // Fixed: changed from createTransporter to createTransport
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    }
  });
};

// Load template with language support
const loadTemplate = async (templateName, language = 'uk') => {
  // For admin templates, use the root directory (no language subfolder)
  if (templateName.includes('admin')) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      return handlebars.compile(template);
    } catch (error) {
      console.error(`Admin template ${templateName} not found:`, error);
      throw error;
    }
  }

  // For user templates, use language-specific folders
  const templatePath = path.join(__dirname, '../templates/emails', language, `${templateName}.hbs`);

  try {
    const template = await fs.readFile(templatePath, 'utf-8');
    return handlebars.compile(template);
  } catch (error) {
    // Fallback to Ukrainian if template not found for requested language
    console.warn(`Template ${templateName} not found for language ${language}, falling back to Ukrainian`);
    try {
      const fallbackPath = path.join(__dirname, '../templates/emails/uk', `${templateName}.hbs`);
      const template = await fs.readFile(fallbackPath, 'utf-8');
      return handlebars.compile(template);
    } catch (fallbackError) {
      console.error(`Fallback template ${templateName} not found:`, fallbackError);
      throw fallbackError;
    }
  }
};

// Send email using template with language support
const sendTemplatedEmail = async (to, subject, templateName, data, language = 'uk') => {
  try {
    console.log('Starting email send process...');
    console.log('Template:', templateName, 'Language:', language);
    console.log('Sending to:', to);

    const transporter = createTransporter();
    console.log('Transporter created');

    const template = await loadTemplate(templateName, language);
    console.log('Template loaded');

    const html = template(data);
    console.log('HTML generated');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };
    console.log('Mail options prepared:', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Detailed error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to format date for display with language support
const formatDateForDisplay = (dateValue, language = 'uk') => {
  if (!dateValue) return getTranslatedText(commonPhrases, language, 'notSpecified');

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return getTranslatedText(commonPhrases, language, 'invalidDate');

    return format(date, 'dd.MM.yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return getTranslatedText(commonPhrases, language, 'dateFormatError');
  }
};

// Helper function to format delivery details with language support
const getDeliveryDetails = (order, language = 'uk') => {
  console.log('Processing delivery details for order:', order.id, 'Language:', language);
  console.log('Order delivery fields:', {
    deliveryType: order.deliveryType,
    deliveryDate: order.deliveryDate,
    deliveryTimeSlot: order.deliveryTimeSlot,
    addressDelivery: order.addressDelivery,
    stationDelivery: order.stationDelivery,
    pickupDelivery: order.pickupDelivery
  });

  // Check if stationDelivery exists and has station data
  if (order.deliveryType === 'RAILWAY_STATION') {
    console.log('RAILWAY_STATION order analysis:', {
      hasStationDelivery: !!order.stationDelivery,
      stationDeliveryId: order.stationDelivery?.id,
      stationId: order.stationDelivery?.stationId,
      hasStationData: !!order.stationDelivery?.station,
      stationName: order.stationDelivery?.station?.city,
      meetingPoint: order.stationDelivery?.station?.meetingPoint,
      meetingTime: order.stationDelivery?.station?.name
    });
  }

  // Format delivery date
  const deliveryDate = order.deliveryDate ? 
    formatDateForDisplay(order.deliveryDate, language) : 
    getTranslatedText(commonPhrases, language, 'notSpecified');

  // Format time slot with proper translation
  const formatTimeSlot = (timeSlot, language) => {
    if (!timeSlot) return '';
    
    // Define time slot mappings for different languages
    const timeSlotTexts = {
      uk: { 
        'morning': 'Ранок',
        'evening': 'Вечір',
        'day': 'День',
        '09:00-13:00': 'Ранок (09:00 - 13:00)',
        '13:00-17:00': 'День (13:00 - 17:00)', 
        '17:00-20:00': 'Вечір (17:00 - 20:00)'
      },
      en: { 
        'morning': 'Morning',
        'evening': 'Evening',
        'day': 'Day',
        '09:00-13:00': 'Morning (09:00 - 13:00)',
        '13:00-17:00': 'Day (13:00 - 17:00)',
        '17:00-20:00': 'Evening (17:00 - 20:00)'
      },
      fr: { 
        'morning': 'Matin',
        'evening': 'Soir',
        'day': 'Jour',
        '09:00-13:00': 'Matin (09:00 - 13:00)',
        '13:00-17:00': 'Jour (13:00 - 17:00)',
        '17:00-20:00': 'Soir (17:00 - 20:00)'
      }
    };
    
    const texts = timeSlotTexts[language] || timeSlotTexts.uk;
    
    // Check if we have a translation for this time slot
    if (texts[timeSlot]) {
      return texts[timeSlot];
    }
    
    // If no translation found, return as is
    return timeSlot;
  };

  const timeSlotFormatted = order.deliveryTimeSlot ? 
    formatTimeSlot(order.deliveryTimeSlot, language) : '';

  console.log('Formatted time slot:', timeSlotFormatted, 'from original:', order.deliveryTimeSlot);

  // Get delivery type text
  const deliveryTypeText = getTranslatedText(deliveryTypes, language, order.deliveryType);
  
  switch (order.deliveryType) {
    case 'ADDRESS':
      // For ADDRESS delivery: show date but NO time slot (as per your requirement)
      const address = order.addressDelivery;
      if (!address) {
        return {
          type: deliveryTypeText,
          details: getTranslatedText(commonPhrases, language, 'addressNotSpecified'),
          date: deliveryDate,
          timeSlot: '', // No time slot for address delivery
          fullDetails: `${deliveryTypeText}\n${getTranslatedText(commonPhrases, language, 'addressNotSpecified')}\n${getTranslatedText(commonPhrases, language, 'deliveryDate')}: ${deliveryDate}`
        };
      }
      
      // Build address string
      const addressParts = [];
      if (address.street) addressParts.push(address.street);
      if (address.house) addressParts.push(address.house);
      if (address.apartment) {
        const aptText = getTranslatedText(commonPhrases, language, 'apartment');
        addressParts.push(`${aptText} ${address.apartment}`);
      }
      if (address.city) addressParts.push(address.city);
      if (address.postalCode) addressParts.push(address.postalCode);
      
      const fullAddress = addressParts.join(', ');
      
      return {
        type: deliveryTypeText,
        details: fullAddress,
        address: fullAddress,
        date: deliveryDate,
        timeSlot: '', // No time slot for address delivery
        rawTimeSlot: order.deliveryTimeSlot,
        fullDetails: `${deliveryTypeText}\n${getTranslatedText(commonPhrases, language, 'address')}: ${fullAddress}\n${getTranslatedText(commonPhrases, language, 'deliveryDate')}: ${deliveryDate}`
      };
      
    case 'STATION':
    case 'RAILWAY_STATION': // Add support for RAILWAY_STATION
      // For STATION delivery: show date and time slot
      const station = order.stationDelivery;
      if (!station) {
        return {
          type: deliveryTypeText,
          details: getTranslatedText(commonPhrases, language, 'notSpecified'),
          date: deliveryDate,
          timeSlot: timeSlotFormatted,
          station: getTranslatedText(commonPhrases, language, 'notSpecified'),
          meetingPoint: getTranslatedText(commonPhrases, language, 'notSpecified'),
          fullDetails: `${deliveryTypeText}\n${getTranslatedText(commonPhrases, language, 'notSpecified')}`
        };
      }
      
      const stationName = station.station?.city || getTranslatedText(commonPhrases, language, 'notSpecified');
      const meetingPoint = station.station?.meetingPoint || getTranslatedText(commonPhrases, language, 'notSpecified'); // Fixed: use station.station.meetingPoint
      const stationMeetingTime = station.station?.name; // Fixed: use station.station.name for meeting time
      //station.meetingTime ? formatDateForDisplay(station.meetingTime, language) : getTranslatedText(commonPhrases, language, 'notSpecified'); // Fixed: use station.meetingTime
      
      console.log('Station data extraction:', {
        stationName: station.station?.city,
        meetingPointFromStation: station.station?.meetingPoint,
        meetingTimeFromStationDelivery: station.meetingTime,
        finalMeetingPoint: meetingPoint,
        finalStationMeetingTime: stationMeetingTime
      });
      
      // Build station details string
      const stationTexts = {
        uk: { station: 'Станція', meetingPoint: 'Місце зустрічі', meetingTime: 'Час зустрічі' },
        en: { station: 'Station', meetingPoint: 'Meeting point', meetingTime: 'Meeting time' },
        fr: { station: 'Gare', meetingPoint: 'Point de rencontre', meetingTime: 'Heure de rendez-vous' }
      };
      const stTexts = stationTexts[language] || stationTexts.uk;
      
      console.log('STATION/RAILWAY_STATION delivery details:', {
        type: deliveryTypeText,
        station: stationName,
        meetingPoint: meetingPoint,
        stationMeetingTime: stationMeetingTime,
        date: deliveryDate,
        timeSlot: timeSlotFormatted
      });
      
      return {
        type: deliveryTypeText,
        details: `${stTexts.station}: ${stationName}`,
        station: stationName,
        meetingPoint: meetingPoint,
        stationMeetingTime: stationMeetingTime,
        date: deliveryDate,
        timeSlot: timeSlotFormatted,
        rawTimeSlot: order.deliveryTimeSlot,
        fullDetails: `${deliveryTypeText}\n${stTexts.station}: ${stationName}\n${stTexts.meetingPoint}: ${meetingPoint}\n${stTexts.meetingTime}: ${stationMeetingTime}\n${getTranslatedText(commonPhrases, language, 'deliveryDate')}: ${deliveryDate}${timeSlotFormatted ? `\n${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlotFormatted}` : ''}`
      };
      
    case 'PICKUP':
      // For PICKUP delivery: show date and time slot (as per your requirement)
      const pickup = order.pickupDelivery;
      if (!pickup || !pickup.store) {
        return {
          type: deliveryTypeText,
          details: getTranslatedText(commonPhrases, language, 'notSpecified'),
          date: deliveryDate,
          timeSlot: timeSlotFormatted, // Show time slot for pickup
          fullDetails: `${deliveryTypeText}\n${getTranslatedText(commonPhrases, language, 'notSpecified')}`
        };
      }
      
      // Use pickup time if specified, otherwise use delivery date
      const pickupTime = pickup.pickupTime ? 
        formatDateForDisplay(pickup.pickupTime, language) : deliveryDate;
      
      const storeTexts = {
        uk: { store: 'Магазин', address: 'Адреса', pickupTime: 'Час отримання' },
        en: { store: 'Store', address: 'Address', pickupTime: 'Pickup time' },
        fr: { store: 'Magasin', address: 'Adresse', pickupTime: 'Heure de retrait' }
      };
      const pickupTexts = storeTexts[language] || storeTexts.uk;
      
      const storeDetails = `${pickupTexts.store}: ${pickup.store.name}, ${pickupTexts.address}: ${pickup.store.address}`;
      
      console.log('PICKUP delivery details:', {
        type: deliveryTypeText,
        details: storeDetails,
        date: pickupTime,
        timeSlot: timeSlotFormatted,
        rawTimeSlot: order.deliveryTimeSlot
      });
      
      return {
        type: deliveryTypeText,
        details: storeDetails,
        date: pickupTime,
        timeSlot: timeSlotFormatted, // Always show time slot for pickup
        rawTimeSlot: order.deliveryTimeSlot,
        fullDetails: `${deliveryTypeText}\n${storeDetails}\n${pickupTexts.pickupTime}: ${pickupTime}${timeSlotFormatted ? `\n${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlotFormatted}` : ''}`
      };
      
    default:
      console.warn('Unknown delivery type:', order.deliveryType);
      return { 
        type: order.deliveryType || getTranslatedText(commonPhrases, language, 'unknownDeliveryType'),
        details: getTranslatedText(commonPhrases, language, 'notSpecified'),
        date: deliveryDate,
        timeSlot: timeSlotFormatted,
        fullDetails: `${order.deliveryType || getTranslatedText(commonPhrases, language, 'unknownDeliveryType')}\n${getTranslatedText(commonPhrases, language, 'notSpecified')}`
      };
  }
};


// Helper function to get payment method with language support
const getPaymentMethod = (order, language = 'uk') => {
  return getTranslatedText(paymentMethods, language, order.paymentMethod);
};

// Helper function to get order status with language support
const getOrderStatus = (order, language = 'uk') => {
  return getTranslatedText(orderStatuses, language, order.status);
};

// Email sending functions with language support

export const sendWelcomeEmail = async (user, language = 'uk') => {
  const subject = emailSubjects.welcome[language] || emailSubjects.welcome.uk;

  return sendTemplatedEmail(
    user.email,
    subject,
    'welcome',
    {
      firstName: user.firstName,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    language
  );
};

export const sendPasswordResetEmail = async (user, resetToken, language = 'uk') => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const subject = emailSubjects.passwordReset[language] || emailSubjects.passwordReset.uk;

  return sendTemplatedEmail(
    user.email,
    subject,
    'password-reset',
    {
      firstName: user.firstName,
      resetUrl,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    language
  );
};

export const sendOrderConfirmation = async (order, user, language = 'uk') => {
  const subjectTemplate = emailSubjects.orderConfirmation[language] || emailSubjects.orderConfirmation.uk;
  const subject = formatSubject(subjectTemplate, { orderId: order.id });

  return sendTemplatedEmail(
    user.email,
    subject,
    'order-confirmation-client',
    {
      firstName: user.firstName,
      orderId: order.id,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryDetails: getDeliveryDetails(order, language),
      paymentMethod: getPaymentMethod(order, language),
      notesClient: order.notesClient,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    language
  );
};

export const sendOrderStatusUpdate = async (order, user, language = 'uk', customMessage = null) => {
  const subjectTemplate = emailSubjects.orderStatusUpdate[language] || emailSubjects.orderStatusUpdate.uk;
  const subject = formatSubject(subjectTemplate, { orderId: order.id });

  return sendTemplatedEmail(
    user.email,
    subject,
    'order-status-update',
    {
      firstName: user.firstName,
      orderId: order.id,
      status: getOrderStatus(order, language),
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryDetails: getDeliveryDetails(order, language),
      customMessage,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    language
  );
};

export const sendModifiedOrderConfirmation = async (order, recipient, language = 'uk') => {
  const subjectTemplate = emailSubjects.orderModified[language] || emailSubjects.orderModified.uk;
  const subject = formatSubject(subjectTemplate, { orderId: order.id });

  return sendTemplatedEmail(
    recipient.email,
    subject,
    'order-modified-confirmation',
    {
      orderId: order.id,
      firstName: recipient.firstName,
      totalAmount: order.totalAmount,
      items: order.items,
      deliveryDetails: getDeliveryDetails(order, language),
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    language
  );
};

// Admin emails (still in Ukrainian)
export const sendNewOrderAdminEmail = async (order, customer) => {
  return sendTemplatedEmail(
    process.env.ADMIN_EMAIL,
    `Нове замовлення #${order.id}`,
    'new-order-admin',
    {
      orderId: order.id,
      customer,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryDetails: getDeliveryDetails(order, 'uk'), // Admin emails in Ukrainian
      paymentMethod: getPaymentMethod(order, 'uk'),
      notesClient: order.notesClient,
      notesAdmin: order.notesAdmin,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    'uk' // Admin emails always in Ukrainian
  );
};

/**
 * Send email verification email
 * @param {Object} user - User object with email, firstName, etc.
 * @param {string} verificationToken - Generated verification token
 * @param {string} language - User's preferred language (uk, en, fr)
 */
export const sendEmailVerification = async (user, verificationToken, language = 'uk') => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  // Use existing email subjects structure
  const subjectTemplate = emailSubjects.emailVerification?.[language] || 
                         emailSubjects.emailVerification?.uk || 
                         'Підтвердження електронної пошти';
  
  const subject = formatSubject(subjectTemplate, { email: user.email });

  return sendTemplatedEmail(
    user.email,
    subject,
    'email-verification',
    {
      firstName: user.firstName,
      verificationUrl,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    language
  );
};

/**
 * Send email verification resend
 * @param {Object} user - User object
 * @param {string} verificationToken - New verification token
 * @param {string} language - User's preferred language
 */
export const sendEmailVerificationResend = async (user, verificationToken, language = 'uk') => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const subjectTemplate = emailSubjects.emailVerificationResend?.[language] || 
                         emailSubjects.emailVerificationResend?.uk || 
                         'Повторне підтвердження електронної пошти';
  
  const subject = formatSubject(subjectTemplate, { email: user.email });

  return sendTemplatedEmail(
    user.email,
    subject,
    'email-verification-resend',
    {
      firstName: user.firstName,
      verificationUrl,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3002'
    },
    language
  );
};