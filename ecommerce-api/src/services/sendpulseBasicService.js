// ecommerce-api/src/services/sendpulseBasicService.js
import axios from 'axios';

/**
 * SendPulse Basic Service
 * Handles customer registration integration with SendPulse CRM and Email API
 */
class SendPulseBasicService {
  constructor() {
    this.apiUrl = 'https://api.sendpulse.com';
    this.crmApiUrl = 'https://api.sendpulse.com/crm/v1';
    this.clientId = process.env.SENDPULSE_CLIENT_ID;
    this.clientSecret = process.env.SENDPULSE_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    console.log('SendPulse Service initialized');
    console.log('API URL:', this.apiUrl);
    console.log('CRM API URL:', this.crmApiUrl);
    console.log('Client ID configured:', !!this.clientId);
    console.log('Client Secret configured:', !!this.clientSecret);
    
    if (!this.clientId || !this.clientSecret) {
      console.error('SendPulse credentials not configured');
    }
  }

  /**
   * Get access token from SendPulse OAuth API
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('Using cached SendPulse token');
      return this.accessToken;
    }

    try {
      console.log('Getting new SendPulse access token...');
      
      const tokenData = {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      };
      
      const response = await axios.post(`${this.apiUrl}/oauth/access_token`, tokenData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from SendPulse');
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      
      console.log('SendPulse token obtained successfully');
      console.log('Token expires in:', response.data.expires_in, 'seconds');
      return this.accessToken;
    } catch (error) {
      console.error('Error getting SendPulse access token:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      throw new Error(`Failed to authenticate with SendPulse: ${error.response?.data?.error_description || error.message}`);
    }
  }

  /**
   * Add customer to SendPulse CRM
   * @param {Object} customerData Customer information
   * @param {string} customerData.email Customer email
   * @param {string} customerData.firstName Customer first name
   * @param {string} customerData.lastName Customer last name
   * @param {string} [customerData.phone] Customer phone
   * @param {string} [customerData.language] Customer language
   * @returns {Promise<Object>} SendPulse response
   */
  async addCustomer(customerData) {
    try {
      console.log('Starting addCustomer process...');
      const token = await this.getAccessToken();
      
      const {
        email,
        firstName,
        lastName,
        phone = null,
        language = 'en'
      } = customerData;

      // Try CRM API first
      const crmResult = await this.addCustomerToCrm(token, {
        email,
        firstName,
        lastName,
        phone,
        language
      });

      if (crmResult.success) {
        return crmResult.data;
      }

      console.log('CRM API failed, trying Email API fallback...');
      
      // Fallback to Email API
      const emailResult = await this.addCustomerToEmailList(token, {
        email,
        firstName,
        lastName,
        phone,
        language
      });

      return emailResult;

    } catch (error) {
      console.error('Error in addCustomer:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Add customer to SendPulse CRM using official CRM API
   * @param {string} token Access token
   * @param {Object} customerData Customer data
   * @returns {Promise<Object>} Result object
   */
  async addCustomerToCrm(token, customerData) {
    try {
      const { email, firstName, lastName, phone, language } = customerData;

      // Создаем контакт с минимальными обязательными полями согласно документации
      const contactData = {
        firstName: firstName,
        lastName: lastName,
        externalContactId: `website_${Date.now()}`
      };

      console.log('Adding customer to SendPulse CRM:', email);
      console.log('Contact data:', JSON.stringify(contactData, null, 2));

      const response = await axios.post(
        `${this.crmApiUrl}/contacts/create`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log('Customer added to SendPulse CRM successfully:', email);
      console.log('Contact ID:', response.data?.data?.id);

      const contactId = response.data?.data?.id;

      if (contactId) {
        // Добавляем email отдельным запросом
        if (email) {
          await this.addContactEmail(token, contactId, email);
        }

        // Добавляем телефон отдельным запросом
        if (phone) {
          await this.addContactPhone(token, contactId, phone);
        }

        // Добавляем custom attributes для регистрации с сайта
        await this.addCustomAttributes(token, contactId, {
          919348: `${firstName} ${lastName}`.trim(), // Имя Фамилия  
          919357: language, // Язык
          923103: 'website' // Сайт (регистрация)
        });
      }

      return { success: true, data: response.data };

    } catch (error) {
      console.error('CRM API error:', error.response?.status, error.response?.data);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Add email to contact
   * @param {string} token Access token
   * @param {number} contactId Contact ID
   * @param {string} email Email address
   */
  async addContactEmail(token, contactId, email) {
    try {
      console.log('Adding email to contact:', contactId, email);

      // Правильный формат согласно документации - emails массив
      await axios.post(
        `${this.crmApiUrl}/contacts/${contactId}/emails`,
        {
          emails: [
            {
              email: email,
              isMain: true
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('Email added successfully');
    } catch (error) {
      console.error('Failed to add email:', error.response?.data);
    }
  }

  /**
   * Add phone to contact
   * @param {string} token Access token
   * @param {number} contactId Contact ID
   * @param {string} phone Phone number
   */
  async addContactPhone(token, contactId, phone) {
    try {
      console.log('Adding phone to contact:', contactId, phone);

      await axios.post(
        `${this.crmApiUrl}/contacts/${contactId}/phones`,
        {
          phone: phone,
          type: 'work'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('Phone added successfully');
    } catch (error) {
      console.error('Failed to add phone:', error.response?.data);
    }
  }

  /**
   * Add custom attributes to contact using existing attribute IDs
   * @param {string} token Access token
   * @param {number} contactId Contact ID
   * @param {Object} attributes Map of attribute ID to value
   */
  async addCustomAttributes(token, contactId, attributes) {
    try {
      console.log('Adding custom attributes to contact:', contactId);

      for (const [attributeId, value] of Object.entries(attributes)) {
        if (!value) continue; // Skip empty values
        
        try {
          await axios.post(
            `${this.crmApiUrl}/contacts/${contactId}/attributes`,
            {
              attributeId: parseInt(attributeId),
              value: value
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );
          console.log(`Added attribute ID ${attributeId}: ${value}`);
        } catch (attrError) {
          console.log(`Failed to add attribute ID ${attributeId}:`, attrError.response?.data);
        }
      }
    } catch (error) {
      console.error('Error adding custom attributes:', error);
    }
  }

  /**
   * Get existing contact attributes
   * @param {string} token Access token
   * @returns {Object} Map of attribute names to IDs
   */
  async getContactAttributes(token) {
    try {
      const response = await axios.get(`${this.crmApiUrl}/contacts/attributes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const attributeMap = {};
      if (response.data && response.data.data) {
        response.data.data.forEach(attr => {
          attributeMap[attr.name] = attr.id;
        });
      }

      return attributeMap;
    } catch (error) {
      console.error('Failed to get contact attributes:', error.response?.data);
      return {};
    }
  }

  /**
   * Create new contact attribute
   * @param {string} token Access token
   * @param {string} name Attribute name
   * @returns {number|null} Attribute ID
   */
  async createContactAttribute(token, name) {
    try {
      console.log('Creating new contact attribute:', name);

      const response = await axios.post(
        `${this.crmApiUrl}/contacts/attributes`,
        {
          name: name,
          type: 1, // Text type
          mandatory: false,
          contactCardShow: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const attributeId = response.data?.data?.id;
      console.log(`Created attribute ${name} with ID:`, attributeId);
      return attributeId;
    } catch (error) {
      console.error(`Failed to create attribute ${name}:`, error.response?.data);
      return null;
    }
  }

  /**
   * Add customer to SendPulse Email list (fallback method)
   * @param {string} token Access token
   * @param {Object} customerData Customer data
   * @returns {Promise<Object>} SendPulse response
   */
  async addCustomerToEmailList(token, customerData) {
    try {
      const { email, firstName, lastName, phone, language } = customerData;

      console.log('Getting addressbooks list...');
      const addressBooksResponse = await axios.get(
        `${this.apiUrl}/addressbooks`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      let addressBookId = 1; // Default fallback

      if (addressBooksResponse.data && addressBooksResponse.data.length > 0) {
        addressBookId = addressBooksResponse.data[0].id;
        console.log('Using addressbook ID:', addressBookId);
      } else {
        console.log('No addressbooks found, using default ID:', addressBookId);
      }

      const contactData = {
        emails: [
          {
            email: email,
            variables: {
              name: `${firstName} ${lastName}`.trim(),
              firstName: firstName || '',
              lastName: lastName || '',
              phone: phone || '',
              language: language,
              source: 'website',
              registrationDate: new Date().toISOString(),
              customerType: 'website-customer'
            }
          }
        ]
      };

      console.log('Adding customer to Email list:', email);

      const response = await axios.post(
        `${this.apiUrl}/addressbooks/${addressBookId}/emails`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log('Customer added to Email list successfully:', email);
      return response.data;

    } catch (error) {
      console.error('Email API error:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data || error.message);
    }
  }

  /**
   * Test connection to SendPulse APIs
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      console.log('Testing SendPulse connection...');
      const token = await this.getAccessToken();
      
      console.log('Testing CRM API...');
      
      // Test CRM API first
      try {
        const response = await axios.get(`${this.crmApiUrl}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        console.log('SendPulse CRM API connection successful');
        console.log('Response status:', response.status);
        return true;
      } catch (crmError) {
        console.log('CRM API test failed, trying Email API...');
        
        // Fallback to Email API test
        const emailResponse = await axios.get(`${this.apiUrl}/addressbooks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        console.log('SendPulse Email API connection successful');
        console.log('Response status:', emailResponse.status);
        return true;
      }
    } catch (error) {
      console.error('SendPulse connection test failed:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      return false;
    }
  }

  /**
   * Get service status and configuration
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      configured: !!(this.clientId && this.clientSecret),
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry,
      endpoints: {
        auth: `${this.apiUrl}/oauth/access_token`,
        crm: `${this.crmApiUrl}/contacts/create`,
        email: `${this.apiUrl}/addressbooks`
      }
    };
  }
}

export default new SendPulseBasicService();