import nodemailer from 'nodemailer';
import { orderConfirmationTemplate, orderStatusUpdateTemplate } from './emailTemplates.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOrderConfirmation = async (order) => {
  try {
    await transporter.sendMail({
      from: `"Your Shop Name" <${process.env.SMTP_USER}>`,
      to: order.user.email,
      subject: `Order Confirmation #${order.id}`,
      html: orderConfirmationTemplate(order),
    });
    console.log(`Order confirmation email sent to ${order.user.email}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
};

const sendOrderStatusUpdate = async (order, newStatus) => {
  try {
    await transporter.sendMail({
      from: `"Your Shop Name" <${process.env.SMTP_USER}>`,
      to: order.user.email,
      subject: `Order #${order.id} Status Update`,
      html: orderStatusUpdateTemplate(order, newStatus),
    });
    console.log(`Order status update email sent to ${order.user.email}`);
  } catch (error) {
    console.error('Failed to send order status update email:', error);
  }
};

export default sendOrderConfirmation;
