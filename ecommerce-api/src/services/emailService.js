import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';


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

// Helper function to format date for display
const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return 'Не вказано';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Некоректна дата';
    
    return format(date, 'dd.MM.yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Помилка форматування дати';
  }
};

// Helper function to format delivery details based on type with date and time
const getDeliveryDetails = (order) => {
  const deliveryDate = order.deliveryDate ? formatDateForDisplay(order.deliveryDate) : 'Не вказано';
  const timeSlot = order.deliveryTimeSlot || '';
  
  switch (order.deliveryType) {
    case 'ADDRESS':
      const address = order.addressDelivery;
      if (!address) {
        return {
          type: 'Доставка за адресою',
          details: 'Адреса не вказана'
        };
      }
      
      return {
        type: 'Доставка за адресою',
        details: `${address.street}, ${address.house}${
          address.apartment ? `, кв. ${address.apartment}` : ''
        }, ${address.city}, ${address.postalCode}`,
        date: deliveryDate,
        timeSlot: timeSlot ? `Часовий слот: ${timeSlot}` : 'Часовий слот не вказано'
      };
      
    case 'RAILWAY_STATION':
      const station = order.stationDelivery;
      if (!station) {
        return {
          type: 'Доставка на залізничну станцію',
          details: 'Станція не вказана'
        };
      }
      
      // For railway station, use meeting time if available, otherwise use delivery date
      const meetingTime = station.meetingTime 
        ? formatDateForDisplay(station.meetingTime)
        : deliveryDate;
      
      return {
        type: 'Доставка на залізничну станцію',
        details: `Станція: ${station.station.name}, Місце зустрічі: ${station.station.meetingPoint}`,
        date: meetingTime
      };
      
    case 'PICKUP':
      const pickup = order.pickupDelivery;
      if (!pickup) {
        return {
          type: 'Самовивіз',
          details: 'Магазин не вказано'
        };
      }
      
      // For pickup, use pickup time if available, otherwise use delivery date + time slot
      const pickupTime = pickup.pickupTime 
        ? formatDateForDisplay(pickup.pickupTime)
        : deliveryDate;
      
      return {
        type: 'Самовивіз',
        details: `Магазин: ${pickup.store.name}, Адреса: ${pickup.store.address}`,
        date: pickupTime,
        timeSlot: timeSlot && !pickup.pickupTime ? `Часовий слот: ${timeSlot}` : ''
      };
      
    default:
      return { 
        type: 'Невідомий тип доставки', 
        details: '',
        date: deliveryDate,
        timeSlot: timeSlot ? `Часовий слот: ${timeSlot}` : ''
      };
  }
};

// Helper function to get payment method in Ukrainian
const getPaymentMethod = (order) => {
  switch (order.paymentMethod) {
    case 'CASH':
      return 'Готівка';
    case 'CARD':
      return 'Картка';
    case 'TWINT':
      return 'TWINT';
    case 'BANK_TRANSFER':
      return 'Банківський переказ';
    default:
      return 'Не вказано';
  }
};

// Helper function to get order status in Ukrainian
const getOrderStatus = (order) => {
  switch (order.status) {
    case 'PENDING':
      return 'В обробці';
    case 'CONFIRMED':
      return 'Підтверджено';
    case 'DELIVERED':
      return 'Доставлено';
    case 'CANCELLED':
      return 'Відмінено';
    default:
      return 'Невідомий статус';
  }
};

// Specific email sending functions
export const sendWelcomeEmail = async (user) => {
  return sendTemplatedEmail(
    user.email,
    'Ласкаво посимо до Syrnyk!',
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
      status: getOrderStatus(order),
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryDetails: getDeliveryDetails(order),
    }
  );
};

export const sendModifiedOrderConfirmation = async (order, recipient) => {
  return sendTemplatedEmail(
    recipient.email,
    `Order #${order.id} Modified and Confirmed`,
    'order-modified-confirmation',
    {
      orderId: order.id,
      firstName: recipient.firstName,
      totalAmount: order.totalAmount,
      items: order.items,
      deliveryDetails: getDeliveryDetails(order),
      changes: order.changes || [], // Array of changes made to the order
      paymentMethod: getPaymentMethod(order)
    }
  );
};

export const sendOrderConfirmationToClient = async (order, recipient) => {
  return sendTemplatedEmail(
    recipient.email,
    `Ваше замовлення #${order.id} отримано!`,
    'order-confirmation-client',
    {
      orderId: order.id,
      firstName: recipient.firstName,
      totalAmount: order.totalAmount,
      items: order.items,
      deliveryDetails: getDeliveryDetails(order),
      paymentMethod: getPaymentMethod(order),
    }
  );
};

export const sendNewOrderNotificationToAdmin = async (order, customer) => {
  return sendTemplatedEmail(
    process.env.ADMIN_EMAIL,
    `Нове замовлення #${order.id}`,
    'new-order-admin',
    {
      orderId: order.id,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        isGuest: !order.userId
      },
      totalAmount: order.totalAmount,
      items: order.items,
      deliveryDetails: getDeliveryDetails(order),
      paymentMethod: getPaymentMethod(order),
      notesClient: order.notesClient
    }
  );
};

// Helper function to format delivery details based on type
/* const getDeliveryDetails = (order) => {
  switch (order.deliveryType) {
    case 'ADDRESS':
      return {
        type: 'Доставка за адресою',
        details: `${order.addressDelivery.street}, ${order.addressDelivery.house}, 
                 ${order.addressDelivery.apartment || ''}, 
                 ${order.addressDelivery.city}, ${order.addressDelivery.postalCode}`
      };
    case 'RAILWAY_STATION':
      return {
        type: 'Доставка на залізничну станцію',
        details: `Станція: ${order.stationDelivery.station.name}, 
                 Місце зустрічи: ${order.stationDelivery.station.meetingPoint},
                 Час: ${new Date(order.stationDelivery.meetingTime).toLocaleString()}`
      };
    case 'PICKUP':
      return {
        type: 'Самовивіз',
        details: `Магазин: ${order.pickupDelivery.store.name}, 
                 Адреса: ${order.pickupDelivery.store.address},
                 Час: ${new Date(order.pickupDelivery.pickupTime).toLocaleString()}`
      };
    default:
      return { type: 'Unknown', details: '' };
  }
};

const getPaymentMethod = (order) => {
  switch (order.paymentMethod) {
    case 'CASH':
      return 'Готівка';
    case 'CARD':
      return 'Картка';
    case 'TWINT':
      return 'TWINT';
    default:
      return 'Unknown';
  }
}

const getOrderStatus = (order) => {
  switch (order.status) {
    case 'CONFIRMED':
      return 'Підтверджено';
    case 'DELIVERED':
      return 'Доставлено';
    case 'CANCELLED':
      return 'Відмінено';
    default:
      return 'Unknown';
  }
} */

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendModifiedOrderConfirmation,
  sendOrderConfirmationToClient,
  sendNewOrderNotificationToAdmin,
};