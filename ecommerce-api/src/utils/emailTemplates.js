export const orderConfirmationTemplate = (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
        <p>Dear ${order.user.firstName} ${order.user.lastName},</p>
        
        <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${order.id}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${order.address.city}, ${order.address.station || ''}</p>
        </div>
  
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
          </tr>
          ${order.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${item.product.name}</td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">${item.price * item.quantity} CHF</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong>${order.totalAmount} CHF</strong></td>
          </tr>
        </table>
  
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">What's Next?</h2>
          <p>1. You'll receive a notification when your order is confirmed.</p>
          <p>2. Once your order is shipped, we'll send you tracking information.</p>
          <p>3. You can track your order status by logging into your account.</p>
        </div>
  
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
  
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;
  };
  
  export const orderStatusUpdateTemplate = (order, newStatus) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Order Status Update</h1>
        
        <p>Dear ${order.user.firstName} ${order.user.lastName},</p>
        
        <p>The status of your order #${order.id} has been updated to: <strong>${newStatus}</strong></p>
        
        ${newStatus === 'DELIVERED' ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">How was your experience?</h2>
            <p>We'd love to hear your feedback! Please click the button below to leave a review:</p>
            <a href="${process.env.FRONTEND_URL}/review/${order.id}" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Leave a Review
            </a>
          </div>
        ` : ''}
  
        <p>You can check the full details of your order by logging into your account.</p>
  
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">Thank you for shopping with us!</p>
        </div>
      </div>
    `;
  };
  
