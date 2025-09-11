// ecommerce-api/src/middleware/basicCrmMiddleware.js
import sendpulseBasicService from '../services/sendpulseBasicService.js';

/**
 * Basic CRM middleware for user registration
 * Step 1: Simple integration
 */
export const addUserToSendPulse = (req, res, next) => {
  // Store original res.json method
  const originalJson = res.json;
  
  // Override res.json to intercept successful responses
  res.json = function(data) {
    // Only trigger SendPulse integration on successful registration (201 status)
    if (res.statusCode === 201 && data.user) {
      // Send to SendPulse asynchronously - don't block the response
      setImmediate(async () => {
        try {
          console.log('Sending new user to SendPulse:', data.user.email);
          
          await sendpulseBasicService.addCustomer({
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phone: data.user.phone,
            language: data.user.language || 'en'
          });
          
          console.log('User successfully added to SendPulse CRM');
        } catch (error) {
          // Log error but don't fail the registration
          console.error('Failed to add user to SendPulse:', error);
        }
      });
    }
    
    // Call original res.json with the data
    return originalJson.call(this, data);
  };
  
  next();
};