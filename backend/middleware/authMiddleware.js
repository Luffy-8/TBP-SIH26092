const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server security configuration error',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user payload to request object
    req.user = decoded; // Contains { id, username, iat, exp }

    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};

module.exports = {
  protect,
};

