const mongoose = require('mongoose');

const loginEventSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  email: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginEvent', loginEventSchema);
