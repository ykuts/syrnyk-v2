// ecommerce-api/src/middleware/internalAuth.js
// Middleware for authenticating internal service requests

import logger from '../utils/logger.js';

/**
 * Internal API authentication middleware
 * Allows requests from other internal services (like CRM Integration Service)
 */
export const internalAuth = (req, res, next) => {
  const internalToken = req.headers['x-internal-api-token'];
  const authHeader = req.headers.authorization;

  // Check for internal API token
  if (internalToken) {
    return validateInternalToken(internalToken, req, res, next);
  }

  // Check for Bearer token (alternative method)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return validateBearerToken(token, req, res, next);
  }

  // No internal authentication provided - this is okay for public endpoints
  // Don't block the request, just don't mark it as internal
  logger.debug('No internal authentication provided', {
    path: req.path,
    method: req.method
  });

  next();
};

/**
 * Validate internal API token
 */
const validateInternalToken = (token, req, res, next) => {
  const validToken = process.env.INTERNAL_API_TOKEN;

  if (!validToken) {
    logger.error('INTERNAL_API_TOKEN not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      code: 'INTERNAL_TOKEN_NOT_CONFIGURED'
    });
  }

  if (token !== validToken) {
    logger.warn('Invalid internal API token attempt', {
      ip: req.ip,
      path: req.path,
      providedToken: token.substring(0, 8) + '...'
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid internal API token',
      code: 'INVALID_INTERNAL_TOKEN'
    });
  }

  // Mark request as internal
  req.isInternal = true;
  req.internalService = 'crm_integration';

  logger.info('Internal API authentication successful', {
    ip: req.ip,
    path: req.path,
    service: 'crm_integration'
  });

  next();
};

/**
 * Validate Bearer token for internal services
 */
const validateBearerToken = (token, req, res, next) => {
  const validBearerToken = process.env.INTERNAL_BEARER_TOKEN;

  if (!validBearerToken) {
    logger.error('INTERNAL_BEARER_TOKEN not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      code: 'INTERNAL_BEARER_NOT_CONFIGURED'
    });
  }

  if (token !== validBearerToken) {
    logger.warn('Invalid internal Bearer token attempt', {
      ip: req.ip,
      path: req.path,
      providedToken: token.substring(0, 8) + '...'
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid internal Bearer token',
      code: 'INVALID_INTERNAL_BEARER'
    });
  }

  // Mark request as internal
  req.isInternal = true;
  req.internalService = 'crm_integration';

  logger.info('Internal Bearer authentication successful', {
    ip: req.ip,
    path: req.path
  });

  next();
};

/**
 * Middleware to require internal authentication
 * Use this for routes that should ONLY be accessible by internal services
 */
export const requireInternal = (req, res, next) => {
  if (!req.isInternal) {
    logger.warn('Internal authentication required but not provided', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      success: false,
      error: 'This endpoint is only accessible by internal services',
      code: 'INTERNAL_ACCESS_REQUIRED'
    });
  }

  next();
};

export default internalAuth;