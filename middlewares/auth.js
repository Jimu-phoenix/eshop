const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    
    next();
  };
};

const requireCustomer = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return;
    requireRole('customer', 'admin')(req, res, next);
  });
};

const requireAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return;
    requireRole('admin')(req, res, next);
  });
};

module.exports = {
  verifyToken,
  requireRole,
  requireCustomer,
  requireAdmin,
  JWT_SECRET
};