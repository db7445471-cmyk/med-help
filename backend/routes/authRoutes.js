const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const LoginEvent = require('../models/LoginEvent');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, category, location, phone } = req.body;
  if (!name || !email || !password || !category || !location) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const doc = new Doctor({ name, email, password: hash, category, location, phone });
    await doc.save();

    const token = jwt.sign({ id: doc._id, email: doc.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    // record login event
    try {
      await LoginEvent.create({ doctor: doc._id, email: doc.email, ip: req.ip, userAgent: req.headers['user-agent'] });
    } catch (e) { console.warn('LoginEvent save failed', e.message); }
    res.json({ token, doctor: { id: doc._id, name: doc.name, email: doc.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

  try {
    const doc = await Doctor.findOne({ email });
    if (!doc) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, doc.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: doc._id, email: doc.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, doctor: { id: doc._id, name: doc.name, email: doc.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
