const { ROLES } = require('../config/constants');

const validateRegistration = (req, res, next) => {
  const { name, email, mobile, password, role } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required' });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'A valid email address is required' });
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobile || !mobileRegex.test(mobile.trim())) {
    return res.status(400).json({ success: false, message: 'A valid 10-digit Indian mobile number is required' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  // Security rule: public registration must NEVER permit choosing admin or verifier roles
  if (role && (role === ROLES.ADMIN || role === ROLES.VERIFIER)) {
    return res.status(403).json({
      success: false,
      message: 'Self-assignment of administrative or verifier roles is strictly prohibited'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  next();
};

module.exports = { validateRegistration, validateLogin };
