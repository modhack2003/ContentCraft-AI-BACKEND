const jwt = require('jsonwebtoken');
const User = require('../models/User');

function authorize(roles = []) {
    console.log(roles.length)
   
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'token not found. please login!! ' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;

      const user = await User.findById(req.user.id);
      console.log(user.role)
      if (roles.length && !roles.includes(user.role)) {
        return res.status(401).json({ message: ' You are not Unauthorized to visit this page' });
      }

      if (!user) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
}

module.exports = authorize;
