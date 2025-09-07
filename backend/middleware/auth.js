const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

module.exports = async function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing authorization header' });

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Malformed authorization header' });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const doc = await Doctor.findById(decoded.id).select('-password');
    if (!doc) return res.status(401).json({ message: 'Invalid token' });
    req.doctor = doc;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
