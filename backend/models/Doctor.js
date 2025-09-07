const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Cardiologist"
  location: { type: String, required: true },
  phone: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Doctor", doctorSchema);
