import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter with configuration
const createTransporter = () => {
  return nodemailer.createTransport({
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

// Load and compile email template
const loadTemplate = async (templateName) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  const template = await fs.readFile(templatePath, 'utf-8');
  return handlebars.compile(template);
};

// Send email using template
const sendTemplatedEmail = async (to, subject, templateName, data) => {
  try {
    console.log('Starting email send process...');
    console.log('Template:', templateName);
    console.log('Sending to:', to);
    
    const transporter = createTransporter();
    console.log('Transporter created');
    
    const template = await loadTemplate(templateName);
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

// Specific email sending functions
export const sendWelcomeEmail = async (user) => {
  return sendTemplatedEmail(
    user.email,
    'Welcome to Syrnyk!',
    'welcome',
    {
      firstName: user.firstName,
    }
  );
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  return sendTemplatedEmail(
    user.email,
    'Password Reset Request',
    'password-reset',
    {
      firstName: user.firstName,
      resetUrl,
    }
  );
};

export const sendOrderConfirmation = async (order, user) => {
  return sendTemplatedEmail(
    user.email,
    `Order Confirmation #${order.id}`,
    'order-confirmation',
    {
      firstName: user.firstName,
      orderId: order.id,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryDetails: getDeliveryDetails(order),
    }
  );
};

export const sendOrderStatusUpdate = async (order, user) => {
  return sendTemplatedEmail(
    user.email,
    `Order #${order.id} Status Update`,
    'order-status-update',
    {
      firstName: user.firstName,
      orderId: order.id,
      status: order.status,
      deliveryDetails: getDeliveryDetails(order),
    }
  );
};

// Helper function to format delivery details based on type
const getDeliveryDetails = (order) => {
  switch (order.deliveryType) {
    case 'ADDRESS':
      return {
        type: 'Delivery to Address',
        details: `${order.addressDelivery.street}, ${order.addressDelivery.house}, 
                 ${order.addressDelivery.apartment || ''}, 
                 ${order.addressDelivery.city}, ${order.addressDelivery.postalCode}`
      };
    case 'RAILWAY_STATION':
      return {
        type: 'Railway Station Pickup',
        details: `Station: ${order.stationDelivery.station.name}, 
                 Meeting Point: ${order.stationDelivery.station.meetingPoint},
                 Time: ${new Date(order.stationDelivery.meetingTime).toLocaleString()}`
      };
    case 'PICKUP':
      return {
        type: 'Store Pickup',
        details: `Store: ${order.pickupDelivery.store.name}, 
                 Address: ${order.pickupDelivery.store.address},
                 Time: ${new Date(order.pickupDelivery.pickupTime).toLocaleString()}`
      };
    default:
      return { type: 'Unknown', details: '' };
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};