// ecommerce-api/src/config/crmService.js
import axios from 'axios';

/**
 * CRM Service Configuration and Helper Functions
 * Handles communication with the CRM Integration Service
 */

// Configuration
const CRM_SERVICE_URL = process.env.CRM_SERVICE_URL || 'http://localhost:3005';
const CRM_API_TOKEN = process.env.CRM_API_TOKEN;

// Create axios instance for CRM service
const crmClient = axios.create({
  baseURL: CRM_SERVICE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': CRM_API_TOKEN
  }
});

// Add request interceptor for logging
crmClient.interceptors.request.use(
  (config) => {
    console.log(`[CRM Service] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[CRM Service] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
crmClient.interceptors.response.use(
  (response) => {
    console.log(`[CRM Service] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[CRM Service] Response error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/**
 * Map ecommerce order status to SendPulse deal status
 */
const mapOrderStatusToSendPulse = (orderStatus) => {
  const statusMapping = {
    'PENDING': 'new',
    'CONFIRMED': 'in_progress',
    'DELIVERED': 'won',
    'CANCELLED': 'lost'
  };
  
  return statusMapping[orderStatus] || 'new';
};

/**
 * Update deal status in SendPulse via CRM service
 * @param {Object} params - Update parameters
 * @param {string} params.dealId - SendPulse deal ID
 * @param {number} params.orderId - Ecommerce order ID
 * @param {string} params.newStatus - New order status
 * @param {string} params.previousStatus - Previous order status
 * @param {Object} params.orderData - Order data (optional)
 * @returns {Promise<Object>} Response from CRM service
 */
export const updateDealStatus = async ({ dealId, orderId, newStatus, previousStatus, orderData }) => {
  try {
    console.log(`[CRM Service] Updating deal status for order ${orderId}`);
    
    const response = await crmClient.post('/api/sync/update-deal-status', {
      dealId,
      orderId,
      newStatus,
      previousStatus,
      orderData
    });

    console.log(`[CRM Service] Deal ${dealId} updated successfully`);
    return response.data;

  } catch (error) {
    console.error(`[CRM Service] Failed to update deal status:`, error.message);
    
    // Don't throw error - we don't want to fail the main operation
    // Just log it and return null
    return null;
  }
};

/**
 * Create deal in SendPulse via CRM service
 * @param {number} orderId - Ecommerce order ID
 * @param {Object} orderData - Complete order data
 * @returns {Promise<Object>} Response from CRM service with deal info
 */
export const createDeal = async (orderId, orderData) => {
  try {
    console.log(`[CRM Service] Creating deal for order ${orderId}`);
    
    const response = await crmClient.post('/api/sync/create-deal', {
      orderId,
      orderData
    });

    console.log(`[CRM Service] Deal created successfully:`, response.data.data);
    return response.data;

  } catch (error) {
    console.error(`[CRM Service] Failed to create deal:`, error.message);
    return null;
  }
};

/**
 * Get sync status for an order
 * @param {number} orderId - Ecommerce order ID
 * @returns {Promise<Object>} Sync status data
 */
export const getSyncStatus = async (orderId) => {
  try {
    const response = await crmClient.get(`/api/sync/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`[CRM Service] Failed to get sync status:`, error.message);
    return null;
  }
};

/**
 * Check if CRM service is available
 * @returns {Promise<boolean>} Service availability status
 */
export const checkCrmServiceHealth = async () => {
  try {
    const response = await crmClient.get('/api/sync/health', {
      timeout: 3000 // Short timeout for health check
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('[CRM Service] Health check failed:', error.message);
    return false;
  }
};

/**
 * Get CRM service configuration info
 * @returns {Object} Configuration details
 */
export const getCrmServiceConfig = () => {
  return {
    url: CRM_SERVICE_URL,
    configured: !!(CRM_SERVICE_URL && CRM_API_TOKEN),
    hasToken: !!CRM_API_TOKEN
  };
};

export default {
  updateDealStatus,
  createDeal,
  getSyncStatus,
  checkCrmServiceHealth,
  getCrmServiceConfig,
  mapOrderStatusToSendPulse
};