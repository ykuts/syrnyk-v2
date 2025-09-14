const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta && Object.keys(meta).length > 0 ? meta : '');
  },
  
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta && Object.keys(meta).length > 0 ? meta : '');
  },
  
  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, meta && Object.keys(meta).length > 0 ? meta : '');
  }
};

export default logger;