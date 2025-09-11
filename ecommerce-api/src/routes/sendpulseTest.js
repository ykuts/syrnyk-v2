// ecommerce-api/src/routes/sendpulseTest.js
import express from 'express';
import axios from 'axios';
import sendpulseBasicService from '../services/sendpulseBasicService.js';

const router = express.Router();

console.log('🚀 SendPulse Test Routes loaded successfully!');

// Middleware для логирования всех запросов к SendPulse API
router.use((req, res, next) => {
  console.log(`📍 SendPulse API: ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * GET /api/sendpulse/
 * Главная страница SendPulse API с информацией о доступных endpoints
 */
router.get('/', (req, res) => {
  res.json({
    message: 'SendPulse API Integration',
    version: '1.0.0',
    availableEndpoints: {
      'GET /': 'This info page',
      'GET /config-status': 'Check configuration status',
      'GET /test-connection': 'Test SendPulse connection (GET)',
      'POST /test-connection': 'Test SendPulse connection (POST)',
      'POST /test-add-contact': 'Test adding contact to SendPulse'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/sendpulse/config-status
 * Проверка конфигурации SendPulse API
 */
router.get('/config-status', (req, res) => {
  console.log('🔧 Checking SendPulse configuration...');
  
  const config = {
    clientIdConfigured: !!process.env.SENDPULSE_CLIENT_ID,
    clientSecretConfigured: !!process.env.SENDPULSE_CLIENT_SECRET,
    chatbotApiKeyConfigured: !!process.env.CHATBOT_API_KEY
  };
  
  const allConfigured = config.clientIdConfigured && config.clientSecretConfigured;
  
  const response = {
    success: true,
    configured: allConfigured,
    config,
    recommendations: []
  };

  if (!config.clientIdConfigured) {
    response.recommendations.push('Set SENDPULSE_CLIENT_ID in .env file');
  }
  if (!config.clientSecretConfigured) {
    response.recommendations.push('Set SENDPULSE_CLIENT_SECRET in .env file');
  }
  if (!config.chatbotApiKeyConfigured) {
    response.recommendations.push('Set CHATBOT_API_KEY in .env file (optional, for API security)');
  }

  console.log('🔧 Configuration check result:', allConfigured ? 'OK' : 'MISSING_CREDENTIALS');
  
  res.json(response);
});

/**
 * GET /api/sendpulse/test-connection
 * Тест подключения к SendPulse API (GET версия для браузера)
 */
router.get('/test-connection', async (req, res) => {
  console.log('🧪 Testing SendPulse connection (GET)...');
  
  try {
    const isConnected = await sendpulseBasicService.testConnection();
    
    if (isConnected) {
      console.log('✅ SendPulse connection test successful');
      res.json({
        success: true,
        message: 'SendPulse connection successful!',
        method: 'GET',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ SendPulse connection test failed');
      res.status(500).json({
        success: false,
        message: 'SendPulse connection failed',
        error: 'Unable to connect to SendPulse API. Check your credentials.',
        method: 'GET',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ SendPulse test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'SendPulse connection test failed',
      error: error.message,
      method: 'GET',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/sendpulse/test-connection
 * Тест подключения к SendPulse API (POST версия)
 */
router.post('/test-connection', async (req, res) => {
  console.log('🧪 Testing SendPulse connection (POST)...');
  
  try {
    const isConnected = await sendpulseBasicService.testConnection();
    
    if (isConnected) {
      console.log('✅ SendPulse connection test successful');
      res.json({
        success: true,
        message: 'SendPulse connection successful!',
        method: 'POST',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ SendPulse connection test failed');
      res.status(500).json({
        success: false,
        message: 'SendPulse connection failed',
        error: 'Unable to connect to SendPulse API. Check your credentials.',
        method: 'POST',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ SendPulse test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'SendPulse connection test failed',
      error: error.message,
      method: 'POST',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/sendpulse/test-add-contact
 * Тест добавления контакта в SendPulse
 */
router.post('/test-add-contact', async (req, res) => {
  console.log('👤 Testing add contact to SendPulse...');
  
  try {
    const { email, firstName, lastName, phone } = req.body;
    
    // Валидация входных данных
    if (!email || !firstName) {
      console.log('❌ Validation failed: missing email or firstName');
      return res.status(400).json({
        success: false,
        error: 'Email and firstName are required',
        received: { email: !!email, firstName: !!firstName, lastName: !!lastName, phone: !!phone }
      });
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    console.log('👤 Adding test contact:', email);
    
    const result = await sendpulseBasicService.addCustomer({
      email,
      firstName,
      lastName: lastName || '',
      phone: phone || null,
      language: 'en'
    });
    
    if (result.error) {
      console.log('❌ Failed to add contact:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to add contact to SendPulse',
        error: result.error,
        contact: { email, firstName, lastName }
      });
    } else {
      console.log('✅ Contact added successfully:', email);
      res.json({
        success: true,
        message: `Contact ${email} added to SendPulse successfully!`,
        contact: { email, firstName, lastName, phone },
        result: result,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Test add contact error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Test add contact failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/sendpulse/health
 * Health check для SendPulse интеграции
 */
router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    service: 'SendPulse Integration',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      sendpulseConfigured: !!(process.env.SENDPULSE_CLIENT_ID && process.env.SENDPULSE_CLIENT_SECRET)
    }
  };
  
  res.json(health);
});

/**
 * GET /api/sendpulse/get-attributes
 * Get list of contact attributes
 */
router.get('/get-attributes', async (req, res) => {
  console.log('Getting contact attributes list...');
  
  try {
    const token = await sendpulseBasicService.getAccessToken();
    
    const response = await axios.get('https://api.sendpulse.com/crm/v1/contacts/attributes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('Attributes response:', JSON.stringify(response.data, null, 2));

    // Форматируем для удобного просмотра
    const attributes = response.data?.data || [];
    const formattedAttributes = attributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      type: attr.type,
      mandatory: attr.mandatory,
      contactCardShow: attr.contactCardShow
    }));

    res.json({
      success: true,
      count: formattedAttributes.length,
      attributes: formattedAttributes,
      raw: response.data
    });

  } catch (error) {
    console.error('Error getting attributes:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

export default router;