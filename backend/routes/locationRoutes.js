const express = require('express');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');

const router = express.Router();

// GET /api/locations/suggest?q=del
// Returns up to 10 distinct location suggestions from Medicine and Doctor collections
router.get('/suggest', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  try {
    const regex = { $regex: '^' + q, $options: 'i' };

    const medLocations = await Medicine.distinct('location', { location: regex });
    const docLocations = await Doctor.distinct('location', { location: regex });

    const merged = Array.from(new Set([...medLocations, ...docLocations]));
    // return up to 10
    res.json(merged.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
