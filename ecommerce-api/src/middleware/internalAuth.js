import logger from '../utils/logger.js';

/**
 * OPTIONAL Internal API authentication middleware
 * Marks request as internal if valid token provided, but doesn't block public requests
 */
export const internalAuth = (req, res, next) => {
  const internalToken = req.headers['x-internal-api-token'];
  const authHeader = req.headers.authorization;

  // Check for internal API token
  if (internalToken) {
    const validToken = process.env.INTERNAL_API_TOKEN;

    if (!validToken) {
      logger.warn('INTERNAL_API_TOKEN not configured in environment');
      return next(); // Continue without marking as internal
    }

    if (internalToken === validToken) {
      // Mark request as internal
      req.isInternal = true;
      req.internalService = 'crm_integration';

      logger.debug('Internal API authentication successful', {
        ip: req.ip,
        path: req.path,
        service: 'crm_integration'
      });

      return next();
    } else {
      // Invalid token provided
      logger.warn('Invalid internal API token attempt', {
        ip: req.ip,
        path: req.path,
        providedToken: internalToken.substring(0, 8) + '...'
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid internal API token',
        code: 'INVALID_INTERNAL_TOKEN'
      });
    }
  }

  // Check for Bearer token (alternative method)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const validBearerToken = process.env.INTERNAL_BEARER_TOKEN;

    if (validBearerToken && token === validBearerToken) {
      req.isInternal = true;
      req.internalService = 'crm_integration';

      logger.debug('Internal Bearer authentication successful', {
        ip: req.ip,
        path: req.path
      });

      return next();
    }
  }

  // No internal auth provided - that's OK, continue as public request
  logger.debug('Public request (no internal auth)', {
    path: req.path,
    method: req.method
  });

  next();
};

/**
 * Middleware to REQUIRE internal authentication
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