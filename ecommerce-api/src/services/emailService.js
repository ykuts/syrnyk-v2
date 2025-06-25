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
  const deliveryDate = order.deliveryDate ? 
    formatDateForDisplay(order.deliveryDate, language) : 
    getTranslatedText(commonPhrases, language, 'notSpecified');
  const timeSlot = order.deliveryTimeSlot || '';
  
  const deliveryTypeText = getTranslatedText(deliveryTypes, language, order.deliveryType);
  
  switch (order.deliveryType) {
    case 'ADDRESS':
      const address = order.addressDelivery;
      if (!address) {
        return {
          type: deliveryTypeText,
          details: getTranslatedText(commonPhrases, language, 'addressNotSpecified'),
          date: deliveryDate,
          timeSlot: timeSlot ? `${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlot}` : ''
        };
      }
      
      const apartmentText = address.apartment ? 
        `, ${getTranslatedText(commonPhrases, language, 'apartment')}${address.apartment}` : '';
      
      return {
        type: deliveryTypeText,
        details: `${address.street}, ${address.house}${apartmentText}`,
        date: deliveryDate,
        timeSlot: timeSlot ? `${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlot}` : ''
      };
      
    case 'STATION':
      const station = order.stationDelivery;
      if (!station) {
        return {
          type: deliveryTypeText,
          details: getTranslatedText(commonPhrases, language, 'notSpecified'),
          date: deliveryDate,
          timeSlot: ''
        };
      }
      
      return {
        type: deliveryTypeText,
        station: station.station?.name || getTranslatedText(commonPhrases, language, 'notSpecified'),
        meetingPoint: station.meetingPoint || getTranslatedText(commonPhrases, language, 'notSpecified'),
        stationMeetingTime: station.stationMeetingTime || getTranslatedText(commonPhrases, language, 'notSpecified'),
        date: deliveryDate,
        timeSlot: timeSlot ? `${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlot}` : ''
      };
      
    case 'PICKUP':
      const pickup = order.pickupDelivery;
      if (!pickup || !pickup.store) {
        return {
          type: deliveryTypeText,
          details: getTranslatedText(commonPhrases, language, 'notSpecified'),
          date: deliveryDate,
          timeSlot: ''
        };
      }
      
      const pickupTime = pickup.pickupTime ? 
        formatDateForDisplay(pickup.pickupTime, language) : deliveryDate;
      
      return {
        type: deliveryTypeText,
        details: `${language === 'en' ? 'Store' : language === 'fr' ? 'Magasin' : 'Магазин'}: ${pickup.store.name}, ${language === 'en' ? 'Address' : language === 'fr' ? 'Adresse' : 'Адреса'}: ${pickup.store.address}`,
        date: pickupTime,
        timeSlot: timeSlot && !pickup.pickupTime ? `${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlot}` : ''
      };
      
    default:
      return { 
        type: getTranslatedText(commonPhrases, language, 'unknownDeliveryType'),
        details: '',
        date: deliveryDate,
        timeSlot: timeSlot ? `${getTranslatedText(commonPhrases, language, 'timeSlot')}: ${timeSlot}` : ''
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
      notesClient: order.notesClient
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
      customMessage
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
      notesClient: order.notesClient
    },
    'uk' // Admin emails always in Ukrainian
  );
};