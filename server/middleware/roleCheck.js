const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    // For owners, check if they are approved
    if (req.user.role === 'owner' && !req.user.approved) {
      return res.status(403).json({ message: 'Account pending approval from admin' });
    }

    next();
  };
};

module.exports = roleCheck;
