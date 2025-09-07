const express = require('express');
const LoginEvent = require('../models/LoginEvent');
const Doctor = require('../models/Doctor');

const router = express.Router();

function checkAdminKey(req, res, next){
  const key = req.headers['x-admin-key'] || process.env.ADMIN_KEY;
  if (!key || key !== process.env.ADMIN_KEY) return res.status(403).json({ message: 'Forbidden' });
  next();
}

router.get('/login-events', checkAdminKey, async (req, res) => {
  const events = await LoginEvent.find().sort({ createdAt: -1 }).limit(200).populate('doctor', 'name email');
  res.json(events);
});

router.get('/doctors', checkAdminKey, async (req, res) => {
  const docs = await Doctor.find().select('-password').limit(500);
  res.json(docs);
});

module.exports = router;
