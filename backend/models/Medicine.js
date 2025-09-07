const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  availability: { type: Number },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
});

module.exports = mongoose.model("Medicine", medicineSchema);
