import logger from '../utils/logger.js';

/**
 * Internal API authentication middleware
 * For service-to-service communication
 */
export const internalApiAuth = (req, res, next) => {
  const apiToken = req.headers['x-internal-api-token'];
  const authHeader = req.headers.authorization;

  // Check for internal API token
  if (apiToken) {
    return validateInternalApiToken(apiToken, req, res, next);
  }

  // Check for Bearer token (for backward compatibility)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return validateInternalBearerToken(token, req, res, next);
  }

  // No internal authentication provided
  logger.warn('Internal API authentication failed - no credentials provided', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method
  });

  return res.status(401).json({
    success: false,
    error: 'Internal API authentication required',
    code: 'NO_INTERNAL_AUTH_PROVIDED'
  });
};

/**
 * Validate internal API token
 */
const validateInternalApiToken = (apiToken, req, res, next) => {
  const validInternalToken = process.env.INTERNAL_API_TOKEN;

  if (!validInternalToken) {
    logger.error('INTERNAL_API_TOKEN not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      code: 'INTERNAL_API_TOKEN_NOT_CONFIGURED'
    });
  }

  if (apiToken !== validInternalToken) {
    logger.warn('Invalid internal API token attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      providedToken: apiToken.substring(0, 8) + '...'
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid internal API token',
      code: 'INVALID_INTERNAL_API_TOKEN'
    });
  }

  // Token is valid - add internal service info to request
  req.user = {
    type: 'internal_service',
    authenticated: true,
    service: 'crm_integration',
    permissions: ['internal_operations', 'order_management', 'sync_operations'],
    isInternal: true
  };

  logger.info('Internal API authentication successful', {
    ip: req.ip,
    path: req.path,
    service: 'crm_integration'
  });

  next();
};

/**
 * Validate internal Bearer token (JWT format)
 */
const validateInternalBearerToken = (token, req, res, next) => {
  const internalBearerToken = process.env.INTERNAL_BEARER_TOKEN;

  if (!internalBearerToken) {
    logger.error('INTERNAL_BEARER_TOKEN not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      code: 'INTERNAL_BEARER_TOKEN_NOT_CONFIGURED'
    });
  }

  if (token !== internalBearerToken) {
    logger.warn('Invalid internal Bearer token attempt', {
      ip: req.ip,
      path: req.path,
      providedToken: token.substring(0, 8) + '...'
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid internal Bearer token',
      code: 'INVALID_INTERNAL_BEARER_TOKEN'
    });
  }

  // Token is valid
  req.user = {
    type: 'internal_service_bearer',
    authenticated: true,
    service: 'crm_integration',
    permissions: ['internal_operations', 'order_management', 'sync_operations'],
    isInternal: true
  };

  logger.info('Internal Bearer token authentication successful', {
    ip: req.ip,
    path: req.path
  });

  next();
};