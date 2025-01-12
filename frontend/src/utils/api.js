import { API_URL } from '../config';

export const apiClient = {
  get: async (endpoint, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers: {
        ...customHeaders
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  post: async (endpoint, data, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(data),
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  upload: async (endpoint, formData) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  put: async (endpoint, data, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  patch: async (endpoint, data, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  
    return response.json();
  },

  delete: async (endpoint, customHeaders = {}) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
        method: 'DELETE',
        headers: {
            
            ...customHeaders
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}

};